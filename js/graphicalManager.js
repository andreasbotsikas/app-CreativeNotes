var webinosMgr;
var serverMgr;
var dataMgr;
var notesList;
var currentNote;
var popupTitleOpened = false;
var defaultUntitledTitle = "Untitled Note";
var noteWidth = "95%";
// Show a spinning wheel while testing everything

var defaultGroup = "WebinosTelefonica"

var img_server = "http://195.235.93.35";
var img_folder = "static/";

// Now, the pages are static HTML, so we can wait to load webinos after painting the interface and handle the messages. 
// In the first try (demo), the waiting for webinos will be inside $(document).bind(pageinit). 
// In the future, first we have to load webinos, and when ready we'll get notes and after paint the interface.

// FUNCTIONS
function initInterface(){
	// graphicalManager tendrá las funciones directamente
	webinosMgr = new webinosManager();
	serverMgr = new serverManager();
	dataMgr = new dataManager();
}

// CARLOS
function saveNote(){
	// Actually get content of the note and send to the server
	var imagesURLs = new Array();
	var result = new Array();
	var imageIndex = 0;
	var noteData = new Array ();

	$.each($(".imageInput"), function (){
		if (this.files[0]){
			imagesURLs.push(img_server+"/"+img_folder+this.files[0].name);
			result.push("NULL");
		}
	});
	
	$.each($(".imageInput"), function (imageIndex){
		if (this.files[0]){
			console.log("Uploading Image"); 
			serverMgr.uploadImage(result,imageIndex,this.files[0]); 
			imageIndex++;
		}
	});

	// In mobile, $(".noteDataItem") is not present when looking for them:
	var noteDataItems = $(".noteDataItem");
	
	var interval = window.setInterval(function(){
		var loop = true;
		$.each(result, function (){
			loop = false; 
			if(this == "NULL") 
				loop = true;
		});

		if (result.length == 0) 
			loop = false;

		if (!loop){
			window.clearInterval(interval);
			console.log ("Images Uploaded");

			imageIndex = 0;

			$.each(noteDataItems, function (){
				if ($(this).is('.textInput')){
					noteData.push (
						{
							"type":"txt",
							"content":this.value
						}
					);
				} else {
					noteData.push (
						{
							"type":"img",
							"content":imagesURLs[imageIndex]
						}
					);
					if (currentNote.thumb == dataMgr.getDefaultThumb())
						dataMgr.setThumb(currentNote, imagesURLs[imageIndex]);
					imageIndex++;
				}
			});
			console.log ("Note Data:: ");
			console.log (noteData);
			currentNote.content = currentNote.content.concat(noteData);
			tmpId = serverMgr.sendNote(currentNote);
			try {
				// First, test if the server has answer rightly.
				id = parseInt(tmpId);
				// Append the note to the list if new note
				if (dataMgr.getId(currentNote) == -1){
					dataMgr.setId(currentNote, id);

					notesList.push(currentNote);
					var title = dataMgr.getTitle(currentNote);
					var thumb = dataMgr.getThumb(currentNote);
					var subtitle = dataMgr.getSubtitle(currentNote);
					$("#notesList").append('<li><a href="editNote.html?id='+id+'">\
								<img src="'+ thumb +'" />\
								<h3>'+ title +'</h3>\
								<p>'+ subtitle +'</p>\
							</a></li>'
					);
					$("#notesList").listview('refresh');
				} else {
					// If existing note
					updateNotesList();
				}
			} catch(err) {			
				console.log("Error while sending note to backend:");
				console.log("Server response:");
				console.log(tmpId);
				console.log(err);
			}

			// Send though webinos anyway (it doesn't )
			webinosMgr.sendTextEvent(currentNote);
		}
	}, 100);

	// Then, send the webinos event
}

function updateNotesList(){
	var currentPage = getCurrentPage();
	if (currentPage.split("?")[0] == "index.html"){
		$("#notesList").html("");
		for (var noteIndex in notesList){
			var note = notesList[noteIndex];
			var title = dataMgr.getTitle(note);
			var thumb = dataMgr.getThumb(note);
			var subtitle = dataMgr.getSubtitle(note);
			var id = dataMgr.getId(note);
			$("#notesList").append('<li><a href="editNote.html?id='+id+'">\
						<img src="'+ thumb +'" />\
						<h3>'+ title +'</h3>\
						<p>'+ subtitle +'</p>\
					</a></li>\
				');
		}
		$("#notesList").listview('refresh');

	}
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
		console.log("SessionID of webinos loaded");
		runFunction(funcion);
	} else {
		// Wait until webinos is loaded
		var interval = self.setInterval(function(){
			if (webinos.session.getSessionId()){
				// sessionId detected
				window.clearInterval(interval);

				console.log("SessionID of webinos loaded");
				runFunction(funcion);
				console.log("A wait has been necessary to load sessionId");
			}
		}, 100);		
	}


}

// If it is the first time we execute the function, it will retrive notesList and fill the interface.
function initIndex(){

	if (!notesList){
		// Get notesList from the server.
		notesList = serverMgr.getNotes(webinosMgr.getPZHName());

		// Fill the interface with the notes retrieved.
		for (var noteIndex in notesList){
			var note = notesList[noteIndex];
			var title = dataMgr.getTitle(note);
			var thumb = dataMgr.getThumb(note);
			var subtitle = dataMgr.getSubtitle(note);
			var id = dataMgr.getId(note);
			$("#notesList").append('<li><a href="editNote.html?id='+id+'">\
						<img src="'+ thumb +'" />\
						<h3>'+ title +'</h3>\
						<p>'+ subtitle +'</p>\
					</a></li>\
				');
		}
		$("#notesList").listview('refresh');
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
		var pzhName = webinosMgr.getPZHName();
		currentNote = dataMgr.getNewNote(pzhName);
		askTitle("blank");
	} else {
		if (!notesList){
			// editNote.html has been loaded before index.html (not possible in WRT)
			currentNote = serverMgr.getSingleNote(idParameter);
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
				noteContent.append('<p style="text-align: center"><img src="' + content.content + 
					'" alt="" width="'+ noteWidth +'" /></p>');
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

// This event will be fired every time a page has been loaded, no matters if it's cached or if it doesn't
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
	reader.readAsDataURL(file);
	reader.onload = function(event){
		// Show the image
		$("#noteContent").append('<p style="text-align: center"><img src="' + event.target.result + 
				'" alt="" width="'+ noteWidth +'" /></p>');

	};
	reader.onerror = function(){
		console.log("Error loading file for showing");
	}
}