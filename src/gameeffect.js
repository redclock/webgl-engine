/**
 * Crearted by ych
 * Date: 13-7-27
 * Time: 上午9:50
 */
define(
    ["engine/renderres/texture", "engine/particle/particlesystem"],
    function(Texture, ParticleSystem)
    {
        "use strict";

        var cache = {};

        var cachePs = function(ps)
        {
            if (!cache[ps.name])
            {
                cache[ps.name] = [ps];
            }
            else
            {
                cache[ps.name].push(ps);
            }
        };

        var Effects =
        {

        };

        Effects.playeEffect = function(name, param)
        {
            var cached = (cache[name]);
            var ps;
            if (cached && cached.length > 0)
            {
                ps = cached.pop();
            }
            else
            {
                var control = createControl(name);
                if (!control)
                    return null;
                ps = new ParticleSystem(control);
                ps.name = name;
            }
            ps.control.param = param;
            ps.start();
            return ps;
        };

        var createControl = function(name)
        {
            switch (name)
            {
            case "fire":
                return function()
                {
                    var emitTime = 0;

                    return {
                        texture : "p2.png",
                        maxPoint : 10,
                        writeZ : false,
                        testZ : true,
                        blendType : "add",
                        start : function(ps)
                        {
                            emitTime = 0;
                        },

                        update : function()
                        {
                            return function(ps, deltaTime)
                            {
                                emitTime += deltaTime;
                                var p;
                                while (emitTime > 0.05)
                                {
                                    emitTime -= 0.05;

                                    p = ps.allocParticle();
                                    if (p)
                                    {
                                        var life = Math.random() * 0.5 + 0.5;

                                        vec3.randomOnCircleXZ(p.pos, [0, 0.3, 0], 0.5);
                                        p.dpos = [p.pos[0], 3, p.pos[2]];
                                        vec3.add(p.pos, p.pos, this.param.pos);
                                        p.setColorGrad([100, 255, 100, 255], [255, 0, 0, 0], life);
                                        p.setScaleGrad(0.5, 1.0, life);
                                        //p.scale = 0.1;
                                        p.life = life;
                                    }
                                }

                                for (var i = 0, count = ps.activeList.length; i < count; i++)
                                {
                                    p = ps.activeList[i];
                                    p.update(deltaTime);
                                    //p.dpos[1] -= deltaTime * 10;
                                    if (p.life < 0)
                                        ps.freeParticle(p);
                                }
                            };
                        }()
                    };
                }();
            case "bullet":
                return function()
                {
                    var t = 0;
                    var emitTime = 0;
                    var dt = 0;
                    var delayTime = 0;
                    var started = false;
                    var startPos = [0, 0, 0];
                    var endPos = [0, 0, 0];
                    return {
                        texture : "p3.png",
                        maxPoint : 10,
                        writeZ : false,
                        testZ : true,
                        blendType : "add",
                        start : function(ps)
                        {

                            t = 0;
                            var d = this.param.dist;
                            if (d > 0)
                                dt =  this.param.speed / d;
                            else
                                dt = 1;
                            emitTime = 0;
                            started = false;
                            delayTime = this.param.delayTime || 0;
                        },

                        update : function(ps, deltaTime)
                        {
                            if (!started)
                            {
                                delayTime -= deltaTime;
                                if (delayTime > 0)
                                    return;
                                started = true;
                                vec3.add(startPos, this.param.pos, this.param.dpos);
                                vec3.scaleAndAdd(endPos, startPos, this.param.dir, this.param.dist);

                            }
                            emitTime += deltaTime;
                            var p;
                            while (t <= 1 && emitTime > 0.01)
                            {
                                emitTime -= 0.01;
                                t += dt * 0.01;
                                p = ps.allocParticle();
                                if (p)
                                {
                                    var life = 0.4;
                                    p.dpos = [0, 0, 0];
                                    vec3.lerp(p.pos, startPos, endPos, t);
                                    p.setColorGrad(this.param.startColor, this.param.endColor, life);
                                    p.setScaleGrad(this.param.startScale, this.param.endScale, life);
                                    p.life = life;
                                }
                            }

                            for (var i = 0, count = ps.activeList.length; i < count; i++)
                            {
                                p = ps.activeList[i];
                                p.update(deltaTime);
                                //p.dpos[1] -= deltaTime * 10;
                                if (p.life < 0)
                                    ps.freeParticle(p);
                            }

                            if (t > 1 && ps.activeList.length == 0)
                            {
                                ps.stop();
                                cachePs(ps);
                            }
                        }
                    };
                }();
            case "touch":
                return function()
                {
                    var t = 0;

                    return {
                        texture : "p3.png",
                        maxPoint : 10,
                        writeZ : false,
                        testZ : true,
                        blendType : "add",
                        start : function(ps)
                        {
                            var color1 = [Math.random() * 255, Math.random() * 255, Math.random() * 255, 255];
                            var color2 = [Math.random() * 255, Math.random() * 255, Math.random() * 255, 0];
                            for (var i = 0; i < this.maxPoint; i++)
                            {
                                var p = ps.allocParticle();

                                if (p)
                                {
                                    var life = 1.0;
                                    var angle = Math.PI * 2 * i / this.maxPoint;
                                    p.pos[0] = Math.cos(angle) * 0.3;
                                    p.pos[1] = 0.1;
                                    p.pos[2] = Math.sin(angle) * 0.3;
                                    p.dpos = [-p.pos[0], 0.1, -p.pos[2]];
                                    vec3.add(p.pos, p.pos, this.param.pos);
                                    p.setColorGrad(color1, color2, life);
                                    p.setScaleGrad(0.1, 0.3, life);
                                    //p.scale = 0.1;
                                    p.life = life;
                                }
                            }
                        },

                        update : function()
                        {
                            return function(ps, deltaTime)
                            {
                                for (var i = 0, count = ps.activeList.length; i < count; i++)
                                {
                                    var p = ps.activeList[i];
                                    p.update(deltaTime);
                                    //p.dpos[1] -= deltaTime * 10;
                                    if (p.life < 0)
                                    {
                                        ps.freeParticle(p);
                                        ps.stop();
                                        cachePs(ps);
                                        break;
                                    }
                                }
                            };
                        }()
                    };
                }();
            default:
                return null;
            }
        };


        return Effects;
    }
);