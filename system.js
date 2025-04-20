
const {Vector} = require("./vector.js");
const {Solid} = require("./solid.js");

const cuboid = [
    [0, 0, 0], 
    [200, 0, 0], 
    [200, 100, 0], 
    [0, 100, 0], 
    // [0, 0, 0],
    [0, 0, 100], 
    [200, 0, 100], 
    [200, 100, 100], 
    [0, 100, 100], 
    // [0, 0, 100]
    // [50, 50, 50]
]

const pyramid4 = [
    [0, 0, 0],
    [100, 0, 0],
    [100, 100, 0],
    [0, 100, 0],
    [50, 50, 100]
]

const pyramid3 = [
    [0, 0, 0],
    [100, 0, 0],
    [0, 100, 0],
    [50, 50, 100]
]

const pyramid5 = [
    [0, 0, 0],
    [100, 0, 0],
    [150, 75, 0],
    [75, 150, 0],
    [0, 100, 0],

    [50, 50, 100]
]

const prism3 = [
    [0, 0, 0],
    [100, 0, 0],
    [0, 100, 0],

    [0, 0, 100],
    [100, 0, 100],
    [0, 100, 100],
]

const prismPyramid = [
    [0, 0, 0], 
    [100, 0, 0], 
    [100, 100, 0], 
    [0, 100, 0], 
    // [0, 0, 0],
    [25, 25, 100], 
    [75, 25, 100], 
    [75, 75, 100], 
    [25, 75, 100], 
    // [0, 0, 100]
]

const prismPyramidTilted = [
    [0, 0, 0], 
    [100, 0, 0], 
    [100, 100, 0], 
    [0, 100, 0], 
    // [0, 0, 0],
    [25, 25, 100], 
    [125, 25, 100], 
    [125, 125, 100], 
    [25, 125, 100], 
    // [0, 0, 100]
]

const prism5 = [
    [0, 0, 0], 
    [100, 0, 0], 
    [125, 75, 0], 
    [75, 125, 0], 
    [0, 100, 0],
    
    [0, 0, 100], 
    [100, 0, 100], 
    [125, 75, 100], 
    [75, 125, 100], 
    [0, 100, 100]
]

let vertecies = [
    [0, 0, 0], 
    [100, 0, 0], 
    [100, 100, 0],
    [0, 100, 0],

    // [50, 50, 100],
    [0, 0, 100],
    [100, 0, 100],
    [100, 100, 100], 
    [0, 100, 100],

    // [50, 100, 20],
    // [50, 0, 20],

    // [50, 50, 150],
    // [0, 50, 100]
]

function rgbacolor(r, g, b, a){
    return "rgba(" 
    + [r, g, b, a]
    .join(",")
    + ")"
}

let collisionCount = 0;
function incrementCollisions(){
    document.getElementById("collisions").textContent = Number(document.getElementById("collisions").textContent) + 1;
}

async function updateState(targetName, t, r, v, a, dt, dr, ptime, w1){
    document.getElementById(targetName).innerHTML = `
    <span style="font-weight:bold">${targetName}</span>
    <br>
    t: ${t.toFixed(2)} sec
    <br>
    r: ${r.map(c=>c.toFixed(2)).join(", ")} 
    <br>
    v: ${v.map(c=>c.toFixed(2)).join(", ")} <span style="color:blue">[${v.magnitude().toFixed(2)} m/s]</span>
    <br>
    a: ${a.map(c=>c.toFixed(2)).join(", ")} <span style="color:yellow">[${a.magnitude().toFixed(2)} m/s^2]</span>
    <br>
    dt: ${dt.toFixed(3)} sec
    <br>
    dr: ${dr.map(c=>c.toFixed(2)).join(", ")} [${dr.magnitude().toFixed(2)} m]
    <br>
    KE: ${(v.magnitude()**2/2).toFixed(2)} Joules
    <br>
    PE: ${(10*r[2]).toFixed(2)} Joules
    <br>
    Total Energy: <span style="color:red"> ${(v.magnitude()**2/2+10*r[2]).toFixed(2)} Joules </span>
    <br>
    Process Time: ${ptime} ms
    <br>
    w: ${w1.map(c=>c.toFixed(2)).join(", ")} <span style="color:brown">[${w1.magnitude().toFixed(2)} rad/s]</span>
    `
    // const dx = 20*dt;
    // const x = 20*t;

    // const TE = v.magnitude()**2/2+10*r[2];
    // plots[targetName][3].add(x, Math.max(10*Math.log2(TE), 0));
    // plots[targetName][0].add(x, r[2]);
    // plots[targetName][1].add(x, v.magnitude());
    // plots[targetName][2].add(x, a.magnitude());

    // if(x > 400){
    //     // energyPlot = energyPlot.move(-dx);
    //     // elivationPlot = elivationPlot.move(-dx);

        
    //     stateCanvas.changePerspectiveTo(
    //         [stateCanvas.alpha, stateCanvas.beta], 
    //         new Vector(...stateCanvas.cameraPosition).add([dx/2, 0, 0])
    //     );
    //     plots[targetName] = plots[targetName].map(p=>p.move(-dx/2))
        
    //     // plots.forEach(p=>p.show());
    //     // energyPlot.show();
    //     // elivationPlot.show();
    // }
    
}


