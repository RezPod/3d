
// const Vector = require("./vector.js");

class Perspective extends Vector{
    constructor(x, y, z){
        super(x, y, z);

        this.dir = this.unit();

        this.distance = this.magnitude();

        // r_p =  r -  (r.n_cap)n_cap
        const z_vec = new Vector(0, 0, 1)
        this.y_unit = z_vec.subtract(
            z_vec.proj(this)
        ).unit();

        this.x_unit = this.cross(this.y_unit).unit();
    }

    for(x, y, z){
        const r = new Vector(x, y, z);
        return new Vector(r.dot(this.x_unit), r.dot(this.y_unit), r.dot(this.dir));
    }

    isof(x, y){
        return this.x_unit.scale(x).add(this.y_unit.scale(y));
    }
}

class LineSegment{
    constructor(p1, p2, color="black"){
        this.p1 = new Vector(...p1);
        this.p2 = new Vector(...p2);
        this.color = color;
    }
}

class Trajectory {
    static for(x, y, z, t_range, with_dt=1, with_color="black"){
        const componentSegments = [];

        for(let t=t_range[0]; t<t_range[1]; t += with_dt){
            componentSegments.push(
                new LineSegment(
                    [x(t), y(t), z(t)],
                    [x(t+with_dt), y(t+with_dt), z(t+with_dt)],
                    with_color
                )
            );
        }

        return componentSegments;
    }
}

class Surface extends Object{
    constructor(x, y, z, u_range, v_range, tangentFuncs, color="gold", smoodhness=1){
        super();
        this.x = x;
        this.y = y;
        this.z = z;

        this.u_range = u_range;
        this.v_range = v_range;

        this.tangentFuncs = tangentFuncs;

        this.color = color; 

        this.du = (u_range[1]-u_range[0]) / (9 + smoodhness);
        this.dv = (v_range[1]-v_range[0]) / (9 + smoodhness);

        this.u_range[1] = this.u_range[1] - this.u_range[1]%this.du;
        this.v_range[1] = this.v_range[1] - this.v_range[1]%this.dv;

        this.boundary =  this.perimeter();
    }

    perimeter(){
        let edge = [];

        let u_range = this.u_range;
        let v_range = this.v_range;
        let du = this.du;
        let dv = this.dv;

        let edge1 = [];
        for(let u = this.u_range[0]; u<=this.u_range[1]; u+=du){
            edge1.push(
                [
                    [u, v_range[0]],
                    new Vector(
                        this.x(u, v_range[0]), 
                        this.y(u, v_range[0]), 
                        this.z(u, v_range[0])
                    )
                ]
            )
        }
        edge = [...edge, ...edge1];

        let edge2 = [];
        for(let v = this.v_range[0]; v<=this.v_range[1]; v+=dv){
            edge2.push(
                [
                    [u_range[1], v],
                    new Vector(
                        this.x(u_range[1], v), 
                        this.y(u_range[1], v), 
                        this.z(u_range[1], v)
                    )
                ]
            )
        }
        edge = [...edge, ...edge2];

        let edge3 = [];
        for(let u = this.u_range[0]; u<=this.u_range[1]; u+=du){
            edge3.push(
                [
                    [u, v_range[1]],
                    new Vector(
                        this.x(u, v_range[1]), 
                        this.y(u, v_range[1]), 
                        this.z(u, v_range[1])
                    )
                ]
            )
        }
        edge = [...edge, ...edge3.map((p, i)=>edge3[edge3.length-1-i])];

        let edge4 = [];
        for(let v = this.v_range[0]; v<=this.v_range[1]; v+=dv){
            edge4.push(
                [
                    [u_range[0], v],
                    new Vector(
                        this.x(u_range[0], v), 
                        this.y(u_range[0], v), 
                        this.z(u_range[0], v)
                    )
                ]
            )
        }
        edge = [...edge, ...edge4.map((p, i)=>edge4[edge4.length-1-i]), edge[0]];

        return edge;
    }

