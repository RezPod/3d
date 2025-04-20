
// const {Vector} = require("./vector.js");
// const {Solid} = require("./solid.js");
const express = require("express");
const {currentState, systemStartTime, collisions} = require("./system.js");


const app = express();
const port = 3000;

// app.use(express.static(__dirname));

app.get("/", (req, res)=>{
    // console.log(req);
    res.sendFile("simluation.html", { root: __dirname });
})

app.get("/vector", (req, res)=>{
    // console.log(req);
    res.sendFile("vector.js", { root: __dirname });
})


app.get("/solid", (req, res)=>{
    // console.log(req);
    res.sendFile("solid.js", { root: __dirname });
})


app.get("/3d", (req, res)=>{
    // console.log(req);
    res.sendFile("3d.js", { root: __dirname });
})

app.get("/bang", (req, res)=>{
    // console.log(req);
    res.sendFile("bang.mp3", { root: __dirname });
})


app.get("/state", (req, res)=>{
    const state = currentState();
    const responseJSON = {};
    responseJSON["containerBox"] = {
        corners : state.containerBox.corners,
        faces:  state.containerBox.faces,
        location: state.containerBox.center()
    }

    responseJSON["livingSolids"] = state.livingSolids.map(
        s=> {
            return {
                corners : s.corners,
                faces:  s.faces,
                location: s.center(),
                velocity: s.velocity,
                angularVelocity: s.angularVelocity,
                acceleration: s.acceleration,
                birthTime: s.birthTime,
                age: s.age
            }    
        }
    );

    responseJSON.systemTime = (Date.now() - systemStartTime)/1000;

    responseJSON.newCollisions = collisions.filter(c=>c[0] > Number(req.query.after))

    res.send(JSON.stringify(responseJSON));
})

app.listen(port, ()=>{
    console.log("serving");
    console.log(`app islistning on port ${port}`);
})
