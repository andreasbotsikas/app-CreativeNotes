// Only for testing purpouses
var webinosMgr;
var serverMgr;
var dataMgr;
var notesList;
var currentNote;


var img_server = "http://creativenotes.site88.net";
var img_folder = "php/upload/img_";

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

	$.each($(".imageInput"), function (){imagesURLs.push(img_server+"/"+img_folder+this.files[0].name);result.push("NULL");});
	$.each($(".imageInput"), function (imageIndex){
		console.log("Uploading Image"); 
		serverMgr.uploadImage(result,imageIndex,this.files[0]); 
		imageIndex++;
	});
	var interval = window.setInterval(function(){
		var loop = true;
		$.each(result,function (){loop = false; if(this == "NULL") loop = true;});
		if (result.length == 0) loop = false;
		if (!loop){
			window.clearInterval(interval);
			/*for (var i = 0; i<result.length; i++)
				if (result[i]!="DONE") imagesURLs[i] = img_server + "/" + img_folder + "error.jpg";*/
			//console.log(result);
			//content = CGM.getNoteContent(result);
			console.log ("Images Uploaded");
			//return result;
			imageIndex = 0;

			$.each($(".noteDataItem"), function (){
				if ($(this).is('.textInput')){
					noteData.push ({"type":"txt","content":this.value});
				}
				else{
					noteData.push ({"type":"img","content":imagesURLs[imageIndex]});
					imageIndex++;
				}
			});
			//note.content = noteData;
			console.log ("Note Data:: ");
			console.log (noteData);
			currentNote.content = currentNote.content.concat(noteData);
			webinosMgr.sendTextEvent(currentNote);
		}
	}, 100);

	// Then, send the webinos event
}

function updateNotesList(){
	var currentPage = getCurrentPageFromJQMEvent(event);
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
	row += 		"<input type='file' class='noteDataItem imageInput' name='image'/>";
	row += "</p>";
	
	$("#noteContent").append(row);	
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

// Saca el parámetro name de la url (CGI)
// http://.../editNote.html?id=4 --> getURLParameter(id) = 4
function getURLParameter(name){
	return decodeURI(
		(RegExp(name + '=' + '(.+)(&|$)').exec(location.search)||[,null])[1]
	);
}

function getURLParameterFromURL(name, url){
	var questionSplit = url.split("?");
	var afterQuestion = questionSplit[questionSplit.length -1];
	return decodeURI(
		(RegExp(name + '=' + '(.+)(&|$)').exec(afterQuestion)||[,null])[1]
	);
}

function initIndex(){
	// Llenamos la lista de notas
	if (!notesList){
		notesList = serverMgr.getNotes(webinosMgr.getPZHName());

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

function initEdit(){
	// Comprobamos si creamos o editamos una nota
	// Suponemos una url del tipo:
	// Nota nueva: http://*.editNote.html?id=blank
	// Nota existente: http://*.editNote.html?id=1
	var idParameter = getURLParameter('id');
	noteContent = $("#noteContent");
	if (idParameter == 'blank'){
		// Nota nueva
		console.log("CreateNewNote");
		currentNote = dataMgr.getNewNote(webinosMgr.getPZHName());
	} else {
		// Editar nota existente
		currentNote = dataMgr.getNoteById(idParameter, notesList);
		for (contentIndex in currentNote.content){
			content = currentNote.content[contentIndex];
			if (content.type == "txt"){
				noteContent.append("<p>"+content.content+"</p>");
			} else if (content.type == "img"){
				noteContent.append('<p style="text-align: center"><img src="' + content.content + '" alt="" /></p>');
			}
		}
	}

	// Aquí ya tenemos la variable note, que es la nota que estamos editando.
}

var showAlert = function(text){
		alert(text);
};

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
}



// This event will be fired every time a page has been loaded, no matters if it's cached or if it doesn't
$(document).bind( 'pagechange', function(event){
	console.log("fired PageChange");
	console.log(event.currentTarget.URL);
	var currentPage = getCurrentPageFromJQMEvent(event);
	if (currentPage == ""){
		initIndex();
	// Lo siguiente reconocerá index.html y tambíén si le metemos un ?, por ejemplo index.html?group=telefonica
	} else if (currentPage.split("?")[0] == "index.html"){
		initIndex();
	} else if (currentPage.split("?")[0] == "editNote.html"){
		initEdit();
	}

});

// Everything inside this will be executed after page has been loaded
$(document).bind( 'pageinit', function(event){
	console.log("PageInit fired");
	console.log(event);
});

// Código útil:
/*
Sacar el ultimo archivo de la url y comparar si estamos en el root:
OJO debería ir dentro de pageinit.
	// First we get if we are in the root or in index.html to load everything from the beggining.
	var last = document.URL.split("/").pop(); 

	if ((last == "") || (last == "index.html")){
		initialized = true;
	} else {
	}
*/