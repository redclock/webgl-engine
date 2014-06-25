/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 上午9:39
 */

define(
    ["./resman", "./texture"],
    function(ResManager, Texture)
    {
        "use strict";
        ////////////////////////////
        // RenderTarget
        ///////////////////////////


        var RenderTarget = function(texture, depthFormat)
        {
            this.texture = texture;

            this.depthFormat = depthFormat;

            this.frameBuffer = gl.createFramebuffer();

            if (depthFormat)
            {
                this.depthBuffer = gl.createRenderbuffer();
            }
            this.applied = false;
            ResManager.newResource(this);
        };


        RenderTarget.create = function(width, height, depthFormat)
        {
            var tex = new Texture();
            tex.mipmap = false;
            tex.minFilter = gl.LINEAR;
            tex.magFilter = gl.LINEAR;
            tex.wrapS = gl.CLAMP_TO_EDGE;
            tex.wrapT = gl.CLAMP_TO_EDGE;
            var data = new Array(width * height * 4);

            for (var i = 0; i < width * height; i++)
            {
                data[i * 4 + 0] = 255;
                data[i * 4 + 1] = 0;
                data[i * 4 + 2] = 0;
                data[i * 4 + 3] = 255;
            }
            tex.createFromData(width, height, data);
            var rt = new RenderTarget(tex, depthFormat);
            rt.recreate();
            return rt;
        };

        RenderTarget.prototype.release = function()
        {
            if (this.texture)
                this.texture.release();
            this.texture = null;

            gl.deleteFramebuffer(this.frameBuffer);
            this.frameBuffer = null;
            if (this.depthFormat)
            {
                gl.deleteRenderbuffer(this.depthBuffer);
                this.depthBuffer = null;
            }
            ResManager.freeResource(this);
        };

        RenderTarget.prototype.onlost = function()
        {
            this.frameBuffer = null;
            this.depthBuffer = null;
            this.loaded = false;
        };

        RenderTarget.prototype.onrestore = function()
        {
            this.frameBuffer = gl.createFramebuffer();
            if (this.depthFormat)
            {
                this.depthBuffer = gl.createRenderbuffer();
            }
            this.recreate();
        };

        RenderTarget.prototype.recreate = function()
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

            this.width = this.texture.width;
            this.height = this.texture.height;
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.texture, 0);
            if (this.depthFormat)
            {
                gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
                gl.renderbufferStorage(gl.RENDERBUFFER, this.depthFormat, this.width, this.height);
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
                gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        };

        RenderTarget.prototype.bind = function()
        {
            console.assert(!this.applied);
            this.oldFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
            this.oldViewport = gl.getParameter(gl.VIEWPORT);

            gl.viewport(0, 0, this.width, this.height);
            gl.viewportWidth = this.width;
            gl.viewportHeight = this.height;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
            this.applied = true;
        };

        RenderTarget.prototype.unbind = function()
        {
            console.assert(this.applied);
            gl.viewport(this.oldViewport[0], this.oldViewport[1], this.oldViewport[2], this.oldViewport[3]);
            gl.viewportWidth = this.oldViewport[2];
            gl.viewportHeight = this.oldViewport[3];
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.oldFbo);
            this.applied = false;
        };

        RenderTarget.prototype.clear = function(r, g, b, a)
        {
            var isbind = this.applied;
            if (!isbind)
                this.bind();
            gl.clearColor(r, g, b, a);
            gl.clear(gl.COLOR_BUFFER_BIT);
            if (!isbind)
                this.unbind();
        };

        RenderTarget.prototype.readPixels = function(x, y, width, height)
        {
            var isbind = this.applied;
            if (!isbind)
                this.bind();

            x = x || 0;
            y = y || 0;
            width = width || this.width;
            height = height || this.height;
            var pixels = new Uint8Array(width * height * 4);
            gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            if (!isbind)
                this.unbind();

            return pixels;
        };

        RenderTarget.Manager =
        {
            freeTargets : []
        };

        RenderTarget.Manager.reset = function()
        {
            for (var i = 0; i < this.freeTargets.length; i++)
            {
                this.freeTargets[i].release();
            }
            this.freeTargets.length = 0;
        };

        RenderTarget.Manager.allocTarget = function(width, height, depthFormat)
        {
            for (var i = 0; i < this.freeTargets.length; i++)
            {
                var item = this.freeTargets[i];
                if (item.width == width && this.height == height && this.depthFormat == depthFormat)
                {
                    this.freeTargets.splice(i, 1);
                    return item;
                }
            }

            var rt = RenderTarget.create(width, height, depthFormat);
            return rt;
        };

        RenderTarget.Manager.freeTarget = function(rt)
        {
            console.assert(rt instanceof RenderTarget);
            this.freeTargets.push(rt);
        };

        return RenderTarget;
    }
);