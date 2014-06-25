/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 上午9:45
 */
define(
    ["./resman"],
    function(ResManager)
    {
        "use strict";

        var IndexBuffer = function()
        {
            this.buffer = gl.createBuffer();
            ResManager.newResource(this);
        };

        IndexBuffer.prototype.setData = function(dataBuffer)
        {
            this.data = new Uint16Array(dataBuffer);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
        };

        IndexBuffer.prototype.onlost = function()
        {
            this.buffer = 0;
        };

        IndexBuffer.prototype.onrestore = function()
        {
            this.buffer = gl.createBuffer();
            if (this.data)
            {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
            }
        };

        IndexBuffer.prototype.appear = function()
        {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        };

        IndexBuffer.prototype.release = function()
        {
            gl.deleteBuffer(this.buffer);
            ResManager.freeResource(this);
        };

        return IndexBuffer;
    }
);