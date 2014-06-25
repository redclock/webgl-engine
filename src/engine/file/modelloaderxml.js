define(
    ["./textfilemanager", "../model/model", "../animation/skeleton", "../animation/skelanim",
    "../common/config", "../renderres/texture"],
    function(TextFileManager, Model, Skeleton, SkelAnim, config, Texture)
    {
        "use strict";

        var ModelLoaderXML = new function()
        {

            var getXMLAttribute = function(node, att_name)
            {
                if (!node)
                    alert("null node");
                var att = node.attributes.getNamedItem(att_name);
                if (att)
                    return att.value;
                else
                    return att;
            };

            // only one level
            var getXMLChildrenByTagName = function(node, tagName)
            {
                var res = [];
                var childNodes = node.childNodes;
                for (var i = 0; i < childNodes.length; i++)
                {
                    if (childNodes[i].nodeName == tagName)
                    {
                        res.push(childNodes[i]);
                    }
                }
                return res;
            };

            this.loadMesh = function(filename)
            {
                var xml = TextFileManager.loadXML(filename);
                if (!xml)
                {
                    console.log("Can not load model xml: " + filename);
                    return null;
                }
                var meshNode = xml.documentElement;
                if (meshNode.nodeName != "mesh")
                {
                    console.log("Can not find <mesh> tag in model xml: " + filename);
                    return null;
                }
                var sharedGeometryNodes = getXMLChildrenByTagName(meshNode, "sharedgeometry");

                var sharedMesh = { position:[], normal:[], texcoord:[] };

                if (typeof sharedGeometryNodes == "object")
                {
                    var sgNode = sharedGeometryNodes[0];
                    if (sgNode)
                    {
                        loadMeshGeometry(sgNode, sharedMesh);
                    }
                }

                var sharedBoneAssignNodes = getXMLChildrenByTagName(meshNode, "boneassignments");

                if (typeof sharedBoneAssignNodes == "object")
                {
                    var sbNode = sharedBoneAssignNodes[0];
                    if (sgNode)
                    {
                        loadMeshBoneAssignments(sbNode, sharedMesh);
                    }
                }


                var submeshesNode = getXMLChildrenByTagName(meshNode, "submeshes")[0];
                if (!submeshesNode)
                {
                    console.log("Can not find <submeshes> tag in model xml: " + filename);
                    return null;
                }
                var model = { meshes:[] };
                var submeshNodes = getXMLChildrenByTagName(submeshesNode, "submesh");
                for (var iMesh = 0; iMesh < submeshNodes.length; iMesh++)
                {
                    var meshData = { position:sharedMesh.position, normal:sharedMesh.normal,
                        texcoord:sharedMesh.texcoord, boneAssign:sharedMesh.boneAssign };
                    var submeshNode = submeshNodes[iMesh];
                    var attTexture = getXMLAttribute(submeshNode, "texture");
                    if (attTexture)
                    {
                        meshData.texture = Texture.Manager.loadTexture(config.texturePath + attTexture);
                    }
                    else
                    {
                        meshData.texture = Texture.Manager.error;
                    }
                    for (var iChild = 0; iChild < submeshNode.childNodes.length; iChild++)
                    {
                        var childNode = submeshNode.childNodes[iChild];
                        if (childNode.nodeName == "faces")
                        {
                            loadMeshFaces(childNode, meshData);
                        }
                        else if (childNode.nodeName == "geometry")
                        {
                            loadMeshGeometry(childNode, meshData);
                        }
                        else if (childNode.nodeName == "boneassignments")
                        {
                            loadMeshBoneAssignments(childNode, meshData);
                        }
                    }

                    if (meshData.indices && meshData.position)
                    {
                        model.meshes.push(meshData);
                    }
                }
                return model;
            };

            var loadMeshFaces = function(node, mesh)
            {
                var attCount = node.attributes.getNamedItem("count");
                var count = parseInt(attCount.value);
                mesh.indices = new Uint16Array(count * 3);

                var faceNodes = getXMLChildrenByTagName(node, "face");
                for (var iFace = 0; iFace < faceNodes.length; iFace++)
                {
                    var faceNode = faceNodes[iFace];
                    var att = faceNode.attributes.getNamedItem("v1");
                    var v1 = parseInt(att.value);
                    att = faceNode.attributes.getNamedItem("v2");
                    var v2 = parseInt(att.value);
                    att = faceNode.attributes.getNamedItem("v3");
                    var v3 = parseInt(att.value);
                    mesh.indices[iFace * 3 + 0] = v1;
                    mesh.indices[iFace * 3 + 1] = v2;
                    mesh.indices[iFace * 3 + 2] = v3;
                }
            };


            var loadMeshGeometry = function(node, mesh)
            {
                var attVertCount = node.attributes.getNamedItem("vertexcount");
                var vertcount = parseInt(attVertCount.value);
                mesh.position = new Float32Array(vertcount * 3);
                mesh.normal = new Float32Array(vertcount * 3);
                mesh.texcoord = new Float32Array(vertcount * 2);

                var vbNodes = getXMLChildrenByTagName(node, "vertexbuffer");
                for (var iVB = 0; iVB < vbNodes.length; iVB++)
                {
                    var vbNode = vbNodes[iVB];
                    var vertNodes = getXMLChildrenByTagName(vbNode, "vertex");
                    for (var iVert = 0; iVert < vertNodes.length; iVert++)
                    {
                        var vertNode = vertNodes[iVert];
                        for (var iChild = 0; iChild < vertNode.childNodes.length; iChild++)
                        {
                            var childNode = vertNode.childNodes[iChild];
                            if (childNode.nodeType != 1) // not element node type
                                continue;
                            if (childNode.nodeName == "position")
                            {
                                var x = parseFloat(getXMLAttribute(childNode, "x"));
                                var y = parseFloat(getXMLAttribute(childNode, "y"));
                                var z = parseFloat(getXMLAttribute(childNode, "z"));
                                mesh.position[iVert * 3 + 0] = x;
                                mesh.position[iVert * 3 + 1] = y;
                                mesh.position[iVert * 3 + 2] = z;
                            }
                            else if (childNode.nodeName == "normal")
                            {
                                var x = parseFloat(getXMLAttribute(childNode, "x"));
                                var y = parseFloat(getXMLAttribute(childNode, "y"));
                                var z = parseFloat(getXMLAttribute(childNode, "z"));
                                mesh.normal[iVert * 3 + 0] = x;
                                mesh.normal[iVert * 3 + 1] = y;
                                mesh.normal[iVert * 3 + 2] = z;
                            }
                            else if (childNode.nodeName == "texcoord")
                            {
                                var u = parseFloat(getXMLAttribute(childNode, "u"));
                                var v = parseFloat(getXMLAttribute(childNode, "v"));
                                mesh.texcoord[iVert * 2 + 0] = u;
                                mesh.texcoord[iVert * 2 + 1] = v;
                            }
                        }
                    }
                }
            };

            var loadMeshBoneAssignments = function(node, mesh)
            {
                var assignNodes = getXMLChildrenByTagName(node, "vertexboneassignment");

                mesh.boneAssign = mesh.boneAssign || [];
                for (var i = 0; i < assignNodes.length; i++)
                {
                    var assignNode = assignNodes[i];
                    var boneInfo =
                    {
                        vertIdx:parseInt(getXMLAttribute(assignNode, "vertexindex")),
                        boneIdx:parseInt(getXMLAttribute(assignNode, "boneindex")),
                        weight:parseFloat(getXMLAttribute(assignNode, "weight"))
                    };
                    mesh.boneAssign.push(boneInfo);
                }
            };

            var loadXMLPosition = function(out, node)
            {
                out[0] = parseFloat(getXMLAttribute(node, "x"));
                out[1] = parseFloat(getXMLAttribute(node, "y"));
                out[2] = parseFloat(getXMLAttribute(node, "z"));
            };

            var loadXMLRotation = function(out, node)
            {
                var angle = parseFloat(getXMLAttribute(node, "angle"));

                var axisNode = getXMLChildrenByTagName(node, "axis")[0];
                if (!axisNode)
                {
                    console.log("Can not find <axis> tag in model xml: ");
                    return;
                }
                var axis = [1, 0, 0];
                loadXMLPosition(axis, axisNode);
                quat.setAxisAngle(out, axis, angle);
            };

            this.loadSkeleton = function(filename)
            {
                var xml;
                if (typeof filename == 'string')
                    xml = TextFileManager.loadXML(filename);
                else
                    xml = filename;

                if (!xml)
                {
                    console.log("Can not load skeleton xml: " + filename);
                    return null;
                }
                var meshNode = xml.documentElement;
                if (meshNode.nodeName != "skeleton")
                {
                    console.log("Can not find <skeleton> tag in model xml: " + filename);
                    return null;
                }

                var bonesNode = getXMLChildrenByTagName(meshNode, "bones")[0];

                var skel = new Skeleton();
                if (!bonesNode)
                {
                    console.log("empty skelton in xml: " + filename);
                    return skel;
                }

                var boneNodes = getXMLChildrenByTagName(bonesNode, "bone");
                for (var iBone = 0; iBone < boneNodes.length; iBone++)
                {
                    var boneNode = boneNodes[iBone];
                    var attName = getXMLAttribute(boneNode, "name");
                    var bone = skel.addBone(attName);

                    var posNode = getXMLChildrenByTagName(boneNode, "position")[0];
                    if (!posNode)
                    {
                        console.log("Can not find <position> tag in model xml: " + filename);
                        return null;
                    }
                    loadXMLPosition(bone.orgPos, posNode);

                    var rotNode = getXMLChildrenByTagName(boneNode, "rotation")[0];
                    if (!rotNode)
                    {
                        console.log("Can not find <rotation> tag in model xml: " + filename);
                        return null;
                    }

                    loadXMLRotation(bone.orgQuat, rotNode);
                }

                var bonehierarchyNode = getXMLChildrenByTagName(meshNode, "bonehierarchy")[0];

                if (!bonehierarchyNode)
                {
                    console.log("empty skelton in xml: " + filename);
                    return skel;
                }

                var bpNodes = getXMLChildrenByTagName(bonehierarchyNode, "boneparent");
                for (var i = 0; i < bpNodes.length; i++)
                {
                    var bpNode = bpNodes[i];
                    var attPName = getXMLAttribute(bpNode, "parent");
                    var attCName = getXMLAttribute(bpNode, "bone");
                    skel.setHierarchy(attPName, attCName);
                }

                skel.reset();
                //skel.outputBones();
                skel.update();
                return skel;
            };

            this.loadAnimation = function(filename, skel)
            {
                var xml = TextFileManager.loadXML(filename);
                if (!xml)
                {
                    console.log("Can not load skeleton xml: " + filename);
                    return null;
                }

                var skelAnim = this.loadSkeleton(xml);
                var meshNode = xml.documentElement;
                if (meshNode.nodeName != "skeleton")
                {
                    console.log("Can not find <skeleton> tag in model xml: " + filename);
                    return null;
                }

                var animationsNode = getXMLChildrenByTagName(meshNode, "animations")[0];

                var anims = [];
                if (!animationsNode)
                {
                    console.log("empty animation in xml: " + filename);
                    return anims;
                }
                var animNodes = getXMLChildrenByTagName(animationsNode, "animation");
                for (var iAnim = 0; iAnim < animNodes.length; iAnim++)
                {
                    var animNode = animNodes[iAnim];
                    var attName = getXMLAttribute(animNode, "name");
                    var attLength = parseFloat(getXMLAttribute(animNode, "length"));

                    var anim = new SkelAnim(skel);
                    anim.name = attName;
                    anim.time = attLength * 1000;

                    var tracksNode = getXMLChildrenByTagName(animNode, "tracks")[0];
                    if (tracksNode)
                    {
                        loadAnimationTracks(tracksNode, anim, skelAnim);
                        anims.push(anim);
                    }
                }
                return anims;
            };

            var loadAnimationTracks = function(tracksNode, anim, skelAnim)
            {
                var trackNodes = getXMLChildrenByTagName(tracksNode, "track");
                for (var i = 0; i < trackNodes.length; i++)
                {
                    var trackNode = trackNodes[i];
                    var attBoneName = getXMLAttribute(trackNode, "bone");
                    var track = new SkelAnim.Track();
                    track.boneName = attBoneName;
                    track.time = anim.time;
                    var bone = skelAnim.boneMap[attBoneName];
                    if (bone)
                    {
                        vec3.copy(track.orgPos, bone.orgPos);
                        quat.copy(track.orgQuat, bone.orgQuat);
                    }
                    var keysNode = getXMLChildrenByTagName(trackNode, "keyframes")[0];
                    if (keysNode)
                    {
                        loadAnimationKeyframes(keysNode, track);
                    }

                    anim.addTrack(track);
                }

                // fill undefined track
                for (var i = 0; i < anim.tracks.length; i++)
                {
                    if (!anim.tracks[i])
                    {
                        var track = new SkelAnim.Track();
                        var bone = skelAnim.bones[i];
                        track.boneName = bone.name;
                        track.time = anim.time;
                        track.addKey(0, bone.orgPos, bone.orgQuat);
                        anim.tracks[i] = track;
                    }
                }

            };

            var loadAnimationKeyframes = function(keysNode, track)
            {
                var keyNodes = getXMLChildrenByTagName(keysNode, "keyframe");
                for (var i = 0; i < keyNodes.length; i++)
                {
                    var keyNode = keyNodes[i];
                    var attTime = parseFloat(getXMLAttribute(keyNode, "time"));
                    var posNode = getXMLChildrenByTagName(keyNode, "translate")[0];
                    if (!posNode)
                    {
                        console.log("Can not find <translate> tag in model xml: ");
                        return;
                    }
                    var pos = [0, 0, 0];
                    loadXMLPosition(pos, posNode);

                    var rotNode = getXMLChildrenByTagName(keyNode, "rotate")[0];
                    if (!rotNode)
                    {
                        console.log("Can not find <rotate> tag in model xml: ");
                        return;
                    }
                    var quat = [0, 0, 0, 1];
                    loadXMLRotation(quat, rotNode);

                    track.addKey(attTime * 1000, pos, quat);
                }
            };
        };

        return ModelLoaderXML;
    }
);