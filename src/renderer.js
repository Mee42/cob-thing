
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
}

function initAllDatapoints(){
    NetworkTables.putValue(addresses.location.rotation,0)
   
    NetworkTables.putValue(addresses.fms.timeLeft,180)
    NetworkTables.putValue(addresses.fms.isRed,false)
}

let ui = {
    rotation : document.getElementById('rotation'),
    timeleft: document.getElementById('timeleft'),
    timer: {
        canvas : document.getElementById('timer'),
    },
    robot: {
        canvas : document.getElementById('robot')
    },
	connecter: {
		address: document.getElementById('connect-address'),
        connect: document.getElementById('connect'),
        login: document.getElementById('login')
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
    if(ui.robot.canvas == null){
        console.log("unable to render robot due to content undefined")
        return
    }
    let ct = ui.robot.canvas.getContext("2d")
    let xMax = ui.robot.canvas.width
    let yMax = ui.robot.canvas.height
    let angle = NetworkTables.getValue('' + addresses.location.rotation)
    angle = (angle + 360 + 180) % 360
    ct.fillStyle = 'white'

    ct.beginPath();
    ct.arc(xMax/2,xMax/2, xMax/2, 0, 2 * Math.PI);
    ct.fill();

    let x = xMax/2
    let y = yMax/2
    let r = 90
    ct.fillStyle = 'silver'
    let ver = rectange()
    ver.a = {x:r,y:r}
    ver.b = {x:r,y:-r}
    ver.c = {x:-r,y:-r}
    ver.d = {x:-r,y:r}
    renderRotatedRectangle(ct,ver,angle,x,y)

    ct.fillStyle = 'black'
    let w = 10
    let h1 = r+10
    let h2 = 10
    ver = rectange()
    ver.a = {x:+w,y:h2}
    ver.b = {x:-w,y:h2}
    ver.c = {x:-w,y:h1}
    ver.d = {x:+w,y:h1}
    renderRotatedRectangle(ct,ver,angle,x,y)

    ct.font = '48px serif';
    ct.fillText(Math.floor(NetworkTables.getValue('' + addresses.location.rotation)), xMax/2 + 50,yMax/2 + 50);
    // console.log(a.x + "," + a.y + ":" + b.x + "," + b.y + ":" +c.x + "," + c.y + ":" + d.x + "," + d.y + ":")
    // renderArm()
}

function renderTimer(){

    if(!NetworkTables.isRobotConnected()){
        //if not connected, we can't render this - just to be safe
        return
    }
    if(ui.timer.canvas == null){
        console.log("unable to render timer due to contnt undefined")
        return
    }
    // console.log("called renderTimer()")
    let time = NetworkTables.getValue('' + addresses.fms.timeLeft)
    let isRed = NetworkTables.getValue('' + addresses.fms.isRed)
    if(isRed == 'true'){
        isRed = true;
    }
    let ct = ui.timer.canvas.getContext("2d")
    let max = ui.timer.canvas.width
    ct.fillStyle = 'rgba(0,0,0,0)'//transparency
    ct.fillRect(0, 0, max, max);
    ct.fillStyle = (isRed)? 'red' : 'blue'
    ct.beginPath();
    ct.arc(max/2,max/2, max/2, 0, 2 * Math.PI);
    ct.fill();
    let amountToFill = time / 180.0//3 minutes
    let archToFill = amountToFill * (2 * Math.PI)//amountToFill should be 0 <= x <= 1 so this should fall under 0 <= x <= (2*PI)
    ct.fillStyle = (isRed) ? 'DarkRed' : 'DarkBlue'
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
}
addNetworkTables();
fullRender()