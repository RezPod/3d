const IS_BEHIND = 1;
const IS_IN_FRONT= 2;
const IS_INTERSECTING = 3;
const IS_ON = 4

class Project3D{
    static dotProduct(normal, point){
        return point.map((v, i)=> v*normal[i]).reduce((s, v)=>s+v, 0.0)
    }

    static parallelProjection(normal, point){
        const dotProductValue = Project3D.dotProduct(normal, point);
        return point.map((v, i)=> dotProductValue*normal[i]);
    }

    static perpendicularProjection(normal, point){
        const dotProductValue = Project3D.dotProduct(normal, point);
        return point.map((v, i)=> v - dotProductValue*normal[i]);                
    }

    static getMagnitude(vector){
        return Math.sqrt(vector.map(v=>v**2).reduce((i, v)=>i+v, 0.0))
    }

    static unitVector(vector){
        const magnitude = Project3D.getMagnitude(vector);
        return magnitude ? vector.map(v=>v/magnitude) : vector;
    }

    static vectorProd(v1, v2){
        return [
            -(v1[1]*v2[2]-v1[2]*v2[1]), 
            -(v1[2]*v2[0]-v1[0]*v2[2]), 
            -(v1[0]*v2[1]-v1[1]*v2[0])
        ]
    }

    static scalerProd(scaler, v){
        return v.map(e=> scaler * e);
    }

    static addVectors(v1, v2){
        return v1.map((c, i)=>c+v2[i]);
    }

    static degreesToRadians(degrees){
        return 2*Math.PI*(degrees/360.0);
    }
    
    static polarToVectorCoords(r, alpha, beta){
        const alphaRadians = Project3D.degreesToRadians(alpha);
        const betaRadians = Project3D.degreesToRadians(beta);

        return [
            r * Math.cos(betaRadians) * Math.cos(alphaRadians), 
            r * Math.cos(betaRadians) * Math.sin(alphaRadians), 
            r * Math.sin(betaRadians)
        ];
    }

    static compareVectors(v1, v2){
        return Project3D.getMagnitude(v1.map((v, i) => (v - v2[i]))) ? false : true ;
    }

    constructor(perspective){
        this.normal = Project3D.unitVector(perspective);
        this.y_projection = Project3D.unitVector(Project3D.perpendicularProjection(this.normal, [0, 0, 1]));
        this.x_projection = Project3D.vectorProd(this.y_projection, this.normal);
    }

    get(x, y, z){
        const projection = Project3D.perpendicularProjection(this.normal, [x, y, z]);
        return [
            Project3D.dotProduct(this.x_projection, projection), 
            Project3D.dotProduct(this.y_projection, projection),
        ];
    }

    get3DCoords(x, y){
        return Project3D.addVectors(
            Project3D.scalerProd(x, this.x_projection),
            Project3D.scalerProd(y, this.y_projection)
        )
    }

    getHeight(x, y, z){
        return Project3D.getMagnitude(Project3D.parallelProjection(this.normal, [x, y, z]));
    }

    shadow(x, y, z, cameraPosition){
        const p1 = cameraPosition;
        const p2 = [x, y, z];
        const dir = Project3D.addVectors(p2, Project3D.scalerProd(-1, p1));
        const t = - Project3D.dotProduct(this.normal, p1)/
                    Project3D.dotProduct(
                        this.normal, 
                        dir
                    )
        return Project3D.addVectors(Project3D.scalerProd(t, dir), p1)
    }

    static intersection(line, plane){
        const minusP1 = Project3D.scalerProd(-1, line.p1);

        // t = n.(r0-p1)/n.(p2-p1)
        const t = Project3D.dotProduct(
            plane.n, 
            Project3D.addVectors(plane.r0, minusP1)
        ) / Project3D.dotProduct(
            plane.n, 
            Project3D.addVectors(line.p2, minusP1)
        ) 


        // r(t) = p1 + t(p2-p1) 
        return Project3D.addVectors(
            line.p1, 
            Project3D.scalerProd(
                t,
                Project3D.addVectors(
                    line.p2,
                    minusP1
                )
            )
        )
    }

