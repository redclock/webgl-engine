// Game engine

define(
    [
        "../renderres/resman",
        "../renderres/texture",
        "./simpledraw",
        "../physics/physics",
        "../input/keyboard",
        "../particle/particlerender"
    ],
    function(ResManager, Texture, SimpleDraw, PhysicsSystem, Keyboard, ParticleRender)
    {
        var Engine = new function()
        {
            this.time = undefined;
            this.frameCount = 0;
            this.frameCountFPS = 0;
            this.FPSTime = 0;
            this.FPS = 60;
            this.deltaTime = 0;
            this.paused = false;
            this.activeCamera = null;
            this.statistics =
            {
                drawCall : 0,
                triangles : 0,
                meshes : 0
            }
        };

        var canvas = {};
        var gl;

        var requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            function(callback)
            {
                setTimeout(callback, 1000 / 60);
            };

        var initGL = function(canvas)
        {
            try
            {
                var createParam =
                {
                    antialias : true,
                    stencil : true,
                    premultipliedAlpha : false,
                    alpha : false
                };
                Engine.gl = canvas.getContext("webgl", createParam) || canvas.getContext("experimental-webgl", createParam);
            }
            catch (e)
            {
            }
            if (!Engine.gl)
            {
                alert("Could not initialise WebGL, sorry :-(");
            }
            else
            {
                Engine.contextAttribute = Engine.gl.getContextAttributes()
            }
        };

        Engine.init = function(canvasName)
        {
            var canvasdom = document.getElementById(canvasName);
            initGL(canvasdom);
            canvas.dom = canvasdom;
            canvas.width = parseInt(canvasdom.getAttribute("width"));
            canvas.height = parseInt(canvasdom.getAttribute("height"));
            Engine.gl.viewportWidth = canvas.width;
            Engine.gl.viewportHeight = canvas.height;

            window.canvas = canvas;
            window.gl = gl = Engine.gl;
            window.engine = Engine;

            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

            canvasdom.addEventListener("webglcontextlost", Engine.onCanvasLost);
            canvasdom.addEventListener("webglcontextrestored", Engine.onCanvasRestore);
            // �����Ҽ�˵�
            canvas.dom.oncontextmenu = function()
            {
                return false;
            };
            Engine.modelRenderList = new Engine.RenderList();

            Texture.Manager.init();
            SimpleDraw.init(this);
            Keyboard.init();
            PhysicsSystem.init();
            ParticleRender.init(1000);
        };

        var timeState = {};

        Engine.beginStat = function(name)
        {
            var s = timeState[name];
            if (!s)
            {
                timeState[name] = { begin: Date.now(), time : 0 };
            }
            else
            {
                s.begin = Date.now();
            }
        };
        Engine.endStat = function(name)
        {
            var s = timeState[name];
            s.time += Date.now() - s.begin;
        };

        Engine.getStat = function(name)
        {
            var s = timeState[name];
            if (!s)
                return 0;
            else
                return s.time;
         };

        Engine.clearStat = function()
        {
            timeState = {};
        };

        Engine.mainLoop = function()
        {
            requestAnimationFrame(Engine.mainLoop);

            var newTime = Date.now();
            Engine.time = Engine.time || Date.now();

            Engine.deltaTime = newTime - Engine.time;
            // ���������
            if (Engine.deltaTime > 500) Engine.deltaTime = 500;

            // ����FPS
            Engine.FPSTime += Engine.deltaTime;
            if (Engine.FPSTime > 1000)
            {
                Engine.FPSTime -= 1000;
                Engine.FPS = Engine.frameCountFPS;
                Engine.frameCountFPS = 0;
            }

            Engine.time = newTime;

            Keyboard.beginFrame();
            if (Engine.paused)
                return;

            if (Engine.renderCallback)
            {
                Engine.renderCallback(Engine.deltaTime);
            }

            Keyboard.endFrame();

            //timeState = {};
            Engine.frameCountFPS++;
            Engine.frameCount++;
        };

        Engine.update = function(deltaTime)
        {
            ParticleRender.update(deltaTime);
            PhysicsSystem.update(deltaTime);
        };

        Engine.onCanvasLost = function(event)
        {
            event.preventDefault();
        };

        Engine.onCanvasRestore = function(event)
        {
        };

        Engine.beforeRender = function()
        {
            Engine.modelRenderList.reset();
            this.statistics.drawCall = 0;
            this.statistics.meshes = 0;
            this.statistics.triangles = 0;
        };

        Engine.renderParticles = function()
        {
            ParticleRender.render();
        };

        Engine.renderList = function()
        {
            Engine.modelRenderList.render();
            gl.flush();
        };

        Engine.RenderList = function()
        {
            this.list = [];
            this.sortByShader = {};
        };

        Engine.RenderList.Item = function(mesh, mat, material)
        {
            return { mesh : mesh, mat : mat, material : material, aabb : mesh.aabb.transformAABB(mat)  };
        };

        Engine.RenderList.prototype.reset = function()
        {
            this.list.length = 0;
            this.sortByShader = {};
        };

        Engine.RenderList.prototype.add = function(item)
        {
            if (!item.material || !item.material.shader)
            {
                return;
            }

           // if (!Engine.activeCamera.frustum.intersectAABB(item.aabb))
           //     return;

            this.list.push(item);
            var shader = item.material.shader;
            var resid = shader.resid;
            if (!this.sortByShader[resid])
            {
                this.sortByShader[resid] = [item];
            }
            else
            {
                this.sortByShader[resid].push(item);
            }
        };

        Engine.RenderList.prototype.render = function()
        {
            //console.log(this.list.length);
            for (var resid in this.sortByShader)
            {
                if (!this.sortByShader.hasOwnProperty(resid))
                    continue;

                var itemList = this.sortByShader[resid];
                var shader = ResManager.getResourceById(resid);
                shader.appear();
                shader.setCommon();
                var itemCount = itemList.length;
                for (var i = 0; i < itemCount; i++)
                {
                    var item = itemList[i];
                    if (!Engine.activeCamera.isAABBVisible(item.aabb))
                        continue;
                    shader.setIndividual(item);
                    item.mesh.ib.appear();
                    engine.statistics.triangles += item.mesh.numIndex / 3;

                    if (item.submeshes)
                    {
                        for (var iSubMesh = 0, submeshLen = item.submeshes.length; iSubMesh < submeshLen; iSubMesh++)
                        {
                            var submesh = item.submeshes[iSubMesh];
                            shader.setPass(item, iSubMesh);
                            gl.drawElements(gl.TRIANGLES, submesh.numIndex, gl.UNSIGNED_SHORT, submesh.startIndex * 2);
                        }
                    }
                    else
                    {
                        gl.drawElements(gl.TRIANGLES, item.mesh.numIndex, gl.UNSIGNED_SHORT, 0);
                    }

                    engine.statistics.drawCall++;
                    engine.statistics.meshes++;
                }
            }
        };

        return Engine;
    }
);
