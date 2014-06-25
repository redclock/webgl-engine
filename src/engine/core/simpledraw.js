/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 上午10:01
 */
define(
    ["../renderres/shader", "../renderres/vertexbuffer", "../renderres/dynamicvb"],
    function(Shader, VertexBuffer, DynamicVB)
    {
        "use strict";

        // By hand drawing , low performace

        var SimpleDraw =
        {
        };

        var Engine = null;
        var shaderDraw;
        var lineVB;
        var pointVB;
        var triangleVB;
        var color;
        var shaderTexture;
        var quadVB;

        SimpleDraw.init = function(engine)
        {
            Engine = engine;
            shaderDraw = Shader.createColorShader();
            shaderDraw.unifMat = shaderDraw.getUniform("matVP");
            shaderDraw.attPosition = shaderDraw.getAttrib("aPosition");
            shaderDraw.attColor = shaderDraw.getAttrib("aColor");

            lineVB = new DynamicVB(VertexBuffer.createPosColorVB(), 1000);
            lineVB.pos = new Float32Array(lineVB.buf);
            lineVB.color = new Uint8Array(lineVB.buf, 12);

            pointVB = new DynamicVB(VertexBuffer.createPosColorVB(), 1000);
            pointVB.pos = new Float32Array(pointVB.buf);
            pointVB.color = new Uint8Array(pointVB.buf, 12);

            triangleVB = new DynamicVB(VertexBuffer.createPosColorVB(), 960);
            triangleVB.pos = new Float32Array(triangleVB.buf);
            triangleVB.color = new Uint8Array(triangleVB.buf, 12);

            color = new Uint8Array([255, 255, 255, 255]);

            shaderTexture = Shader.createTextureShader();
            quadVB = VertexBuffer.createPosTexVB();
            quadVB.setData(new Float32Array([
                -1, -1, 0, 0, 0,
                -1, 1, 0, 0, 1,
                1, 1, 0, 1, 1,
                1, -1, 0, 1, 0
            ]));
        };


        SimpleDraw.beginDraw = function()
        {
            shaderDraw.appear();
            gl.uniformMatrix4fv(shaderDraw.unifMat, false, Engine.activeCamera.matViewProj);
            var attList = [shaderDraw.attPosition, shaderDraw.attColor];

            pointVB.begin(
                function(dvb)
                {
                    dvb.vb.bindAttribute(attList);
                    gl.drawArrays(gl.POINTS, 0, dvb.vertCount);
                    engine.statistics.drawCall++;
                });

            lineVB.begin(
                function(dvb)
                {
                    dvb.vb.bindAttribute(attList);
                    gl.drawArrays(gl.LINES, 0, dvb.vertCount);
                    engine.statistics.drawCall++;
                });
            triangleVB.begin(
                function(dvb)
                {
                    dvb.vb.bindAttribute(attList);
                    gl.drawArrays(gl.TRIANGLES, 0, dvb.vertCount);
                    engine.statistics.drawCall++;
                });

        };

        SimpleDraw.endDraw = function()
        {
            this.flush();
        };

        SimpleDraw.flush = function()
        {
            pointVB.flush();
            lineVB.flush();
            triangleVB.flush();

        };

        SimpleDraw.addVertex = function(dvb, x, y, z)
        {
            dvb.addVertex();
            var offPos = dvb.curOffset / 4;
            var offColor = dvb.curOffset;

            dvb.pos[offPos + 0] = x;
            dvb.pos[offPos + 1] = y;
            dvb.pos[offPos + 2] = z;
            dvb.color[offColor + 0] = color[0];
            dvb.color[offColor + 1] = color[1];
            dvb.color[offColor + 2] = color[2];
            dvb.color[offColor + 3] = color[3];
        };

        SimpleDraw.addPoint = function(x, y, z)
        {
            this.addVertex(pointVB, x, y, z);
        };

        SimpleDraw.addLine = function(x1, y1, z1, x2, y2, z2)
        {
            this.addVertex(lineVB, x1, y1, z1);
            this.addVertex(lineVB, x2, y2, z2);
        };

        SimpleDraw.addTriangle = function(p1, p2, p3, framewire, mat)
        {
            var tp1 = p1;
            var tp2 = p2;
            var tp3 = p3;

            if (mat)
            {
                tp1 = vec3.create();
                tp2 = vec3.create();
                tp3 = vec3.create();
                vec3.transformMat4(tp1, p1, mat);
                vec3.transformMat4(tp2, p2, mat);
                vec3.transformMat4(tp3, p3, mat);
            }

            if (framewire)
            {
                this.addLine(tp1[0], tp1[1], tp1[2], tp2[0], tp2[1], tp2[2]);
                this.addLine(tp2[0], tp2[1], tp2[2], tp3[0], tp3[1], tp3[2]);
                this.addLine(tp1[0], tp1[1], tp1[2], tp3[0], tp3[1], tp3[2]);
            }
            else
            {
                this.addVertex(triangleVB, tp1[0], tp1[1], tp1[2]);
                this.addVertex(triangleVB, tp2[0], tp2[1], tp2[2]);
                this.addVertex(triangleVB, tp3[0], tp3[1], tp3[2]);
            }
        };

        SimpleDraw.addQuad = function(p1, p2, p3, p4, framewire, mat)
        {
            if (framewire)
            {
                var tp1 = p1;
                var tp2 = p2;
                var tp3 = p3;
                var tp4 = p4;

                if (mat)
                {
                    tp1 = vec3.create();
                    tp2 = vec3.create();
                    tp3 = vec3.create();
                    tp4 = vec3.create();
                    vec3.transformMat4(tp1, p1, mat);
                    vec3.transformMat4(tp2, p2, mat);
                    vec3.transformMat4(tp3, p3, mat);
                    vec3.transformMat4(tp4, p4, mat);
                }
                this.addLine(tp1[0], tp1[1], tp1[2], tp2[0], tp2[1], tp2[2]);
                this.addLine(tp2[0], tp2[1], tp2[2], tp3[0], tp3[1], tp3[2]);
                this.addLine(tp3[0], tp3[1], tp3[2], tp4[0], tp4[1], tp4[2]);
                this.addLine(tp4[0], tp4[1], tp4[2], tp1[0], tp1[1], tp1[2]);
            }
            else
            {
                this.addTriangle(p1, p2, p3, framewire, mat);
                this.addTriangle(p1, p3, p4, framewire, mat);
            }
        };

        SimpleDraw.addAABB = function(aabb, framewire, mat)
        {
            var corners = aabb.getCorners();

            if (mat)
            {
                for (var i = 0; i < 8; i++)
                {
                    vec3.transformMat4(corners[i], corners[i], mat);
                }
            }

            this.addQuad(corners[0], corners[1], corners[3], corners[2], framewire);
            this.addQuad(corners[4], corners[5], corners[7], corners[6], framewire);
            this.addQuad(corners[2], corners[3], corners[7], corners[6], framewire);
            this.addQuad(corners[0], corners[1], corners[5], corners[4], framewire);
            this.addQuad(corners[0], corners[2], corners[6], corners[4], framewire);
            this.addQuad(corners[1], corners[3], corners[7], corners[5], framewire);
        };

        SimpleDraw.setColor = function(r, g, b, a)
        {
            color[0] = r;
            color[1] = g;
            color[2] = b;
            color[3] = a;
        };

        SimpleDraw.drawTexture = function(texture, x, y, width, height, diffuseColor, emissiveColor)
        {
            shaderTexture.appear();
            diffuseColor = diffuseColor || [1, 1, 1, 1];
            emissiveColor = emissiveColor || [0, 0, 0, 0];
            gl.uniform4fv(shaderTexture.unifDiffuseColor, diffuseColor);
            gl.uniform4fv(shaderTexture.unifEmissiveColor, emissiveColor);
            this.drawTextureWithShader(texture, x, y, width, height, shaderTexture);

        };

        // shader should have appeared before this call
        SimpleDraw.drawTextureWithShader = function(texture, x, y, width, height, shader)
        {
            var mat =
                [
                    width / gl.viewportWidth, 0, 0, 0,
                    0, -height / gl.viewportHeight, 0, 0,
                    0, 0, 0, 0,
                    (x * 2 + width) / gl.viewportWidth - 1, (-y * 2 - height) / gl.viewportHeight + 1, 0, 1
                ];
            gl.uniformMatrix4fv(shader.unifViewProj, false, mat);
            gl.uniform1i(shader.unifDiffuseMap, 0);
            quadVB.bindAttribute([shader.positionSlot, shader.texcoordSlot]);
            texture.appear(0);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
            engine.statistics.drawCall++;
        };


        return SimpleDraw;
    }
);

