// const Vector  = require("./vector.js");

class Polygon extends Object{

    constructor(points, color="gold"){
        super();
        this.corners =  points.map(p => new Vector(...p));
        this.centerLocation = this.center();
        this.color = color;
    }

    center(){
        return this.corners.slice(0, this.corners.length-1).reduce(
            (a, c)=>a.add(c), Vector.zero()
        ).scale(
            1/(this.corners.length-1)
        )
    }

    area(){
        return this.corners.slice(
            1
        ).reduce(
            (a, c, i) => 
                a + 0.5*(
                    this.centerLocation.distance(
                        c, 
                        this.corners[i]
                    )
                )*this.corners[i].distance(c)
            , 0
        )
    }

    contains(point){
    }
}

module.exports = Polygon;