
// const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
var memoize = require("memoizee");

let addresses = {
    location : {
        rotation: "/cob/location/rotation",
    },
    fms: {
        timeLeft: "/cob/fms/time-left",
        isRed: "/FMSInfo/IsRedAlliance",
    },
    mode: "cob/mode", //0 = Field Orient, 1 = Robot Orient, 2 = Auto, 3 = Vision, 4 = Disabled
}

function initAllDatapoints(){
    NetworkTables.putValue(addresses.location.rotation, 0);
    NetworkTables.putValue(addresses.fms.timeLeft, 180);
    NetworkTables.putValue(addresses.fms.isRed, false);
    NetworkTables.putValue(addresses.mode, 4);
}

let ui = {
    rotation : document.getElementById('rotation'),
    timeleft: document.getElementById('timeleft'),
    timer: {
        canvas : document.getElementById('timer'),
        mode : document.getElementById("robot-mode"),
    },
    robot: {
        image : document.getElementById('robot'),
    },
	connecter: {
		address: document.getElementById('connect-address'),
        connect: document.getElementById('connect'),
        login: document.getElementById('login'),
	}
};

//memoizeation
var sine = function(rot) {
    return Math.sin(Math.floor(rot) * (Math.PI/180))
};
var cos = function(rot) {
    return Math.cos(Math.floor(rot) * (Math.PI/180))
};

let sinM = memoize(sine);
let cosM = memoize(cos)

NetworkTables.addRobotConnectionListener(onRobotConnection, false);

function onRobotConnection(connected) {
	var state = connected ? 'Robot connected!' : 'Robot disconnected.';
	let address = ui.connecter.address
	let connect = ui.connecter.connect
	console.log(state);
	// ui.robotState.data = state;
	if (connected) {
        initAllDatapoints()

		// On connect hide the connect popups
        login.style.width = "0%"
        fullRender()
	} else {
        login.style.width = "100%"

        // login.style.display = "block"

		// Add Enter key handler
		console.log("robot connection changed:" + state)
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
	// address.value = 'roborio-62X-frc.local';
     address.value = '10.6.2X.2'
		address.focus();
        address.setSelectionRange(6,7);

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
    renderTimer()
    renderRobot()
}

function renderRobot(){
    console.log("rendering robot")
    if(!NetworkTables.isRobotConnected()){
        //if not connected, we can't render this - just to be safe
        return
    }

    let angle = NetworkTables.getValue('' + addresses.location.rotation)
    angle = (angle + 360) % 360
    ui.robot.image.style.transform = "rotate("+ angle +"deg)"
}

function renderTimer(){
    
    if(!NetworkTables.isRobotConnected()){
        //if not connected, we can't render this - just to be safe
        return
    }
    //Mode Identifier
    let mode = NetworkTables.getValue("" + addresses.mode);
    if (mode === 0){
        ui.timer.mode.innerText = "Field Oriented";
    }else if (mode === 1){
        ui.timer.mode.innerText = "Robot Oriented";
    }else if (mode === 2){
        ui.timer.mode.innerText = "Auto";
    }else if (mode === 3){
        ui.timer.mode.innerText = "Vision";
    }else if (mode === 4){
        ui.timer.mode.innerText = "Disabled";
    }
    if(ui.timer.canvas == null){
        console.log("unable to render timer due to contnt undefined")
        return
    }
    // console.log("called renderTimer()")
    let time = NetworkTables.getValue('' + addresses.fms.timeLeft)
    console.log(time);
    time = Math.floor(time);
    let isRed = NetworkTables.getValue('' + addresses.fms.isRed)
    if(isRed == 'true'){
        isRed = true;
    }
    let ct = ui.timer.canvas.getContext("2d")
    let max = ui.timer.canvas.width
    ct.fillStyle = 'rgba(0,0,0,0)'//transparency
    let isFlashing = time <= 45 && time % 2 === 1 && NetworkTables.getValue("" + addresses.mode) <= 1;
    ct.fillRect(0, 0, max, max);
    if (isFlashing){ 
        ct.fillStyle = '#F4D03F';
    }else{
        ct.fillStyle = (isRed)? 'red': 'blue';
    }
    ct.beginPath();
    ct.arc(max/2,max/2, max/2, 0, 2 * Math.PI);
    ct.fill();
    let amountToFill = time / 180.0//3 minutes
    let archToFill = amountToFill * (2 * Math.PI)//amountToFill should be 0 <= x <= 1 so this should fall under 0 <= x <= (2*PI)
    if (isFlashing){ 
        ct.fillStyle = '#D4AC0D';
    }else{
        ct.fillStyle = (isRed)? 'darkRed': 'darkBlue';
    }
    ct.beginPath();
    ct.moveTo(max/2,max/2)
    ct.arc(max/2,max/2, max/2, 0, archToFill);
    ct.moveTo(max/2,max/2)
    ct.fill();

    //do the text
    ct.font = "75px Monospace";
    ct.fillStyle = 'white'
    ct.textAlign = "center";

    let text = '' + Math.floor(time/60) + ':' + Math.floor(time%60)
    ct.fillText(text, max/2, max/2+20);//30px text, 15px ajustment?

    // console.log(NetworkTables.getValue('' + addresses.robot.isField))
}

function rectange(){
    return {
        a: {x:0,y:0},
        b: {x:0,y:0},
        c: {x:0,y:0},
        d: {x:0,y:0}
    }
}

function renderRotatedRectangle(ct,ver,rot,x,y){
    let rotation = function(x,y,sin,cos,addX,addY){
        let obj = {}
        obj.x = (x*cos - y*sin) + addX
        obj.y = (x*sin + y*cos) + addY
        return obj
    }

    let sin = sinM(rot)
    let cos = cosM(rot)

    let a1 = rotation(ver.a.x,ver.a.y,sin,cos,x,y)
    ver.a = a1
    let b1 = rotation(ver.b.x,ver.b.y,sin,cos,x,y)
    ver.b = b1
    let c1 = rotation(ver.c.x,ver.c.y,sin,cos,x,y)
    ver.c = c1
    let d1 = rotation(ver.d.x,ver.d.y,sin,cos,x,y)
    ver.d = d1
    ct.beginPath()
    ct.moveTo(a1.x,a1.y)
    ct.lineTo(b1.x,b1.y)
    ct.lineTo(c1.x,c1.y)
    ct.lineTo(d1.x,d1.y)
    ct.lineTo(a1.x,a1.y)
    ct.fill()
}

function addNetworkTables(){

    NetworkTables.addKeyListener('' + addresses.fms.timeLeft,()=>{
        renderTimer();
    },false)


    NetworkTables.addKeyListener('' + addresses.location.rotation,()=>{
        renderRobot();
    })

    NetworkTables.addKeyListener('' + addresses.fms.isRed,()=>{
    renderTimer();
    })
    NetworkTables.addKeyListener('' + addresses.mode,()=>{
        renderTimer();
        })
}
addNetworkTables();
fullRender()