    project(from){

        let tangents = [];

        for(let vfunc of this.tangentFuncs){
            const tangent = [];

            for(let u = this.u_range[0]; u <= this.u_range[1]; u += this.du){
                let v = vfunc(from, u)
                
                if(!isin(v, this.v_range)){
                    continue;
                }
                
                tangent.push([
                    u,
                    v, 
                    this.x(u, v), 
                    this.y(u, v), 
                    this.z(u, v)
                ])
            }
            tangents.push(tangent);
        }
        
        if( tangents.reduce((m, t)=> m < t.length ? t.length : m, 0) < 2){
            return [tangents, [new Polygon(this.boundary.map(p=>p[1]), this.color)]];
        }

        tangents = tangents.filter(t=>t.length>2);

        let closestPoints = this.boundary.reduce((a, p, i)=>{
            tangents.forEach((t, j) => {
                const d1 = Math.hypot(
                    t[0][0] - p[0][0], 
                    t[0][1] - p[0][1]
                );
                const d2 = Math.hypot(
                    t[t.length-1][0] - p[0][0],
                    t[t.length-1][1] - p[0][1]
                );

                if(d1 < a[j][0][0]){
                    a[j][0][0] = d1;
                    a[j][0][1] = i;
                }

                if(d2 < a[j][1][0]){
                    a[j][1][0] = d2;
                    a[j][1][1] = i;
                }
            })

            return a;
        }, tangents.map(t=>[
            [Infinity, 0], 
            [Infinity, 0]
        ]))

        closestPoints = closestPoints.reduce((a, c, i) => {
                a.push({t:i, beginnig: true, i:c[0][1]});
                a.push({t:i, beginnig: false, i:c[1][1]});
                return a;
            }, []
        ).sort(
            (a, b)=> a.i - b.i
        );

        let polygons = [];

        // let tangent =  tangents[tangents.length-1];
        
        // closestPoints = closestPoints[tangents.length-1];

        let surfaceboundary = [...this.boundary.map(p=>p[1])];

        do{
            let s = closestPoints[0];
            let e = closestPoints[closestPoints.length-1];

            let tangent = tangents[s.t];
            if(!s.beginnig)
                tangent = tangents[s.t].reverse();

            polygons.push([
                ...surfaceboundary.slice(0, s.i + 1), 
                ...tangent.map(p=>p.slice(2)),
                ...surfaceboundary.slice(e.i)
            ])

            surfaceboundary = [
                ...tangent.reverse().map(p=>p.slice(2)), 
                ...surfaceboundary.slice(0, e.i).slice(s.i)
            ]
            closestPoints.shift();
            closestPoints.pop();

            closestPoints.forEach((c, i)=>{
                closestPoints[i].i = closestPoints[i].i + tangent.length - s.i
            })

        }while(closestPoints.length)

        polygons.push(surfaceboundary);

        // if(closestPoints[0][1] < closestPoints[1][1]){
        //     polygons.push([
        //         ...this.boundary.slice(0, closestPoints[0][1] + 1).map(p=>p[1]), 
        //         ...tangent.map(p=>p.slice(2)),
        //         ...this.boundary.slice(closestPoints[1][1]).map(p=>p[1])
        //     ]);

        //     polygons.push([
        //         ...this.boundary.slice(closestPoints[0][1], closestPoints[1][1]).map(p=>p[1]), 
        //         ...tangent.reverse().map(p=>p.slice(2)),
        //     ]);
        // } else if(closestPoints[0][1] > closestPoints[1][1]){
        //     polygons.push([
        //         ...this.boundary.slice(0, closestPoints[1][1] + 1).map(p=>p[1]), 
        //         ...tangent.reverse().map(p=>p.slice(2)),
        //         ...this.boundary.slice(closestPoints[0][1]).map(p=>p[1])
        //     ]);

        //     polygons.push([
        //         ...this.boundary.slice(closestPoints[1][1], closestPoints[0][1]).map(p=>p[1]), 
        //         ...tangent.reverse().map(p=>p.slice(2)),
        //     ]);
        // }

        return [
            tangents.map(t=>t.map(p=>new Vector(...p.slice(2)))), 
            polygons.map(p=> new Polygon(p, this.color))
        ];
    }

    polygons(){
        polygons = [];
        let du = this.du;
        let dv = this.dv;

        for(let u = this.u_range[0]; u<=this.u_range[1]; u+=du){
            for(let v = this.v_range[0]; v<=this.v_range[1]; v+=dv){
                const corners = [
                    [this.x(u, v), this.y(u, v), this.z(u, v)],
                    [this.x(u+du+1, v), this.y(u+du+1, v), this.z(u+du+1, v)],
                    [this.x(u+du+1, v+dv+1), this.y(u+du+1, v+dv+1), this.z(u+du+1, v+dv+1)],
                    [this.x(u, v+dv+1), this.y(u, v+dv+1), this.z(u, v+dv+1)],
                ];

                polygons.push(
                    new Polygon([...corners, corners[0]], this.color)
                )
            }
        }

        return polygons;
    }

}

