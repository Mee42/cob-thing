
// const remote = require('electron').remote;
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
function initAllDatapoints(){
    NetworkTables.putValue(addresses.location.x,0)
    NetworkTables.putValue(addresses.location.y,0)
    NetworkTables.putValue(addresses.location.rotation,0)
    NetworkTables.putValue(addresses.arm.mainArm.rotation,0)
    NetworkTables.putValue(addresses.arm.wrist.rotation,0)
    NetworkTables.putValue(addresses.arm.wrist.vacuum,false)
    NetworkTables.putValue(addresses.robot.isSandstorm,false)
    NetworkTables.putValue(addresses.robot.isTeleop,false)
    NetworkTables.putValue(addresses.robot.isEnabled,false)
    NetworkTables.putValue(addresses.fms.timeLeft,-1)
    NetworkTables.putValue(addresses.fms.isRed,false)
    
    
}
initAllDatapoints()


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
        connect: document.getElementById('connect'),
        login: document.getElementById('login')
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
        login.style.width = "0%"
        fullRender()
	} else {
        login.style.width = "100%"

        // login.style.display = "block"

		// Add Enter key handler
		console.log("called onRObotConnection:" + state)
		address.onkeydown = ev => {
			if (ev.key === 'Enter') {
				connect.click();
			}
		};
		// Enable the input and the button
		address.disabled = false;
		// connect.disabled = false;
		connect.firstChild.data = 'Connect';
		// CHANGE THIS VALUE TO YOUR ROBOT'S IP ADDRESS
		// address.value = '10.6.23.2';
		address.focus();
        // address.setSelectionRange(8, 12);
        
		// On click try to connect and disable the input and the button
		connect.onclick = () => {
            console.log("connect button clicked")
            if(connect.firstChild.data == 'Connect'){
                ipc.send('connect', address.value);
                address.disabled = true;
                // connect.disabled = true;
                connect.firstChild.data = 'Connecting';
            }else if(connect.firstChild.data == 'Connecting'){
                ipc.send('stop-connect');
                address.disabled = false;
                connect.disabled = false;
                connect.firstChild.data = 'Connect'
            }
		};
	}
}

function fullRender(){
    renderArm()

}

function renderArm(){
    if(!NetworkTables.isRobotConnected()){
        //if not connected, we can't render this
        return
    }
    if(ui.arm.canvas == null ){
        //for some reason this happens when it's covered
        console.log("unable to render arm due to context undefined")
        return
    }
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



