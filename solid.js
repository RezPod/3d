// const Vector  = require("./vector.js");

// const Polygon = require("./polygon.js");


class Solid extends Object{
    constructor(
        points, name, density
    ){
        super();
        this.name = name;
        this.corners = points.map(p => new Vector(...p));
        this.location = this.center();
        this.rotation = new Vector(0);

        const hull = this.convexHull();
        this.adjacentVertecies = hull.adjacentVertecies;
        this.interiorPoints= hull.interiorPoints;
        this.edges = hull.edges;
        this.faces = hull.faces; 

        this.maxRadius = Math.max(...this.corners.map(c=>c.subtract(this.location).magnitude()));
        this.minRadius = Math.min(...this.faces.map(f=>this.location.distance(this.corners[f[0]], this.corners[f[1]], this.corners[f[2]])));

        this.density = density ? density : 0.001; //kg/m^3
        this.volumeValue = this.volume()
        this.mass = this.density * this.volumeValue; 
    }

    move(by){
        if(by.isZero()) return;

        for(let i in this.corners){
            this.corners[i] = this.corners[i].add(by);
        }
    }

    rotate(by){
        if(by.isZero()) return;

        const center = this.center();
        for(let i in this.corners){
            this.corners[i] = center.add(this.corners[i].subtract(center).rotate(by));
        }
        this.rotation = this.rotation.add(by);
    }

    center(){
        return this.corners.reduce(
            (s, p)=>s.add(p), Vector.zero()
        ).scale(1/this.corners.length);
    }

    moveTo(location){
        location = new Vector(...location);
        
        if(location.subtract(this.location).isZero()) return;

        const c = this.center();

        for(let i in this.corners){
            this.corners[i] = location.add(this.corners[i].subtract(c));
        }
        this.location = location;
    }

    scale(by){
        const center = this.center();
        for(let i in this.corners){
            this.corners[i] = center.add(this.corners[i].subtract(center).scale(by));
        }

        this.maxRadius = Math.max(...this.corners.map(c=>c.subtract(center).magnitude()));
        this.minRadius = Math.min(...this.faces.map(f=>this.location.distance(this.corners[f[0]], this.corners[f[1]], this.corners[f[2]])));

        this.volumeValue = this.volume()
        this.density = this.mass / this.volumeValue;
    }