    static regularPolygonBase(n, center, diameter, normal, startAngle){
        normal = normal ? Project3D.unitVector(normal) : [0, 0, 1];
        startAngle = startAngle ? 2 * Math.PI * (startAngle/360) : 0; 
        const angle = (2 * Math.PI) / n ;
        const radius = diameter / 2;
        
        const x = Project3D.compareVectors([0, 1, 0], normal) 
            ? [1, 0, 0] 
            : [0, 1, 0]

        const xAxisDir = Project3D.unitVector(Project3D.vectorProd(normal, x));
        const yAxisDir = Project3D.unitVector(Project3D.vectorProd(xAxisDir, normal));

        const base=[];

        for(let i=0; i <= n; i++){
            const radianAngle = startAngle + i * angle;
            const r = Project3D.addVectors(
                Project3D.scalerProd(radius * Math.cos(radianAngle), xAxisDir),
                Project3D.scalerProd(radius * Math.sin(radianAngle), yAxisDir)
            )
            base.push(
                Project3D.addVectors(
                    center, 
                    r
                )
            );
        }

        return base;
    }   

    static regularRectangularBase(n, center, diameter1, diameter2, normal, startAngle){
        normal = normal ? Project3D.unitVector(normal) : [0, 0, 1];
        
        startAngle = startAngle ? 2 * Math.PI * (startAngle/360) : 0;
        const angle = (2 * Math.PI) / n;
        const radius1 = diameter1 / 2;
        const radius2 = diameter2 / 2;

        const x = Project3D.compareVectors([0, 1, 0], normal) 
            ? [1, 0, 0] 
            : [0, 1, 0]

        const xAxisDir = Project3D.unitVector(Project3D.vectorProd(normal, x));
        const yAxisDir = Project3D.unitVector(Project3D.vectorProd(xAxisDir, normal));

        const base=[];

        for(let i=0; i <= n; i++){
            const radianAngle =  i * angle + startAngle;
            const r = Project3D.addVectors(
                Project3D.scalerProd(radius1 * Math.cos(radianAngle), xAxisDir),
                Project3D.scalerProd(radius2 * Math.sin(radianAngle), yAxisDir)
            )
            base.push(
                Project3D.addVectors(
                    center, 
                    r
                )
            );
        }

        return base;
    }

    static relativeLocation(a, b, perspective){

        const r0 = b.coords[0];
        const minusR0 = Project3D.scalerProd(-1, r0);
        const n = Project3D.unitVector(
            Project3D.vectorProd(
                Project3D.addVectors(b.coords[1], minusR0),
                Project3D.addVectors(b.coords[2], minusR0)
            )
        );

        const result = [];

        for(let p of a.coords){
            const intersectionPoint = Project3D.intersection(
                {
                    p1 : p,
                    p2 : Project3D.addVectors(p, perspective)
                },
                {
                    r0,
                    n
                }
            )
            const r = Project3D.addVectors(intersectionPoint, Project3D.scalerProd(-1, p));
            const k = Project3D.dotProduct(perspective, r);
            if(k < 0){
                result.push(1);
            } else if(k > 0){
                result.push(0);
            }
        }

        if(result.length > 0){
            const sum = result.reduce((i, v)=>i+v, 0);
            if(sum == result.length){
                return IS_IN_FRONT
            } else if (sum == 0){
                return IS_BEHIND;
            } else {
                return IS_INTERSECTING;
            }
        } else {
            return IS_ON
        }
    }

