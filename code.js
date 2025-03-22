/*
                    for(let i=0; i<polygons.length; i++){
                        let min = i;
                        for(let j=i+1; j<polygons.length; j++){
                            let l = await Project3D.relativeLocation(polygons[j], polygons[min], w.perspective);
                            if(l===IS_BEHIND){
                                min = j;
                            } else if (
                                l === IS_INTERSECTING 
                                && await Project3D.relativeLocation(polygons[min], polygons[j], w.perspective)===IS_IN_FRONT
                            ) {
                                min = j
                            } 
                        }
                        [polygons[i], polygons[min]]= [polygons[min], polygons[i]];
                    }
                    return polygons;
                    */

                    /*
                    async function isInFront(p, p1){
                        const relativeLocation = Project3D.relativeLocation(p, p1, perspective);
                        if(relativeLocation===IS_IN_FRONT){
                            return 1;
                        } else if (relativeLocation===IS_INTERSECTING){
                            if(Project3D.relativeLocation(p, p1, perspective)===IS_BEHIND){
                                return 1;
                            }
                        }
                        return 0;
                    }

                    async function getCount(p){
                        return (
                            await Promise.all(
                                polygons.map(p1=>isInFront(p, p1)))
                        ).reduce((i, v)=>i+v, 0)
                    }

                    // const promiseList = polygons.map(p=>getCount(p))
                    return (await Promise.all(polygons.map(p=>getCount(p))))
                    .map((c, i)=>{return {c, i}})
                    .sort((a, b)=> a.c - b.c)
                    .map(v=>polygons[v.i]);
                    */

                    /*
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
                    */


                                        /*return polygons.sort((a, b)=>{
                        let center_join = Project3D.addVectors(
                            Project3D.scalerProd(
                                1.0/a.coords.length, 
                                a.coords.reduce((i, c)=> Project3D.addVectors(i, c), [0, 0, 0])
                            ), Project3D.scalerProd(
                                -1.0/b.coords.length, 
                                b.coords.reduce((i, c)=> Project3D.addVectors(i, c), [0, 0, 0])
                            )
                        )
                        // console.log("a: ", a);
                        // console.log("b: ", b)
                        // console.log("center_join:", center_join);
                        // console.log("this.normal:", this.normal);

                        const result  = Project3D.dotProduct(perspective, center_join)
                        // console.log("result: ", result);
                        // console.log(null);
                        return result;
                    });*/

                    // pointOnPlane = Project3D.scalerProd(-1, pointOnPlane);

                    // return polygons.sort((a, b)=>{
                    //     const aMax = Math.max(
                    //         ...a.coords.map(
                    //             c=>Project3D.getMagnitude(
                    //                 Project3D.parallelProjection(
                    //                     normaltoPlane, 
                    //                     Project3D.addVectors(
                    //                         c,
                    //                         pointOnPlane
                    //                     )
                    //                 )
                    //             )
                    //         )
                    //     )

                    //     const bMax = Math.max(
                    //         ...b.coords.map(
                    //             c=>Project3D.getMagnitude(
                    //                 Project3D.parallelProjection(
                    //                     normaltoPlane, 
                    //                     Project3D.addVectors(
                    //                         c,
                    //                         pointOnPlane
                    //                     )
                    //                 )
                    //             )
                    //         )
                    //     )
                    //     return aMax - bMax;
                    // })

                    //     pointOnPlane = Project3D.scalerProd(-1, pointOnPlane);

                    //     const ref =(p) =>  Project3D.addVectors(p, Project3D.scalerProd(-1, curentfocusPoint));

                    //     return polygons.sort((a, b)=>{
                            
                    //         const r0 = Project3D.scalerProd(-1,  ref(a.coords[0]));
                    //         const n = Project3D.unitVector(Project3D.vectorProd(
                    //             Project3D.addVectors(ref(a.coords[1]), r0),
                    //             Project3D.addVectors(ref(a.coords[2]), r0)
                    //         ));

                    //         const k = Project3D.dotProduct(n, Project3D.addVectors(ref(cameraPosition), r0));

                    //         for(let c of b.coords){
                    //             // const projectinOnRefPlane = Project3D.perpendicularProjection(normaltoPlane, c);
                    //             const v = Project3D.dotProduct(n, Project3D.addVectors(ref(c), r0));
                    //             // const c2 = Project3D.dotProduct(n, Project3D.addVectors(projectinOnRefPlane, r0));
                    //             if(k * v < 0){
                    //                 return +1;
                    //             }
                    //         }
                    //         return -1;
                    //     })
                    // }


w.shapes.polygons.forEach(
    (v, i) => { 
        console.log(`-----------${i}----------`); 
        v.coords.map(c => console.log(c.map(x => x.toFixed(2)))); 
        console.log("****************************************") 
    }
)