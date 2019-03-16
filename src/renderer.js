
// const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
var memoize = require("memoizee");


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
            hatch: "/cob/arm/wrist/is-hatch"
        },
    },
    robot: {
        isSandstorm: "/cob/robot/is-sandstorm",
        isTeleop: "/cob/robot/is-teleop",
        isEnabled: "/cob/robot/is-enabled",
        isField : "/cob/robot/is-field-oriented"
    },
    fms: {
        timeLeft: "/cob/fms/time-left",
        isRed: "/FMSInfo/IsRedAlliance",
    },
    vision: {
        centerX: "/vision/centerX",
        centerY: "/vision/centerY",
        height: "/vision/height",
        angle: "/vision/angle",
        width: "/vision/width"
    },
    ak : {
        isPressed: "/cob/ak/is-pressed"
    }
}

function initAllDatapoints(){
    NetworkTables.putValue(addresses.location.x,0)
    NetworkTables.putValue(addresses.location.y,0)
    NetworkTables.putValue(addresses.location.rotation,0)
    NetworkTables.putValue(addresses.arm.mainArm.rotation,0)
    NetworkTables.putValue(addresses.arm.wrist.rotation,0)
    NetworkTables.putValue(addresses.arm.wrist.vacuum,false)
    NetworkTables.putValue(addresses.arm.wrist.hatch,false)

    NetworkTables.putValue(addresses.robot.isSandstorm,false)
    NetworkTables.putValue(addresses.robot.isTeleop,false)
    NetworkTables.putValue(addresses.robot.isEnabled,false)
    NetworkTables.putValue(addresses.robot.isField,false)

    NetworkTables.putValue(addresses.fms.timeLeft,180)
    NetworkTables.putValue(addresses.fms.isRed,false)

    NetworkTables.putValue(addresses.vision.centerX,[])
    NetworkTables.putValue(addresses.vision.centerY,[])
    NetworkTables.putValue(addresses.vision.height,[])
    NetworkTables.putValue(addresses.vision.angle,[])
    NetworkTables.putValue(addresses.vision.width,[])
    NetworkTables.putValue(addresses.ak.isPressed,false)

}


