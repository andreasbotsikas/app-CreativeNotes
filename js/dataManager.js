function dataManager(){
	var defaultThumb = "img/emptyNote.jpg";
	
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