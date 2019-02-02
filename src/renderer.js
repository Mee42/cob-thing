
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

let addresses = {
    location : {
        x: "/cob/location/x",
        y: "/cob/location/y",
        rotation: "/cob/location/rotation",
    },
    arm: {
        mainArm: {
            rotation: "/cob/arm/main-arm/rotation",
        },
        wrist: {
            rotation: "/cob/arm/wrist/rotation",
            vacuum: "/cob/arm/wrist/vacuum",
        },
    },
    robot: {
        isSandstorm: "/cob/robot/is-sandstorm",
        isTeleop: "/cob/robot/is-teleop",
        isEnabled: "/cob/robot/is-enabled",
    },
    fms: {
        timeLeft: "/cob/fms/time-left",
        isRed: "/cob/fms/is-red",
    },
}


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




