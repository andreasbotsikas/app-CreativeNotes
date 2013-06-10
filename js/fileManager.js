function fileManager(successCB, errorCB){
	var fileService;
	var fileSystem;
	var otherFileServices = [];
	var otherFileSystems = [];

	var notesListFileName = "CreativeNotes.json";

	function error(log){
		console.log(log);
	};

	function errorWithCB(log){
		console.log(log);
		errorCB(log);
	}  

	function onServiceFound(ser){
		// Test if it's fileAPI from another PZP
		if (ser.serviceAddress != webinos.session.getPZPId()){
			// Add it to otherPZP list, to otherFileServices and exit (we do not bind at the moment)
			otherPZP.push(ser.serviceAddress);
			otherFileServices.push(ser);
			return;
		}

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

	var readImg = function(name, fs, successCB, errorCB, foreign){
		if (!fs){
			console.log("File API not initializated");
			return -1;
		};

		var error = function(e){
			console.log("Error loading image");
			console.log(e);
		}

		fs.root.getDirectory('img', {create: true}, function(dirEntry) {
	        dirEntry.getFile(name, null, function(fileEntry){
	            fileEntry.file(function(file){
	            	file.type = "image/jpeg";
		        	if (foreign){
		        		// Get local img dir
		        		fileSystem.root.getDirectory('img', null, function(imgDir){
		        			// Copy remote img to local storage. First get new file
		        			imgDir.getFile(name, {create: true}, function(newEntry){
		        				// Create writer
		        				newEntry.createWriter(function(fileWriter){
		        					// 
		        					fileWriter.onerror = error;
		        					fileWriter.onwriteend = function(end){
		        						console.log("Foreign img copied in local");
						                newEntry.file(function(file){
						                	successCB(URL.createObjectURL(file), name);
						                	/*
						                    fr = new FileReader();
						                    fr.onload = function(e){
						                       successCB(e.target.result, name);
						                    }
						                    fr.readAsDataURL(file);
						                    */
						                }, error)
		        					}
		        					fileWriter.write(file);
		        				})
		        			}, error)
		        		}, error);
		        	} else {
	                	successCB(URL.createObjectURL(file), name);			        		
/*	                    fr = new FileReader();
	                    fr.onload = function(e){
	                       successCB(e.target.result, name);
	                    }
	                    fr.readAsDataURL(file);*/
		        	}
                }, error)
	        }, error)
		}, error);
	}

	this.readLocalImg = function(name, successCB){
		readImg(name, fileSystem, successCB, function(error){
			console.log("Error loading local img");
		}, false);
	}

	fsIndex = 0;
	dates = [];

	this.readForeignImg = function(name, successCB){
		// Read the image from the first fileSystem, if there isn't first fileService, if not second and so on.
		if (otherFileSystems[fsIndex]){
			readImg(name, otherFileSystems[fsIndex], successCB, function(error){
				// The filesystem has been initialized but unsuccesfully, reload it
				otherFileSystems[fsIndex] = undefined;
				readForeignImg(name, successCB);
			}, true);
		} else if (otherFileServices[fsIndex]) {
			otherFileServices[fsIndex].bindService({
				onBind: function(){
			    	otherFileServices[fsIndex].requestFileSystem(1,200*1024*1024,function(fs){
			      		otherFileSystems[fsIndex] = fs;
			      		readImg(name, fs, successCB, function(error){
			      			// Image not present in this fileSystem go to the next device
			      			fsIndex++;
							readForeignImg(name, successCB);
			      		}, true);
			      	}, function(error){
			      		// The filesystem does not work, go to next device
		      			fsIndex++;
						readForeignImg(name, successCB);
			      	});
			  	}
			})
		}
	}

	var sendImgToFS = function(file, fs){
		fs.root.getDirectory('img', {create: true}, function(dirEntry) {
        	dirEntry.getFile(file.name, {create: true}, function(fileEntry){
        		fileEntry.createWriter(function(fileWriter){
        			fileWriter.onerror = function(error){
        				console.log("Error creating fileWriter in foreign file");
        				console.log(error);
        				console.log(fileEntry);
        			};
        			fileWriter.onwriteend = function(end){
        				if (fs == fileSystem){
        					console.log("Img written in local");
        				} else {
	        				console.log("Local img written in remote");
        				}
        			}
        			fileWriter.write(file);
        		})
        	}, function(error){
        		console.log("Error creating file");
        		console.log(error);
        	});
        }, function(error){
        	console.log("Error loading img foreign");
        });
	}

	this.sendImg = function(file){
		for (deviceIndex in otherFileServices){
			if (otherFileSystems[deviceIndex]){
				sendImgToFS(file, otherFileSystems[deviceIndex]);
			} else {
				fser = otherFileServices[fsIndex]
				fser.requestFileSystem(1,200*1024*1024,function(fs){
					otherFileSystems[deviceIndex] = fs;
					sendImgToFS(file, fs);
				}, function(error){
					console.log("Error requesting quota in foreign filesystem");
				});
			}

		}
	}

	this.saveImg = function(file){
		sendImgToFS(file, fileSystem);
	}

}