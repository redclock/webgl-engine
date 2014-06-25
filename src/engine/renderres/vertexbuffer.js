/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 上午9:48
 */

define(
    ["./resman"],
    function(ResManager)
    {
        "use strict";
        var VertexBuffer = function()
        {
            this.buffer = gl.createBuffer();
            this.stride = 0;
            this.usage = gl.STATIC_DRAW;
            this.desc = [];
            ResManager.newResource(this);
        };

        VertexBuffer.prototype.setData = function(dataBuffer)
        {
            this.data = dataBuffer;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, dataBuffer, this.usage);
        };

        VertexBuffer.prototype.setSubData = function(dataBuffer, off)
        {
            this.data = dataBuffer;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, off, dataBuffer);
        };

        VertexBuffer.prototype.onlost = function()
        {
            this.buffer = 0;
        };

        VertexBuffer.prototype.onrestore = function()
        {
            this.buffer = gl.createBuffer();
            if (this.data)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
                gl.bufferData(gl.ARRAY_BUFFER, this.data, this.usage);
            }
        };

        VertexBuffer.prototype.bindAttribute = function(attIndexList)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

            for (var i = 0; i < this.desc.length; i++)
            {
                if (attIndexList[i] >= 0)
                {
                    gl.enableVertexAttribArray(attIndexList[i]);
                    gl.vertexAttribPointer(attIndexList[i], this.desc[i].comps, this.desc[i].comptype,
                        this.desc[i].norm == true, this.stride, this.desc[i].offsetByte);
                }
                else
                {
                    //gl.disableVertexAttribArray(attIndexList[i]);
                }
            }
        };

        VertexBuffer.prototype.release = function()
        {
            gl.deleteBuffer(this.buffer);
            ResManager.freeResource(this);
        };

// Create typed vertex buffers
        VertexBuffer.createVec2VB = function()
        {
            var vb = new VertexBuffer();
            vb.desc[0] =
            {
                comps : 2,
                comptype : gl.FLOAT,
                norm : false,
                offsetByte : 0
            };

            vb.stride = 2 * Float32Array.BYTES_PER_ELEMENT;
            return vb;
        };

        VertexBuffer.createVec3VB = function()
        {
            var vb = new VertexBuffer();
            vb.desc[0] =
            {
                comps : 3,
                comptype : gl.FLOAT,
                norm : false,
                offsetByte : 0
            };
            vb.stride = 3 * Float32Array.BYTES_PER_ELEMENT;
            return vb;
        };

        VertexBuffer.createVec4VB = function()
        {
            var vb = new VertexBuffer();
            vb.desc[0] =
            {
                comps : 4,
                comptype : gl.FLOAT,
                norm : false,
                offsetByte : 0
            };
            vb.stride = 4 * Float32Array.BYTES_PER_ELEMENT;
            return vb;
        };

        VertexBuffer.createColorVB = function()
        {
            var vb = new VertexBuffer();
            vb.desc[0] =
            {
                comps : 4,
                comptype : gl.UNSIGNED_BYTE,
                norm : true,
                offsetByte : 0
            };
            vb.stride = 4 * Uint8Array.BYTES_PER_ELEMENT;
            return vb;
        };

// Create typed vertex buffers
        VertexBuffer.createByte2VB = function()
        {
            var vb = new VertexBuffer();
            vb.desc[0] =
            {
                comps : 2,
                comptype : gl.UNSIGNED_BYTE,
                norm : false,
                offsetByte : 0
            };

            vb.stride = 2 * Uint8Array.BYTES_PER_ELEMENT;
            return vb;
        };

        VertexBuffer.createByte3VB = function()
        {
            var vb = new VertexBuffer();
            vb.desc[0] =
            {
                comps : 3,
                comptype : gl.UNSIGNED_BYTE,
                norm : false,
                offsetByte : 0
            };
            vb.stride = 3 * Uint8Array.BYTES_PER_ELEMENT;
            return vb;
        };

        VertexBuffer.createByte4VB = function()
        {
            var vb = new VertexBuffer();
            vb.desc[0] =
            {
                comps : 4,
                comptype : gl.UNSIGNED_BYTE,
                norm : false,
                offsetByte : 0
            };
            vb.stride = 4 * Uint8Array.BYTES_PER_ELEMENT;
            return vb;
        };


        VertexBuffer.createPosColorVB = function()
        {
            var vb = new VertexBuffer();
            vb.stride = 0;
            vb.desc[0] =
            {
                comps : 3,
                comptype : gl.FLOAT,
                norm : false,
                offsetByte : 0
            };
            vb.stride += 3 * Float32Array.BYTES_PER_ELEMENT;

            vb.desc[1] =
            {
                comps : 4,
                comptype : gl.UNSIGNED_BYTE,
                norm : true,
                offsetByte : vb.stride
            };
            vb.stride += 4 * Uint8Array.BYTES_PER_ELEMENT;

            return vb;
        };

        VertexBuffer.createPosTexVB = function()
        {
            var vb = new VertexBuffer();
            vb.stride = 0;
            vb.desc[0] =
            {
                comps : 3,
                comptype : gl.FLOAT,
                norm : false,
                offsetByte : 0
            };
            vb.stride += 3 * Float32Array.BYTES_PER_ELEMENT;

            vb.desc[1] =
            {
                comps : 2,
                comptype : gl.FLOAT,
                norm : false,
                offsetByte : vb.stride
            };
            vb.stride += 2 * Float32Array.BYTES_PER_ELEMENT;

            return vb;
        };

        VertexBuffer.createPosNormTexVB = function()
        {
            var vb = new VertexBuffer();
            vb.stride = 0;
            vb.desc[0] =
            {
                comps : 3,
                comptype : gl.FLOAT,
                norm : false,
                offsetByte : 0
            };
            vb.stride += 3 * Float32Array.BYTES_PER_ELEMENT;

            vb.desc[1] =
            {
                comps : 3,
                comptype : gl.FLOAT,
                norm : false,
                offsetByte : vb.stride
            };
            vb.stride += 3 * Float32Array.BYTES_PER_ELEMENT;

            vb.desc[2] =
            {
                comps : 2,
                comptype : gl.FLOAT,
                norm : false,
                offsetByte : vb.stride
            };
            vb.stride += 2 * Float32Array.BYTES_PER_ELEMENT;

            return vb;
        };

        VertexBuffer.createBlendWeightIndexVB = function()
        {
            var vb = new VertexBuffer();
            vb.stride = 0;
            vb.desc[0] =
            {
                comps : 3,
                comptype : gl.FLOAT,
                norm : false,
                offsetByte : 0
            };
            vb.stride += 3 * Float32Array.BYTES_PER_ELEMENT;

            vb.desc[1] =
            {
                comps : 4,
                comptype : gl.UNSIGNED_BYTE,
                norm : false,
                offsetByte : vb.stride
            };
            vb.stride += 4 * Uint8Array.BYTES_PER_ELEMENT;

            return vb;
        };

        return VertexBuffer;

    }
);