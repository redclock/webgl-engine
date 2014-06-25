define(

    function()
    {
        "use strict";

        var BinaryStream = function(initLength)
        {
            this.maxLength = initLength || 1024;
            this.pos = 0;
            this.len = 0;
            createBuffers(this);
        };

        var createBuffers = function(stream)
        {
            stream.buf = new ArrayBuffer(stream.maxLength);
            stream.bytes = new Uint8Array(stream.buf);
            stream.dataView = new DataView(stream.buf);
        };

        BinaryStream.prototype.clear = function()
        {
            this.pos = 0;
            this.len = 0;
        };

        BinaryStream.prototype.increase = function(newLength)
        {
            if (newLength > this.len)
                this.len = newLength;

            if (this.maxLength >= newLength)
                return;

            this.maxLength = this.maxLength * 2;
            var bytes = this.bytes;
            createBuffers(this);
            for (var i = 0; i < this.maxLength / 2; i++)
            {
                this.bytes[i] = bytes[i];
            }
        };

        BinaryStream.prototype.writeByte = function(x)
        {
            this.increase(this.pos + 1);
            this.dataView.setUint8(this.pos++, x);
        };

        BinaryStream.prototype.writeShort = function(x)
        {
            this.increase(this.pos + 2);
            this.dataView.setUint16(this.pos, x);
            this.pos += 2;
        };

        BinaryStream.prototype.writeInt = function(x)
        {
            this.increase(this.pos + 4);
            this.dataView.setUint32(this.pos, x);
            this.pos += 4;
        };

        BinaryStream.prototype.writeFloat = function(x)
        {
            this.increase(this.pos + 4);
            this.dataView.setFloat32(this.pos, x);
            this.pos += 4;
        };

        BinaryStream.prototype.writeByteArray = function(arr, len)
        {
            len = len == undefined ? arr.length : len;
            this.increase(this.pos + len);

            for (var i = 0; i < len; i++)
            {
                this.dataView.setUint8(this.pos++, arr[i]);
            }
        };

        BinaryStream.prototype.writeShortArray = function(arr, len)
        {
            len = len == undefined ? arr.length : len;
            this.increase(this.pos + 2 * len);

            for (var i = 0; i < len; i++)
            {
                this.dataView.setUint16(this.pos, arr[i]);
                this.pos += 2;
            }
        };

        BinaryStream.prototype.writeIntArray = function(arr, len)
        {
            len = len == undefined ? arr.length : len;
            this.increase(this.pos + 4 * len);

            for (var i = 0; i < len; i++)
            {
                this.dataView.setUint32(this.pos, arr[i]);
                this.pos += 4;
            }
        };

        BinaryStream.prototype.writeFloatArray = function(arr, len)
        {
            len = len == undefined ? arr.length : len;
            this.increase(this.pos + 4 * len);

            for (var i = 0; i < len; i++)
            {
                this.dataView.setFloat32(this.pos, arr[i]);
                this.pos += 4;
            }
        };

        BinaryStream.prototype.readByte = function()
        {
            var x = this.dataView.getUint8(this.pos);
            this.pos += 1;
            return x;
        };

        BinaryStream.prototype.readShort = function()
        {
            var x = this.dataView.getUint16(this.pos);
            this.pos += 2;
            return x;
        };

        BinaryStream.prototype.readInt = function()
        {
            var x = this.dataView.getUint32(this.pos);
            this.pos += 4;
            return x;
        };

        BinaryStream.prototype.readFloat = function()
        {
            var x = this.dataView.getFloat32(this.pos);
            this.pos += 4;
            return x;
        };

        BinaryStream.prototype.readByteArray = function(arr, len)
        {
            len = len == undefined ? arr.length : len;

            for (var i = 0; i < len; i++)
            {
                arr[i] = this.dataView.getUint8(this.pos++);
            }
        };

        BinaryStream.prototype.readShortArray = function(arr, len)
        {
            len = len == undefined ? arr.length : len;

            for (var i = 0; i < len; i++)
            {
                arr[i] = this.dataView.getUint16(this.pos);
                this.pos += 2;
            }
        };

        BinaryStream.prototype.readIntArray = function(arr, len)
        {
            len = len == undefined ? arr.length : len;

            for (var i = 0; i < len; i++)
            {
                arr[i] = this.dataView.getUint32(this.pos);
                this.pos += 4;
            }
        };


        /**
         *
         * @param {BinaryChunk} chunk
         */
        BinaryStream.prototype.writeChunk = function(chunk)
        {
            this.writeInt(0xCCCCAAAA);
            this.writeInt(chunk.id);
            this.writeInt(chunk.children.length);
            this.writeInt(chunk.stream.len);
            this.writeByteArray(chunk.stream.bytes, chunk.stream.len);

            for (var i = 0; i < chunk.children.length; i++)
            {
                this.writeChunk(chunk.children[i]);
            }
        };

        BinaryStream.prototype.readChunk = function()
        {
            var flag = this.readInt();

            console.assert(flag == 0xCCCCAAAA);
            var chunk = new BinaryChunk();
            chunk.id = this.readInt();
            var childrenNum = this.readInt();
            var len = this.readInt();

            chunk.stream.increase(len);
            this.readByteArray(chunk.stream.bytes, len);

            for (var i = 0; i < childrenNum; i++)
            {
                chunk.children.push(this.readChunk());
            }
        };


        var BinaryChunk = function()
        {
            this.id = 0;
            this.stream = new BinaryStream();
            this.children = [];
        };

        BinaryChunk.prototype.getChildrenLen = function()
        {
            var len = 0;
            for (var i = 0; i < this.children.length; i++)
            {
                len += this.children[i].len;
            }
        };

        BinaryChunk.prototype.addChild = function()
        {
            var chunk = new BinaryChunk();
            this.children.push(chunk);
            return chunk;
        };

        BinaryStream.Chunk = BinaryChunk;

        return BinaryStream;
    }
);