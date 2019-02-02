#Paths for cob network tables
This is the place to keep track of all the different network tables used in the cob. 
Add anything new here first, and then cob.h/cpp and renderer.js, before working with it

```
cob: {
    location : {
        x: "/cob/location/x",
        y: "/cob/location/y",
        rotation: "/cob/location/rotation",
    },
    arm: {
        main-arm: {
            rotation: "/cob/arm/main-arm/rotation",
        },
        wrist: {
            rotation: "/cob/arm/wrist/rotation",
            vacuum: "/cob/arm/wrist/vacuum",
        },
    },
    robot: {
        is-sandstorm: "/cob/robot/is-sandstorm",
        is-teleop: "/cob/robot/is-teleop",
        is-enabled: "/cob/robot/is-enabled",
    },
    fms: {
        time-left: "/cob/fms/time-left",
        is-red: "/cob/fms/is-red",
    },
}

```
