/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 上午10:01
 */

define(
    function()
    {
        "use strict";

        var Particle = function()
        {
            this.pos = [0, 0, 0];
            this.color = [0, 0, 0, 0];
            this.scale = 1;
            this.active = false;
            this.life = 0;

            this.dpos = [0, 0, 0];
            this.dcolor = [0, 0, 0, 0];
            this.dscale = 0;
        };


        Particle.prototype.setPosGrad = function(posStart, posEnd, duration)
        {
            this.pos[0] = posStart[0];
            this.pos[1] = posStart[1];
            this.pos[2] = posStart[2];

            var d = 1 / duration;
            this.dpos[0] = (posEnd[0] - posStart[0]) * d;
            this.dpos[1] = (posEnd[1] - posStart[1]) * d;
            this.dpos[2] = (posEnd[2] - posStart[2]) * d;
        };

        Particle.prototype.setPos = function(pos)
        {
            this.pos[0] = pos[0];
            this.pos[1] = pos[1];
            this.pos[2] = pos[2];
        };


        Particle.prototype.setColorGrad = function(colorStart, colorEnd, duration)
        {
            this.color[0] = colorStart[0];
            this.color[1] = colorStart[1];
            this.color[2] = colorStart[2];
            this.color[3] = colorStart[3];

            var d = 1 / duration;
            this.dcolor[0] = (colorEnd[0] - colorStart[0]) * d;
            this.dcolor[1] = (colorEnd[1] - colorStart[1]) * d;
            this.dcolor[2] = (colorEnd[2] - colorStart[2]) * d;
            this.dcolor[3] = (colorEnd[3] - colorStart[3]) * d;
        };

        Particle.prototype.setColor = function(color)
        {
            this.color[0] = color[0];
            this.color[1] = color[1];
            this.color[2] = color[2];
            this.color[3] = color[3];
        };


        Particle.prototype.setScaleGrad = function(scaleStart, scaleEnd, duration)
        {
            this.scale = scaleStart;
            this.dscale = (scaleEnd - scaleStart) / duration;
        };

        Particle.prototype.updatePos = function(deltaTime)
        {
            this.pos[0] += this.dpos[0] * deltaTime;
            this.pos[1] += this.dpos[1] * deltaTime;
            this.pos[2] += this.dpos[2] * deltaTime;
        };

        Particle.prototype.updateColor = function(deltaTime)
        {
            this.color[0] += this.dcolor[0] * deltaTime;
            this.color[1] += this.dcolor[1] * deltaTime;
            this.color[2] += this.dcolor[2] * deltaTime;
            this.color[3] += this.dcolor[3] * deltaTime;
        };

        Particle.prototype.updateScale = function(deltaTime)
        {
            this.scale += this.dscale * deltaTime;
        };

        Particle.prototype.update = function(deltaTime)
        {
            this.pos[0] += this.dpos[0] * deltaTime;
            this.pos[1] += this.dpos[1] * deltaTime;
            this.pos[2] += this.dpos[2] * deltaTime;
            this.color[0] += this.dcolor[0] * deltaTime;
            this.color[1] += this.dcolor[1] * deltaTime;
            this.color[2] += this.dcolor[2] * deltaTime;
            this.color[3] += this.dcolor[3] * deltaTime;
            this.scale += this.dscale * deltaTime;
            this.life -= deltaTime;
        };

        return Particle;
    }
);
