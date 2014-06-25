/**
 * @author yaochunhui
 */


define(
    [
        "engine/common/config",
        "engine/common/utils",
        "engine/common/mathlib",
        "engine/core/aabb",
        "engine/core/camera",
        "engine/core/engine",
        "engine/core/simpledraw",
        "engine/file/ajaxfile",
        "engine/file/modelloaderxml",
        "engine/file/textfilemanager",
        "engine/input/keyboard",
        "engine/input/canvasevent",
        "engine/renderres/shader",
        "engine/renderres/texture",
        "engine/renderres/rendertarget",
        "engine/model/model",
        "engine/model/modelins",
        "engine/physics/physics",
        "engine/particle/particlesystem",
        "./phymaterial",
        "./npc",
        "./gameeffect",
        "./gameui"
    ],
    function(config, Utils, MathLib, AABB, Camera, Engine, SimpleDraw, AjaxFile, ModelLoaderXML, TextFileManager,
             Keyboard, CanvasEvent, Shader, Texture, RenderTarget, Model, ModelIns, PhysicsSystem, ParticleSystem,
             PhysicsMaterials, Npc, GameEffect, ui
            )
    {
        var game = {};
        window.game = game;
        game.profile =
        {
        };

        game.ui = ui;

        function initialize()
        {
            try
            {
                ui.init(game);
                Engine.renderCallback = render;
                Engine.init("myCanvas");
                game.init();
                Engine.mainLoop();
            }
            catch(e)
            {
                alert(e);
            }
        }


        function render(deltaTime)
        {
            game.render(deltaTime);
            ui.update();
        }

        game.controlType = 0;

        var fishFiles = {
            mesh : "aabody.mesh.xml",
            skeleton : "aabody.SKELETON.xml",
            walk : "aabody.SKELETON.xml",
            idle : "aabody.SKELETON.xml",
            attack : "aabody.SKELETON.xml"
        };

        var frogFiles = {
            mesh : "frog/frog.MESH.xml",
            skeleton : "frog/frog.SKELETON.xml",
            walk : "frog/run.SKELETON.xml",
            idle : "frog/idle.SKELETON.xml",
            attack : "frog/idle.SKELETON.xml"
        };
        var mimicFiles = {
            mesh : "Mimic/Mimic.MESH.xml",
            skeleton : "Mimic/Mimic.SKELETON.xml",
            walk : "Mimic/Run.SKELETON.xml",
            idle : "Mimic/Idle.SKELETON.xml",
            attack : "Mimic/Attack1.SKELETON.xml"
        };

        var catFiles = {
            mesh : "Cat/aa.mesh.xml",
            skeleton : "Cat/cat.SKELETON.xml",
            walk : "Cat/Walk.SKELETON.xml",
            idle : "Cat/Idle.SKELETON.xml",
            attack : "Cat/Attack1.SKELETON.xml"
        };

        var ghostFiles = {
            mesh : "Ghost/Ghost.MESH.xml",
            skeleton : "Ghost/Ghost.SKELETON.xml",
            walk : "Ghost/Walk.SKELETON.xml",
            idle : "Ghost/Idle.SKELETON.xml",
            attack : "Ghost/Attack1.SKELETON.xml"
        };

        var zealotFiles = {
            mesh : "Zealot/Zealot.MESH.xml",
            skeleton : "Zealot/Zealot.SKELETON.xml",
            walk : "Zealot/Walk.SKELETON.xml",
            idle : "Zealot/Idle.SKELETON.xml",
            attack : "Zealot/Polearm1.SKELETON.xml"
        };

        function createActor(files)
        {
            var skel = ModelLoaderXML.loadSkeleton(config.modelPath + files.skeleton);
            var anim = ModelLoaderXML.loadAnimation(config.modelPath + files.walk, skel)[0];

            skel.addAnimation("walk", anim);
            anim = ModelLoaderXML.loadAnimation(config.modelPath + files.attack, skel)[0];
            skel.addAnimation("attack", anim);
            anim = ModelLoaderXML.loadAnimation(config.modelPath + files.idle, skel)[0];
            skel.addAnimation("idle", anim);

            skel.setChannelNum(2);

            skel.playAnimationClip(0, "walk", {trans : 100, loop : true, exclusive : true});

            var model = new Model();
            model.init();

            model.load(config.modelPath + files.mesh, ModelLoaderXML, {size : [1, 1, 1], skin : true});

            var actor = new Npc();
            actor.init(model, skel, { shader : game.skinShader });
            actor.transform.pos = [0, -1.5, 0];
            actor.transform.updateMatrix();
            return actor;
        }

        function createSphereModelIns(pos, radius, texScale, up, dir, texture, density)
        {
            var planeModel = new Model();
            planeModel.init();
            planeModel.addSphere({radius : radius, texScale : texScale, texture : texture});
            planeModel.ready = true;
            planeModel.recreate();


            var modelIns = new ModelIns();
            modelIns.init(planeModel);
            modelIns.transform.lookAt(pos, up, dir);
            modelIns.setMaterial(game.staticMaterial);
            density = density == undefined ? 10 : density;

            modelIns.phyObj = PhysicsSystem.addPhysics(modelIns, density * 4 / 3 * Math.PI * radius * radius * radius);
            modelIns.phyObj.body.material = PhysicsMaterials.materials["ball"];
            return modelIns;
        }

        function createCubeModelIns(pos, size, texScale, up, dir, texture)
        {
            //size[1] = size[2] = size[0];
            var planeModel = new Model();
            planeModel.init();
            planeModel.addCube({size : size, texScale : texScale, texture : texture});
            planeModel.ready = true;
            planeModel.recreate();


            var modelIns = new ModelIns();
            modelIns.init(planeModel);
            modelIns.transform.lookAt(pos, up, dir);
            modelIns.setMaterial(game.staticMaterial);
            modelIns.phyObj = PhysicsSystem.addPhysics(modelIns, 100 * size[0] * size[1] * size[2]);
            modelIns.phyObj.body.material = PhysicsMaterials.materials["wall"];
            return modelIns;
        }

        function createPlaneModelIns(pos, size, texScale, up, dir, texture)
        {
            var planeModel = new Model();
            planeModel.init();
            planeModel.addPlane({size : size, texScale : texScale, texture : texture});
            planeModel.ready = true;
            planeModel.recreate();


            var modelIns = new ModelIns();
            modelIns.init(planeModel);
            modelIns.transform.lookAt(pos, up, dir);
            modelIns.setMaterial(game.staticMaterial);
            modelIns.phyObj = PhysicsSystem.addPhysics(modelIns, 0);
            modelIns.phyObj.body.material = PhysicsMaterials.materials["wall"];
            return modelIns;
        }

        function initGameObjects()
        {
            /*
             game.ball = new Ball();
             game.ball.borderColor = "#FFFFFF";

             game.scene = new Scene();
             game.scene.map = new Map(20, 20, 20);
             game.scene.init();
             game.map = game.scene.map;
             */


            var textureWall = game.texture = new Texture();
            textureWall.load('res/images/stone.jpg');

            var textureSpot = game.textureSpot = new Texture();
            textureSpot.load('res/images/spot.png');

            var textureBall = game.texture = new Texture();
            textureBall.load('res/images/stone.jpg');

            game.staticMaterial = { shader : Shader.createDiffuseShader() };
            game.staticModels = [];

            game.staticModels.push(createPlaneModelIns([0, -6, 0], [60, 60, 1], [3, 3], [0, 0, 1], [0, 1, 0], textureWall));
            game.staticModels.push(createPlaneModelIns([15, -1.5, 0], [30, 15, 1], [3, 1], [0, 1, 0], [-1, 0, 0], textureWall));
            game.staticModels.push(createPlaneModelIns([-15, -1.5, 0], [30, 15, 1], [3, 1], [0, 1, 0], [1, 0, 0], textureWall));
            game.staticModels.push(createPlaneModelIns([0, -1.5, 15], [30, 15, 1], [3, 1], [0, 1, 0], [0, 0, -1], textureWall));
            game.staticModels.push(createPlaneModelIns([0, -1.5, -15], [30, 15, 1], [3, 1], [0, 1, 0], [0, 0, 1], textureWall));
            game.mirror = createPlaneModelIns([0, -1.5, 0], [30, 30, 1], [1, 1], [0, 0, 1], [0, 1, 0], textureWall);
            game.mirror.canRayTrace = true;

            game.balls = [];
            for (var i = 0; i < 5; i++)
            {
                var ball = createSphereModelIns(
                    [Math.random() * 20 - 10, 1, Math.random() * 20 - 10],
                    Math.random() + 1, [3, 3], [0, 1, 0], [0, 0, 1], textureBall);
                game.staticModels.push(ball);
                game.balls.push(ball);

//        game.staticModels.push(
//            createCubeModelIns(
//                [Math.random() * 20 - 10, -1, Math.random() * 20 - 10],
//                [Math.random() * 2 + 1, Math.random() * 2 + 1, Math.random() * 2 + 1], [3, 3], [0, 1, 0], [0, 0, 1], textureWall)
//        );
            }
            game.staticModels.push(createSphereModelIns(
                [10, -1, 10], 3, [3, 3], [0, 1, 0], [0, 0, 1],textureBall, 0));
            /*
             mat4.rotateX(matCube, matCube, 1);
             game.cube = new CubeShape({ pos:[1, 0, 0], size:[1, 1, 1], mat:matCube });

             var matRot = mat4.create();
             mat4.rotateX(matRot, mat4.create(), -Math.PI / 2);
             game.planeBottom = new PlaneShape({ pos:[0, -1.5, 0], size:[30, 30, 1], mat:matRot, texScale: [5, 5] });

             mat4.rotateY(matRot, mat4.create(), -Math.PI / 2);
             game.planeLeft = new PlaneShape({ pos:[5, 0, 0], size:[10, 10, 1], mat:matRot });

             mat4.rotateY(matRot, mat4.create(), Math.PI / 2);
             game.planeRight = new PlaneShape({ pos:[-5, 0, 0], size:[10, 10, 1], mat:matRot });

             mat4.rotateY(matRot, mat4.create(), Math.PI);
             game.planeBack = new PlaneShape({ pos:[0, 0, 5], size:[10, 10, 1], mat:matRot });

             game.sphere = new SphereShape({ pos:[-2, 0, 0], size:[1, 1, 1], mat:matCube,
             texScale : [5, 1],
             widthSegments : 30, heightSegments : 30,
             thetaStart: 0, thetaLength: Math.PI / 2}, 1.0);
             */

            game.camera = new Camera({pos : [0, 0, -10], target : [0, 0, 0]});

            game.cameraReflect = new Camera({pos : [0, 0, -10], target : [0, 0, 0]});
            game.cameraRefract = new Camera({pos : [0, 0, -10], target : [0, 0, 0]});

            game.cameraReflect.setClipPlane(new MathLib.Plane([0, 1, 0], 1.5));
            game.cameraRefract.setClipPlane(new MathLib.Plane([0, -1, 0], -1.5));


            game.skinShader = Shader.createSkinDiffuseShader();

            game.showModel = true;

            game.lastPos = {x : 0, y : 0};

            game.rtResult = { };

            game.actor = createActor(zealotFiles);
            game.npc = createActor(mimicFiles);

            game.npcs = [];


             for (var x = 0; x <= 0; x++)
             for (var y = 0; y <= 1; y++)
             {
                 var actor = new Npc();
                 actor.init(game.npc.model, game.npc.skel.clone(), { shader : game.skinShader });
                 actor.transform.pos = [x * 2, -1.5, y * 2];
                 actor.transform.updateMatrix();
                 actor.update(0);
                 game.npcs.push(actor);
             }

            //var clipPlane = new MathLib.Plane([0, 0, 1], 0);
            //game.camera.setClipPlane(clipPlane);

            var rt = RenderTarget.create(128, 128);
            game.rt = rt;

            game.shaderBlur = Shader.createTextureShader("blur", "_BLUR_RADIUS_=1");
            game.shaderBlur.unifOffset = game.shaderBlur.getUniform("offset");

            game.shaderWave = Shader.createTextureShader("wave");
            game.shaderWave.unifOffset = game.shaderWave.getUniform("offset");
            game.shaderWave.unifMap2 = game.shaderWave.getUniform("DiffuseMap2");

            game.shaderH2N = Shader.createTextureShader("height2normal");
            game.shaderH2N.unifOffset = game.shaderH2N.getUniform("offset");


            game.shaderMirror = Shader.createMirrorShader();
            game.mirror.setMaterial({shader : game.shaderMirror });
            game.mirror.items[0].camera = game.cameraReflect;
            game.mirror.items[0].mesh.texture = rt.texture;

            var normalmap = game.texture = new Texture();
            normalmap.load('res/images/normal-water.jpg');

            game.mirror.items[0].mesh.textureDetailNormal = normalmap;

            var waveSize = 128;
            game.rtHeight1 = RenderTarget.create(waveSize, waveSize);
            game.rtHeight1.clear(0.5, 0.5, 0.5, 1.0);
            game.rtHeight2 = RenderTarget.create(waveSize, waveSize);
            game.rtHeight2.clear(0.5, 0.5, 0.5, 1.0);
            game.rtHeight3 = RenderTarget.create(waveSize, waveSize);
            game.rtHeight3.clear(0.5, 0.5, 0.5, 1.0);


            game.rtNormal = RenderTarget.create(waveSize, waveSize);
            game.rtRefract = RenderTarget.create(256, 256);

            game.mirror.items[0].mesh.normalmap = game.rtNormal.texture;
            game.mirror.items[0].mesh.textureRefract = game.rtRefract.texture;

            game.ps = GameEffect.playeEffect("fire", game.actor.transform);

        }

        game.init = function()
        {
            CanvasEvent.bindCanvasEvent(canvas.dom, this);
            PhysicsMaterials.init();
            initGameObjects();

        };

        game.onMouseMove = function(pos, event)
        {
            //ball.left = pos.x;
            //ball.top = pos.y;
            if (Engine.paused)
                return;
            if (isNaN(pos.x) || isNaN(pos.y))
                return;
            if (game.isdown)
            {
                game.camera.rotateRelative(
                    (pos.x - game.lastPos.x) * 0.01,
                    -(pos.y - game.lastPos.y) * 0.01);
                game.lastPos = pos;
            }
        };

        game.onMouseDown = function(pos, event)
        {
//    var posTile = game.map.cursorToTilePos(pos.x, pos.y);
//    if (game.map.isValidTilePos(posTile.row, posTile.col))
//    {
//        game.map.tiles[posTile.row][posTile.col] = new Wall(posTile.col, posTile.row)
//    }
            if (isNaN(pos.x) || isNaN(pos.y))
                return;

            if (Engine.paused)
                return;

            game.isdown = true;
            game.lastPos = pos;
            game.downPos = pos;
        };

        game.onMouseUp = function(pos, event)
        {
            game.isdown = false;
            if (isNaN(pos.x) || isNaN(pos.y))
                return;

            if (event.button == 0)
            {
                game.rtResult.pos = null;
                if (game.staticModels)
                {
                    var result = { };

                    var rayDir = [0, 0, 0];
                    game.camera.invertDir(rayDir, pos.x, pos.y);

                    for (var i = 0; i < game.staticModels.length; i++)
                    {
                        var m = game.staticModels[i];
                        if (!m.canRayTrace)
                            continue;

                        if (m.rayTrace(game.camera.pos, rayDir, result))
                        {
                            result.maxt = result.t;
                            var hitPos = [0, 0, 0];
                            vec3.scale(hitPos, rayDir, result.t);
                            vec3.add(hitPos, game.camera.pos, hitPos);
                            game.rtResult.pos = vec3.clone(hitPos);
                            game.rtResult.normal = vec3.clone(result.normal);
                            game.actor.moveTo(hitPos);
                        }
                    }

                    m = game.mirror;

                    if (m.rayTrace(game.camera.pos, rayDir, result))
                    {
                        result.maxt = result.t;
                        var hitPos = [0, 0, 0];
                        vec3.scale(hitPos, rayDir, result.t);
                        vec3.add(hitPos, game.camera.pos, hitPos);
                        game.rtResult.pos = vec3.clone(hitPos);
                        game.rtResult.normal = vec3.clone(result.normal);
                        game.actor.moveTo(hitPos);
                        GameEffect.playeEffect("touch", {pos : hitPos});
                    }
                }
            }
            else if (event.button == 1)
            {
                game.actor.skel.playAnimationClip(1, "attack", { trans : 100, exclusive : true, autofadeout : 200 });
            }
        };

        game.onMouseWheel = function(pos, delta, event)
        {
            //ball.left = pos.x;
            //ball.top = pos.y;
            if (Engine.paused)
                return;
            game.camera.zoom(delta);
        };

        game.fire = function(startColor, startScale, endColor, endScale)
        {
            var psParam = {};
            var dir = [0, 0, 0];
            game.actor.transform.getDirUpRight(dir);
            psParam.pos = game.actor.transform.pos;
            psParam.dpos = [dir[0], 1.5, dir[2]];
            psParam.dir = dir;
            psParam.dist = 15;
            psParam.speed = 10;
            psParam.startColor = startColor;
            psParam.startScale = startScale;
            psParam.endColor = endColor;
            psParam.endScale = endScale;
            psParam.delayTime = 0.7;
            GameEffect.playeEffect("bullet", psParam);
            game.actor.skel.playAnimationClip(1, "attack", { trans : 100, exclusive : true, autofadeout : 200 });
        };

        game.handleKeyInput = function()
        {
            if (Keyboard.isKeyJustPressed("Q"))
            {
                game.actor.attack();
            }

            if (Keyboard.isKeyJustPressed("P"))
            {
                var rt2 = game.rtHeight2;
                var buf = rt2.readPixels();
                AjaxFile.sendBinaryToServer("/saveimage?width=" + rt2.width
                    + "&height=" + rt2.height + "&filename=a.png", buf);
            }
            var moved = false;

            if (game.controlType == 0) // control camera
            {
                var offset = [0, 0, 0];
                var deltaMove = Engine.deltaTime * 0.01;
                if (Keyboard.isKeyPressed("W"))
                {
                    vec3.scale(offset, game.camera.dir, deltaMove);
                    moved = true;
                }
                if (Keyboard.isKeyPressed("S"))
                {
                    vec3.scale(offset, game.camera.dir, -deltaMove);
                    moved = true;
                }
                if (Keyboard.isKeyPressed("A"))
                {
                    vec3.scale(offset, game.camera.right, deltaMove);
                    moved = true;
                }
                if (Keyboard.isKeyPressed("D"))
                {
                    vec3.scale(offset, game.camera.right, -deltaMove);
                    moved = true;
                }
                if (moved)
                    game.camera.move(offset);
            }
            else
            {
                var actorDir = [0, 0, 0];
                var sumX = 0;
                var sumZ = 0;

                if (Keyboard.isKeyPressed("W"))
                {
                    vec3.scale(actorDir, game.camera.dir, 1);
                    vec3.normalize(actorDir, actorDir);
                    sumX += actorDir[0];
                    sumZ += actorDir[2];
                    moved = true;
                }
                if (Keyboard.isKeyPressed("S"))
                {
                    vec3.scale(actorDir, game.camera.dir, -1);
                    vec3.normalize(actorDir, actorDir);
                    sumX += actorDir[0];
                    sumZ += actorDir[2];
                    moved = true;
                }
                if (Keyboard.isKeyPressed("A"))
                {
                    vec3.scale(actorDir, game.camera.right, 1);
                    vec3.normalize(actorDir, actorDir);
                    sumX += actorDir[0];
                    sumZ += actorDir[2];
                    moved = true;
                }
                if (Keyboard.isKeyPressed("D"))
                {
                    vec3.scale(actorDir, game.camera.right, -1);
                    vec3.normalize(actorDir, actorDir);
                    sumX += actorDir[0];
                    sumZ += actorDir[2];
                    moved = true;
                }

                var len = (sumX * sumX + sumZ * sumZ);
                if (len > 1e-6)
                {
                    var angle = Math.atan2(sumX, sumZ);
                    game.actor.faceTo(angle);
                    game.actor.walk();
                }
                else
                {
                    game.actor.stand();
                }
            }
        };

        var dt = 0;
        var first = true;
        game.renderHeightMap = function()
        {
            gl.depthMask(false);
            gl.disable(gl.CULL_FACE);
            gl.disable(gl.DEPTH_TEST);

            dt += engine.deltaTime;
            gl.disable(gl.BLEND);

            if (dt > 30)
            {
                dt -= 30;
                var rt1 = game.rtHeight1;
                var rt2 = game.rtHeight2;
                var rt3 = game.rtHeight3;
                var rtNormal = game.rtNormal;

                rt3.bind();
                SimpleDraw.drawTexture(rt2.texture, 0, 0, rt3.width, rt3.height);
                rt3.unbind();

                rt2.bind();
                game.shaderWave.appear();
                gl.uniform2f(game.shaderWave.unifOffset, 0.3 / rt1.width, 0.3 / rt1.height);
                gl.uniform1i(game.shaderWave.unifMap2, 1);
                rt3.texture.appear(1);
                SimpleDraw.drawTextureWithShader(rt1.texture, 0, 0, rt2.width, rt2.height, game.shaderWave);

                if (first && game.textureSpot.loaded)
                {
                    var x = (game.actor.transform.pos[0] + 15) / 30 * rt2.width;
                    var y = (-game.actor.transform.pos[2] + 15) / 30 * rt2.height;
                    gl.enable(gl.BLEND);
                    SimpleDraw.drawTexture(game.textureSpot, x - 2, y - 2, 4, 4, [0.0, 0.0, 0.0, 1], [0, 0, 0, 0]);

                    for (var i = 0; i < game.balls.length; i++)
                    {
                        x = (game.balls[i].transform.pos[0] + 15) / 30 * rt2.width;
                        y = (-game.balls[i].transform.pos[2] + 15) / 30 * rt2.height;

                        SimpleDraw.drawTexture(game.textureSpot, x - 4, y - 4, 8, 8, [0.0, 0.0, 0.0, 1], [0, 0, 0, 0]);
                    }
                    gl.disable(gl.BLEND);
                    //first = false;
                }

                rt2.unbind();


                game.rtHeight1 = rt2;
                game.rtHeight2 = rt1;

                rtNormal.bind();
                game.shaderH2N.appear();
                gl.uniform2f(game.shaderH2N.unifOffset, 1 / rt2.width, 1 / rt2.height);

                SimpleDraw.drawTextureWithShader(rt2.texture, 0, 0, rtNormal.width, rtNormal.height, game.shaderH2N);
                rtNormal.unbind();

            }
        };

        game.render = function()
        {
            if (game.profile.UpdateEngine)
            {
                engine.beginStat("UpdateEngine");
                engine.update(engine.deltaTime);
                engine.endStat("UpdateEngine");
            }
            var plane = game.cameraReflect.clipPlane;

            plane.mirrorPoint(game.cameraReflect.pos, game.camera.pos);
            plane.mirrorVector(game.cameraReflect.dir, game.camera.dir);
            plane.mirrorVector(game.cameraReflect.up, game.camera.up);
            vec3.copy(game.cameraReflect.target, game.camera.target);

            vec3.copy(game.cameraRefract.pos, game.camera.pos);
            vec3.copy(game.cameraRefract.dir, game.camera.dir);
            vec3.copy(game.cameraRefract.up, game.camera.up);
            vec3.copy(game.cameraRefract.target, game.camera.target);

            game.cameraReflect.updateView();
            game.cameraRefract.updateView();

            game.handleKeyInput();

            if (game.profile.UpdateActor)
            {
                engine.beginStat("UpdateActor");
                game.actor.update(Engine.deltaTime);

                for (var i = 0; i < game.npcs.length; i++)
                {
                    game.npcs[i].update(Engine.deltaTime);
                    if (!game.npcs[i].targetPos)
                    {
                        game.npcs[i].moveTo(
                            [Math.random() * 30 - 15,
                                -1.5,
                                Math.random() * 30 - 15]
                        );
                    }
                }
                engine.endStat("UpdateActor");
            }

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            if (game.profile.RenderNormal)
            {
                engine.beginStat("RenderNormal");
                game.renderHeightMap();
                engine.endStat("RenderNormal");
            }

            gl.depthMask(true);


            gl.clearColor(0.3, 0.5, 1.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.frontFace(gl.CCW);
            gl.cullFace(gl.BACK);
            gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
            gl.depthMask(true);
            gl.depthFunc(gl.LESS);
            gl.depthRange(0, 1);

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            Engine.beforeRender();
            Engine.activeCamera = game.camera;


            if (game.profile.RenderWall)
            {
                engine.beginStat("RenderWall");

                for (var i = 0; i < game.staticModels.length; i++)
                {
                    game.staticModels[i].update();
                    game.staticModels[i].draw();
                }

                engine.endStat("RenderWall");
            }

            if (game.profile.RenderActor)
            {
                engine.beginStat("RenderActor");

                game.actor.draw();

                for (var i = 0; i < game.npcs.length; i++)
                {
                    game.npcs[i].draw();
                }
                engine.endStat("RenderActor");
            }

            if (game.profile.RenderReflect)
            {
                engine.beginStat("RenderReflect");

                Engine.activeCamera = game.cameraReflect;

                game.rt.bind();
                gl.clearColor(0.1, 0.3, 0.7, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                Engine.renderList();

                game.rt.unbind();

                //Engine.activeCamera = game.cameraRefract;

                //game.rtRefract.bind();
                //gl.clearColor(0.0, 0.0, 0.0, 1.0);
                //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                //Engine.renderList();

                //game.rtRefract.unbind();

                Engine.activeCamera = game.camera;
                game.mirror.draw();
                engine.endStat("RenderReflect");
            }
            Engine.renderList();


            if (game.profile.RenderParticle)
            {
                engine.beginStat("RenderParticle");
                Engine.renderParticles();
                engine.endStat("RenderParticle");
            }

            gl.disable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
            gl.depthMask(true);

            if (game.profile.RenderDebug)
            {
                engine.beginStat("RenderDebug");
                gl.depthMask(false);
                SimpleDraw.beginDraw();
                SimpleDraw.setColor(255, 0, 0, 255);
                SimpleDraw.addLine(0, 0, 0, 10, 0, 0);
                SimpleDraw.setColor(0, 255, 0, 255);
                SimpleDraw.addLine(0, 0, 0, 0, 10, 0);
                SimpleDraw.setColor(0, 0, 255, 255);
                SimpleDraw.addLine(0, 0, 0, 0, 0, 10);
                SimpleDraw.flush();

                SimpleDraw.setColor(0, 0, 255, 128);

                //game.actor.skel.drawBones();

                var a = new AABB();

                if (game.rtResult.pos)
                {
                    SimpleDraw.setColor(255, 255, 255, 255);
                    SimpleDraw.addLine(game.rtResult.pos[0], game.rtResult.pos[1], game.rtResult.pos[2],
                        game.rtResult.pos[0] + game.rtResult.normal[0],
                        game.rtResult.pos[1] + game.rtResult.normal[1],
                        game.rtResult.pos[2] + game.rtResult.normal[2]
                    );
                    vec3.add(a.mins, game.rtResult.pos, [-0.01, -0.01, -0.01]);
                    vec3.add(a.maxs, game.rtResult.pos, [0.01, 0.01, 0.01]);
                    SimpleDraw.setColor(255, 0, 0, 255);
                    SimpleDraw.addAABB(a);
                }


                SimpleDraw.endDraw();

                gl.disable(gl.DEPTH_TEST);

                game.shaderBlur.appear();
                gl.uniform2f(game.shaderBlur.unifOffset, 1 / 256, 0);
                //SimpleDraw.drawTextureWithShader(game.rtRefract.texture, 150, 50, 100, 100, game.shaderBlur);

                SimpleDraw.drawTexture(game.rtHeight1.texture, 0, 0, 64, 64, [1, 1, 1, 1], [0, 0, 0, 1]);
                SimpleDraw.drawTexture(game.rtHeight2.texture, 70, 0, 64, 64);
                SimpleDraw.drawTexture(game.rtNormal.texture, 140, 0, 64, 64);
                engine.endStat("RenderDebug");

            }

            gl.useProgram(null);

           //console.log(engine.statistics);
        };

        initialize();
        return game;
    }
);