/**
 * Created with JetBrains WebStorm.
 * User: ych
 * Date: 13-6-19
 * Time: 上午11:09
 * Define common used shaders
 */

define(
    ["./resman", "../common/domutils", "../file/textfilemanager", "../common/config"],
    function(ResManager, DomUtils, TextFileManager, config)
    {
        "use strict";

        var Texture;
        var Shader = function(name)
        {
            this.vs = null;
            this.fs = null;
            this.program = null;
            this.vsContent = '';
            this.fsContent = '';
            this.name = name;

            ResManager.newResource(this);
            if (!Texture)
            {
                require(["engine/renderres/texture"], function(t) { Texture = t; });
            }
        };

        Shader.prototype.compileShader = function(shaderType, str)
        {
            var shader = gl.createShader(shaderType);
            gl.shaderSource(shader, str);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            {
                var strType = shaderType == gl.VERTEX_SHADER ? "Vertex Shader" : "Fragment Shader";
                alert(strType + " [" + this.name + "] ERROR:\n" + gl.getShaderInfoLog(shader) + "\n" + str);
                return null;
            }
            return shader;
        };

        Shader.prototype.linkProgram = function()
        {
            this.program = gl.createProgram();
            gl.attachShader(this.program, this.vs);
            gl.attachShader(this.program, this.fs);
            gl.linkProgram(this.program);
            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
            {
                alert("Could not initialise shaders");
                gl.deleteProgram(this.program);
                this.program = null;
            }
        };

        Shader.prototype.create = function()
        {
            this.vs = this.compileShader(gl.VERTEX_SHADER, this.vsContent);
            if (!this.vs) return;
            this.fs = this.compileShader(gl.FRAGMENT_SHADER, this.fsContent);
            if (!this.fs) return;
            this.linkProgram();
        };

        Shader.prototype.initCommon = function()
        {
            this.posSlot = this.getAttrib("aPosition");
            this.normalSlot = this.getAttrib("aNormal");
            this.texcoordSlot = this.getAttrib("aTexcoord");
            this.colorSlot = this.getAttrib("aColor");

            this.unifWorld = this.getUniform("matWorld");
            this.unifViewProj = this.getUniform("matViewProj");
            this.unifDiffuseMap = this.getUniform("DiffuseMap");
            this.unifDiffuseColor = this.getUniform("DiffuseColor");
        };

        Shader.prototype.generateDefineSource = function(defines)
        {
            var result = "";
            if (!defines)
                return result;

            var list = defines.split(";");

            for (var i = 0; i < list.length; i++)
            {
                var pair = list[i].split("=");
                if (!pair[0])
                    continue;
                if (pair[1])
                {
                    result += "#define " + pair[0] + " " + pair[1] + "\n";
                }
                else
                {
                    result += "#define " + pair[0] + "\n";
                }
            }

            return result;
        };


        Shader.prototype.loadFromFile = function(filevs, filefs, defines)
        {
            var defineSource = this.generateDefineSource(defines);
            this.name = filevs + "#" + filefs + (defines ? "#" + defines : "");
            this.vsContent = defineSource + TextFileManager.loadFileWithInclude(config.shaderPath + filevs, config.shaderPath);
            this.fsContent = defineSource + TextFileManager.loadFileWithInclude(config.shaderPath + filefs, config.shaderPath);
            this.create();
        };

        Shader.prototype.loadFromElement = function(idvs, idfs)
        {
            this.vsContent = DomUtils.getTextFromElement(idvs);
            this.fsContent = DomUtils.getTextFromElement(idfs);
            this.create();
        };

        Shader.prototype.release = function()
        {
            gl.deleteShader(this.vs);
            this.vs = null;
            gl.deleteShader(this.fs);
            this.fs = null;
            gl.deleteProgram(this.program);
            this.program = null;
            ResManager.freeResource(this);
        };

        Shader.prototype.appear = function()
        {
            if (!this.program)
                return false;
            gl.useProgram(this.program);
            return true;

        };

        Shader.prototype.getAttrib = function(name)
        {
            return gl.getAttribLocation(this.program, name);
        };

        Shader.prototype.getUniform = function(name)
        {
            return gl.getUniformLocation(this.program, name);
        };

        Shader.prototype.setCommon = function()
        {

        };

        Shader.prototype.setIndividual = function()
        {

        };

        Shader.prototype.setPass = function()
        {

        };

        Shader.createDiffuseShader = function()
        {
            var instance;
            return function()
            {
                if (instance)
                    return instance;

                var shader = new Shader("diffuse mesh");
                shader.loadFromFile("model-vs.txt", "color_texture-fs.txt");

                shader.initCommon();
                shader.setCommon = function()
                {
                    gl.uniformMatrix4fv(shader.unifViewProj, false, engine.activeCamera.matViewProj);
                    gl.uniform1i(shader.unifDiffuseMap, 0);
                };

                shader.setIndividual = function(item)
                {
                    gl.uniformMatrix4fv(shader.unifWorld, false, item.mat);
                    item.mesh.vb.bindAttribute([shader.posSlot, shader.normalSlot, shader.texcoordSlot]);
                    if (item.mesh.texture)
                    {
                        item.mesh.texture.appear(0);
                    }
                    else if (Texture)
                    {
                        Texture.Manager.error.appear(0);
                    }
                };

                instance = shader;
                return shader;

            }
        }();

        Shader.createSkinDiffuseShader = function()
        {
            var instance;
            return function()
            {
                if (instance)
                    return instance;

                var shader = new Shader("skin diffuse mesh");
                shader.loadFromFile("model-vs.txt", "color_texture-fs.txt", "_SKIN_");

                shader.initCommon();
                shader.blendWeightSlot = shader.getAttrib("aBlendWeights");
                shader.blendIndicesSlot = shader.getAttrib("aBlendIndices");
                shader.unifBlendMat = shader.getUniform("matBlend");
                shader.setCommon = function()
                {
                    gl.uniformMatrix4fv(shader.unifViewProj, false, engine.activeCamera.matViewProj);
                    gl.uniform1i(shader.unifDiffuseMap, 0);
                };

                shader.setIndividual = function(item)
                {
                    gl.uniformMatrix4fv(shader.unifWorld, false, item.mat);
                    item.mesh.vb.bindAttribute([shader.posSlot, shader.normalSlot, shader.texcoordSlot]);
                    item.mesh.vbBoneWeights.bindAttribute([shader.blendWeightSlot]);
                    if (item.mesh.texture)
                    {
                        item.mesh.texture.appear(0);
                    }
                    else if (Texture)
                    {
                        Texture.Manager.error.appear(0);
                    }
                };

                shader.setPass = function(item, index)
                {
                    var submesh = item.submeshes[index];
                    submesh.vbBoneIndices.bindAttribute([shader.blendIndicesSlot]);
                    gl.uniform4fv(shader.unifBlendMat, submesh.skinUniforms);

                };

                instance = shader;
                return shader;

            }
        }();

        Shader.createColorShader = function()
        {
            var instance;
            return function()
            {
                if (instance)
                    return instance;

                var shader = new Shader("color");
                shader.loadFromFile("color-vs.txt", "color-fs.txt");

                shader.initCommon();
                shader.colorSlot = shader.getAttrib("aColor");
                shader.setCommon = function()
                {
                    gl.uniformMatrix4fv(shader.unifViewProj, false, engine.activeCamera.matViewProj);
                };

                shader.setIndividual = function(item)
                {
                    gl.uniformMatrix4fv(shader.unifWorld, false, item.mat);
                    item.mesh.vb.bindAttribute([shader.posSlot, shader.colorSlot]);
                };
                instance = shader;
                return shader;

            }
        }();

        Shader.createTextureShader = function()
        {
            var instances = [];
            return function(fs, defines)
            {
                fs = fs || "texture";
                defines = defines || "";
                var key = fs + "#" + defines;
                if (instances[key])
                    return instances[key];

                var shader = new Shader(key);
                shader.loadFromFile("texture-vs.txt", fs + "-fs.txt", defines);

                shader.positionSlot = shader.getAttrib("aPosition");
                shader.texcoordSlot = shader.getAttrib("aTexcoord");
                shader.unifDiffuse = shader.getUniform("DiffuseMap");
                shader.unifViewProj = shader.getUniform("matVP");
                shader.unifDiffuseColor = shader.getUniform("diffuseColor");
                shader.unifEmissiveColor = shader.getUniform("emissiveColor");

                instances[fs] = shader;
                return shader;

            }
        }();

        Shader.createMirrorShader = function()
        {
            var instance;
            return function()
            {
                if (instance)
                    return instance;

                var shader = new Shader("mirror");
                shader.loadFromFile("mirror-vs.txt", "mirror-fs.txt");

                shader.initCommon();
                shader.tangentSlot = shader.getAttrib("aTangent");
                shader.unifReflectMat = shader.getUniform("matViewProjReflect");
                shader.unifEyePos = shader.getUniform("eyePos");
                shader.unifNormalMap = shader.getUniform("NormalMap");
                shader.unifRefractMap = shader.getUniform("RefractMap");
                shader.unifDetailNormalMap = shader.getUniform("DetailNormalMap");
                shader.unifDetailMapParam = shader.getUniform("detailParam");
                shader.setCommon = function()
                {
                    gl.uniformMatrix4fv(shader.unifViewProj, false, engine.activeCamera.matViewProj);
                    gl.uniform3fv(shader.unifEyePos, engine.activeCamera.pos);
                    gl.uniform1i(shader.unifDiffuseMap, 0);
                    gl.uniform1i(shader.unifNormalMap, 1);
                    gl.uniform1i(shader.unifRefractMap, 2);
                    gl.uniform1i(shader.unifDetailNormalMap, 3);
                };

                shader.setIndividual = function(item)
                {
                    gl.uniformMatrix4fv(shader.unifWorld, false, item.mat);
                    gl.uniformMatrix4fv(shader.unifReflectMat, false, item.camera.matViewProj);
                    item.mesh.vb.bindAttribute([shader.posSlot, shader.normalSlot, shader.texcoordSlot]);
                    gl.disableVertexAttribArray(shader.tangentSlot);
                    gl.vertexAttrib4f(shader.tangentSlot, 1, 0, 0, 1);

                    if (item.mesh.texture)
                    {
                        item.mesh.texture.appear(0);
                    }
                    else if (Texture)
                    {
                        Texture.Manager.error.appear(0);
                    }
                    item.mesh.normalmap.appear(1);
                    item.mesh.textureRefract.appear(2);
                    item.mesh.textureDetailNormal.appear(3);

                    var time = (engine.time % 100000) * 0.001;
                    gl.uniform3f(shader.unifDetailMapParam, time * 0.01, time * 0.01, 10);
                };
                instance = shader;
                return shader;

            }
        }();
        return Shader;

    }
);