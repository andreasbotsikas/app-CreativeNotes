function webinosManager(){
	/*

	Communication SCHEMA:
	--------------getNotes---------------
	PZP loads and ask other PZP for notes
	-PZP1		-		-PZP2
		cn-getNotes----->		
		<------cn-getNotesResp
	
	--------------sendNote---------------
	PZP sends an update of a new or an existing note
	-PZP1		-		-PZP*
		cn-sendNote------>

	*/


	var eventService;
	var gotNotesCB;

	this.getNotesFromOtherPZP = function(successCB, errorCB){
		sendGetNotesEvent();
		gotNotesCB = successCB;

	}

	function sendGetNotesEvent(){
		// First, retrieve a valid PZP to ask for notes
		// This should be webinos.session.getOtherPZP(), but it doesn't work
		// Now it asks everyone for notesList, when getOtherPZP works it will ask only one device
		var newEvent = eventService.createWebinosEvent();
		newEvent.type = "cn-getNotes";

		/* Fill this when getOtherPZP works
		newEvent.addressing = {};
		newEvent.addressing.to = [];
		newEvent.addressing.to[0] =
		*/

		newEvent.dispatchWebinosEvent({});
	}

	function sendGetNotesResponseEvent(originalEvent){
		// Create an event fo

		var newEvent = eventService.createWebinosEvent();
		newEvent.type = "cn-getNotesResp";

		// Add notesList
		newEvent.payload = notesList;
		newEvent.inResponseTo = originalEvent;
		
		// Add recipient
		newEvent.addressing = {};
		newEvent.addressing.to = [];
		newEvent.addressing.to[0] = {};
		newEvent.addressing.to[0].id = originalEvent.addressing.source.id;

		// Actually send the event
		newEvent.dispatchWebinosEvent({});

		console.log(newEvent);
	}

	function eventReceived(event){	
		console.log("Nuevo evento recibido");
		console.log(event);		

		// Look who is the creator of the event
		if (event.addressing.source.id == webinos.session.getSessionId()){
			// The event has been created by this device
			switch (event.type){
				case "cn-getNotes":
					// Do nothing, we are asking for notes, we don't have notes.
					break;
				case "cn-sendNotes":
					// The event has been sent by this client
					showAlert("Note succesfully created/updated");
					break;
			}
		} else {
			// The event has been created by someone else
			switch (event.type){
				case "cn-getNotes":
					// Someone is asking for notesList
					sendGetNotesResponseEvent(event);
					break;
				case "cn-sendNotes":
					// Someone has send a new or updated note
					showAlert(event.addressing.source.id.split('/')[1] + " has sent a new or updated note");
					dataMgr.addNote(event.payload, notesList);
					break;
				case "cn-getNotesResp":
					console.log("NOTES RECEIVED FROM OTHER PZP");
					gotNotesCB(event.payload);
					break;
			}
		}
	}

	this.getPZHName = function(){
		return getPZHName();
	}

	var getPZHName = function(){
		// Name of the PZH
		var ssid = webinos.session.getSessionId();
		console.log("Session id: "+ssid);
		if (ssid){
			var pzh = ssid.split('/')[0];
			return pzh;
		} else {
			return undefined;
		}
	}

	this.sendNoteEvent = function(note){
		// Create event from Events Module
		var newEvent = eventService.createWebinosEvent();
		newEvent.type = "cn-updatedNote"
		newEvent.payload = note;
		newEvent.dispatchWebinosEvent({});
	}

	// Init webinos. It will look for services, and will bind some listeners when found
	// Events module:
	webinos.discovery.findServices(
    	new ServiceType('http://webinos.org/api/events'), 
			{onFound: function(ser){
				// Save the service instance
				eventService = ser;
				console.log("Servicio encontrado");
				// When the service has been found, it will bound to it
				ser.bind({onBind: function(variable){
					// Once bound, let's register to all events.
					console.log("Api de eventos: "+ser.api+" bound");
					console.log("APP ID: "+ser.myAppID);
					console.log(variable);
					ser.addWebinosEventListener(eventReceived);
					showAlert("Succesfully connected to Webinos PZH: "+getPZHName());
				}})
            }}
	);		
}