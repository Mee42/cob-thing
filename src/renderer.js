
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
    vision: {
        centerX: "/vision/centerX",
        centerY: "/vision/centerY",
        height: "/vision/height",
        angle: "/vision/angle",
        width: "/vision/width"        
    }
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
    NetworkTables.putValue(addresses.fms.timeLeft,180)
    NetworkTables.putValue(addresses.fms.isRed,false)
    
    NetworkTables.putValue(addresses.vision.centerX,[])
    NetworkTables.putValue(addresses.vision.centerY,[])
    NetworkTables.putValue(addresses.vision.height,[])
    NetworkTables.putValue(addresses.vision.angle,[])
    NetworkTables.putValue(addresses.vision.width,[])
    
    
}
initAllDatapoints()


let ui = {
	rotation : document.getElementById('rotation'),
	teleop: document.getElementById('whatsrunning'),
	timeleft: document.getElementById('timeleft'),
	arm : {
		canvas : document.getElementById('arm'), //the arm canvass
    },
    timer: {
        canvas : document.getElementById('timer')
    },
    view: {
        canvas :document.getElementById('view')  
    },
	dev: {
        timer : document.getElementById('dev-timer'),
        arm : document.getElementById('dev-arm'),
        wrist : document.getElementById('dev-wrist')
    },
	connecter: {
		address: document.getElementById('connect-address'),
        connect: document.getElementById('connect'),
        login: document.getElementById('login')
	}
};


NetworkTables.addRobotConnectionListener(onRobotConnection, false);


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
    renderTimer()
    renderView()
}

function renderView(){

    if(!NetworkTables.isRobotConnected()){
        //if not connected, we can't render this - just to be safe
        return
    }
    if(ui.view.canvas == null){
        console.log("unable to render view due to contnt undefined")
        return
    }
    // console.log("render view")
    let ct = ui.view.canvas.getContext("2d")
    let xMax = 980
    let yMax = 540
    let centerX = NetworkTables.getValue('' + addresses.vision.centerX)
    
    let centerY = NetworkTables.getValue('' + addresses.vision.centerY)

    let heightA = NetworkTables.getValue('' + addresses.vision.height)
    let widthA = NetworkTables.getValue('' + addresses.vision.width)
    let angleA = NetworkTables.getValue('' + addresses.vision.angle)

    ct.fillStyle = 'black'
    ct.fillRect(0,0,xMax,yMax)
    

    ct.fillStyle = 'green'
    let i = -1
    while(centerX[++i] != undefined){
        let x = centerX[i]
        let y = centerY[i]
        let height = heightA[i]
        let h = height/2//THis is for calculations, makes stuff easier
        let width = widthA[i]
        let w = width/2//see above
        let angle = angleA[i]
        if(height < width){
            let a = height//assume hight is always bigger
            height = width
            width = a 
        }
        let rotation = function(x,y,sin,cos,addX,addY){
            let obj = {}
            obj.x = (x*cos - y*sin) + addX
            obj.y = (x*sin + y*cos) + addY
            return obj
        }
        let sin = Math.sin(angle * (Math.PI/180))
        let cos = Math.cos(angle * (Math.PI/180))
        
        let a = rotation(-w,-h,sin,cos,x,y)
        let b = rotation(+w,-h,sin,cos,x,y)
        let c = rotation(+w,+h,sin,cos,x,y)
        let d = rotation(-w,+h,sin,cos,x,y)
        ct.beginPath()
        ct.moveTo(a.x,a.y)
        ct.lineTo(b.x,b.y)
        ct.lineTo(c.x,c.y)
        ct.lineTo(d.x,d.y)
        ct.lineTo(a.x,a.y)
        ct.fill()
    }
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
    console.log("called renderTimer()")
    let time = NetworkTables.getValue('' + addresses.fms.timeLeft)
    let isRed = NetworkTables.getValue('' + addresses.fms.isRed)
    if(isRed == 'true'){
        isRed = true;
    }
    let ct = ui.timer.canvas.getContext("2d")
    let xMax = 250
    let yMax = 250
    ct.fillStyle = 'rgba(0,0,0,0)'//transparency
    ct.fillRect(0, 0, xMax, yMax);
    ct.fillStyle = (isRed)? 'red' : 'blue'
    ct.beginPath();
    ct.arc(xMax/2,yMax/2, 50, 0, 2 * Math.PI);
    ct.fill(); 
    let amountToFill = time / 180.0//3 minutes
    let archToFill = amountToFill * (2 * Math.PI)//amountToFill should be 0 <= x <= 1 so this should fall under 0 <= x <= (2*PI)
    ct.fillStyle = (isRed) ? 'DarkRed' : 'DarkBlue'
    ct.beginPath();
    ct.moveTo(xMax/2,yMax/2)
    ct.arc(xMax/2,yMax/2, 50, 0, archToFill);
    ct.moveTo(xMax/2,yMax/2)
    ct.fill(); 

    //do the text
    ct.font = "30px Monospace";
    ct.fillStyle = 'white'
    ct.textAlign = "center"; 
    
    let text = '' + Math.floor(time/60) + ':' + Math.floor(time%60)
    ct.fillText(text, xMax/2, yMax/2+10);//30px text, 15px ajustment?
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
	let mainArmRotation = NetworkTables.getValue('' + addresses.arm.mainArm.rotation)
    mainArmRotation = (mainArmRotation - 90) % 360
    let wristArmRotation = NetworkTables.getValue('' + addresses.arm.wrist.rotation)
    wristArmRotation = (wristArmRotation + 0/*ajustment value*/) % 360//keep it below 360
	// let wrist = NetworkTables.getValue(addresses.arm.wrist.rotation)
	//consts
	let xMax = ui.arm.canvas.width
    let yMax = ui.arm.canvas.height
    let xMid = 20 
    let yMid = yMax/2


	let armLength = 200
	let wristLength = 30

	let ct = ui.arm.canvas.getContext("2d");
    // ct.fillStyle = "#bbb";
    // ct.fillStyle = 'black'//transparent
    ct.fillRect(0, 0, ui.arm.canvas.width, ui.arm.canvas.height);
    
    ct.fillStyle = '#bbb'

	ct.fillRect(0, 0, ui.arm.canvas.width, ui.arm.canvas.height);
	ct.beginPath()
	ct.moveTo(xMid,yMax)
	ct.lineTo(xMid,yMid);//the middle of the default size
	let newX = Math.cos(mainArmRotation * (Math.PI / 180))*armLength + xMid
	let newY = Math.sin(mainArmRotation * (Math.PI / 180))*armLength + yMid
    ct.lineTo(newX,newY)
    let wristX = Math.cos(wristArmRotation * (Math.PI / 180))*wristLength + newX
    let wristY = Math.sin(wristArmRotation * (Math.PI / 180))*wristLength + newY
    ct.lineTo(wristX,wristY)
    //draw to 
    ct.stroke()
    
}

