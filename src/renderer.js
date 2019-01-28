
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

//addresses from last year - will need some ajustments
//actually
let addresses = {
	rotation : '/cob/rotation', //pass the rotation of the robot here (0 - 360)
	position : {
		x : '/cob/position/x', //pass the x position of the robot here
        y : '/cob/position/y' //pass the y position of the robot here 
	},
	autonomous : {
		emergencyStop : '/cob/autonomous/emergency-no-auto', //send the autonomous emergency no stop option (true, false)
		side : '/cob/autonomous/side', //send the robot's starting position (0, 1, 2)
		instructions : '/cob/autonomous/instructions', //send the robot's instructions (0, 1, 2, or 3 for side routes, any integer for center)
		enableOpposite : '/cob/autonomous/enable-crossing', //send the enable crossing option (true, false)
	},
	game : {
		autonomous : '/cob/gamedata/is-autonomous', //pass if the robot is in autonomous (true, false)
		teleop : '/cob/gamedata/is-teleop', //pass if the robot is in teleop (true, false)
		enabled : '/cob/gamedata/is-enabled' //pass if the robot is enabled (true, false)
	},
	fms : {
		time : '/cob/fms/time', //pass the time left in the period in seconds (0 - infinity)
		alliance : '/cob/fms/alliance' //pass if the alliance is red (true, false)
	},
	debug : {
		error : '/cob/debug/error' //used for debugging the COB
	}
};

let ui = {
	rotation : document.getElementById('rotation'),
	teleop: document.getElementById('whatsrunning'),
	timeleft: document.getElementById('timeleft')
};

//should be split into different functions, so that the entire thing doesn't have to render when one thing updates
//also, values that can be changed and don't touch anything else should (ie, robot vacume on/off) should just be handled in the listener
//more complex stuff (like the arm) should have a dedicated method renderArm() which is called from the listeners
//For now, this should work fine
function render(){
	console.log("Rendering")
	ui.rotation.textContent = 'Rotation: ' + NetworkTables.getValue(addresses.rotation,'unknown')
	ui.teleop.textContent = NetworkTables.getValue(addresses.game.teleop,false) ? 'teleop is running' : 
								NetworkTables.getValue(addresses.game.teleop,false) ? 'Auto is running' : 'Nothing is running'
	ui.timeleft.textContent = 'Time left: ' + NetworkTables.getValue(addresses.fms.time,'-1')

}
render()
//methods such as render(), and later on renderArm() etc, should be called in a function renderAll()
// which will be called as the last thing in this file, rendering the entire screen.
// for now, calling it directly after instansiation will work fine
// without doing this, the screen's objects will not 




NetworkTables.addGlobalListener(onValueChanged,true)

function onValueChanged(key,value,isNew){
	// Sometimes, NetworkTables will pass booleans as strings. This corrects for that.
	if (value === 'true') {
		value = true;
	} else if (value === 'false') {
		value = false;
	}
	render();//render every time something new happens. Should be removed when render() is refactored into listeners
}

/**
 * Carson: This is the old onValueChanged function and it only deals with SmartDashboard stuff. 
 * because rerendering is handled by key listensers, this method should only work with keys that are unknown at compile time
 * and/or follow key designs which means it changes (note - if we do end up doing this, it's probably bad code)
 * 
 * 
 * Global Listener that runs whenever any value changes
 * @param {string} key
 * @param value
 * @param {boolean} isNew
 */
function old_onValueChanged(key, value, isNew) {
	// Sometimes, NetworkTables will pass booleans as strings. This corrects for that.
	if (value === 'true') {
		value = true;
	} else if (value === 'false') {
		value = false;
	}
	//Carson: This is the code that takes in data that the robot pushes to the SmartDashboard (a simple wrapper around the network tables) 
	//and displays it...somewhere
	//It builds the html to edit the value and puts listensers on them to update the network tables
	//This only applies to the /SmartDashboard/ datapoints
	//However, this seems to call a non-existant ui object, ui.tuning

	// The following code manages tuning section of the interface.
	// This section displays a list of all NetworkTables variables (that start with /SmartDashboard/) and allows you to directly manipulate them.
	var propName = key.substring(16, key.length);
	// Check if value is new and doesn't have a spot on the list yet
	if (isNew && !document.getElementsByName(propName)[0]) {
		// Make sure name starts with /SmartDashboard/. Properties that don't are technical and don't need to be shown on the list.
		if (/^\/SmartDashboard\//.test(key)) {
			// Make a new div for this value
			var div = document.createElement('div'); // Make div
			ui.tuning.list.appendChild(div); // Add the div to the page
			var p = document.createElement('p'); // Make a <p> to display the name of the property
			p.appendChild(document.createTextNode(propName)); // Make content of <p> have the name of the NetworkTables value
			div.appendChild(p); // Put <p> in div
			var input = document.createElement('input'); // Create input
			input.name = propName; // Make its name property be the name of the NetworkTables value
			input.value = value; // Set
			// The following statement figures out which data type the variable is.
			// If it's a boolean, it will make the input be a checkbox. If it's a number,
			// it will make it a number chooser with up and down arrows in the box. Otherwise, it will make it a textbox.
			if (typeof value === 'boolean') {
				input.type = 'checkbox';
				input.checked = value; // value property doesn't work on checkboxes, we'll need to use the checked property instead
				input.onchange = function() {
					// For booleans, send bool of whether or not checkbox is checked
					NetworkTables.putValue(key, this.checked);
				};
			} else if (!isNaN(value)) {
				input.type = 'number';
				input.onchange = function() {
					// For number values, send value of input as an int.
					NetworkTables.putValue(key, parseInt(this.value));
				};
			} else {
				input.type = 'text';
				input.onchange = function() {
					// For normal text values, just send the value.
					NetworkTables.putValue(key, this.value);
				};
			}
			// Put the input into the div.
			div.appendChild(input);
		}
	} else {
		//if it already exists, it's already been verified as /SmartDashboard/
		// Find already-existing input for changing this variable
		var oldInput = document.getElementsByName(propName)[0];
		if (oldInput) {
			if (oldInput.type === 'checkbox')
				oldInput.checked = value;
			else
				oldInput.value = value;
		}
		else console.log('Error: Non-new variable ' + key + ' not present in tuning list!');
	}
}









