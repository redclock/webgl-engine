/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 上午10:01
 */

define(
    function()
    {
        "use strict";

        var DynamicVB = function(vertexBuffer, vertMax)
        {
            this.vb = vertexBuffer;
            this.vb.usage = gl.DYNAMIC_DRAW;
            this.vertCount = 0;
            this.vertMax = vertMax;
            this.buf = new ArrayBuffer(this.vb.stride * vertMax);
            this.vb.setData(this.buf);
            this.curOffset = -this.vb.stride;
        };

        DynamicVB.prototype.begin = function(callbackFlush)
        {
            this.vertCount = 0;
            this.curOffset = -this.vb.stride;
            this.callbackFlush = callbackFlush;
        };

        DynamicVB.prototype.flush = function()
        {
            if (this.vertCount <= 0)
                return;

            this.vb.setSubData(this.buf, 0);
            if (this.callbackFlush)
            {
                this.callbackFlush(this);
            }
            this.vertCount = 0;
            this.curOffset = -this.vb.stride;
        };

        DynamicVB.prototype.addVertex = function()
        {
            if (this.vertCount >= this.vertMax)
            {
                this.flush();
            }
            this.vertCount++;
            this.curOffset += this.vb.stride;
        };

        return DynamicVB;
    }
);