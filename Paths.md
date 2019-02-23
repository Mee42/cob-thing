# Paths for cob network tables
This is the place to keep track of all the different network tables used in the cob. 
Add anything new here first, and then cob.h/cpp and renderer.js, before working with it

|key|range|desc|on cob|on robot|Planned|
|:---|:--:|:--:|:----:|:-----------:|:------|
`/cob/location/x` | 0+ | The X value of the robot | ✖️ | ✖️ | ✖️
`/cob/location/y` | 0+ | The Y value of the robot | ✖️ | ✖️ | ✖️
`/cob/location/rotation` | 0-360 | The rotation of the robot | ✔️ | ✔️ | ✔️
`/cob/location/xVel` | 0+- | The velocity of the robot in the X direction | ✖️ | ✖️ | ➖
`/cob/location/yVel` | 0+- | The velocity of the robot in the Y direction | ✖️ | ✖️ | ➖
`/cob/location/left-distance` | 0+ | The distance returned by the left distance sensor | ✖️ | ✖️ | ✖️
`/cob/location/right-distance` | 0+ | The distance returned by the right distance sensor | ✖️ | ✖️ | ✖️
`/cob/arm/main-arm/rotation` | 0-360 | The rotation of the main arm | ✔️ | ✖️ | ✔️
`/cob/arm/wrist/rotation` | 0-360 | The rotation of the wrist | ✔️ | ✖️ | ✔️
`/cob/arm/wrist/vacuum` | True/False | The on/off state of the vacuum | ✔️ | ✖️ | ✔️
`/cob/arm/wrist/hatch` | True/False | Whether or not the wrist is in hatch mode | ✔️ | ✖️ | ✔️
`/cob/robot/is-sandstorm` | True/False | If it is currently sandstorm | ✖️ | ✖️ | ✖️
`/cob/robot/is-teleop` | True/False | If it is currently teleop | ✖️ | ✖️ | ✖️
`/cob/robot/is-enabled` | True/False | If the robot is currently enabled | ✖️ | ✖️ | ✖️
`/cob/robot/is-field-oriented` | True/False | If the robot is currently field oriented | ✔️ | ✔️ | ✔️ 
`/cob/fms/time-left` | 0+ | The time left, in seconds, in the match | ✔️ | ✖️ | ✔️
`/cob/fms/is-red` | True/False | If the robot is on team red | ✔️ | ✖️ | ✔️


Here are the values for the arm position values:

```
cob: {
    arm-positions: {
      cargo: {
         rocket-high:"/cob/arm-position/rocket-high"
         rocket-mid:"/cob/arm-position/rocket-mid"
         rocket-low:"/cob/arm-position/rocket-low"
         ground:"/cob/arm-position/cargo/ground"
         ship:"/cob/arm-position/cargo/ship"
      },
      hatch: {
        low:"/cob/arm-position/hatch/low"
        mid:"/cob/arm-position/hatch/mid"
        high:"/cob/arm-position/hatch/high"
      }
      secure: "/cob/arm-position/secure"
      alley-oop: "/cob/arm-position/alley-oop"
    },
    wrist-position: {
          cargo: {
         rocket-high:"/cob/arm-position/rocket-high"
         rocket-mid:"/cob/arm-position/rocket-mid"
         rocket-low:"/cob/arm-position/rocket-low"
         ground:"/cob/arm-position/cargo/ground"
         ship:"/cob/arm-position/cargo/ship"
      },
      hatch: {
        low:"/cob/arm-position/hatch/low"
        mid:"/cob/arm-position/hatch/mid"
        high:"/cob/arm-position/hatch/high"
      }
      secure: "/cob/arm-position/secure"
      alley-oop: "/cob/arm-position/alley-oop"
   }
}
```
