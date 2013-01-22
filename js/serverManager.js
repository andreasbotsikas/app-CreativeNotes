function serverManager(){
	var notesList;

	this.getNotes = function(pzhname){
		return notesList;
	}

	this.uploadImage = function (result, index, file){
		//comprobamos que hay una imagen seleccionada
		if(file){
			//console.log(file);
			//console.log("[iomanager: photo:  trying to upload - Name: " + file.name + " Type: " + file.type + file.size+"]");
			var data = new FormData();
			data.append('file',file);

			$.ajax({
				url: "http://creativenotes.site88.net/php/upload_pic.php",
				data: data,
				cache: false,
				contentType: false,
				processData: false,
				type: 'POST',
				async: false,
				success: function(data){
					//console.log(["uploaded!"]);
					result[index]=("DONE");
					//console.log(index+":  creativenotes2/php/upload/img_"+file.name);
					console.log("success finsih: "+index);
				},
				error: function (data){
					//console.log(["error!"]);
					result[index]=("FAIL");
				}
			});
			console.log("ajax finish: "+index);
		}
	}

	notesList = [
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
		},
		{
			id: 1,
			group: 'WebinosTelefonica',
			title: 'Almond bags in mustard',
			thumb: 'img/thumb/2_01.jpg',
			content: [
				{
					type: 'txt',
					content: 'We have to vaccum smashed almonds'
				},
				{
					type: 'img',
					content: 'img/thumb/2_01.jpg'
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
			thumb: 'img/thumb/3_01.jpg',
			content: [
				{
					type: 'txt',
					content: 'First, we have to make ices'
				},
				{
					type: 'img',
					content: 'img/thumb/3_01.jpg'
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
			thumb: 'img/thumb/4_01.jpg',
			content: [
				{
					type: 'txt',
					content: 'Cut the strawberries in halfs'
				},
				{
					type: 'img',
					content: 'img/thumb/4_01.jpg'
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
			thumb: 'img/thumb/5_01.jpg',
			content: [
				{
					type: 'txt',
					content: 'First, we have to cook the lentils'
				},
				{
					type: 'img',
					content: 'img/thumb/5_01.jpg'
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
			thumb: 'img/thumb/6_01.jpg',
			content: [
				{
					type: 'txt',
					content: 'First, we have to cook the lentils'
				},
				{
					type: 'img',
					content: 'img/thumb/6_01.jpg'
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
			thumb: 'img/thumb/7_01.jpg',
			content: [
				{
					type: 'txt',
					content: 'First, we have to cook the lentils'
				},
				{
					type: 'img',
					content: 'img/thumb/7_01.jpg'
				},
				{
					type: 'txt',
					content: 'Spread the lentils on the pizza base'
				}
			]
		}
	]

}	