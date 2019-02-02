
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
	timeleft: document.getElementById('timeleft'),
	arm : {
		canvas : document.getElementById('arm'), //the arm canvass
	},
	test: {
		slider :document.getElementById('angleSlider')
	},
	connecter: {
		address: document.getElementById('connect-address'),
		connect: document.getElementById('connect')
	}
};


NetworkTables.addRobotConnectionListener(onRobotConnection, true);


function onRobotConnection(connected) {
	var state = connected ? 'Robot connected!' : 'Robot disconnected.';
	let address = ui.connecter.address
	let connect = ui.connecter.connect
	console.log(state);
	// ui.robotState.data = state;
	if (connected) {
		// On connect hide the connect popups
		document.body.classList.toggle('login', true);
	} else {
		// On disconnect show the connect popup
		document.body.classList.toggle('login', false);
		// Add Enter key handler
		console.log("called onRObotConnection:" + state)
		address.onkeydown = ev => {
			if (ev.key === 'Enter') {
				connect.click();
			}
		};
		// Enable the input and the button
		address.disabled = false;
		connect.disabled = false;
		connect.firstChild.data = 'Connect';
		// CHANGE THIS VALUE TO YOUR ROBOT'S IP ADDRESS
		address.value = '10.6.23.2';
		address.focus();
		address.setSelectionRange(8, 12);
		// On click try to connect and disable the input and the button
		connect.onclick = () => {
			console.log("connect button clicked")
			ipc.send('connect', address.value);
			address.disabled = true;
			connect.disabled = true;
			connect.firstChild.data = 'Connecting';
		};
	}
}


//should be split into different functions, so that the entire thing doesn't have to render when one thing updates
//also, values that can be changed and don't touch anything else should (ie, robot vacume on/off) should just be handled in the listener
//more complex stuff (like the arm) should have a dedicated method renderArm() which is called from the listeners
//For now, this should work fine
function render(){
	console.log("Rendering")
	ui.rotation.textContent = 'Rotation: ' + NetworkTables.getValue(addresses.rotation,'unknown')
	ui.teleop.textContent = NetworkTables.getValue(addresses.robot.isTeleop,false) ? 'teleop is running' : 
								NetworkTables.getValue(addresses.robot.isSandstorm,false) ? 'Sandstorm is running' : 'Nothing is running'
	ui.timeleft.textContent = 'Time left: ' + NetworkTables.getValue(addresses.fms.time,'-1')

}
render()
//methods such as render(), and later on renderArm() etc, should be called in a function renderAll()
// which will be called as the last thing in this file, rendering the entire screen.
// for now, calling it directly after instansiation will work fine
// without doing this, the screen's objects will not 

function renderArm(){
	let main = NetworkTables.getValue('' + addresses.arm.mainArm.rotation)
	main = (main - 90) % 360
	// let wrist = NetworkTables.getValue(addresses.arm.wrist.rotation)
	//consts
	let xMax = 500
	let yMax = 500
	let armLength = 200
	let wristLength = 30

	let ct = ui.arm.canvas.getContext("2d");
	ct.fillStyle = "silver";

	ct.fillRect(0, 0, ui.arm.canvas.width, ui.arm.canvas.height);
	ct.beginPath()
	ct.moveTo(xMax/2,yMax)
	ct.lineTo(xMax/2,yMax/2);//the middle of the default size
	let newX = Math.cos(main * (Math.PI / 180))*armLength + xMax/2
	let newY = Math.sin(main * (Math.PI / 180))*armLength + yMax/2
	ct.lineTo(newX,newY)
	ct.stroke()
}
renderArm()

NetworkTables.addKeyListener('' + addresses.arm.mainArm.rotation,()=>{
	renderArm()
},false);
NetworkTables.addKeyListener('' + addresses.arm.wrist.wrist,()=>{
	renderArm()
},false);





// NetworkTables.addGlobalListener(onValueChanged,true)//comment out when not used

function onValueChanged(key,value,isNew){
	// Sometimes, NetworkTables will pass booleans as strings. This corrects for that.
	if (value === 'true') {
		value = true;
	} else if (value === 'false') {
		value = false;
	}
}




