function sin(theta){
    return Math.sin(theta);
}

function cos(theta){
    return Math.cos(theta);
}

function tan(theta){
    return Math.tan(theta);
}

function asin(theta){
    return Math.asin(theta);
}

function acos(theta){
    return Math.acos(theta);
}

function atan(theta){
    return Math.atan(theta);
}

function isin(x, [min, max]){
    return x>=min && x<=max;
}

const degrees = (rad) => 360*rad/(2*Math.PI)

const radians = (deg) => deg*(2*Math.PI)/360

const PI = Math.PI

function rgbacolor(r, g, b, a){
    return "rgba(" 
    + [r, g, b, a]
    .join(",")
    + ")"
}

function playBang() {
    (new Audio("/bang.mp3")).play();
}

function playDing() {
    (new Audio("/ding.mp3")).play();
}

module.exports = {
    sin, 
    cos, 
    tan,
    asin,
    acos,
    atan,
    isin,
    degrees,
    radians,
    PI,
    rgbacolor,
    playBang,
    playDing
}