class Sphere extends Surface{
    constructor(center, radius, color, smoodhness){
        
        super(
            (u, v)=> radius * Math.cos(v)*Math.cos(u),
            (u, v)=> radius * Math.cos(v)*Math.sin(u),
            (u, v)=> radius * Math.sin(v),
            [0, 2.1*Math.PI],
            [-Math.PI/2, Math.PI/2],    
            [(f, u)=> Math.atan(
                -(Math.cos(u)*f[0] + Math.sin(u)*f[1]) / f[2]
            )%(2*Math.PI)],
            color,
            smoodhness ? smoodhness : 120
        );

        this.center = center;
    }

    project(from){
        const [tangents, polygons] = super.project(from);
        return [
            tangents.map(t=>t.map(p=>p.add(this.center))), 
            polygons.map(
                poly=>new Polygon(poly.corners.map(p=>p.add(this.center)), this.color)
            )
        ]
    }
    
    polygons(){
        return super.polygons().map(
            poly => new Polygon(
                poly.corners.map(p=>p.add(this.center)), 
                super.color
            )
        )
    }

    

}

class View {
    constructor(targetCanvas){
        this.ctx = targetCanvas.getContext("2d");

        this.width = targetCanvas.width;
        this.height = targetCanvas.height;

        this.persp = new Perspective(1, 1, 1);
        this.origin = new Vector(this.width/2, this.height/2, 0);
        this.bindPointer();
    }

    where(x, y, z){
        const p = this.persp.for(x, y, z);
        return [
            this.origin[0] +  p[0], 
            this.origin[1] -  p[1]
        ]
    }

    isfor(x, y){
        return this.persp.isof(x - this.origin[0], this.origin[1] - y);
    }

    renderLineSegment(l) {
        const path = new Path2D();

        path.moveTo(...this.where(...l.p1));
        path.lineTo(...this.where(...l.p2));

        const strockStyle = this.ctx.strokeStyle;
        this.ctx.strokeStyle = l.color;

        this.ctx.stroke(path);

        this.ctx.strokeStyle = strockStyle;
    }

    renderPolygon(p) {
        const path = new Path2D();

        const coords = p.corners.map(c=>this.where(...c))

        path.moveTo(...coords[0]);

        coords.slice(1).map(
            c=>path.lineTo(...c)
        );

        path.closePath();

        const image = this.persp.image(
            p.corners[0], 
            p.corners[Math.round(p.corners.length/2)],
            p.corners[p.corners.length-2],
        );

        const distance = image.distance(this.persp);
        const lsic = this.where(...image); //lightSourceImageCanvasCoords

        const maxRadius = coords.reduce((m, c)=>{
            let r = Math.hypot(c[0]-lsic[0], c[1]-lsic[1]);
            if(r>m) m = r;
            return m;
        }, 0)

        const gradient = this.ctx.createRadialGradient(
            ...lsic, 1, ...lsic, maxRadius
        );

        const intensity = Math.floor(255 * (1200-distance)/1200)
        gradient.addColorStop(0, rgbacolor(intensity, intensity, intensity, 1));
        gradient.addColorStop(1, p.color);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill(path);

    }
    
