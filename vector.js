class Vector extends Array{
    constructor(x, y, z){
        super(3);
        this[0] = x;
        this[1] = y;
        this[2] = z;
    }

    apply(func){
        return new Vector(...this.map(v=>func(v)));
    }

    operate(vector, func){
        return new Vector(
            ...this.map(
                (v, i)=>func(v, vector[i])
            )
        );
    }

    cross(vector){
        return new Vector(
            this[1]*vector[2]-this[2]*vector[1],
            this[2]*vector[0]-this[0]*vector[2],
            this[0]*vector[1]-this[1]*vector[0]
        );
    }

    dot(vector){
        return this.operate(vector, (c1, c2)=>c1*c2).reduce((s, c)=>s+c, 0.0);
    }

    add(vector){
        return this.operate(vector, (c1, c2)=>c1+c2);
    }

    subtract(vector){
        return this.operate(vector, (c1, c2)=>c1-c2);
    }

    scale(by){
        return this.apply(c=>by*c);
    }

    proj(on){
        const on_unit = on.unit();
        return on_unit.scale(this.dot(on_unit));
    }

    equate(vector){
        // return ! this.operate(vector, (c1, c2)=> c1==c2 ? 0 : 1 ).magnitude();
        return this.subtract(vector).isZero();
    }

    magnitude(){
        return Math.hypot(...this);
    }

    unit(){
        const magnitude = this.magnitude();
        if(magnitude>0 && magnitude!=1){
            return  new Vector(
                this[0]/magnitude,
                this[1]/magnitude,
                this[2]/magnitude
            );
        } else {
            return new Vector(...this);
        }
        
    }

    angle(vector){
        // return toDegrees(
        //     Math.acos( 
        //         Math.min(
        //             this.unit().dot(vector.unit()), 
        //             1
        //         ) 
        //     )
        // )
        return Math.acos( 
            Math.min(
                this.unit().dot(vector.unit()), 
                1
            ) 
        )
    }

    static zero(){
        return new Vector(0, 0, 0);
    }

    isZero(){
        return this.magnitude()==0;
    }

    isUnit(){
        return this.magnitude()==1;
    }

    toString(){
        return {
            x:this[0],
            y:this[1],
            z:this[2]
        };
    }

    copy(){
        return new Vector(...this);
    }

    rotate(by){
        const by_theta = by.magnitude()%(2*Math.PI);
        const by_dir = by.unit();

        if(by_theta==0) return this;

        const n_cap = by_dir.cross(this.unit()).unit();
        if(n_cap.isZero())
            return this;

        const r_parallel = this.proj(by_dir);
        const r_perp = this.subtract(r_parallel);
        const r_perp_bar = r_perp.magnitude();
        const r_perp_cap = r_perp.unit();

        // v_rotated = cos(theta)v + (v_magnitude*sin(theta))n_unit
        const r_perp_rotated = r_perp_cap.scale(
            Math.cos(by_theta)
        ).add(
            n_cap.scale(Math.sin(by_theta))
        ).scale(
            r_perp_bar
        )
        // const r_perp_rotated =  r_perp.scale(
        //     Math.cos(theta)
        // ).add(
        //     n_unit.scale(
        //         r_perp.magnitude() * Math.sin(theta)
        //     )
        // )

        return r_parallel.add(r_perp_rotated);

    }

    coplaner(points){
        return Vector.coplaner([this, ...points]);
    }

    isWithin(convexPolygon){
        for(let i=1; i<convexPolygon.length; i++){
            const p1 = convexPolygon[i-1];
            const p2 = convexPolygon[i];

            const p12 = p2.subtract(p1);
            const rp1 = this.subtract(p1);

            const rI = this.subtract(rp1.subtract(rp1.proj(p12)));
            if(
                p12.magnitude() < 
                (
                    rI.subtract(p1).magnitude() 
                    + rI.subtract(p2).magnitude()
                )
            ){
                return false;
            }
        }
        
        return true;
    }

    static normal(p1, p2, p3){
        return p2.subtract(p1).cross(p3.subtract(p2)).unit();
    }

    distance(p1, p2, p3){ // plane is defined a set of non-colinear points on it
        const n_cap = p2.subtract(p1).cross(p3.subtract(p2)).unit();
        return Math.abs(this.subtract(p1).dot(n_cap));
    }

    image(p1, p2, p3){
        const n_cap = p2.subtract(p1).cross(p3.subtract(p2)).unit();
        return this.subtract(this.subtract(p1).proj(n_cap));
    }

    static coplaner(points){
        const vectors = points.slice(1).map((p, i)=>p.subtract(points[i]));

        const normals = vectors.slice(1).map((v, i)=>v.cross(vectors[i]));
    
        for(let i=1; i<normals.length; i++){
            if(Math.sin(normals[i].angle(normals[i-1])).toFixed(5) != Number(0).toFixed(5)){
                return false;
            }
        }
    
        return true;
    }
}

module.exports = { Vector };