    static getDrawingOrder(polygons, perspective){

        const counts = (new Array(polygons.length)).fill(null).map((v, i)=>{return {c:0, i:i}});
        polygons.forEach(
            (p1, i)=>polygons.forEach(
                (p2, j)=>{
                    const relativeLocation = Project3D.relativeLocation(p1, p2, perspective);
                    if(relativeLocation===IS_IN_FRONT){
                        counts[i].c+=1;
                    } else if (relativeLocation===IS_INTERSECTING){
                        if(Project3D.relativeLocation(p2, p1, perspective)===IS_BEHIND){
                            counts[i].c+=1;
                        }
                    }
                }
            )
        )

        return counts.sort((a, b)=> a.c-b.c).map(v=>polygons[v.i]);

        // return polygons.sort( (a, b)=>{
        //     switch(Project3D.relativeLocation(a, b, perspective)){
        //         case IS_BEHIND:
        //             return -1;
        //         case IS_IN_FRONT:
        //             return 1;
        //         case IS_ON:
        //             return 0;
        //         case IS_INTERSECTING:
        //             switch(Project3D.relativeLocation(b, a, perspective)){
        //                 case IS_BEHIND:
        //                     return 1;
        //                 case IS_IN_FRONT:
        //                     return -1;
        //                 case IS_ON:
        //                     return 0;
        //             }
        //     }
        // });                
    }

}

class Canvas3D{
    static count = 0;
    static names = [];  

    createHTML(){
        this.containerElement = document.createElement("div");
        this.containerElement.className = "canvas-3d-container";
        this.containerElement.id = this.name;

        this.canvasElement = document.createElement('canvas');
        this.canvasElement.className = "canvas-3d";
        this.canvasElement.width = this.width;
        this.canvasElement.height = this.height;
        this.canvasElement.style.backgroundColor = "skyblue";
        this.containerElement.appendChild(this.canvasElement);

        this.statusElement = document.createElement("div");
        this.statusElement.className = "canvas-3d-status";
        this.containerElement.append(this.statusElement);
        
        this.parentElement.appendChild(this.containerElement);
    }

    constructor(parentElement, name, width, height, cameraPosition, alpha, beta){
        this.parentElement = parentElement ? parentElement : document.body;

        Canvas3D.count+=1;
        if(name){
            if(Canvas3D.names.indexOf(name)!=-1){
                name = name +'-'+ count;
            }
            this.name = name; 
        } else {
            this.name = `canvas-3d-${Canvas3D.count}`
        }
        Canvas3D.names.push(this.name);

        this.width = width ? width : window.innerWidth - 20;
        this.height = height ? height : window.innerHeight - 140;
        
        this.createHTML();
        // this.canvasElement = document.getElementById(id);

        this.ctx = this.canvasElement.getContext("2d");
        this.origin_x = this.canvasElement.width  / 2;
        this.origin_y = this.canvasElement.height / 2;

        this.alpha = alpha ? alpha%360 : 360 * Math.asin(1/(2**0.5))/(2*Math.PI);
        this.initAlpha = this.alpha;

        this.beta  = beta ? beta%360 : 360 * Math.asin(1/(3**0.5))/(2*Math.PI);
        this.initBeta = this.beta;

        this.cameraPosition = cameraPosition ? cameraPosition :[400, 400, 400];
        this.currenFocusPoint = [0, 0, 0]; 

        this.perspective = Project3D.unitVector(Canvas3D.getPerspective(this.alpha, this.beta));
        this.project3D = new Project3D(this.perspective);
        this.shapes = {
            lines:[],
            polygons: [],
            images: []
        };
        this.displayPerspective();

        // this.showPerspectiveIndicator();
        this.enablePerspectiveChange();
        this.changePerspectiveTo([this.alpha, this.beta], this.cameraPosition);
        this.shapeCount = 0;
    }

    loadScene(scenePath){
        fetch(scenePath)
        .then(response=>response.json())
        .then(responseJSON=>{
            this.shapes.polygons = responseJSON;
            this.refresh();
        });
    }

    setPixel(x, y, z, [r, g, b, a]){
        const imageData =  this.ctx.createImageData(1, 1);
        imageData.data[0] = r;
        imageData.data[1] = g;
        imageData.data[2] = b;
        imageData.data[3] = a;
        this.ctx.putImageData(imageData, ...this.toCoords( x, y, z));
    }

