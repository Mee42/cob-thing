# Paths for cob network tables
This is the place to keep track of all the different network tables used in the cob. 
Add anything new here first, and then cob.h/cpp and renderer.js, before working with it

|key|desc|datatype|range|on cob|on robot|Planned|
|:---|:---:|:----:|:---:|:----:|:-----------:|:------|
`/cob/location/x` | Number | 0+ | The X value of the robot | ✖️ | ✖️ | ✖️
`/cob/location/y` | Number | 0+ | The Y value of the robot | ✖️ | ✖️ | ✖️
`/cob/location/rotation` | Number | 0-360 | The rotation of the robot | ✔️ | ✔️ | ✔️
`/cob/location/xVel` | Number | 0+- | The velocity of the robot in the X direction | ✖️ | ✖️ | ➖
`/cob/location/yVel` | Number | 0+- | The velocity of the robot in the Y direction | ✖️ | ✖️ | ➖
`/cob/location/left-distance` | Number | 0+ | The distance returned by the left distance sensor | ✖️ | ✖️ | ✖️
`/cob/location/right-distance` | Number | 0+ | The distance returned by the right distance sensor | ✖️ | ✖️ | ✖️
`/cob/arm/main-arm/rotation` | Number | 0-360 | The rotation of the main arm | ✔️ | ✖️ | ✔️
`/cob/arm/wrist/rotation` | Number | 0-360 | The rotation of the wrist | ✔️ | ✖️ | ✔️
`/cob/arm/wrist/vacuum` | Boolean | True/False | The on/off state of the vacuum | ✔️ | ✖️ | ✔️
`/cob/arm/wrist/hatch` | Boolean | True/False | Whether or not the wrist is in hatch mode | ✔️ | ✖️ | ✔️
`/cob/robot/is-sandstorm` | Boolean | True/False | If it is currently sandstorm | ✖️ | ✖️ | ✔️
`/cob/robot/is-teleop` | Boolean | True/False | If it is currently teleop | ✖️ | ✖️ | ✔️
`/cob/robot/is-enabled` | Boolean | True/False | If the robot is currently enabled | ✖️ | ✖️ | ✔️
`/cob/robot/is-field-oriented` | Boolean | True/False | If the robot is currently field oriented | ✖️ | ✔️ | ✔️ 
`/cob/fms/time-left` | Number | 0+ | The time left, in seconds, in the match | ✔️ | ✖️ | ✔️
`/cob/fms/is-red` | Boolean | True/False | If the robot is on team red | ✔️ | ✖️ | ✔️