    order(elements){
        const Ds = elements.map(
            e => {
                if(e instanceof LineSegment){
                    const d1 =  Math.abs(
                        e.p1.subtract(
                            this.persp
                        ).dot(
                            this.persp.dir
                        )
                    )

                    const d2 = Math.abs(
                        e.p2.subtract(
                            this.persp
                        ).dot(
                            this.persp.dir
                        )
                    )
                    
                    return [
                        Math.min(d1, d2), 
                        Math.max(d1, d2),
                        null
                    ];
                } else if (e instanceof Polygon || e instanceof Solid){
                    return e.corners.reduce(
                        (a, v)=> {
                            const d = Math.abs(
                                v.subtract(
                                    this.persp
                                ).dot(
                                    this.persp.dir
                                )
                            )
                            return [
                                Math.min(d, a[0]), 
                                Math.max(d, a[1]),
                                [...a[2], d]
                            ];
                        }, [Infinity, 0, []]
                    );
                } else if (e instanceof Surface){

                    return  e.boundary.reduce(
                        (a, [_, v])=> {
                            const d = Math.abs(
                                v.subtract(
                                    this.persp
                                ).dot(
                                    this.persp.dir
                                )
                            )
                            return [
                                Math.min(d, a[0]), 
                                Math.max(d, a[1]),
                                [...a[2], d]
                            ];
                        }, [Infinity, 0, []]
                    )
                }

            }
        );

        const order =  Object.keys(elements).sort(
            (a, b) => {
                if(Ds[b][0] == Ds[a][0]) {
                    if(Ds[b][1] == Ds[a][1]){ 
                        if(Ds[a][2] == null && Ds[b][2] == null){
                            return 0;
                        } else if (Ds[a][2] == null){
                            return -1;
                        } else if (Ds[b][1] == null){
                            return 1;
                        } else {
                            const s1 = new Set(Ds[a][2]);
                            const s2 = new Set(Ds[b][2]);

                            s1.delete(Ds[a][0])
                            s1.delete(Ds[a][1])

                            s2.delete(Ds[b][0])
                            s2.delete(Ds[b][1])

                            while(s1.size && s2.size){
                                let m1 = Math.max(...s1);
                                let m2 = Math.max(...s2);

                                if(m1 > m2){
                                    return -1
                                } else if(m1 < m2) {
                                    return +1
                                } else {
                                    s1.delete(m1);
                                    s2.delete(m2);
                                }
                            }

                            return 0
                        }
                    } else {
                        return Ds[b][1] - Ds[a][1]
                    } 
                } else {
                    return Ds[b][0] - Ds[a][0]
                }
            }
        )

        return order;
    }

    renderSolid(s){
        const facePolygons =  s.faces.map( 
            f => new Polygon(f.map(i=>s.corners[i]))
        );

        this.order(facePolygons).forEach(
            i => this.renderPolygon(facePolygons[i])
        );
    }

    renderSurface(s, boundary=false, outline=false){
        const [tangents, polygons]= s.project(this.persp);

        if(boundary)
            s.boundary.slice(1).forEach((p, i)=>this.renderLineSegment(new LineSegment(s.boundary[i][1], p[1])));

        // s.boundary.forEach((p, i)=>this.renderLineSegment(new LineSegment(p[1].prod([1, 1, 0]), p[1])));

        if(outline)
            tangents.forEach(
                t=>t.slice(1).forEach(
                    (p, i)=>this.renderLineSegment(new LineSegment(t[i], p))
                )
            );

        // this.renderPolygon(new Polygon([...tangents[0], tangents[0][0]], s.color));
        // tangent.map(p=>this.renderLineSegment(new LineSegment(this.persp, p)))

        // polygons[1].corners.slice(1).map((p, i)=>this.renderLineSegment(new LineSegment(polygons[1].corners[i], p)));
        polygons.forEach(p=>this.renderPolygon(p));
    }

    render(scene){                    
        this.clear();

        for(let i of this.order(scene)){
            if(scene[i] instanceof LineSegment){
                this.renderLineSegment(scene[i]);
            } else if (scene[i] instanceof Polygon){
                this.renderPolygon(scene[i]);
            } else if (scene[i] instanceof Solid){
                this.renderSolid(scene[i]);
            } else if(scene[i] instanceof Surface){
                this.renderSurface(scene[i]);
            }
        }
    }

    clear(){
        this.ctx.reset();
    }
    
    from(perspective, scene){
        this.persp = perspective;
        this.render(scene);
    }

    bindPointer(){
        this.ctx.canvas.onmousemove = (e) => this.curPointer = view.isfor(e.offsetX, e.offsetY);
    }

    interactive(scene, onPerspChange){
        this.ctx.canvas.onmousemove = (e) => {
            if(e.altKey){
                let persp = this.persp.copy();

                persp = persp.rotate(
                    Vector.unitz.scale(
                        2*Math.PI*(e.movementX/360)/10
                    )
                );

                persp = persp.rotate(
                    persp.cross(
                        Vector.unitz
                    ).unit().scale(
                        2*Math.PI*(e.movementY/360)/10
                    )
                );

                if(
                    degrees(persp.angle(Vector.unitz)) > 5 
                    && degrees(persp.angle(Vector.unitz)) < 80
                ){
                    this.from(
                        new Perspective(
                            ...persp
                        ),
                        scene
                    )     
                }
            } 
            else if (e.ctrlKey) {
                this.origin = view.origin.add([
                    e.movementX, 
                    e.movementY, 
                    0
                ]);

                this.render(scene);
            }

            this.curPointer = view.isfor(e.offsetX, e.offsetY);

            onPerspChange(this.persp, this.origin, this.curPointer);
        }
    }
}