    loadImage(filePath, x, y, z){
        const base_image = new Image();
        base_image.src = filePath;
        const startTime = Date.now();

        base_image.onload = ()=>{
            this.ctx.drawImage(base_image, 0, 0);
            const width = base_image.width-11;
            const height = base_image.height-11;

            const imageData = this.ctx.getImageData(
                0+10, 0+10, 
                width, height
            );

            for(let i=0; i<height; i++){
                for(let j=0; j<width; j++){
                    let [r, g, b, a] = imageData.data.slice(4*i*width + 4*j, 4*i*width + 4*j + 4);
                    // a = a / 100;
                    const color = `rgba(${r}, ${g}, ${b}, ${a})`;
                    const p = Project3D.addVectors([x, y, z], [j, 0, height-i])
                    this.setPixel(...p, [r, g, b, a]);
                }
            }
            this.ctx.clearRect(0, 0, 10+width, 10+height);
            // console.log(`time-taken: ${Date.now() - startTime}ms`)
            this.shapeCount += 1;
            this.shapes.images.append({
                src:filePath,
                bottomLeftCornerPos: [x, y, z],
            })
            // this.refresh();
        }
    }

    displayPerspective(cur_x, cur_y){
        // const currentLocation = this.project3D.get3DCoords(this.initX, this.initY);
        this.statusElement.innerHTML = `
        <br>
        perspective: (${this.alpha.toFixed(2)}, ${this.beta.toFixed(2)})
        <br>
        currentFocus: 
            (${this.currenFocusPoint.map(v=>v.toFixed(2)).join(", ")}) &nbsp 
            (${this.toCoords(...this.currenFocusPoint).map(v=>v.toFixed(2)).join(", ")})
        <br>
        absolute-origin-position: (${this.origin_x.toFixed()}, ${this.origin_y.toFixed(2)}) 
        <br>
        current-pointer-coords: (${cur_x}, ${cur_y})
        <br>
        current-pointer-location: (${this.to3DCoords(cur_x, cur_y).map(c=>c.toFixed(2)).join(", ")})
        <br>
        camera position: (${this.cameraPosition.map(c=>c.toFixed(2)).join(", ")})
        <br>
        `
    }

    static getPerspective(alpha, beta){
        // if(beta > 90) beta = 90;
        // else if(beta < -90) beta = -90;

        const alphaRadians = Canvas3D.toRadians(alpha);
        const betaRadians = Canvas3D.toRadians(beta);

        return Project3D.unitVector([
            Math.cos(betaRadians)*Math.cos(alphaRadians), 
            Math.cos(betaRadians)*Math.sin(alphaRadians), 
            Math.sin(betaRadians)
        ]);
    }

    static toRadians(degrees){
        return 2*Math.PI*(degrees/360.0);
    }

    toCoords(x, y, z){
        // const projection_2d =  this.project3D.get(...this.project3D.shadow(x, y, z, this.cameraPosition)); 
        const projection_2d =  this.project3D.get(x, y, z); 
        return [projection_2d[0] + this.origin_x, this.origin_y - projection_2d[1]];
    }

    to3DCoords(x, y){
        return this.project3D.get3DCoords(x - this.origin_x, this.origin_y - y);
    }

    drawLine(x1, y1, z1, x2, y2, z2){
        this.ctx.moveTo(...this.toCoords(x1, y1, z1));
        this.ctx.lineTo(...this.toCoords(x2, y2, z2));
        this.ctx.stroke();

        this.shapes.lines.push([x1, y1, z1, x2, y2, z2]);
    }

    drawAxis(length){
        this.drawLine(0, 0, 0, length, 0, 0);
        this.drawLine(0, 0, 0, 0, length, 0);
        this.drawLine(0, 0, 0, 0, 0, length);
    }

