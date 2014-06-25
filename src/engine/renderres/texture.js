//////////////////////////////////////////////
// Texture
//////////////////////////////////////////////

/**
 * Crearted by ych
 * Date: 2013-7-15
 * Time: 9:24
 */
define(
    ["./resman"],
    function(ResManager)
    {
        "use strict";

        var Texture = function()
        {
            this.texture = gl.createTexture();
            this.image = null;
            this.dataInfo = null;
            this.flipY = false;
            this.width = 0;
            this.height = 0;
            this.magFilter = gl.LINEAR;
            this.minFilter = gl.LINEAR_MIPMAP_LINEAR;
            this.wrapS = gl.REPEAT;
            this.wrapT = gl.REPEAT;
            this.mipmap = true;
            this.loaded = false;
            this.width = 0;
            this.height = 0;
            ResManager.newResource(this);
        };

        Texture.prototype.recreate = function()
        {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipY);

            if (this.image)
            {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
                this.width = this.image.width;
                this.height = this.image.height;
            }
            else
            {
                gl.texImage2D(gl.TEXTURE_2D, 0, this.dataInfo.interFormat, this.dataInfo.width, this.dataInfo.height,
                    0, this.dataInfo.format, this.dataInfo.dataType, this.dataInfo.data);

                this.width = this.dataInfo.width;
                this.height = this.dataInfo.height;
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);
            if (this.mipmap)
                gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);

            this.loaded = true;
        };

        Texture.prototype.load = function(filename)
        {
            this.image = new Image();
            this.dataInfo = null;
            var thisTexture = this;
            this.image.onload = function()
            {
                thisTexture.recreate.apply(thisTexture);
            };
            this.image.src = filename;
            this.loaded = false;
        };

        Texture.prototype.createFromData = function(w, h, data, format, internalFormat, dataType)
        {
            this.dataInfo =
            {
                width : w,
                height : h,
                format : format || gl.RGBA,
                interFormat : internalFormat || gl.RGBA,
                dataType : dataType || gl.UNSIGNED_BYTE
            };
            this.dataInfo.data = data instanceof Array ? new Uint8Array(data) : data;
            this.loaded = false;
            this.recreate();
        };

        Texture.prototype.release = function()
        {
            this.image = null;
            gl.deleteTexture(this.texture);
            this.texture = null;
            ResManager.freeResource(this);
        };

        Texture.prototype.onlost = function()
        {
            this.texture = null;
            this.loaded = false;
        };

        Texture.prototype.onrestore = function()
        {
            this.texture = gl.createTexture();
            this.recreate();
        };

        Texture.prototype.appear = function(layer)
        {
            if (!this.texture || !this.loaded)
            {
                if (this != Manager.error)
                    Manager.error.appear(layer);
                return;
            }

            gl.activeTexture(gl.TEXTURE0 + layer);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        };

        var Manager =
        {
            textureMap : {}
        };

        Manager.init = function()
        {
            Manager.white = new Texture();
            Manager.white.magFilter = gl.NEAREST;
            Manager.white.minFilter = gl.NEAREST;
            Manager.white.createFromData(1, 1, [255, 255, 255, 255]);

            Manager.black = new Texture();
            Manager.black.magFilter = gl.NEAREST;
            Manager.black.minFilter = gl.NEAREST;
            Manager.black.createFromData(1, 1, [0, 0, 0, 255]);

            Manager.error = new Texture();
            Manager.error.magFilter = gl.NEAREST;
            Manager.error.minFilter = gl.NEAREST;
            Manager.error.minFilter = gl.NEAREST_MIPMAP_LINEAR;
            var len = 16;
            var errorTex = new Array(len * len * 4);
            var index = 0;
            for (var i = 0; i < len; i++)
            {
                for (var j = 0; j < len; j++)
                {
                    if ((i + j) % 2 == 0)
                    {
                        errorTex[index * 4 + 0] = 0;
                        errorTex[index * 4 + 1] = 255;
                        errorTex[index * 4 + 2] = 255;
                        errorTex[index * 4 + 3] = 255;
                    }
                    else
                    {
                        errorTex[index * 4 + 0] = 255;
                        errorTex[index * 4 + 1] = 0;
                        errorTex[index * 4 + 2] = 255;
                        errorTex[index * 4 + 3] = 255;
                    }
                    index++;
                }
            }
            Manager.error.createFromData(len, len, errorTex);
        };


        Manager.loadTexture = function(filename)
        {
            var tex = this.textureMap[filename];
            if (tex != undefined)
            {
                return tex;
            }

            tex = new Texture();
            tex.load(filename);
            this.textureMap[filename] = tex;
            return tex;
        };

        Texture.Manager = Manager;

        return Texture;
    }
);


