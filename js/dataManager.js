function dataManager(){
	// Public functions
	this.getTitle = function(note){
		return note.title;
	}

	this.getThumb = function(note){
		return note.thumb;
	}

	this.getSubtitle = function (note){
		var subtitle = "";
		for (content in note.content){
			if (content.type == "txt"){
				subtitle = content.content;
				break;
			}
		}
		return subtitle;
	}

	this.getId = function (note){
		return note.id;
	}

	this.getNewNote = function(pzhName){
		return {
			id: '',
			group: pzhName,
			title: 'Untitled',
			thumb: 'img/emptyNote.jpg',
			content: []
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
		// Test if the note exits:
		if (this.getNoteById(note.id, serverMgr.getNotes()) == -1){
			// NEW NOTE
			notesList.push(note);
		} else {
			// UPDATED NOTE
			notesList[this.getNoteIndexById(note.id, notesList)] = note;
		}
	}

	/* DATA MODEL OF NOTESLIST
	[
		{
			id: 0,
			group: 'WebinosTelefonica',
			title: 'Lentil\'s Pizza',
			thumb: 'img/thumb/1_01.jpg',
			content: [
				{
					type: 'txt',
					content: 'First, we have to cook the lentils'
				},
				{
					type: 'img',
					content: 'img/thumb/1_01.jpg'
				},
				{
					type: 'txt',
					content: 'Spread the lentils on the pizza base'
				}
			]
		}
	]
	*/
}