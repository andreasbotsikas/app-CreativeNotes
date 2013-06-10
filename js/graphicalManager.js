var webinosMgr;
var dataMgr;
var fileMgr;
var notesList;
var currentNote;
var popupTitleOpened = false;
var defaultUntitledTitle = "Untitled Note";
var noteWidth = "95%";
// Show a spinning wheel while testing everything

var defaultGroup = "WebinosTelefonica";

var pzhName;
var otherPZP = []; // Filled when searching fileAPI services (fileManager.js)

var noteIdLength = 32;

// Now, the pages are static HTML, so we can wait to load webinos after painting the interface and handle the messages. 
// In the first try (demo), the waiting for webinos will be inside $(document).bind(pageinit). 
// In the future, first we have to load webinos, and when ready we'll get notes and after paint the interface.

// FUNCTIONS
function initInterface(){
	// graphicalManager tendrá las funciones directamente
	webinosMgr = new webinosManager();
	dataMgr = new dataManager();
}

function saveNote(){
	imgInput = $(".imageInput");
	for (var imgIndex=0; imgIndex<imgInput.length; imgIndex++){
		fileMgr.saveImg(imgInput[imgIndex].files[0]);
		fileMgr.sendImg(imgInput[imgIndex].files[0]);
	}

	var noteDataItems = $(".noteDataItem");
	noteData = [];

	for (var dataIndex=0; dataIndex<noteDataItems.length; dataIndex++){
		if (noteDataItems[dataIndex].classList.contains("imageInput")){
			noteData.push({
					"type":"img",
					"content": noteDataItems[dataIndex].files[0].name
				});
			if (currentNote.thumb == dataMgr.getDefaultThumb())
				dataMgr.setThumb(currentNote, noteDataItems[dataIndex].files[0].name);
		} else if (noteDataItems[dataIndex].classList.contains("textInput")){
			noteData.push({
					"type":"txt",
					"content": noteDataItems[dataIndex].value
				});
		}
	}

	currentNote.content = currentNote.content.concat(noteData);
	// If new note
	if (dataMgr.getId(currentNote) == -1){
		// Generate a new random ID, and assign to the current note.
		dataMgr.setId(currentNote, randomString(noteIdLength));
	}
	// This will add the note to notesList, refresh view and write notesList to File
	dataMgr.addNote(currentNote, notesList);
	// Send though webinos
	webinosMgr.sendNoteEvent(currentNote);
}


function updateNotesList(){
	var currentPage = getCurrentPage();
	$("#notesList").html("");
	for (var noteIndex in notesList){
		var note = notesList[noteIndex];
		var title = dataMgr.getTitle(note);
		var thumb = dataMgr.getThumb(note);
		var subtitle = dataMgr.getSubtitle(note);
		var id = dataMgr.getId(note);
		$("#notesList").append('<li><a href="editNote.html?id='+id+'">\
					<img id="'+ thumb +'" />\
					<h3>'+ title +'</h3>\
					<p>'+ subtitle +'</p>\
				</a></li>\
			');

		// Add local images
		fileMgr.readLocalImg(thumb, function(data, name){
			imgs = $("img[id='"+ name +"']");
			for (imgIndex in imgs){
				imgs[imgIndex].src = data;
			}
		});	
	}
	$("#notesList").listview('refresh');

}

function addImage(){
	var row = "";

	row += "<p style='text-align:center'>";
	row += 		"<input type='file' class='noteDataItem imageInput' accept='image/*;capture=camera' name='image'/>";
	row += "</p>";
	
	$("#noteContent").append(row);	

	// Append dynamic image preview with FileAPI
	if (window.FileReader){
		$(".imageInput:last").change(function(){
			// Gets dataURL, and when ready show the image
			readFileAsDataURL(this.files[0]);

			// Hide paragraph including input
			this.parentElement.hidden = true;
		});
	}

	$(".imageInput:last").click();
}

