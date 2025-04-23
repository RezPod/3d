
const express = require("express");
const {currentState, systemStartTime, collisions} = require("./system.js");

const app = express();
const port = 3000;

app.get("/", (req, res)=>{
    res.sendFile("simluation.html", { root: __dirname });
})

app.get("/vector", (req, res)=>{
    res.sendFile("vector.js", { root: __dirname });
})


app.get("/solid", (req, res)=>{
    res.sendFile("solid.js", { root: __dirname });
})


app.get("/3d", (req, res)=>{
    res.sendFile("3d.js", { root: __dirname });
})

app.get("/bang", (req, res)=>{
    res.sendFile("bang.mp3", { root: __dirname });
})


app.get("/state", (req, res)=>{
    const state = currentState();
    const responseJSON = {};
    responseJSON["containerBox"] = {
        corners : state.containerBox.corners,
        faces:  state.containerBox.faces,
        location: state.containerBox.center(),
        mass: state.containerBox.mass,
        volume: state.containerBox.volumeValue,
        density: state.containerBox.density
    }

    responseJSON["livingSolids"] = state.livingSolids.map(
        s=> {
            return {
                name: s.name,
                corners : s.corners,
                faces:  s.faces,
                location: s.location,
                velocity: s.velocity,
                angularVelocity: s.angularVelocity,
                acceleration: s.acceleration,
                birthTime: s.birthTime,
                age: s.age,
                mass: s.mass,
                volume: s.volumeValue,
                density: s.density
            }    
        }
    );

    responseJSON.systemTime = (Date.now() - systemStartTime)/1000;

    responseJSON.newCollisions = collisions.filter(c=>c[0] > Number(req.query.after))

    responseJSON.centerOfMass = state.centerOfMass;

    res.send(JSON.stringify(responseJSON));
})

app.listen(port, ()=>{
    console.log("serving");
    console.log(`app islistning on port ${port}`);
})
