function fileManager(successCB, errorCB){
	var fileService;
	var fileSystem;

	var notesListFileName = "CreativeNotes.json";

	function error(log){
		console.log(log);
	};

	function errorWithCB(log){
		console.log(log);
		errorCB(log);
	}

	function onServiceFound(ser){
		fileService = ser;
		ser.bindService({
			onBind: function(){
		    	ser.requestFileSystem(1,200*1024*1024,function(fs){
		      		fileSystem = fs;

		      		// Once fileSystem API has been initialized, let's call successCB
		      		// For example, when FileAPI is ready, read notesList from file.
		      		successCB()
		      	}, errorWithCB);
		  }
		});
	};

	var init = function(){
    	webinos.discovery.findServices(
			new ServiceType("http://webinos.org/api/file"),
			{
				onFound: onServiceFound, 
				onLost: errorWithCB, 
				onError: errorWithCB
			}
		);
	};

	this.readNotesList = function(successCB, errorCB){
		if (!fileSystem){
			console.log("File API not initializated");
			errorCB("File API not initializated");
			return;
		};

		var error = function(){
			errorCB();
		}

		// Read the notesList file and return it as a variable
		fileSystem.root.getFile(notesListFileName, {}, function(fileEntry) {
			// Get a File object representing the file,
			// then use FileReader to read its contents.
			fileEntry.file(function(file) {
		    	var reader = new FileReader();

		    	reader.onloadend = function(e) {
		    		console.log("Notes successfully read from file");
		    		successCB(JSON.parse(this.result));
		    	};

		    	reader.readAsText(file);
		  	}, error);

		}, error);
	};

	this.writeNotesList = function(notesList){
		if (!fileSystem){
			console.log("File API not initializated");
			return -1;
		};

		// Open notesList file and write updated content.
		fileSystem.root.getFile(notesListFileName, {create: true}, function(fileEntry){
			fileEntry.createWriter(function(fileWriter){
		    	fileWriter.onwriteend = function(e){
		    		console.log("Notes written in file");
		    	};

		    	fileWriter.onerror = function(e){
		      		console.log('Write failed: '+e.toString());
		    	};

		    	var blob = new Blob([JSON.stringify(notesList)], {type: 'text/plain'});

			    fileWriter.write(blob);
		  	}, error);
		});		
	};

	init();

}