function addText(){
	var row = "";

	row += "<p>";
	row += 		"<input type='textarea' class='noteDataItem textInput' name='text' placeholder='Click here to write your comment'></input>";
	row += "</p>";
	
	$("#noteContent").append(row);	
	$(".textInput:last").focus();
}

function getCurrentPage(){
	return document.URL.split("/").pop();
}

function getCurrentPageFromJQMEvent(event){
	return event.currentTarget.URL.split("/").pop();
}

// Gets a parameter from the URL (CGI like)
// http://.../editNote.html?id=4 --> getURLParameter("id") = 4
function getURLParameter(name){
	return decodeURI(
		(RegExp(name + '=' + '(.+)(&|$)').exec(location.search)||[,null])[1]
	);
}

// Gets a parameter from a given URL
function getURLParameterFromURL(name, url){
	var questionSplit = url.split("?");
	var afterQuestion = questionSplit[questionSplit.length -1];
	return decodeURI(
		(RegExp(name + '=' + '(.+)(&|$)').exec(afterQuestion)||[,null])[1]
	);
}

// We have detected that webinos object may be present, but not all its features
// In this method it waits to have a correct sessionId, and then initialize the function given.
function waitWebinosPZHAndRunFunction(funcion) {
	var runFunction = function(funcion) {
		switch(funcion){
			case "index":
				initIndex();
				break;
			case "edit":
				initEdit();
				break;
		}

		// The page has been loaded, hide spinning wheel
		$.mobile.loading('hide');
	}

	// First, wait webinos to load completely to get a right PZHId
	if (webinos.session.getSessionId()){
		// If webinos is already loaded
		runFunction(funcion);
	} else {
		// Wait until webinos is loaded
		var interval = self.setInterval(function(){
			if (webinos.session.getSessionId()){
				// sessionId detected
				window.clearInterval(interval);
				pzhName = webinosMgr.getPZHName();
				runFunction(funcion);
				console.log("A wait has been necessary to load sessionId");
			}
		}, 100);		
	}


}

// If it is the first time we execute the function, it will retrive notesList and fill the interface.
function initIndex(){

	if (!notesList){
		// First, try to get notes from the local file. If something bad happens, download/ask

		// If fileAPI is not ready (or not supported), there is no file, or it's corrupted
		var errorCB = function(error){
			// Get a list of notes from other PZP through webinos
			webinosMgr.getNotesFromOtherPZP(
				function(notes){
					// This function can be called more than one time (various responses)
					// Test if notesList has been already loaded
					if (!notesList){
						console.log("NOTES RETRIEVED FROM OTHER PZP");
						notesList = notes;
						fileMgr.writeNotesList(notesList);
						updateNotesList();
					}
				}
			)
		}

		// If fileAPI is ready
		var successCB = function(){

			// If the file has been read
			var gotNotesList = function(nl){
				notesList = nl;
				updateNotesList();

				// Now retrieve remote NotesList, and look for changes
				var gotRemoteNL = false;
				webinosMgr.getNotesFromOtherPZP(
					function(remoteNotesList){
						if (!gotRemoteNL){
							gotRemoteNL = true;
							dataMgr.mixNotesList(notesList, remoteNotesList);
						}
					}
				);
			}

			// If there is no file to read, same actions as fileAPI not ready.
			fileMgr.readNotesList(gotNotesList, errorCB);

		}

		// Initialize fileManager, and when ready, try to read notes.
		fileMgr = new fileManager(successCB, errorCB);

	}
}