let ui = {
	rotation : document.getElementById('rotation'),
	teleop: document.getElementById('whatsrunning'),
	timeleft: document.getElementById('timeleft'),
	arm : {
		canvas : document.getElementById('arm'), //the arm canvass
    },
    timer: {
        canvas : document.getElementById('timer'),
        field : document.getElementById('field')
    },
    view: {
        canvas :document.getElementById('view')
    },
    robot: {
        canvas : document.getElementById('robot')
    },
    wrist: {
        canvas : document.getElementById('wrist')
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
    renderArm()
    renderTimer()
    renderView()
    renderRobot()
    renderWrist()
}

function renderWrist(){
    // console.log("rendering wrist")
    if(!NetworkTables.isRobotConnected()){
        //if not connected, we can't render this - just to be safe
        return
    }
    if(ui.wrist.canvas == null){
        console.log("unable to render robot due to contnt undefined")
        return
    }
    let ct = ui.wrist.canvas.getContext("2d")
    let xMax = ui.wrist.canvas.width
    let yMax = ui.wrist.canvas.height

    //get data
    let vacuumOn = NetworkTables.getValue('' + addresses.arm.wrist.vacuum)
    let hatch = NetworkTables.getValue('' + addresses.arm.wrist.hatch)

    let r = 50

    ct.strokeStyle = 'sliver'

    if(vacuumOn){

        let grd = ct.createLinearGradient(0, 0, xMax, 0);
        let ak = NetworkTables.getValue('' + addresses.ak.isPressed)
        // console.log(ak)
        ak = (('' + ak) == 'true') ? true : false
        // console.log(ak)
        let color =  ak ? 'red' : 'blue'
        // console.log(color)
        grd.addColorStop(1, color);
        grd.addColorStop(0, "white");

        ct.fillStyle = grd;
    }else{
        ct.fillStyle = 'white'

    }
    ct.fillRect(0,0,xMax,yMax)


    ct.beginPath()
    // ct.moveTo(0,0)
    ct.moveTo(4 * r, yMax/2 - r + (hatch ? 0 : 1/2*r))
    ct.lineTo(2 * r,yMax/2 -r)
    ct.lineTo(r,yMax/2)
    ct.lineTo(2 * r,yMax/2 + r)
    ct.lineTo(4 * r, yMax/2 + r - (hatch ? 0 : 1/2*r))
    ct.lineWidth = r;
    ct.lineJoin = "round";

    ct.stroke()
}

function renderRobot(){

    if(!NetworkTables.isRobotConnected()){
        //if not connected, we can't render this - just to be safe
        return
    }
    if(ui.robot.canvas == null){
        console.log("unable to render robot due to contnt undefined")
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
    // console.log(a.x + "," + a.y + ":" + b.x + "," + b.y + ":" +c.x + "," + c.y + ":" + d.x + "," + d.y + ":")
    // renderArm()
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
    // 1/2 : 2
    // 3/4 : 4/3
    let scale = 4.0/3.0
    let centerX = NetworkTables.getValue('' + addresses.vision.centerX)

    let centerY = NetworkTables.getValue('' + addresses.vision.centerY)

    let heightA = NetworkTables.getValue('' + addresses.vision.height)
    let widthA = NetworkTables.getValue('' + addresses.vision.width)
    let angleA = NetworkTables.getValue('' + addresses.vision.angle)
    let scaleFactor = undefined
    ct.fillStyle = 'black'
    ct.fillRect(0,0,xMax,yMax)


    ct.fillStyle = 'green'
    let i = -1
    while(centerX != undefined && centerX[++i] != undefined &&
        centerY != undefined && centerY[i] != undefined &&
        heightA != undefined && heightA[i] != undefined &&
        widthA != undefined && widthA[i] != undefined &&
        angleA != undefined && angleA[i] != undefined){
        let x = centerX[i]/scale
        let y = centerY[i]/scale
        let height = heightA[i]/scale
        let h = height/2//THis is for calculations, makes stuff easier
        let width = widthA[i]/scale
        let w = width/2//see above
        let angle = angleA[i]
        if(height < width){
            let a = height//assume hight is always bigger
            height = width
            width = a
        }
        let ver = rectange()
        ver.a = {x:+w,y:+h}
        ver.b = {x:+w,y:-h}
        ver.c = {x:-w,y:-h}
        ver.d = {x:-w,y:+h}

        renderRotatedRectangle(ct,ver,angle,x,y)
        let TEST = true
        if(TEST){
            console.log("a:(" + ver.a.x +"," + ver.a.y + ")" +
            "b:(" + ver.b.x +"," + ver.b.y + ")" +
            "c:(" + ver.c.x +"," + ver.c.y + ")" +
            "d:(" + ver.d.x +"," + ver.d.y + ")")
        }
        //to set the scale value
        let newScale = height/(167/scale)
        if(scaleFactor == undefined || newScale > scaleFactor){
            scaleFactor = newScale
        }

    }
    /*
a:(485.57822994427727,160.08644417561493)
b:(465.3576041381055,73.1377541153606)
c:(431.645952184629,80.9776732560257)
d:(451.86657799080075,167.92636331628003)

a:(301.06389439451357,80.09744224105077)
b:(272.2785911264726,71.7648535083116)
c:(249.1188448632989,151.77124062027735)
d:(277.9041481313399,160.10382935301652)

a:(473.3971153723523,138.81612120176152)
b:(455.2403950498923,50.233336071698176)
c:(422.25358042842896,56.99460877870722)
d:(440.41030075088895,145.57739390877057)

a:(289.58235652499064,52.10770029961328)
b:(258.66910629571714,43.399739517058215)
c:(234.67167179532186,128.59060292304298)
d:(265.58492202459536,137.29856370559804)

a:(426.17131161969564,344.45034505153467)
b:(399.7654606211288,338.3540739963644)
c:(383.83903383928873,407.3390073654575)
d:(410.2448848378556,413.4352784206278)

a:(581.1985834529676,405.0665521768541)
b:(562.0310804489405,333.53245711159616)
c:(535.2611028263293,340.70545099697404)
d:(554.4286058303563,412.23954606223197)

//real
a:(570.7436155545697,377.9952045411933)
b:(547.6036799589007,291.6357892142848)
c:(514.8781800997272,300.40456047345515)
d:(538.0181156953962,386.76397580036365)

a:(376.3814728104277,301.54072314284525)
b:(344.06260018814055,294.6711347012005)
c:(325.4925506270723,382.03634900070944)
d:(357.81142324935945,388.9059374423542)

    */
   // console.log("scale:" + scaleFactor + "\nscaleValue:" + scale)
    scale = 1//offset so cords are correfct
    let a2 = {x:570/scale,y:377/scale}
    let b2 = {x:547/scale,y:291/scale}
    let c2 = {x:514/scale,y:300/scale}
    let d2 = {x:538/scale,y:386/scale}

    // let a1 = {x:178/scale,y:104/scale}
    let a1 = {x:376/scale,y:301/scale}
    // let b1 = {x:116/scale,y:86/scale}
    let b1 = {x:344/scale,y:294/scale}
    let c1 = {x:325/scale,y:382/scale}
    let d1 = {x:357/scale,y:388/scale}
    scale/=0.6
    let c = {x:d1.x,y:d1.y}


    let arr = [a1,b1,c1,d1,a2,b2,c2,d2]
    // for (let i = 0; i < arr.length; i++) {
    //     arr[i].x = arr[i].x - 50;
    // }

    let scaleFactorX = scaleFactor;

    scaleFactor = 1
    ct.strokeStyle = 'red'
    ct.beginPath()
    ct.moveTo(a1.x,a1.y)
    ct.lineTo(b1.x,b1.y)
    ct.lineTo(c1.x,c1.y)
    ct.lineTo(d1.x,d1.y)
    ct.lineTo(a1.x,a1.y)

    ct.moveTo(a2.x,a2.y)
    ct.lineTo(b2.x,b2.y)
    ct.lineTo(c2.x,c2.y)
    ct.lineTo(d2.x,d2.y)
    ct.lineTo(a2.x,a2.y)

    ct.stroke()
    return
    console.log("RIP")
    scaleFactor = scaleFactorX

    // let arr = [a1,b1,c1,d1,a2,b2,c2,d2]

    // console.log(arr)
    // for(ar in arr){
    //for some reason the line of code above doesn't work
    for (let i = 0; i < arr.length; i++) {
        arr[i].x = arr[i].x - c.x
        arr[i].y = arr[i].y - c.y
    }//align origins to a local origin
    // console.log(arr)

    for (let i = 0; i < arr.length; i++) {

        arr[i].x = arr[i].x * scaleFactor
        arr[i].y = arr[i].y * scaleFactor
    }
    // console.log(arr)

    for (let i = 0; i < arr.length; i++) {
        arr[i].x = arr[i].x + c.x
        arr[i].y = arr[i].y + c.y
    }//alight origins back to the real ones
    // console.log(arr)

    ct.strokeStyle = 'yellow'
    ct.beginPath()
    ct.moveTo(a1.x,a1.y)
    ct.lineTo(b1.x,b1.y)
    ct.lineTo(c1.x,c1.y)
    ct.lineTo(d1.x,d1.y)
    ct.lineTo(a1.x,a1.y)

    ct.moveTo(a2.x,a2.y)
    ct.lineTo(b2.x,b2.y)
    ct.lineTo(c2.x,c2.y)
    ct.lineTo(d2.x,d2.y)
    ct.lineTo(a2.x,a2.y)

    ct.stroke()
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

    ui.timer.field.textContent = (
        ('' + NetworkTables.getValue('' + addresses.robot.isField) == 'true') ? "Field Oriented" : "Robot Oriented"
    )

    // console.log(NetworkTables.getValue('' + addresses.robot.isField))
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
    //
    let pot = 2.47777
	let mainArmRotation = NetworkTables.getValue('' + addresses.arm.mainArm.rotation)
    mainArmRotation = -1 *(((mainArmRotation / pot) % 360) - 90 + 25)
    // console.log("arm:" + mainArmRotation)
    let wristArmRotation = NetworkTables.getValue('' + addresses.arm.wrist.rotation)
    let wristpot = 1
    wristArmRotation = ((wristArmRotation / wristpot)%360) + 0//keep it below 360
    // console.log("wrist:" + wristArmRotation)
    // let wrist = NetworkTables.getValue(addresses.arm.wrist.rotation)
	//consts
    let yMax = ui.arm.canvas.height
    let xMid = 10
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
    ct.lineWidth = 3;

	ct.moveTo(xMid,yMax)
	ct.lineTo(xMid,yMid);//the middle of the default size
	let newX = cosM(mainArmRotation)*armLength + xMid
	let newY = sinM(mainArmRotation)*armLength + yMid
    ct.lineTo(newX,newY)
    let wristX = Math.cos(wristArmRotation * (Math.PI / 180))*wristLength + newX
    let wristY = Math.sin(wristArmRotation * (Math.PI / 180))*wristLength + newY
    ct.lineTo(wristX,wristY)
    //draw to
    ct.stroke()

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

  NetworkTables.addKeyListener('' + addresses.robot.isField,()=>{
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

  NetworkTables.addKeyListener('' + addresses.location.rotation,()=>{
      renderRobot();
  })

  NetworkTables.addKeyListener('' + addresses.arm.wrist.vacuum, ()=> {
      renderWrist();
  })

  NetworkTables.addKeyListener('' + addresses.arm.wrist.hatch, ()=> {
      renderWrist();
  })
  NetworkTables.addKeyListener('' + addresses.ak.isPressed, ()=> {
      renderWrist();
  })

}
addNetworkTables();


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
