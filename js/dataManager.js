function dataManager(){
	var defaultThumb = "emptyNote.jpg";
	
	this.getDefaultThumb = function(){
		return defaultThumb;
	}

	this.getTitle = function(note){
		return note.title;
	}

	this.setTitle = function(note, title){
		note.title = title;
	}

	this.getThumb = function(note){
		return note.thumb;
	}

	this.setThumb = function(note, thumb){
		note.thumb = thumb; 
	}

	this.getSubtitle = function (note){
		var subtitle = "";
		for (contentIndex in note.content){
			content = note.content[contentIndex];
			if (content.type == "txt"){
				subtitle = content.content + "...";
				break;
			}
		}
		return subtitle;
	}

	this.getId = function (note){
		return note.id;
	}

	this.setId = function (note, id){
		note.id = id;
	}

	this.getNewNote = function(pzhName){
		return {
			"id": "-1",
			"group": pzhName,
			"title": "Untitled",
			"thumb": defaultThumb,
			"content": []
		}
	}

	this.getNoteById = function(id, notesList){
		var note = -1;
		for (noteIndex in notesList){
			noteTmp = notesList[noteIndex];
			if (noteTmp.id == id){
				note = noteTmp;
				break;
			}
		}
		return note;
	}

	this.getNoteIndexById = function(id, notesList){
		for (var noteIndex in notesList){
			var note = notesList[noteIndex];
			if (note.id == id){
				return noteIndex;
			}
		}

		// Ends iteration, not found
		return -1;
	}

	this.addNote = function (note, notesList){
		console.log("Add Note");
		console.log(note);
		// Test if the note exits in notesList:
		if (this.getNoteById(note.id, notesList) == -1){
			// NEW NOTE
			notesList.push(note);
		} else {
			// UPDATED NOTE
			notesList[this.getNoteIndexById(note.id, notesList)] = note;
		}

		// Update the list of notes
		updateNotesList();

		fileMgr.writeNotesList(notesList);
	}

	/***
	Use SugarJS to work with sets
	***/
	this.mixNotesList = function(localNotesList, remoteNotesList){
		var notesList1 = localNotesList;
		var notesList2 = remoteNotesList;

		// Function that mixes two notes with the same id and changes in both.
		var mixNotes = function(localNote, remoteNote){
		  var note = localNote;
		  var note2 = remoteNote;
		  var onlyLocalContent = note.content.subtract(note2.content); // [] if only remote changes
		  var onlyRemoteContent = note2.content.subtract(note.content); // [] if only local changes
		  if (onlyLocalContent.length == 0){
		    // The note has not been updated locally, only remotely
		    note.content = note2.content;
		    console.log("Note modified in remote, update only in local");
		    dataMgr.addNote(note, notesList);
		    // Check and download new images
		    for (cIndex in onlyRemoteContent){
		    	if (onlyRemoteContent[cIndex].type == 'img'){
		    		fileMgr.readForeignImg(onlyRemoteContent[cIndex].content, function(message){
		    			console.log("Found new image in remote. Image retrieved");
		    		})
		    	}
		    }
		  } else if (onlyRemoteContent.length == 0){
		    // The note only has local updates
		    console.log("Note modified in local, send webinos event");
		    webinosMgr.sendNoteEvent(note);
		    // Check and send new images
		    for (cIndex in onlyLocalContent){
		    	if (onlyLocalContent[cIndex].type == 'img'){
		    		fileMgr.sendImg(onlyLocalContent[cIndex].content);
		    	}
		    }
		  } else {
		    console.log("Note modified in both sides, send webinos event");
		    note.content = note.content.union(note2.content);
		    webinosMgr.sendNoteEvent(note);
		    // Check local content
		    for (cIndex in onlyLocalContent){
		    	if (onlyLocalContent[cIndex].type == 'img'){
		    		fileMgr.sendImg(onlyLocalContent[cIndex].content);
		    	}
		    }
		    // Check and retrieve new remote images
		    for (cIndex in onlyRemoteContent){
		    	if (onlyRemoteContent[cIndex].type == 'img'){
		    		fileMgr.readForeignImg(onlyRemoteContent[cIndex].content, function(message){
		    			console.log("Found new image in remote. Image retrieved");
		    		})
		    	}
		    }
		  }
		  console.log(note);
		  console.log(note2);
		}

		var modifiedLocalNotes = notesList1.subtract(notesList2);
		var modifiedRemoteNotes = notesList2.subtract(notesList1);

		for (noteI in modifiedLocalNotes){
		  var note = modifiedLocalNotes[noteI];
		  if (dataMgr.getNoteById(note.id, modifiedRemoteNotes) == -1){
		    // Inexistent note in remote. Brand new local note
		    console.log("New local note, send webinos event");
		    webinosMgr.sendNoteEvent(note);
		    // Send local images
		    for (cIndex in note.content){
		    	if (note.content[cIndex].type == 'img'){
		    		fileMgr.sendImg(note.content[cIndex].content);
		    	}
		    }
		  } else {
		    // Modified in both sides
		    console.log("Updated note: Mix local and remote notes");
		    var note2 = dataMgr.getNoteById(note.id, notesList2);
		    mixNotes(note, note2);
		    // It will send and download the neccessary images in mixNotes
		  }
		}

		for (noteI in modifiedRemoteNotes){
		  var note = modifiedRemoteNotes[noteI];
		  if (dataMgr.getNoteById(note.id, modifiedLocalNotes) == -1){
		    // Inexistent note in local. Brand new remote note
		    console.log("New remote note, add it locally");
		    dataMgr.addNote(note, notesList);
		    // Retrieve remote images
		    for (cIndex in note.content){
		    	if (note.content[cIndex].type == 'img'){
		    		fileMgr.readForeignImg(note.content[cIndex].content, function(message){
		    			console.log("Found new image in remote. Image retrieved");
		    		})
		    	}
		    }

		  }
		}
	}

	/* DATA MODEL OF NOTESLIST
	[
		{
			"id": 0,
			"group": "WebinosTelefonica",
			"title": "Lentil's Pizza",
			"thumb": "img/thumb/1_01.jpg",
			"content": [
				{
					"type": "txt",
					"content": "First, we have to cook the lentils"
				},
				{
					"type": "img",
					"content": "img/thumb/1_01.jpg"
				},
				{
					"type": "txt",
					"content": "Spread the lentils on the pizza base"
				}
			]
		}
	]
	*/
}