    drawPolygon(coords, fillColor, drawBorders, shapeId){
        const polygon = new Path2D();
        polygon.moveTo(...this.toCoords(...coords[0]))
        coords.slice(1).forEach(c=>{
            polygon.lineTo(...this.toCoords(...c));
        });
        polygon.closePath();

        if(fillColor){
            this.ctx.fillStyle=fillColor;
            this.ctx.fill(polygon);
        }

        if(drawBorders){
            this.ctx.stroke(polygon);
        }
        
        this.shapes.polygons.push({coords, fillColor, drawBorders, shapeId});

        return polygon;
    }

    removeShape(shapeId){
        // this.shapes.polygons.push({coords, fillColor, drawBorders, shapeId})
        this.shapes.polygons = this.shapes.polygons.filter(p=>p.shapeId!=shapeId);
        this.refresh();
    }

    showPerspectiveIndicator(){
        const s = 40;
        const h = 40;
        const position = [0, 400, 400];
        let coords = [
            [s, s, 0],
            [s, -s, 0],
            [2*s, 2*s, 0],
            [-s, s, 0],
        ]
        this.drawPolygon(coords.map(c=>Project3D.addVectors(position, c)), "red", true);

        coords = [
            [s, s, -h],
            [s, -s, -h],
            [2*s, 2*s, -h],
            [-s, s, -h],
        ]
        this.drawPolygon(coords.map(c=>Project3D.addVectors(position, c)), "red", true);

        coords = [
            [s, s, 0],
            [-s, s, 0],
            [-s, s, -h],
            [s, s, -h]
        ];
        this.drawPolygon(coords.map(c=>Project3D.addVectors(position, c)), "red", true);

        coords = [
            [s, s, 0],
            [s, -s, 0],
            [s, -s, -h],
            [s, s, -h]
        ];
        this.drawPolygon(coords.map(c=>Project3D.addVectors(position, c)), "red", true);

        coords = [
            [2*s, 2*s, 0],
            [-s, s, 0],
            [-s, s, -h],
            [2*s, 2*s, -h]
        ];
        this.drawPolygon(coords.map(c=>Project3D.addVectors(position, c)), "red", true);

        coords = [
            [2*s, 2*s, 0],
            [s, -s, 0],
            [s, -s, -h],
            [2*s, 2*s, -h]
        ];
        this.drawPolygon(coords.map(c=>Project3D.addVectors(position, c)), "red", true);
    }

    drawArc(center, normal, radius, theta_start, theta_end, fillColor, drawBorders){
        const origin_vector = center;
        const normal_vector = Project3D.unitVector(normal); 
        
        const radial_vector = Project3D.unitVector(Project3D.vectorProd(origin_vector, normal_vector));
        const radial_vector2 = Project3D.vectorProd(normal_vector, radial_vector);

        let p;
        const coords = [];
        for(let i=theta_start; i<=theta_end; i++){
            p = Project3D.addVectors(
                Project3D.scalerProd(radius*Math.cos(Canvas3D.toRadians(i)), radial_vector),
                Project3D.scalerProd(radius*Math.sin(Canvas3D.toRadians(i)), radial_vector2)
            );
            p = Project3D.addVectors(origin_vector, p);
            coords.push(p); 
        }
        this.drawPolygon(coords, fillColor, drawBorders); 
        this.refresh();
    }