    act=()=>{
        let t1 = this.age;
        let r1 = this.location.copy();
        let v1 = this.velocity.copy();
        let w1 = this.angularVelocity.copy();

        let t = Date.now()/1000;
        let deltaT = t-t1;
        // let r = this.center(); 

        let a_inst = this.inst_acceleration(this, t-this.birthTime, v1, r1);

        let v = v1.add(
            a_inst.scale(deltaT)
        ) 
        // const deltaR = v.scale(deltaT);
        let r=r1;
        if(v.magnitude() > 0){
            r = r1.add(v.scale(deltaT));
            this.moveTo(r);

            if(this.containerSolid){
                let isOutSideBounds = false;
                let cornerOutisdeBounds; 
                const d = r.subtract(this.containerSolid.center()).magnitude();
                
                if(d > this.containerSolid.maxRadius - this.minRadius){
                    isOutSideBounds = true;
                    const cc = this.containerSolid.center();

                    let maxD = 0; 
                    cornerOutisdeBounds = this.corners.reduce((max, c)=>{
                        let D = c.subtract(cc).magnitude();
                        if( D > maxD){
                            maxD = D;
                            return c;
                        };
                        return max;
                    }, Vector.zero());
                } else if (d > this.containerSolid.minRadius - this.maxRadius) {
                    for(let c of this.corners){
                        if(!this.containerSolid.contains(c)){
                            isOutSideBounds = true;
                            cornerOutisdeBounds = c;
                            break;
                        }
                    }
                }

                if(isOutSideBounds){

                    let c2 = cornerOutisdeBounds;
                    let c1 = r1.add(c2.subtract(r));
                    let c1c2_cap = c2.subtract(c1).unit();
                    let cc = this.containerSolid.center();
                    // const r2 = r.add(r.subtract(r1).unit().scale(this.maxRadius));

                    for(let f of this.containerSolid.faces){
                        const p1 = this.containerSolid.corners[f[0]];
                        const n_cap = Vector.normal(...f.slice(0, 3).map(i=>this.containerSolid.corners[i]));
                        if(
                            // c1.subtract(p1).dot(n_cap) * 
                            cc.subtract(p1).dot(n_cap) * 
                            c2.subtract(p1).dot(n_cap) <= 0
                        ){
                            const v_perp = v.proj(n_cap);

                            if(
                                // (
                                //     v1.proj(n_cap).magnitude()<1 
                                //     // || 
                                //     //v_perp.magnitude()<1
                                // ) && 
                                c1.subtract(p1).dot(n_cap)==0
                            ){
                                v = v.subtract(v_perp);
                                r = r1.add(v.scale(deltaT));
                                break;
                            }

                            this.onCollision(t-this.birthTime, r1, v1);

                            if(v_perp.magnitude()>1){
                                v = v.subtract(v_perp.scale(2));
                            } else {
                                v = v.subtract(v_perp);
                            }
                            w1 = this.angularVelocity.scale(-1);

                            const dn = Math.abs(c2.subtract(p1).dot(n_cap));
                            const sin_theta = c1c2_cap.cross(n_cap).magnitude();

                            const cos_theta = (1 - sin_theta**2)**0.5;
                            const hypot = dn/cos_theta;

                            c2 = c2.add(c1c2_cap.scale(-hypot));
                            r  = r1.add(c2.subtract(c1)); 

                            break;
                        }
                    }
                }

                // if(
                //     this.containerSolid.minRadius 
                //     < r.subtract(this.containerSolid.center()).magnitude() + this.maxRadius
                // ) {

                //     for(let b of this.bounderies){
                //         // (r-r0).n = 0   -> {r lies on the plane}
                //         // (r-r0).n >< 0  -> {distance of r from the plane}
                //         const np = v.proj(b.n);

                //         if(r1.subtract(b.r0).dot(b.n)==0){
                //             if(v1.proj(b.n).magnitude()<1 || np.magnitude()<1){
                //                 v = v.subtract(np);
                //             }
                //             continue;
                //         }

                //         r = r1.add(v.scale(deltaT));
                //         const c = r.subtract(b.r0).dot(b.n);

                //         if(c<0){
                //             if(np.dot(b.n) < 0){
                //                 v = v.add(np.scale(-2));

                //                 // r_final = r + (r_distance_from_boundery_plan/(n.v_unit))v_unit
                //                 const v_unit = v.unit()
                //                 r = r.add(
                //                     v_unit.scale(
                //                         Math.abs(c)
                //                         /v_unit.dot(b.n)
                //                     )
                //                 )

                //                 if(np.magnitude()<1){
                //                     v = v.subtract(np);
                //                 }else{
                //                     this.angularVelocity = this.angularVelocity.scale(-1);
                //                     this.onCollision(t-this.birthTime, r, v, b);
                //                 }
                //                 break;
                //             }                    
                //         }
                //     }
                // }
            }

            if(r.subtract(r1).magnitude()>0 && v.magnitude()>0.01){
                this.moveTo(r);
                this.rotate(w1.scale(deltaT));
                this.onMotion(this, r, v, a_inst, w1);
            }
        }

        this.onStateChange(
            t-this.birthTime, 
            this.center(), 
            v, 
            a_inst,
            deltaT,
            r.subtract(r1),
            Date.now()-t*1000,
            w1
        );

        this.age = t;
        this.location = r;
        this.velocity = v;
        this.acceleration = a_inst;
        this.angularVelocity = w1;
        // setTimeout(()=>motion(t, r, v), 17-(Date.now()-t*1000));
        // setTimeout(()=>motion(), 17-(Date.now()-t*1000))
    }

