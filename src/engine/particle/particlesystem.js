/**
 * Crearted by ych
 * Date: 13-7-26
 * Time: 上午9:34
 */
define(
    ["../common/config", "./particle", "./particlerender", "../renderres/texture"],
    function(config, Particle, ParticleRender, Texture)
    {
        "use strict";

        var defaultControl =
        {
            maxPoint : 10,

            writeZ : false,

            testZ : true,

            blendType : "add",

            start : function(ps)
            {
            },

            update : function()
            {
                var emitTime = 0;
                return function(ps, deltaTime)
                {
                    emitTime += deltaTime;
                    var p;
                    while (emitTime > 100)
                    {
                        emitTime -= emitTime;

                        p = ps.allocParticle();
                        if (p)
                        {
                            var life = Math.random() * 1000 + 500;
                            vec3.randomInBox(p.pos, [-0.5, -0.5, -0.5], [0.5, 0.5, 0.5]);
                            vec3.randomOnCircleXZ(p.dpos, [0, 0.001, 0], Math.random() * 0.003);
                            p.setColorGrad([255, 255, 0, 255], [0, 0, 255, 255], life);
                            p.scale = 0.1;
                            p.life = life;
                        }
                    }

                    for (var i = 0, count = ps.activeList.length; i < count; i++)
                    {
                        p = ps.activeList[i];
                        p.update(deltaTime);

                        if (p.life < 0)
                            ps.freeParticle(p);
                    }
                };
            }()
        };

        var ParticleSystem = function(control)
        {
            this.control = control = control || defaultControl;
            var maxPoint = control.maxPoint;
            this.texture = Texture.Manager.white;

            if (control.texture)
            {
                this.texture = Texture.Manager.loadTexture(config.texturePath + control.texture);
            }
            this.testZ = control.testZ;
            switch (control.blendType)
            {
                case "alpha" :
                    this.srcBlend = gl.SRC_ALPHA;
                    this.dstBlend = gl.ONE_MINUS_SRC_ALPHA;
                    break;
                case "add" :
                    this.srcBlend = gl.SRC_ALPHA;
                    this.dstBlend = gl.ONE;
                    break;
                default :
                    this.srcBlend = gl.ONE;
                    this.dstBlend = gl.ZERO;
                    break;
            }


            this.materialTag = (control.texture + "#" +
                (control.writeZ ? "W" : "w") +
                (control.testZ ? "T" : "t") +
                (control.blendType));


            this.freeList = new Array(maxPoint);
            this.activeList = new Array(maxPoint);
            this.activeList.length = 0;
            for (var i = 0; i < maxPoint; i++)
            {
                this.freeList[i] = new Particle(this);
            }

            this.time = 0;
            this.started = false;
        };

        ParticleSystem.prototype.allocParticle = function()
        {
            var p;
            if (this.freeList.length == 0)
            {
                p = new Particle();
            }
            else
            {
                p = this.freeList.pop();
            }
            p.active = true;
            this.activeList.push(p);
            return p;
        };

        ParticleSystem.prototype.freeParticle = function(p)
        {
            p.active = false;
            this.freeList.push(p);
            this.freeNum++;
        };

        ParticleSystem.prototype.reset = function()
        {
            this.time = 0;
            for (var i = 0, count = this.activeList.length; i < count; i++)
            {
                var p = this.activeList[i];
                p.active = false;
                this.freeList.push(p);
            }
            this.activeList.length = 0;
            if (this.control.start)
                this.control.start(this);
        };

        ParticleSystem.prototype.update = function(deltaTime)
        {
            this.freeNum = 0;
            if (this.control.update)
            {
                this.control.update(this, deltaTime);
            }

            if (this.freeNum > 0)
            {
                for (var i = 0, count = this.activeList.length; i < count; i++)
                {
                    var p = this.activeList[i];
                    if (!p.active)
                    {
                        this.activeList.splice(i, 1);
                        i--;
                        count--;
                    }
                }
            }

            this.time += deltaTime;
        };

        ParticleSystem.prototype.start = function()
        {
            if (!this.started)
            {
                this.reset();
                ParticleRender.add(this);
                this.started = true;
            }
        };

        ParticleSystem.prototype.stop = function()
        {
            if (this.started)
            {
                ParticleRender.remove(this);
                this.started = false;
            }
        };

        return ParticleSystem;
    }
);    