// First, we detect if it's a new note or an existing note.
// Url like:
// Blank new note: http://*.editNote.html?id=blank
// Existing note: http://*.editNote.html?id=1
function initEdit(){
	var idParameter = getURLParameter('id');

	noteContent = $("#noteContent");

	if (idParameter == 'blank'){
		if (popupTitleOpened){
			// Function called by closing a popup
			popupTitleOpened = false;
			return;			
		}
		
		// New note
		console.log("CreateNewNote");
		currentNote = dataMgr.getNewNote(pzhName);
		askTitle("blank");
	} else {
		if (!notesList){
			// editNote.html has been loaded before index.html (not possible in WRT)
			alert("Load first index.html");
		} else {
			// notesList loaded in the past
			if (popupTitleOpened){
				// Function called by closing a popup
				popupTitleOpened = false;
				return;
			}

			// notesList is loaded, so we get the note from notesList.
			currentNote = dataMgr.getNoteById(idParameter, notesList);
		}

		// Set the according title
		setTitle(currentNote.title);

		// Delete previous content in the interface
		noteContent.html("");

		// Iterate and fill the interface with note's contents.
		for (contentIndex in currentNote.content){
			content = currentNote.content[contentIndex];
			if (content.type == "txt"){
				noteContent.append("<p>"+content.content+"</p>");
			} else if (content.type == "img"){
				noteContent.append('<p style="text-align: center"><img id="' + content.content + 
					'" alt="" width="'+ noteWidth +'" /></p>');
				fileMgr.readLocalImg(content.content, function(data, name){
					imgs = $("img[id='"+ name +"']");
					for (imgIndex in imgs){
						imgs[imgIndex].src = data;
					}
				})
			}
		}
	}
	// Here we have the note variable loaded and ready to be accessed.
}

// Function called when the title has been set via popup
// The note will be updated, so there is no need to save the note.
function titleEdited(el, event){
	event.preventDefault();
	setTitle($("input[name=title]")[0].value);
	$("#titlePopup").popup('close');	
	saveNote();
}

// Show the popup for asking note's title
var askTitle = function(mode){
	if (mode == "existing")
		$("input[name=title]")[0].value = dataMgr.getTitle(currentNote);
	
	popupTitleOpened = true;
	$("#titlePopup").popup('open');

}

var setTitle = function(title){
	$("#noteTitle")[0].innerHTML = title;
	dataMgr.setTitle(currentNote, title);
	updateNotesList();
}

var showAlert = function(text){
	var notificationArea = $(".notificationArea");
	notificationArea.show('fast');
	notificationArea.html(text);
	notificationArea.delay(3000).hide('fast');
};

// If webinos is not present use only initinterface();

// INITIAL ATIONS
// Load webinos and initialise interface, or wait until webinos is loaded to do the same.
if ("webinos" in window){
	// If webinos is already loaded
	console.log("Webinos at first");
	initInterface();
} else {
	// Wait until webinos is loaded
	var interval = self.setInterval(function(){
		if ("webinos" in window){
			// Webinos detected
			window.clearInterval(interval);

			initInterface();
			console.log("A wait has been necessary to load webinos");
		}
	}, 100);		
	console.log(interval);
}

// This event will be fired every time a page has been loaded, it doesn't matter if it's cached or if it doesn't
$(document).bind( 'pagechange', function(event){
	$.mobile.loading('show');
	console.log("fired PageChange");
	console.log(event.currentTarget.URL);
	var currentPage = getCurrentPageFromJQMEvent(event);
	
	// Only possible when running on a browser
	if (currentPage == ""){ 
		waitWebinosPZHAndRunFunction("index");
	
	// Usual case when running on WRT or a browser
	} else if (currentPage.split("?")[0] == "index.html"){
		waitWebinosPZHAndRunFunction("index");

	// Only in a browser
	} else if (currentPage.split("?")[0] == "editNote.html"){
		waitWebinosPZHAndRunFunction("edit");
	}
});

// Everything inside this will be executed after page has been loaded
$(document).bind( 'pageinit', function(event){
	console.log("PageInit fired");
	console.log(event);
});

// FILE API
function readFileAsDataURL(file){
	var reader = new FileReader();
	reader.onload = function(event){
		// Show the image
		$("#noteContent").append('<p style="text-align: center"><img src="' + event.target.result + 
				'" alt="" width="'+ noteWidth +'" /></p>');

	};

	reader.onerror = function(){
		console.log("Error loading file for showing");
	}

	reader.readAsDataURL(file);

}

// Generates a random string
function randomString(length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}