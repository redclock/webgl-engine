/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 上午11:35
 */
define(
    ["../core/transform", "../core/engine"],
    function(Transform, Engine)
    {
        "use strict";

        var ModelIns = function()
        {
            this.material = { shader : null };
            this.items = [];
            this.transform = new Transform();
            this.isSkin = false;
            this.isPhysics = false;
        };

        /**
         *
         * @param {Model} model
         * @param {Skeleton} skeleton
         */
        ModelIns.prototype.init = function(model, skeleton)
        {
            this.model = model;
            this.isSkin = !!skeleton;
            for (var i = 0; i < model.meshes.length; i++)
            {
                var mesh = model.meshes[i];
                var item = Engine.RenderList.Item(mesh, this.transform.mat, this.material);

                if (this.isSkin)
                {
                    item.submeshes = [];
                    for (var j = 0; j < mesh.submeshes.length; j++)
                    {
                        var submesh = {};
                        submesh.skinUniforms = new Float32Array(mesh.submeshes[j].boneIndexMap.length * 12);
                        submesh.boneMap = mesh.submeshes[j].boneIndexMap;
                        submesh.vbBoneIndices = mesh.submeshes[j].vbBoneIndices;
                        submesh.numIndex = mesh.submeshes[j].numIndex;
                        submesh.startIndex = mesh.submeshes[j].startIndex;
                        item.submeshes.push(submesh);
                    }
                }

                this.items.push(item);
            }
            this.aabb = model.aabb;

            this.skeleton = skeleton;

        };


        ModelIns.prototype.update = function()
        {
            this.updateSkin();
            if (this.transform.dirty)
            {
                this.updateMatrix();
                this.transform.dirty = false;
            }
        };

        ModelIns.prototype.updateSkin = function()
        {
            if (this.isSkin)
            {
                var bones = this.skeleton.bones;
                for (var iItem = 0, itemLen = this.items.length; iItem < itemLen; iItem++)
                {
                    var submeshes = this.items[iItem].submeshes;

                    for (var iSubMesh = 0, submeshLen = submeshes.length; iSubMesh < submeshLen; iSubMesh++)
                    {
                        var submesh = submeshes[iSubMesh];
                        var skinUniforms = submesh.skinUniforms;
                        var boneMap = submesh.boneMap;
                        var index = 0;
                        for (var iBone = 0, boneLen = boneMap.length; iBone < boneLen; iBone++)
                        {
                            var bone = bones[boneMap[iBone]];
                            skinUniforms[index++] = bone.matRelative[0];
                            skinUniforms[index++] = bone.matRelative[4];
                            skinUniforms[index++] = bone.matRelative[8];
                            skinUniforms[index++] = bone.matRelative[12];
                            skinUniforms[index++] = bone.matRelative[1];
                            skinUniforms[index++] = bone.matRelative[5];
                            skinUniforms[index++] = bone.matRelative[9];
                            skinUniforms[index++] = bone.matRelative[13];
                            skinUniforms[index++] = bone.matRelative[2];
                            skinUniforms[index++] = bone.matRelative[6];
                            skinUniforms[index++] = bone.matRelative[10];
                            skinUniforms[index++] = bone.matRelative[14];
                        }
                    }
                }
            }
        };

        ModelIns.prototype.draw = function()
        {
            for (var i = 0; i < this.items.length; i++)            {

                var item = this.items[i];
                Engine.modelRenderList.add(item);
            }

        };

        ModelIns.prototype.updateMatrix = function()
        {
            for (var i = 0, itemLen = this.items.length; i < itemLen; i++)
            {
                var mat = this.transform.mat;
                var item = this.items[i];
                item.mat = mat;
                item.aabb = item.mesh.aabb.transformAABB(mat);
            }
            this.aabb = this.model.aabb.transformAABB(mat);
        };

        ModelIns.prototype.setMaterial = function(material, index)
        {
            if (index != undefined)
            {
                this.items[index].material = material;
            }
            else
            {
                for (var i = 0; i < this.items.length; i++)
                {
                    this.items[i].material = material;
                }
            }
        };

        ModelIns.prototype.rayTrace = function()
        {
            var matinv = mat4.create();
            var startObj = [0, 0, 0];
            var dirObj = [0, 0, 0];
            return function(start, dir, result)
            {
                mat4.invert(matinv, this.transform.mat);
                vec3.transformMat4(startObj, start, matinv);
                vec3.transformMat4NoTranslation(dirObj, dir, matinv);

                var maxt = result.maxt;
                var found = false;
                for (var i = 0; i < this.items.length; i++)
                {
                    var mesh = this.items[i].mesh;
                    if (mesh.rayTrace(startObj, dirObj, result))
                    {
                        result.maxt = result.t;
                        found = true;
                    }
                }

                result.maxt = maxt;
                if (found)
                {
                    vec3.transformMat4NoTranslation(result.normal, result.normal, this.transform.mat);
                    vec3.normalize(result.normal, result.normal);
                }

                return found;
            };
        }();

        return ModelIns;
    }
);