NetworkTables.addKeyListener('' + addresses.arm.mainArm.rotation,()=>{
    renderArm()
},false);
NetworkTables.addKeyListener('' + addresses.arm.wrist.wrist,()=>{
	renderArm()
},false);
NetworkTables.addKeyListener('' + addresses.arm.wrist.rotation,()=>{
    renderArm()
},false)
NetworkTables.addKeyListener('' + addresses.fms.timeLeft,()=>{
    renderTimer();
},false)
NetworkTables.addKeyListener('' + addresses.fms.isRed,()=>{
    renderTimer();
},false)

NetworkTables.addKeyListener('' + addresses.vision.centerX,()=>{
    renderView();
},false)

NetworkTables.addKeyListener('' + addresses.vision.centerY,()=>{
    renderView();
},false)

NetworkTables.addKeyListener('' + addresses.vision.height,()=>{
    renderView();
},false)

NetworkTables.addKeyListener('' + addresses.vision.angle,()=>{
    renderView();
},false)

NetworkTables.addKeyListener('' + addresses.vision.width,()=>{
    renderView();
},false)



//dev input
ui.dev.timer.oninput = function() {
    NetworkTables.putValue('' + addresses.fms.timeLeft,this.value)
};
ui.dev.arm.oninput = function() {
    NetworkTables.putValue('' + addresses.arm.mainArm.rotation,this.value)
};
ui.dev.wrist.oninput = function() {
    NetworkTables.putValue('' + addresses.arm.wrist.rotation,this.value)
};





// NetworkTables.addGlobalListener(onValueChanged,true)//comment out when not used

function onValueChanged(key,value,isNew){
	// Sometimes, NetworkTables will pass booleans as strings. This corrects for that.
	if (value === 'true') {
		value = true;
	} else if (value === 'false') {
		value = false;
	}
}


fullRender()