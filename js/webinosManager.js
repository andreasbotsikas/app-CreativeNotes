function webinosManager(){
	// OTHER VARIABLES
	var eventService;

	// ATTRIBUTES

	// METHODS
	function getPZHName(){
		// Name of the PZH
		var ssid = webinos.session.getSessionId();
		console.log("Session id: "+ssid);
		if (ssid){
			return (ssid.split('/')[0]);
		} else {
			return undefined;
		}
	}

	function eventReceived(event){	
		console.log("Nuevo evento recibido");
		console.log(event);		

		// Test if the source of the event is this client
		if (event.addressing.source.id == webinos.session.getSessionId()){
			// The event has been sent by this client
			alert("Note succesfully created/updated");
			updateNotesList();
		} else {
			// The event has been sent by another PZP
			alert(event.addressing.source.id.split('/')[1] + " has sent a new/updated note");
			dataMgr.addNote(event.payload, serverMgr.getNotes());
		}
	}

	// Funciones accesibles desde fuera
	this.getPZHName = function(){
		getPZHName();
	}

	this.sendTextEvent = function(event){
		// Create event from Events Module
		var newEvent = eventService.createWebinosEvent();
		newEvent.payload = event;
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
					alert("Succesfully connected to Webinos PZH: "+getPZHName());
				}})
            }}
	);		
	// ACTIONS
}