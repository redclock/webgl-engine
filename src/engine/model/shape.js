/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 上午10:50
 */

define(
    ["../core/aabb", "../common/utils", "../common/config", "../renderres/indexbuffer", "../renderres/vertexbuffer"],
    function(AABB, Utils, config, IndexBuffer, VertexBuffer)
    {
        "use strict";

        var ShapeBase = function()
        {
            this.numVert = 0;
            this.numIndex = 0;
            this.pos = [0, 0, 0];
            this.size = [1, 1, 1];
        };

        ShapeBase.prototype.create = function(shapeData, opts)
        {
            if (!opts) opts = {};
            if (opts.pos == undefined) opts.pos = [0, 0, 0];
            if (opts.size == undefined) opts.size = [1, 1, 1];
            if (opts.texScale == undefined) opts.texScale = [1, 1];

            vec3.copy(this.pos, opts.pos);
            vec3.copy(this.size, opts.size);

            this.ib = new IndexBuffer();
            this.ib.setData(shapeData.indices);
            this.aabb = new AABB();

            this.vb = VertexBuffer.createPosNormTexVB();
            var buf = new ArrayBuffer(this.vb.stride * this.numVert);
            for (var i = 0; i < this.numVert; i++)
            {
                var off = i * this.vb.stride;
                var pos = new Float32Array(buf, off + 0, 3);
                var norm = new Float32Array(buf, off + 12, 3);
                var tex = new Float32Array(buf, off + 24, 2);
                pos[0] = shapeData.position[3 * i + 0] * opts.size[0];
                pos[1] = shapeData.position[3 * i + 1] * opts.size[1];
                pos[2] = shapeData.position[3 * i + 2] * opts.size[2];
                norm[0] = shapeData.normal[3 * i + 0];
                norm[1] = shapeData.normal[3 * i + 1];
                norm[2] = shapeData.normal[3 * i + 2];

                pos[0] += opts.pos[0];
                pos[1] += opts.pos[1];
                pos[2] += opts.pos[2];

                tex[0] = shapeData.texcoord[2 * i + 0] * opts.texScale[0];
                tex[1] = shapeData.texcoord[2 * i + 1] * opts.texScale[1];

                this.aabb.addVertex(pos[0], pos[1], pos[2]);
            }
            this.vb.setData(buf);

            if (opts.skin && shapeData.boneAssign)
            {
                this.vbBoneWeights = VertexBuffer.createVec3VB();
                var boneUsed = [];
                var boneIdxBuf = new Uint8Array(4 * this.numVert);
                var boneWeightBuf = new Float32Array(3 * this.numVert);

                // init to zeros
                for (var i = 0; i < this.numVert; i++)
                {
                    boneWeightBuf[i * 3 + 0] = 0;
                    boneWeightBuf[i * 3 + 1] = 0;
                    boneWeightBuf[i * 3 + 2] = 0;
                    boneIdxBuf[i * 4 + 0] = 0;
                    boneIdxBuf[i * 4 + 1] = 0;
                    boneIdxBuf[i * 4 + 2] = 0;
                    boneIdxBuf[i * 4 + 3] = 0;
                }

                // fill bone data
                var maxBoneIndex = 0;
                for (var i = 0; i < shapeData.boneAssign.length; i++)
                {
                    var boneInfo = shapeData.boneAssign[i];
                    boneUsed[boneInfo.boneIdx] = true;
                    if (maxBoneIndex < boneInfo.boneIdx)
                        maxBoneIndex = boneInfo.boneIdx;

                    var vertIdx = boneInfo.vertIdx;
                    var index = 3;
                    for (var j = 0; j < 3; j++)
                    {
                        if (boneWeightBuf[vertIdx * 3 + j] == 0)
                        {
                            index = j;
                            break;
                        }
                    }
                    if (index < 3)
                        boneWeightBuf[vertIdx * 3 + index] = boneInfo.weight;
                    boneIdxBuf[vertIdx * 4 + index] = boneInfo.boneIdx;
                }

                // rearrange to use map
                var boneMap = [];
                var boneMapToUsed = [];
                for (var i = 0; i <= maxBoneIndex; i++)
                {
                    if (boneUsed[i])
                    {
                        boneMap.push(i);
                        boneMapToUsed[i] = boneMap.length - 1;
                    }
                }

                // can fit in single submesh
                if (boneMap.length <= config.maxBone)
                {
                    for (var i = 0; i < this.numVert; i++)
                    {
                        var boneIdx = boneMapToUsed[boneIdxBuf[i * 4 + 0]] || 0;
                        boneIdxBuf[i * 4 + 0] = boneIdx;
                        boneIdx = boneMapToUsed[boneIdxBuf[i * 4 + 1]] || 0;
                        boneIdxBuf[i * 4 + 1] = boneIdx;
                        boneIdx = boneMapToUsed[boneIdxBuf[i * 4 + 2]] || 0;
                        boneIdxBuf[i * 4 + 2] = boneIdx;
                        boneIdx = boneMapToUsed[boneIdxBuf[i * 4 + 3]] || 0;
                        boneIdxBuf[i * 4 + 3] = boneIdx;
                    }

                    var submesh =
                    {
                        startIndex : 0,
                        numIndex : this.numIndex,
                        boneIndexMap : boneMap,
                        boneIndices : boneIdxBuf
                    };

                    this.submeshes = [submesh];

                    submesh.vbBoneIndices = VertexBuffer.createByte4VB();
                    submesh.vbBoneIndices.setData(boneIdxBuf);
                }
                else
                {
                    var submeshes = this.divideSubMesh(config.maxBone, shapeData.indices, boneIdxBuf, boneWeightBuf);


                    for (var i = 0; i < submeshes.length; i++)
                    {
                        var submesh = submeshes[i];
                        submesh.vbBoneIndices = VertexBuffer.createByte4VB();
                        submesh.vbBoneIndices.setData(submesh.boneIndices);
                    }

                    this.submeshes = submeshes;

                    console.log("Shape : divided into " + this.submeshes.length + " parts");
                }
                //alert(boneUsedNum);
                this.vbBoneWeights.setData(boneWeightBuf);
            }

            this.aabb.completeCenterExt();
        };

        ShapeBase.prototype.rayTrace = function(start, dir, result)
        {
            return false;
        };


        ShapeBase.prototype.divideSubMesh = function(maxBone, indices, boneIndices, boneWeights)
        {
            var subMeshes = [];
            var usedBoneMap = [];
            var candidateBoneMap = [];
            var candidateBoneList = [];
            var usedBoneNum = 0;
            var usedBoneNumIfAdd = 0;
            var startFace = 0;
            var curFace = 0;
            var boneIndexMap = [];
            var boneIndexMapToUse = [];
            var numVert = this.numVert;
            var numIndex = this.numIndex;

            var addVert = function(index)
            {
                for (var i = 0; i < 4; i++)
                {
                    var weight = i < 3 ? boneWeights[index * 3 + i]
                        : 1 - boneWeights[index * 3 + 0] - boneWeights[index * 3 + 1] - boneWeights[index * 3 + 2];
                    if (weight < 1e-5)
                        continue;
                    var boneIndex = boneIndices[index * 4 + i];
                    if (!usedBoneMap[boneIndex] && !candidateBoneMap[boneIndex])
                    {
                        usedBoneNumIfAdd++;
                        candidateBoneMap[boneIndex] = true;
                        candidateBoneList.push(boneIndex);
                    }
                }
            };

            var newSubMesh = function()
            {
                if (startFace >= curFace)
                    return;
                var submesh = {
                    startIndex : startFace * 3,
                    numIndex : (curFace - startFace) * 3,
                    boneIndexMap : boneIndexMap.slice(),
                    boneIndices : new Uint8Array(numVert * 4)
                };

                for (var i = 0; i < numVert * 4; i++)
                {
                    var newIndex = boneIndexMapToUse[boneIndices[i]];
                    submesh.boneIndices[i] = newIndex == undefined ? 0 : newIndex;
                }
                subMeshes.push(submesh);
                usedBoneMap = [];
                usedBoneNum = 0;
                startFace = curFace;
                boneIndexMap = [];
                usedBoneNumIfAdd = 0;
            };

            while (curFace < numIndex / 3)
            {
                candidateBoneMap = [];
                candidateBoneList = [];
                //usedBoneNumIfAdd = 0;
                addVert(indices[curFace * 3]);
                if (usedBoneNumIfAdd > maxBone)
                {
                    newSubMesh();
                    continue;
                }

                addVert(indices[curFace * 3 + 1]);
                if (usedBoneNumIfAdd > maxBone)
                {
                    newSubMesh();
                    continue;
                }
                addVert(indices[curFace * 3 + 1]);
                if (usedBoneNumIfAdd > maxBone)
                {
                    newSubMesh();
                    continue;
                }
                curFace++;
                usedBoneNum = usedBoneNumIfAdd;
                for (var i = 0; i < candidateBoneList.length; i++)
                {
                    usedBoneMap[candidateBoneList[i]] = true;
                    boneIndexMap.push(candidateBoneList[i]);
                    boneIndexMapToUse[candidateBoneList[i]] = boneIndexMap.length - 1;
                }
            }
            newSubMesh();

            return subMeshes;

        };

        //////////////////////////////////////////////////////
        // CubeShape
        //////////////////////////////////////////////////////

        var Cube = function()
        {
            ShapeBase.apply(this);
            this.numVert = 24;
            this.numIndex = 36;
        };

        extend(Cube, ShapeBase);

        Cube.prototype.rayTrace = function(start, dir, result)
        {
            return Utils.rayTraceAABB(start, dir, this.aabb.mins, this.aabb.maxs, result);
        };

        Cube.Data =
        {
            position : [
                //ǰ
                0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
                -0.5, -0.5, 0.5, -0.5, 0.5, 0.5,

                //
                0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
                -0.5, -0.5, -0.5, 0.5, -0.5, -0.5,

                //
                -0.5, 0.5, 0.5, -0.5, -0.5, 0.5,
                -0.5, -0.5, -0.5, -0.5, 0.5, -0.5,

                //
                0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
                0.5, -0.5, 0.5, 0.5, 0.5, 0.5,

                //
                0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
                -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,

                //
                0.5, -0.5, 0.5, 0.5, -0.5, -0.5,
                -0.5, -0.5, -0.5, -0.5, -0.5, 0.5
            ],

            normal : [
                //
                0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

                //
                0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

                //
                -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,

                //
                1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

                //
                0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

                //
                0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0
            ],
            texcoord : [
                //
                1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,

                //
                1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

                //
                1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

                //
                1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0,

                //
                1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,

                //
                1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0
            ],

            indices : [
                0, 2, 1, 0, 3, 2,

                4, 6, 5, 4, 7, 6,

                8, 10, 9, 8, 11, 10,

                12, 14, 13, 12, 15, 14,

                16, 18, 17, 16, 19, 18,

                20, 22, 21, 20, 23, 22
            ]
        };

        //////////////////////////////////////////////////////
        // Plane
        //////////////////////////////////////////////////////

        var Plane = function()
        {
            ShapeBase.apply(this);
            this.numVert = 4;
            this.numIndex = 6;
        };

        extend(Plane, ShapeBase);

        Plane.prototype.rayTrace = function(start, dir, result)
        {
            if (Math.abs(dir[2]) < 0.000001)
            {
                return false;
            }
            var t = -(start[2] - this.pos[2]) / dir[2];
            if (t < 0 || (result.maxt != undefined && result.maxt < t))
            {
                return false;
            }

            var fx = (start[0] - this.pos[0] + dir[0] * t) / this.size[0];
            var fy = (start[1] - this.pos[1] + dir[1] * t) / this.size[1];
            if (fx < 0.5 && fx > -0.5 && fy < 0.5 && fy > -0.5)
            {
                result.t = t;
                result.normal = [0, 0, 1];
                return true;
            }
            else
            {
                return false;
            }
        };

        Plane.Data =
        {
            position : [
                //
                -0.5, -0.5, 0.0, 0.5, -0.5, 0.0,
                0.5, 0.5, 0.0, -0.5, 0.5, 0.0
            ],

            normal : [
                //
                0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
            ],
            texcoord : [
                //
                1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0
            ],

            indices : [
                0, 1, 2, 0, 2, 3
            ]
        };

        //////////////////////////////////////////////////////
        // Sphere
        //////////////////////////////////////////////////////

        var Sphere = function()
        {
            ShapeBase.apply(this);
        };

        extend(Sphere, ShapeBase);

        Sphere.prototype.create = function(data, opts)
        {
            opts = opts || {};

            this.radius = opts.radius || 1;

            ShapeBase.prototype.create.call(this, data, opts);
        };

        Sphere.createData = function(opts)
        {
            var data =
            {
                position : [],
                normal : [],
                texcoord : [],
                indices : []
            };

            opts = opts || {};

            var radius = opts.radius || 1;
            var widthSegments = Math.max(3, Math.floor(opts.widthSegments) || 16);
            var heightSegments = Math.max(2, Math.floor(opts.heightSegments) || 16);

            var phiStart = opts.phiStart !== undefined ? opts.phiStart : 0;
            var phiLength = opts.phiLength !== undefined ? opts.phiLength : Math.PI * 2;

            var thetaStart = opts.thetaStart !== undefined ? opts.thetaStart : 0;
            var thetaLength = opts.thetaLength !== undefined ? opts.thetaLength : Math.PI;

            var numVert = 0;
            for (var y = 0; y <= heightSegments; y++)
            {
                var v = y / heightSegments;
                var theta = thetaStart + v * thetaLength;
                for (var x = 0; x <= widthSegments; x++)
                {
                    var u;
                    if (y == 0)
                        u = (x - 0.5) / widthSegments;
                    else if (y == heightSegments - 1)
                        u = (x - 0.5) / widthSegments;
                    else
                        u = x / widthSegments;
                    var phi = phiStart + u * phiLength;
                    var vx = Math.cos(phi) * Math.sin(theta);
                    var vy = Math.cos(theta);
                    var vz = Math.sin(phi) * Math.sin(theta);
                    data.position.push(radius * vx);
                    data.position.push(radius * vy);
                    data.position.push(radius * vz);
                    data.normal.push(vx);
                    data.normal.push(vy);
                    data.normal.push(vz);
                    data.texcoord.push(u);
                    data.texcoord.push(v);

                    if (y > 0 && x > 0)
                    {
                        data.indices.push(numVert - widthSegments - 1);
                        data.indices.push(numVert);
                        data.indices.push(numVert - 1);
                        data.indices.push(numVert - widthSegments - 1);
                        data.indices.push(numVert - 1);
                        data.indices.push(numVert - widthSegments - 2);
                    }
                    numVert++;
                }
            }

            return data;
        };

        Sphere.prototype.rayTrace = function(start, dir, result)
        {
            return Utils.rayTraceSphere(start, dir, this.pos, this.radius, result);
        };

        //////////////////////////////////////////////////////
        // MeshShape
        //////////////////////////////////////////////////////

        var Mesh = function(opts)
        {
            ShapeBase.apply(this);
            this.numVert = 0;
            this.numIndex = 0;
        };

        extend(Mesh, ShapeBase);

        return {
            Cube : Cube,
            Plane : Plane,
            Sphere : Sphere,
            Mesh : Mesh,
            copyData : function(out, src)
            {
                out.position = src.position.slice();
                out.normal = src.normal.slice();
                out.texcoord = src.texcoord.slice();
                out.indices = src.indices.slice();
            }
        };
    }
);