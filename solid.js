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
        if(this.isZero() || on,this.isZero()) return null;

        on = on.unit();

        return on.scale(this.dot(on));
    }

    equate(vector){
        return ! this.operate(vector, (c1, c2)=> c1==c2 ? 0 : 1 ).magnitude();
    }

    magnitude(){
        return Math.hypot(...this);
    }

    unit(){
        const magnitude = this.magnitude();
        if(magnitude){
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

    toString(){
        return {
            x:this[0],
            y:this[1],
            z:this[2]
        };
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

function areCoplaner(points){
    const vectors = points.slice(1).map((p, i)=>p.subtract(points[i]));

    const normals = vectors.slice(1).map((v, i)=>v.cross(vectors[i]));

    for(let i=1; i<normals.length; i++){
        if(Math.sin(normals[i].angle(normals[i-1])).toFixed(5) != Number(0).toFixed(5)){
            return false;
        }
    }

    return true;
}


// const toDegrees = (rad) => 360 * rad / (2 * Math.PI);

// const vs = pyramid3.map(
//     p => new Vector(...p)
// );
// console.log(vs);

// const edges=[];

// for(let i=0; i<vs.length; i++){
//     const p0 = vs[i];
//     const edgesFromP0 = [];

//     for(let j=0; j<vs.length; j++){
//         const v1 = vs[j].subtract(p0).unit();
//         if(v1.isZero()) continue;

//         let flag = true;

//         for(let k1=0; k1<vs.length; k1++){
//             const v2 = vs[k1].subtract(p0).unit();

//             if(v2.isZero() || v2.equate(v1)) continue;

//             for(let k2=0; k2<vs.length; k2++){
//                 const v3 = vs[k2].subtract(p0).unit();
//                 if(v3.isZero() || v3.equate(v2) || v3.equate(v1)) continue;

//                 let n23 = v2.cross(v3).unit();
//                 // proj = v - (v.n)n
//                 let proj123 = v1.subtract(n23.scale(v1.dot(n23)))
//                 let a32 = v3.angle(v2).toFixed(12);

//                 let flag23 = (
//                     proj123.angle(v2).toFixed(12) != Number(0).toFixed(12)
//                     && proj123.angle(v3).toFixed(12) != Number(0).toFixed(12)
//                     &&
//                     (proj123.angle(v2) + proj123.angle(v3)).toFixed(12)==a32
//                 )

//                 if(flag23==false) continue;

//                 for(let k3=0; k3<vs.length; k3++){
//                     const v4 = vs[k3].subtract(p0).unit();
//                     if(
//                         v4.isZero() || v4.equate(v3) 
//                         || v4.equate(v2) || v4.equate(v1)
//                     ) continue;

//                     if(
//                         areCoplaner([Vector.zero(), v1, v2, v3, v4]) 
//                         // && areCoplaner(Vector.zero(), v2, v3, v4)
//                     ){
//                         flag = false;
//                         break;
//                         // continue;
//                     }

//                     let n34 = v3.cross(v4).unit();
//                     // proj = v - (v.n)n
//                     let proj134 = v1.subtract(n34.scale(v1.dot(n34)));
//                     let a34 = v3.angle(v4).toFixed(12);

//                     let flag34 = (
//                         proj134.angle(v3).toFixed(12) != Number(0).toFixed(12)
//                         && proj134.angle(v4).toFixed(12) != Number(0).toFixed(12)
//                         && 
//                         (proj134.angle(v3) + proj134.angle(v4)).toFixed(12) == a34
//                     )

//                     if(flag34==false) continue;

//                     let n42 = v4.cross(v2);
//                     // proj = v - (v.n)n
//                     let proj142 = v1.subtract(n42.scale(v1.dot(n42)));
//                     let a42 = v4.angle(v2).toFixed(12)

//                     if(
//                         proj142.angle(v4).toFixed(12) != Number(0).toFixed(12) 
//                         && proj142.angle(v2).toFixed(12) != Number(0).toFixed(12)
//                         && 
//                         (proj142.angle(v4) + proj142.angle(v2)).toFixed(12) == a42
//                     ){
//                         flag = false;
//                         break;
//                     }
//                 }
//                 if(flag==false) break;
//             }
//             if(flag==false) break;
//         }

//         if(flag==true){
//             edgesFromP0.push(j);
//         }
//     }

//     edges.push(edgesFromP0);
// }

// console.log(edges);

// const interiarPoints = edges.reduce(
//     (a, adj, i)=>{
//         if(adj.length==0){
//             a.push(i);
//         }
//         return a;
//     }, []
// )
// console.log(interiarPoints);

// let uniqueEdges = edges.reduce(
//     (a, adj, p0)=>{
//         adj.forEach(
//             p1 => a.add(`${Math.min(p0, p1)},${Math.max(p0, p1)}`)    
//         );
//         return a;
//     }, new Set([])
// )
// console.log(uniqueEdges);

// const faces = [];

// function traverse(face){
//     // let result=[];
//     if(face.length==2){
//         let [i, j] = face;
//         for(let k of edges[j]){
//             if(k==i) continue;
//             // result = [...result, ...traverse([i, j, k])];
//             traverse([i, j, k]);
//         }
//         // return result;
//     } else {
//         let first = face[0];
//         let secondLast = face[face.length-2];
//         let last  = face[face.length-1];

//         for(let f of faces){
//             if(f.indexOf(first)!=-1 && f.indexOf(secondLast)!=-1 && f.indexOf(last)!=-1)
//                 return;
//         }

//         for(let k of edges[last]){
//             if(k==first){
//                 faces.push([...face, k])
//                 continue;
//             }

//             if(k==secondLast){
//                 continue;
//             }

//             if(areCoplaner([vs[first], vs[secondLast], vs[last], vs[k]])){
//                 // result = [...result, ...traverse([...face, k])];
//                 traverse([...face, k])
//             } else {
//                 // result = [...result, ...traverse([secondLast, last, k])];
//                 traverse([secondLast, last, k])
//             }
            
//         }
//     }

//     // return result;
// }

// i = 0;
// j = edges[i][0];

// traverse([i, j]);

// console.log(JSON.stringify(faces));

// const uniqueFaces = faces.reduce((s, f, i)=>{s.add(f.slice(0, f.length-1).sort((a, b)=>a-b).toString()); return s}, new Set());
// console.log(uniqueFaces);

class Solid extends Array{
    constructor(
        vertecies, 
        initialVelocity = Vector.zero(), 
        acceleration = (t, v, r)=> Vector.zero()
    ){
        super(...vertecies.map(p => new Vector(...p)));
    }

    move(by){
        for(let i in this){
            this[i] = this[i].add(by);
        }
    }

    center(){
        return this.reduce(
            (s, p)=>{s=s.add(p); return s}, Vector.zero()
        ).scale(1/this.length);
    }

    moveTo(location){
        const c = this.center();
        location = new Vector(...location);
        for(let i in this){
            this[i] = location.add(this[i].subtract(c));
        }
    }

    scale(by){
        const c = this.center();
        for(let i in this){
            this[i] = c.add(this[i].subtract(c).scale(by));
        }
    }

    live(
        r = null,
        u = Vector.zero(), 
        a = (t, v, r)=>Vector(), 
        onMotion=()=>null, 
        onStateChange=()=>null,
        bounderies=[],
        onCollision=()=>null
    ){
        const t0 = Date.now()/1000;
        r = r ? r : this.center();
        this.moveTo(r);

        const motion = (t1, r1, v1)=>{
            let t = Date.now()/1000;
            let deltaT = t-t1;
            // let r = this.center(); 

            let a_inst = acceleration(t-t0, v1, r1);

            let v = v1.add(
                a_inst.scale(deltaT)
            ) 
            // const deltaR = v.scale(deltaT);
            let r;
            if(v.magnitude() > 0){

                for(let b of bounderies){
                    // (r-r0).n = 0   -> {r lies on the plane}
                    // (r-r0).n >< 0  -> {distance of r from the plane}
                    const np = v.proj(b.n);
    
                    if(r1.subtract(b.r0).dot(b.n)==0){
                        if(v1.proj(b.n).magnitude()<1 || np.magnitude()<1){
                            v = v.subtract(np);
                        }
                        continue;
                    }
    
                    r = r1.add(v.scale(deltaT));
                    const c = r.subtract(b.r0).dot(b.n);
    
                    if(c<0){
                        if(np.dot(b.n) < 0){
                            v = v.add(np.scale(-2));
    
                            // r_final = r + (r_distance_from_boundery_plan/(n.v_unit))v_unit
                            const v_unit = v.unit()
                            r = r.add(
                                v_unit.scale(
                                    Math.abs(c)
                                    /v_unit.dot(b.n)
                                )
                            )
                            // this.moveTo(r);
                            // onCollision(t-t0, r, v, b)

                            if(np.magnitude()<1){
                                v = v.subtract(np);
                            }else{
                                onCollision(t-t0, r, v, b);
                            }
                            break;
                        }                    
                    }
                }
    
                if(!r.equate(r1)){
                    this.moveTo(r);
                    onMotion(this, r, v, a_inst);
                }

            }

            onStateChange(
                t-t0, 
                this.center(), 
                v, 
                a_inst,
                deltaT,
                r.subtract(r1),
                Date.now()-t*1000
            );
            setTimeout(()=>motion(t, r, v), 17-(Date.now()-t*1000))
        }

        motion(t0, r, u);
    }

    convexHull(){
        let edges=[];
        const vs = this;

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
                                areCoplaner([Vector.zero(), v1, v2, v3, v4]) 
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
        
                    if(areCoplaner([vs[first], vs[secondLast], vs[last], vs[k]])){
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
}

// const solid = new Solid(vertecies);
// const convexHull = solid.convexHull();
// console.log(convexHull);