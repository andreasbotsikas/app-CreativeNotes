function serverManager(){
	var notesList;

	this.getNotes = function(pzhname){
		xmlhttp = new XMLHttpRequest(); 
		xmlhttp.open("GET", "http://195.235.93.35/webinos/getMessages/"+pzhname, false); 
		xmlhttp.send(); 
		try{
			notesRetrieved = JSON.parse(xmlhttp.responseText);
			return (notesRetrieved);
		} catch (e){
			showAlert("The serves is unresponsive or data malformed");
			return (notesList);
		}
	}

	this.getSingleNote = function(id){
		xmlhttp = new XMLHttpRequest(); 
		xmlhttp.open("GET", "http://195.235.93.35/webinos/getMessage/"+ id, false); 
		xmlhttp.send(); 
		try{
			var note = JSON.parse(xmlhttp.responseText);
			return (note);
		} catch (e){
			showAlert("The serves is unresponsive or data malformed");
			console.log(xmlhttp.responseText);
			return (-1);
		}
	}

	this.uploadImage = function (result, index, file){
		// Test if file was given
		if(file){
			var data = new FormData();
			data.append('file',file);

			xmlhttp = new XMLHttpRequest(); 
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState==4 && xmlhttp.status==200){
			    	result[index] = ("DONE");
				} else {
					result[index]=("FAIL");
				}
			};
  			xmlhttp.open("POST", "http://195.235.93.35/webinos/saveMedia", true); 
			xmlhttp.send(data);

			console.log("Answer of the server:");
			console.log(xmlhttp.response); 
		}
	}

	this.sendNote = function(note){
		xmlhttp = new XMLHttpRequest(); 
		xmlhttp.open("POST", "http://195.235.93.35/webinos/saveMessage/"+dataMgr.getId(note), false); 
		noteText = "["+JSON.stringify(note)+"]";
		console.log(noteText);
		xmlhttp.send(noteText); 

		// Retrieve the assigned ID
		return xmlhttp.response;
	}

	// Default notes List if webinos or server are down.
	notesList = [
		{
			id: 0,
			group: 'WebinosTelefonica',
			title: 'Lentil\'s Pizza',
			thumb: 'img/1_01.jpg',
			content: [
				{
					type: 'txt',
					content: 'First, we have to cook the lentils'
				},
				{
					type: 'img',
					content: 'img/1_01.jpg'
				},
				{
					type: 'txt',
					content: 'Spread the lentils on the pizza base'
				}
			]
		},
		{
			id: 1,
			group: 'WebinosTelefonica',
			title: 'Almond bags in mustard',
			thumb: 'img/2_01.jpg',
			content: [
				{
					type: 'txt',
					content: 'We have to vaccum smashed almonds'
				},
				{
					type: 'img',
					content: 'img/2_01.jpg'
				},
				{
					type: 'txt',
					content: 'Put it on a mustard base'
				}
			]
		},
		{
			id: 2,
			group: 'WebinosTelefonica',
			title: 'Pork with ice',
			thumb: 'img/3_01.jpg',
			content: [
				{
					type: 'txt',
					content: 'First, we have to make ices'
				},
				{
					type: 'img',
					content: 'img/3_01.jpg'
				},
				{
					type: 'txt',
					content: 'Add vinegar to the pork'
				}
			]
		},
		{
			id: 3,
			group: 'WebinosTelefonica',
			title: 'Marshmallows with strawberries',
			thumb: 'img/4_01.jpg',
			content: [
				{
					type: 'txt',
					content: 'Cut the strawberries in halfs'
				},
				{
					type: 'img',
					content: 'img/4_01.jpg'
				},
				{
					type: 'txt',
					content: 'Put the marshmallows some seconds in the Micro'
				}
			]		
		},
		{
			id: 4,
			group: 'WebinosTelefonica',
			title: 'Roe caviar',
			thumb: 'img/5_01.jpg',
			content: [
				{
					type: 'txt',
					content: 'First, we have to cook the lentils'
				},
				{
					type: 'img',
					content: 'img/5_01.jpg'
				},
				{
					type: 'txt',
					content: 'Spread the lentils on the pizza base'
				}
			]
		},
		{
			id: 5,
			group: 'WebinosTelefonica',
			title: 'Flowers\' spiral',
			thumb: 'img/6_01.jpg',
			content: [
				{
					type: 'txt',
					content: 'First, we have to cook the lentils'
				},
				{
					type: 'img',
					content: 'img/6_01.jpg'
				},
				{
					type: 'txt',
					content: 'Spread the lentils on the pizza base'
				}
			]
		},
		{
			id: 6,
			group: 'WebinosTelefonica',
			title: 'Spinach puree',
			thumb: 'img/7_01.jpg',
			content: [
				{
					type: 'txt',
					content: 'First, we have to cook the lentils'
				},
				{
					type: 'img',
					content: 'img/7_01.jpg'
				},
				{
					type: 'txt',
					content: 'Spread the lentils on the pizza base'
				}
			]
		}
	]

}	