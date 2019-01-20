
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

//addresses from last year - will need some ajustments
let addresses = {
	rotation : '/cob/rotation', //pass the rotation of the robot here (0 - 360)
	position : {
		x : '/cob/position/x', //pass the x position of the robot here
        y : '/cob/position/y' //pass the y position of the robot here 
	},
	velocity : {
		direction : '/cob/velocity/direction', //pass the direction the robot is moving here (0 - 365)
		magnitude : '/cob/velocity/magnitude' //pass the speed of the robot here (0 - infinity)
	},
	arm : {
		height : '/cob/arm/height', //pass the height of the arm here (0 - 1)
		rotation : '/cob/arm/rotation', //pass the rotation of the arm here (0 - 136)
		cubeGrabbed : '/cob/arm/cube-grabbed', //pass if the cube is grabbed here (UNUSED)
		climbStatus : '/cob/arm/climb-status' //pass the climb status here (UNUSED)
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
		field : '/cob/fms/field', //pass the field game data ('RRR', 'LLL', 'RLR', 'LRL')
		alliance : '/cob/fms/alliance' //pass if the alliance is red (true, false)
	},
	lidar: '/cob/lidar',
	update: '/cob/update',
	debug : {
		error : '/cob/debug/error' //used for debugging the COB
	}
};

let ui = {
	rotation : document.getElementById('rotation'),
	teleop: document.getElementById('whatsrunning'),
	timeleft: document.getElementById('timeleft')
};

function render(){
	console.log("Rendering")
	ui.rotation.textContent = 'Rotation: ' + NetworkTables.getValue(addresses.rotation,'unknown')
	ui.teleop.textContent = NetworkTables.getValue(addresses.game.teleop,false) ? 'teleop is running' : 
								NetworkTables.getValue(addresses.game.teleop,false) ? 'Auto is running' : 'Nothing is running'
	ui.timeleft.textContent = 'Time left: ' + NetworkTables.getValue(addresses.fms.time,'-1')

}
render()

NetworkTables.addGlobalListener((key,value,isNew) => {
	render()
},false)