    drawPie(center, normal, radius, height, theta_start, theta_end, fillColor){
        const origin_vector = center;
        const normal_vector = Project3D.unitVector(normal);                     

        const radial_vector = Project3D.unitVector(Project3D.vectorProd(origin_vector, normal_vector));
        const radial_vector2 = Project3D.vectorProd(normal_vector, radial_vector);

        let p1=null, p2=null;
        const coords = [center];

        for(let i=theta_start; i<=theta_end; i++){
            p2 = Project3D.addVectors(
                Project3D.scalerProd(radius*Math.cos(Canvas3D.toRadians(i)), radial_vector),
                Project3D.scalerProd(radius*Math.sin(Canvas3D.toRadians(i)), radial_vector2)
            );
            p2 = Project3D.addVectors(origin_vector, p2);
            coords.push(p2);
            
            if(p1!=null){
                this.drawPolygon([
                    p1,
                    p2,
                    Project3D.addVectors(p2, Project3D.scalerProd(height, normal_vector)),
                    Project3D.addVectors(p1, Project3D.scalerProd(height, normal_vector)),
                ], fillColor)
            } else {
                this.drawPolygon([
                    origin_vector,
                    p2,
                    Project3D.addVectors(p2, Project3D.scalerProd(height, normal_vector)),
                    Project3D.addVectors(origin_vector, Project3D.scalerProd(height, normal_vector)),
                ], fillColor, true)
            }
            p1=[...p2]
        }
        
        this.drawPolygon([
            origin_vector,
            p2,
            Project3D.addVectors(p2, Project3D.scalerProd(height, normal_vector)),
            Project3D.addVectors(origin_vector, Project3D.scalerProd(height, normal_vector)),
        ], fillColor, true);

        this.drawPolygon(coords, fillColor, true); 
        this.drawPolygon(coords.map(c=>Project3D.addVectors(c, Project3D.scalerProd(height, normal_vector))), fillColor, true); 
        this.refresh();
    }

    drawCone(center, normal, radius1, radius2, height, fillColor, edges){
        const normal_vector = Project3D.unitVector(normal);                     
        const center1 = center;
        const center2 = Project3D.addVectors(center, Project3D.scalerProd(height, normal_vector))

        const radial_vector1 = Project3D.unitVector(Project3D.vectorProd(center1, normal_vector));
        const radial_vector2 = Project3D.vectorProd(normal_vector, radial_vector1);


        let coords1=[], coords2=[];
        let p1=null, p2=null;
        let p3=null, p4=null;

        for(let i=0; i<=360; i++){
            p2 = Project3D.addVectors(
                Project3D.scalerProd(radius1*Math.cos(Canvas3D.toRadians(i)), radial_vector1),
                Project3D.scalerProd(radius1*Math.sin(Canvas3D.toRadians(i)), radial_vector2)
            );
            p2 = Project3D.addVectors(center1, p2);
            
            p4 = Project3D.addVectors(
                Project3D.scalerProd(radius2*Math.cos(Canvas3D.toRadians(i)), radial_vector1),
                Project3D.scalerProd(radius2*Math.sin(Canvas3D.toRadians(i)), radial_vector2)
            );
            p4 = Project3D.addVectors(center2, p4);


            if(p1!=null && p3!=null){
                this.drawPolygon([
                    p1,
                    p2,
                    p4,
                    p3,
                ], fillColor);
            }

            coords1.push(p2);
            coords2.push(p4);
            p1=[...p2];
            p3=[...p4];

        }
        this.drawPolygon(coords1, fillColor, edges);
        this.drawPolygon(coords2, fillColor, edges);

        this.refresh();
    }

    drawSphere(center, radius, color){
        let r1=null, r2=null;
        const delta = 4;
        for(let i=-90; i<=90; i+=delta){
            r2 = radius * Math.cos(Canvas3D.toRadians(i));
            if(r1!=null){
                const c = [...center];
                c[2] = c[2] + radius * Math.sin(Canvas3D.toRadians(i-delta));
                const h = - radius * (Math.sin(Canvas3D.toRadians(i-delta)) - Math.sin(Canvas3D.toRadians(i)));
                this.drawCone(c, [0, 0, 1], r1, r2, h, color);
            }
            r1 = r2;
        }
        this.refresh();
    }

