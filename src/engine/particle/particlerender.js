/**
 * Crearted by ych
 * Date: 13-7-26
 * Time: 上午11:10
 */
define(
    ["../renderres/vertexbuffer", "../renderres/shader"],
    function(VertexBuffer, Shader)
    {
        "use strict";

        var ParticleRender =
        {
        };

        var maxPoint = 0;
        var psList = [];
        var sortByMaterial = {};
        var posScaleBuffer;
        var colorBuffer;
        var vbPosScale;
        var vbColor;
        var shader;

        var inUpdate = false;

        var removeList = [];

        ParticleRender.init = function(max)
        {
            maxPoint = max;
            psList = [];
            sortByMaterial = {};

            posScaleBuffer = new Float32Array(maxPoint * 4);
            vbPosScale = VertexBuffer.createVec4VB();
            vbPosScale.usage = gl.DYNAMIC_DRAW;
            vbPosScale.setData(posScaleBuffer);

            colorBuffer = new Uint8Array(maxPoint * 4);
            vbColor = VertexBuffer.createColorVB();
            vbColor.usage = gl.DYNAMIC_DRAW;
            vbColor.setData(colorBuffer);

            shader = new Shader();
            shader.loadFromFile("particle-vs.txt", "particle-fs.txt");
            shader.initCommon();
            shader.unifSizeScale = shader.getUniform("sizeScale");
        };

        ParticleRender.add = function(ps)
        {
            var slot = sortByMaterial[ps.materialTag];
            if (!slot)
            {
                slot = sortByMaterial[ps.materialTag] = [];
            }
            slot.push(ps);
            psList.push(ps);
        };

        ParticleRender.clear = function()
        {
            sortByMaterial = {};
            psList.length = 0;
        };

        ParticleRender.remove = function(ps)
        {
            var i = psList.indexOf(ps);
            if (i >= 0)
            {
                if (!inUpdate)
                    psList.splice(i, 1);
                else
                    removeList.push(i);
            }

            var slot = sortByMaterial[ps.materialTag];
            if (!slot)
            {
                return;
            }

            i = slot.indexOf(ps);
            if (i >= 0)
                slot.splice(i, 1);
        };

        ParticleRender.update = function(deltaTime)
        {
            var dt = deltaTime * 0.001;
            inUpdate = true;
            for (var i = 0, count = psList.length; i < count; i++)
            {
                var ps = psList[i];
                ps.update(dt);
            }
            if (removeList.length > 0)
            {
                removeList.sort();

                for (var index = 0; index < removeList.length; index++)
                {
                    psList.splice(removeList[index] - index, 1);
                }
                removeList.length = 0;
            }
            inUpdate = false;
        };

        ParticleRender.render = function()
        {
            if (psList.length == 0)
                return;

            shader.appear();
            gl.uniformMatrix4fv(shader.unifViewProj, false, engine.activeCamera.matViewProj);
            var scale = engine.activeCamera.matProj[5] * gl.viewportHeight;
            gl.uniform1f(shader.unifSizeScale, scale);
            gl.uniform1i(shader.unifDiffuseMap, 0);
            gl.depthMask(false);

            gl.disable(gl.CULL_FACE);
            gl.disable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);


            vbPosScale.bindAttribute([shader.posSlot]);
            vbColor.bindAttribute([shader.colorSlot]);
            var draw = function(count)
            {
                vbPosScale.setSubData(posScaleBuffer, 0);
                vbColor.setSubData(colorBuffer, 0);

                gl.drawArrays(gl.POINTS, 0, count);
            };

            for (var material in sortByMaterial)
            {
                var slot = sortByMaterial[material];
                var indexPos = 0;
                var indexColor = 0;
                for (var i = 0, count = slot.length; i < count; i++)
                {
                    var ps = slot[i];

                    // first particle system set the render states
                    if (i == 0)
                    {
                        ps.texture.appear(0);
                        ps.testZ ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);
                        gl.blendFunc(ps.srcBlend, ps.dstBlend);
                    }

                    for (var j = 0, pcount = ps.activeList.length; j < pcount; j++)
                    {
                        var p = ps.activeList[j];
                        posScaleBuffer[indexPos++] = p.pos[0];
                        posScaleBuffer[indexPos++] = p.pos[1];
                        posScaleBuffer[indexPos++] = p.pos[2];
                        posScaleBuffer[indexPos++] = p.scale;
                        colorBuffer[indexColor++] = p.color[0];
                        colorBuffer[indexColor++] = p.color[1];
                        colorBuffer[indexColor++] = p.color[2];
                        colorBuffer[indexColor++] = p.color[3];

                        if (indexPos >= maxPoint - 4)
                        {
                            draw(indexPos / 4);
                            indexPos = 0;
                            indexColor = 0;
                        }
                    }
                }

                if (indexPos > 0)
                {
                    draw(indexPos / 4);
                    indexPos = 0;
                    indexColor = 0;
                }


            }

            gl.depthMask(true);

            gl.enable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        };
        return ParticleRender;
    }
);    