
const Vector = require("./vector.js");
const Solid = require("./solid.js");

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

const pyramid3 = [
    [0, 0, 0],
    [100, 0, 0],
    [0, 100, 0],
    [50, 50, 100]
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

function rgbacolor(r, g, b, a){
    return "rgba(" 
    + [r, g, b, a]
    .join(",")
    + ")"
}

const rad = (deg)=>2*Math.PI*(deg/360);

const drag = 0.2;
const windForce = new Vector(0, 0, 0);
const g = new Vector(0, 0, -0);
const springConstant = 1*0;
const springHinge = new Vector(200, 0, 200);

const q1 = 80e-3;
const q2 = -3e-3;
const k  = 8.99e9;
const eC = k*q1*q2;
const orbitRadius = 100

const containerBox = new Solid(vertecies, "container");
containerBox.scale(4);
containerBox.moveTo([200, 200, 200]);
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

let angularVelocity = new Vector(0, 0, 1).scale(Math.PI/4);

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

const particles = []; 
const size = 5;
const grid = 3;

const bondConstant = 200000;
const p_space = 20;

function bondForce(p1, p2){
    const r12 = p1.center().subtract(p2.center());
    if(r12.magnitude() > p_space * (p1.maxRadius + p2.maxRadius)){
        return r12.unit().scale(- (2**1.5)*bondConstant/r12.magnitude()**2)
    } else {
        return r12.unit().scale(+bondConstant/r12.magnitude()**2)
    }
}

let accelerationBlocked = true;

let acceleration = (p, t, v, r) => {

    if(accelerationBlocked){
        return Vector.zero();
    }

    const r12 = r.subtract(r2);
    const electricForce = r12.unit().scale(
        eC/(r12.magnitude()**2)
    )

    const bondF = livingSolids.reduce(
        (a, p2) => {
            if(p.name != p2.name)
                a = a.add(bondForce(p, p2));
            return a;
        }
        , Vector.zero()
    )

    const springForce = r.subtract(springHinge).unit().scale(
        // -(Math.random()-0.5)
        -springConstant
        *r.subtract(springHinge).magnitude()
    );

    // F = rho * g * V 
    // where,
    // rho = fluid density (kg/m^3)
    // g = gravity (m/s^-2)
    // V = volume of the submerged object (m^3);

    const bouyantForce = g.scale(-containerBox.density * p.volumeValue);

    return g
    .scale(p.mass)
    .add(bondF)
    .add(bouyantForce)
    // .add(springForce)
    // .add(electricForce)
    // .add(windForce)
    .add(v.scale(-drag))
    .scale(1/p.mass);;
};

for(let i=1; i<=grid; i++){
    const row = [];
    for(let j=1; j<=grid; j++){
        const stack = []
        for(let k=1; k<=grid; k++){
            let particle = new Solid(vertecies, `p[${i},${j},${k}]`);
            particle.scale(size/100);
            particle.moveTo(new Vector(50*i+70, 50*j+70, 50*k+20));

            if(
                false 
                // ||
                // (i==1 && j==1 && k==1) 
                // || (i==3 && j==3 && k==3) 
                // ||(i==2 && j==2 && k==2))
            ){
                particle.live(null, new Vector(1, 0, 0));
            }
            else 
                particle.live();

            // particle.inst_acceleration = acceleration;
           
            particle.containerSolid = containerBox;
            particle.onCollision = () => registerCollisionBetween(particle, containerBox);
            particle.inst_acceleration = acceleration;

            livingSolids.push(particle);
            stack.push(particle)
        }
        row.push(stack);
    }
    particles.push(row);
}

// livingSolids.forEach(async(s)=>{
//     s.live();

// });

accelerationBlocked=false;

console.log(particles);

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

const systemTotalMass = livingSolids.reduce((t, s)=>t+s.mass, 0);

function currentState(){
    const centerOfMass = livingSolids.reduce(
        (a, s)=> a.add(s.location.scale(s.mass)), 
        Vector.zero()
    ).scale(
        1/systemTotalMass
    );

    return {
        containerBox, 
        livingSolids,
        centerOfMass
    }
}

module.exports = {currentState, systemStartTime, collisions};