    drawBlock(basePolygonCoords, height, color, edges){
        const e1 = Project3D.addVectors(basePolygonCoords[1], Project3D.scalerProd(-1, basePolygonCoords[0]));
        const e2 = Project3D.addVectors(basePolygonCoords[2], Project3D.scalerProd(-1, basePolygonCoords[0]));
        const normal = Project3D.unitVector(Project3D.vectorProd(e1, e2));
        
        let p1=null, p2=null;
        let p3=null, p4=null;
        const topPolygonCoords = [];

        for(const p of basePolygonCoords){
            p2 = p;
            p4 = Project3D.addVectors(p2, Project3D.scalerProd(-height, normal));
            if(p1!=null && p3!=null){
                topPolygonCoords.push(p4);
                this.drawPolygon([
                    p1, 
                    p2, 
                    p4, 
                    p3
                ], color, edges, this.shapeCount);
            }
            p1 = [...p2];
            p3 = [...p4];
        }

        this.drawPolygon(basePolygonCoords, color, edges, this.shapeCount);
        this.drawPolygon(topPolygonCoords, color, edges, this.shapeCount);
        
        this.shapeCount+=1;
        this.refresh();
    }

    drawParallelogram(baseFace, topFace, color, edges){
        color = color ? color : 'gold';
        edges = edges ? edges : true;

        this.drawPolygon(baseFace, color, 1, w.shapeCount);

        for(let i=0; i<baseFace.length-1; i++){
            this.drawPolygon(
                [baseFace[i], topFace[i], topFace[i+1], baseFace[i+1]],
                color, 
                1,
                w.shapeCount
            )
        }

        this.drawPolygon(topFace, color, 1, this.shapeCount);
        this.shapeCount += 1;
        this.refresh();
    }                

    changePerspectiveTo(perspective, cameraPosition){
        
        const [alpha, beta] = perspective;
        
        if(
            beta > 90 
            || beta < -90 
            // || alpha > 225 
            // || alpha < -135
        ) return;

        // if(
        //     alpha==this.alpha 
        //     && beta==this.beta 
        //     && Project3D.compareVectors(cameraPosition, this.cameraPosition)
        // ) return;

        [this.alpha, this.beta] = perspective;
        this.cameraPosition = cameraPosition ? cameraPosition : this.cameraPosition;

        this.alpha = this.alpha%360;
        if(this.alpha < 0) this.alpha = 360 + this.alpha;

        perspective = Canvas3D.getPerspective(this.alpha, this.beta);

        let a =  Project3D.scalerProd(-1, perspective)
        a = Project3D.scalerProd(
                Project3D.getMagnitude(this.cameraPosition), 
                a
            )
        a =  Project3D.addVectors(
            this.cameraPosition,
            a
        )

        const newFocusPoint = [...a];

        a = Project3D.addVectors(
            this.currenFocusPoint,
            Project3D.scalerProd(
                -1,
                a
            )
        )

        // a = this.project3D.get(...a);
        

        // console.log(this.origin_x, this.origin_y);
        a = this.toCoords(...a);
        // console.log(a);

        this.origin_x = a[0];
        this.origin_y = a[1];

        // console.log(this.origin_x, this.origin_y);

        this.currenFocusPoint = newFocusPoint;
        this.perspective = perspective;
        this.project3D = new Project3D(this.perspective);
        
        this.displayPerspective();

        this.refresh();
    }

    refresh(){
        const lines = [...this.shapes.lines];
        this.shapes.lines = [];

        let polygons = [...this.shapes.polygons];
        this.shapes.polygons = [];

        this.ctx.reset();
        lines.forEach(v => this.drawLine(...v));
        
        const start_time = Date.now();

        Project3D
        .getDrawingOrder(polygons, this.perspective)
        .forEach(
            p=>this.drawPolygon(
                p.coords, 
                p.fillColor, 
                p.drawBorders, 
                p.shapeId
            )
        )

        /*
        // console.log("before sorting....................................")
        // polygons.forEach(
        //     (v, i) => { 
        //         console.log(`-----------${i}----------`); 
        //         v.coords.map(c => console.log(c.map(x => x.toFixed(2)))); 
        //         console.log("****************************************") 
        //     }
        // )

        const sorted_polygons = Project3D.getDrawingOrder(polygons, this.perspective);
        // console.log("after sorting....................................")
        // sorted_polygons.forEach(
        //     (v, i) => { 
        //         console.log(`-----------${i}----------`); 
        //         v.coords.map(c => console.log(c.map(x => x.toFixed(2)))); 
        //         console.log("****************************************") 
        //     }
        // )  

        for(let p of sorted_polygons){
            this.drawPolygon(p.coords, p.fillColor, p.drawBorders, p.shapeId);
        }
        // polygons.forEach(p => this.drawPolygon(p.coords, p.fillColor, p.drawBorders));
        */
    }