    kill=()=>{
        this.velocity = Vector.zero();
        this.inst_acceleration = ()=>Vector.zero();
        this.deathTime = Date.now()/1000;
        clearInterval(this.life);
    }

    live = async (
        r = null,
        u = Vector.zero(), 
        inst_acceleration = (t, v, r)=>Vector.zero(), 
        onMotion=()=>null, 
        onStateChange=()=>null,
        bounderies=[],
        onCollision=()=>null,
        angularVelocity = Vector.zero(),
        container = null
    )=>{
        this.birthTime = Date.now()/1000;
        
        this.location = r ? r : this.location;
        this.moveTo(this.location);

        this.velocity = u ? u : Vector.zero();
        this.age = this.birthTime;
        this.inst_acceleration = inst_acceleration;
        this.onMotion = onMotion;
        this.onStateChange = onStateChange;
        this.bounderies = bounderies;
        this.onCollision = onCollision;
        this.angularVelocity = angularVelocity;
        this.containerSolid = container;

        this.act();
        this.life = setInterval(this.act, 17)
    }

    convexHull(){
        let edges=[];
        const vs = this.corners;

        for(let i=0; i<vs.length; i++){
            const p0 = vs[i];
            const edgesFromP0 = [];

            for(let j=0; j<vs.length; j++){
                const v1 = vs[j].subtract(p0).unit();
                if(v1.isZero()) continue;

                let flag = true;

                for(let k1=0; k1<vs.length; k1++){
                    const v2 = vs[k1].subtract(p0).unit();

                    if(v2.isZero() || v2.equate(v1)) continue;

                    for(let k2=0; k2<vs.length; k2++){
                        const v3 = vs[k2].subtract(p0).unit();
                        if(v3.isZero() || v3.equate(v2) || v3.equate(v1)) continue;

                        let n23 = v2.cross(v3).unit();
                        // proj = v - (v.n)n
                        let proj123 = v1.subtract(n23.scale(v1.dot(n23)))
                        let a32 = v3.angle(v2).toFixed(12);

                        let flag23 = (
                            proj123.angle(v2).toFixed(12) != Number(0).toFixed(12)
                            && proj123.angle(v3).toFixed(12) != Number(0).toFixed(12)
                            &&
                            (proj123.angle(v2) + proj123.angle(v3)).toFixed(12)==a32
                        )

                        if(flag23==false) continue;

                        if(Vector.coplaner([Vector.zero(), v1, v2, v3])){
                            flag = false;
                            break;
                        }

                        for(let k3=0; k3<vs.length; k3++){
                            const v4 = vs[k3].subtract(p0).unit();
                            if(
                                v4.isZero() || v4.equate(v3) 
                                || v4.equate(v2) || v4.equate(v1)
                            ) continue;

                            if(
                                // areCoplaner([Vector.zero(), v1, v2, v3, v4])
                                Vector.coplaner([Vector.zero(), v1, v2, v3, v4])
                                // && areCoplaner(Vector.zero(), v2, v3, v4)
                            ){
                                flag = false;
                                break;
                                // continue;
                            }

                            let n34 = v3.cross(v4).unit();
                            // proj = v - (v.n)n
                            let proj134 = v1.subtract(n34.scale(v1.dot(n34)));
                            let a34 = v3.angle(v4).toFixed(12);

                            let flag34 = (
                                proj134.angle(v3).toFixed(12) != Number(0).toFixed(12)
                                && proj134.angle(v4).toFixed(12) != Number(0).toFixed(12)
                                && 
                                (proj134.angle(v3) + proj134.angle(v4)).toFixed(12) == a34
                            )

                            if(flag34==false) continue;

                            let n42 = v4.cross(v2);
                            // proj = v - (v.n)n
                            let proj142 = v1.subtract(n42.scale(v1.dot(n42)));
                            let a42 = v4.angle(v2).toFixed(12)

                            if(
                                proj142.angle(v4).toFixed(12) != Number(0).toFixed(12) 
                                && proj134.angle(v2).toFixed(12) != Number(0).toFixed(12)
                                && 
                                (proj142.angle(v4) + proj142.angle(v2)).toFixed(12) == a42
                            ){
                                flag = false;
                                break;
                            }
                        }
                        if(flag==false) break;
                    }
                    if(flag==false) break;
                }

                if(flag==true){
                    edgesFromP0.push(j);
                }
            }

            edges.push(edgesFromP0);
        }

        const interiorPoints = [];

        for(let i=0; i<edges.length; i++){
            for(let j of edges[i]){
                if(edges[j].indexOf(i)==-1){
                    interiorPoints.push(i);
                    break;
                }
            }
        }

        edges = edges.filter((e, i)=>interiorPoints.indexOf(i)==-1)

        const faces = [];

        function traverse(face){
            // let result=[];
            if(face.length==2){
                let [i, j] = face;
                for(let k of edges[j]){
                    if(k==i) continue;
                    // result = [...result, ...traverse([i, j, k])];
                    traverse([i, j, k]);
                }
                // return result;
            } else {
                let first = face[0];
                let secondLast = face[face.length-2];
                let last  = face[face.length-1];
        
                for(let f of faces){
                    if(f.indexOf(first)!=-1 && f.indexOf(secondLast)!=-1 && f.indexOf(last)!=-1)
                        return;
                }
        
                for(let k of edges[last]){
                    if(k==first){
                        faces.push([...face, k])
                        continue;
                    }
        
                    if(k==secondLast){
                        continue;
                    }
        
                    // if(areCoplaner([vs[first], vs[secondLast], vs[last], vs[k]])){
                    if(Vector.coplaner([vs[first], vs[secondLast], vs[last], vs[k]])){
                        // result = [...result, ...traverse([...face, k])];
                        traverse([...face, k])
                    } else {
                        // result = [...result, ...traverse([secondLast, last, k])];
                        traverse([secondLast, last, k])
                    }
                    
                }
            }
        
            // return result;
        }
        
        traverse([0, edges[0][0]]);

        let uniqueEdges = []
        edges.reduce(
            (a, adj, p0)=>{
                adj.forEach(
                    p1 => {
                        const s = `${Math.min(p0, p1)},${Math.max(p0, p1)}`;
                        if(!a.has(s)){
                            uniqueEdges.push([Math.min(p0, p1), Math.max(p0, p1)]);
                            a.add(s)
                        }
                    }
                );
                return a;
            }, new Set([])
        )
        // console.log(uniqueEdges);

        const uniqueFaces = [];

        faces.reduce((s, f, i)=>{
            const fs = f.slice(0, f.length-1).sort((a, b)=>a-b).toString();
            if(!s.has(fs)){
                uniqueFaces.push(f);
                s.add(fs);
            }
            return s
        }, new Set());
        // console.log(uniqueFaces);

        return {
            adjacentVertecies: edges, 
            interiorPoints: interiorPoints,
            edges: uniqueEdges, 
            faces: uniqueFaces
        };
    }

    contains(point){
        for(let f of this.faces){
            const facePolygon = f.map(i=>this.corners[i]);

            const n_cap = facePolygon[1].subtract(
                facePolygon[0]
            ).cross(
                facePolygon[2].subtract(
                    facePolygon[1]
                )
            ).unit();

            const pI = point.subtract(point.proj(n_cap));

            if(pI.isWithin(facePolygon)==false){
                return false;
            }
        }

        return true;
    }

    volume(){
        let totalVolume = 0;
        const center = this.center();

        for(let f of this.faces){
            const p = new Polygon(f.map(i=>this.corners[i]));
            totalVolume += (1/3) * center.distance(
                ...p.corners.slice(0, 3)
            )*(
                p.area()
            )
        }
        return totalVolume;
    }
}

module.exports = Solid;