const rad = (deg)=>2*Math.PI*(deg/360);

const drag = 0.0;
const windForce = new Vector(0, 0, 0);
const g = new Vector(0, 0, -10);
const springConstant = 1*0;
const springHinge = new Vector(200, 0, 200);


const q1 = 80e-3;
const q2 = -3e-3;
const k  = 8.99e9;
const eC = k*q1*q2;
const orbitRadius = 100

const containerBox = new Solid(vertecies, "container");
containerBox.scale(4);
containerBox.moveTo([200, 0, 200]);
// containerBox.rotate(new Vector(1, 1, 1).scale(Math.PI/6));
const r2 = containerBox.center();

const angle = rad(0);

const u = new Vector(
        Math.cos(angle),
        0,   
        Math.sin(angle)
).scale(
    // Math.abs(1*eC/orbitRadius)**0.5
    60
);

let acceleration = (t, v, r) => {
    const r12 = r.subtract(r2);
    const electricForce = r12.unit().scale(
        eC/(r12.magnitude()**2)
    )

    const springForce = r.subtract(springHinge).unit().scale(
        // -(Math.random()-0.5)
        -springConstant
        *r.subtract(springHinge).magnitude()
    );

    return g
    .add(springForce)
    // .add(electricForce)
    .add(windForce)
    .add(
        v.scale(-drag)
    );
};

let angularVelocity = new Vector(0, 0, 1).scale(Math.PI/4);

function playBang() {
    (new Audio("/bang.mp3")).play();
}

function playDing() {
    (new Audio("/ding.mp3")).play();
}

const bounderies = [{
    r0:new Vector(0, 0, 0), 
    n:new Vector(0, 0, 1)
},{
    r0:new Vector(400, 0, 0),
    n: new Vector(-1, 0, 0)
},{
    r0:new Vector(0, 0, 0),
    n: new Vector(1, 0, 0)
},{
    r0:new Vector(0, 0, 400),
    n: new Vector(0, 0, -1)
},{
    r0:new Vector(0, 200, 0),
    n: new Vector(0, -1, 0)
},{
    r0:new Vector(0, -200, 0),
    n: new Vector(0, 1, 0)
},]

// vertecies = prismPyramidTilted;
const systemStartTime = Date.now();
const livingSolids = [];
const collisions = [];

function registerCollisionBetween(s1, s2){
    collisions.push([
        (Date.now()-systemStartTime)/1000,
        s1.name,
        s2.name
    ])
}

let solid1 = new Solid(vertecies, "solid1");
solid1.scale(0.2);
solid1.live(
    new Vector(200, 0, 200),
    u, 
    acceleration,
    (s, r, v, a, w1) => {},
    (t, r, v, a, dt, dr, ptime, w1)=>{},
    bounderies,
    (t, r, v, b)=>registerCollisionBetween(solid1, containerBox),
    angularVelocity,
    containerBox
)
livingSolids.push(solid1);

let solid2 = new Solid(vertecies, 'solid2');
solid2.scale(0.2);
solid2.live(
    new Vector(200, 0, 100),
    u.add([0, 0, 0]), 
    acceleration,
    (s, r, v, a, w1) => {},
    (t, r, v, a, dt, dr, ptime, w1)=>{},
    bounderies,
    (t, r, v, w)=>registerCollisionBetween(solid1, containerBox),
    angularVelocity.scale(6),
    containerBox
)
livingSolids.push(solid2);

function checkCollisions(){
    // const minApproach = 20*3**0.5;
    for(let i=0; i<livingSolids.length; i++){
        for(let j=i+1; j<livingSolids.length; j++){
            if(i==j){
                continue;
            }
            let collisionFlag = false;

            let s1 = livingSolids[i];
            let s2 = livingSolids[j];

            const r12 = s2.location.subtract(s1.location);
            const approach = r12.magnitude();

            if(approach < s1.minRadius + s2.minRadius){
            // if(false) {
                collisionFlag = true;
                // for(let c of s1.corners){
                //     if(s2.contains(c)){
                //         collisionPoint = c;
                //         break;
                //     }
                // }
            } else if ( approach < s1.maxRadius + s2.maxRadius){
                for(let c of s1.corners){
                    if(s2.contains(c)){
                        collisionFlag = true;
                        collisionPoint = c;
                        break;
                    }
                }
            }

            if(collisionFlag===true){
                const dr = r12.unit().scale((s1.maxRadius + s2.maxRadius - approach)/2);

                s1.location = s1.location.subtract(dr);
                s2.location = s2.location.add(dr);

                [s1.velocity, s2.velocity] = [s2.velocity, s1.velocity];
                [s1.angularVelocity, s2.angularVelocity] = [s2.angularVelocity, s1.angularVelocity];

                registerCollisionBetween(s1, s2);
            }
        }
        
    }
}

setInterval(checkCollisions, 17);

function currentState(){
    return {
        containerBox, 
        livingSolids,
    }
}

module.exports = {currentState, systemStartTime, collisions};