    clear(){
        this.shapes.lines = [];
        this.shapes.polygons = [];
        this.ctx.reset();
        this.shapeCount=0;
    }

    onMouseDown = (e)=>{
        this.initX=e.clientX;
        this.initY=e.clientY;
        this.isMouseDown = true;
    }

    onMouseMove = (e)=>{
        if(e.altKey){
            const newPerspective = [
                (this.alpha + 40*(e.movementX)/this.width)%360,
                (this.beta  + 40*(e.movementY)/this.height)%360
            ];
            this.changePerspectiveTo(newPerspective);
            
            // this.drawArc( Project3D.scalerProd(-1, this.currenFocusPoint), [0, 0, 1], 20, 0, 360, 'gold', false);
            // this.drawArc(this.currenFocusPoint, this.perspective, 20, 0, 360, 'gold', true);
        } else if (e.ctrlKey) {
            this.changePerspectiveTo(
                [this.alpha, this.beta], 
                Project3D.addVectors(
                    this.cameraPosition, 
                    Project3D.scalerProd(
                        1/2, 
                        this.project3D.get3DCoords(e.movementX, -e.movementY)
                    )
                )
            );
        }
        this.displayPerspective(e.offsetX, e.offsetY); 
    }

    onMouseUp = (e)=>{
        // this.changePerspectiveTo(
        //     [
        //         (this.alpha + 10*(e.clientX - this.initX)/e.target.width)%360,
        //         (this.beta  + 10*(e.clientY - this.initY)/e.target.height)%360
        //     ]
        // )
        this.isMouseDown = false;
    }

    enablePerspectiveChange(){
        this.isMouseDown = false;
        this.canvasElement.onmousedown = this.onMouseDown;
        this.canvasElement.onmousemove = this.onMouseMove;
        this.canvasElement.onmouseup = this.onMouseUp;

        this.initialOrientationAlpha = null;
        // this.containerElement.addEventListener("deviceorientation", this.handleOrientationChange, true);
    }
    
    handleOrientationChange(e){
        // console.log("e.beta:", e.beta);
        // console.log("e.alpha:", e.gamma);
        // this.statusElement.innerHTML=`
        // <br>
        // e.beta: ${e.beta.toFixed(2)}
        // <br>
        // e.gamma: ${e.gamma.toFixed(2)}
        // <br>
        // e.alpha: ${e.alpha.toFixed(2)}
        // <br>
        // e.absolute: ${e.absolute}
        // `
        if(e.beta && e.alpha){
            if(this.initialOrientationAlpha==null){
                this.initialOrientationAlpha = e.alpha;
            }

            const betaDelta  = ((e.gamma < 0) ? (e.gamma + 90 - this.initBeta) : -(90-e.gamma) - this.initBeta);
            const alphaDelta = -(
                (
                    (e.gamma < 0) 
                    ? e.alpha 
                    : (e.alpha + (this.initialOrientationAlpha<=180 ? -180 : 180 ))
                ) 
                - this.initialOrientationAlpha
            )
            this.changePerspectiveTo([
                this.initAlpha + alphaDelta, 
                this.initBeta  + betaDelta,
            ]);

            // document.getElementById("orientation").innerHTML += `
            //     <br>
            //     canvasLeft.alpha : ${this.alpha.toFixed(2) }
            //     <br>
            //     canvasLeft.beta : ${this.beta.toFixed(2) }
            //     <br>
            //     canvasLeft.currenFocusPoint: ${this.currenFocusPoint.map(v=>v.toFixed(2)) }
            //     <br>
            //     canvasLeft.origin: ${this.origin_x.toFixed()},${this.origin_y.toFixed()} 
            // `             
        }
    }
}
