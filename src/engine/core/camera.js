/**
 * @author yaochunhui
 */
define(
    ["../common/mathlib", "../common/utils"],
    function(MathLib, Utils)
    {
        "use strict";
        var Camera = function(opts)
        {
            if (opts.pos)
                this.pos = opts.pos;
            else
                this.pos = [0, 10, 10];

            if (opts.target)
                this.target = opts.target;
            else
                this.target = [0, 0, 0];

            if (opts.dir)
            {
                this.dir = opts.dir;
            }
            else
            {
                this.dir = new Array(3);
                vec3.sub(this.dir, this.target, this.pos);
            }

            if (opts.fov)
                this.fov = opts.fov;
            else
                this.fov = Math.PI / 3;

            if (opts.zn)
                this.zn = opts.zn;
            else
                this.zn = 1.0;

            if (opts.zf)
                this.zf = opts.zf;
            else
                this.zf = 10000.0;

            this.up = [0, 1, 0];
            this.right = [1, 0, 0];

            this.matView = mat4.create();
            this.matProj = mat4.create();
            this.matOrgProj = mat4.create();
            this.matViewProj = mat4.create();
            this.matInvView = mat4.create();
            this.frustum = new MathLib.Frustum();

            this.updateView();
            this.updateProj();

            this.rotX = Math.atan2(-this.dir[2], -this.dir[0]);
            this.rotY = Math.acos(-this.dir[1]);

            this.distance = vec3.distance(this.target, this.pos);
            this.clipPlaneViewSpace = null;
            this.clipPlane = null;
        };

        Camera.prototype.updateView = function()
        {
            vec3.normalize(this.dir, this.dir);
            vec3.normalize(this.up, this.up);
            Utils.makeCoordinate(this.dir, this.up, this.right);
            Utils.mat4Transform(this.matView, this.pos, this.up, this.dir);
            mat4.mul(this.matViewProj, this.matProj, this.matView);
            mat4.invert(this.matInvView, this.matView);

            if (this.clipPlane)
            {
                if (!this.clipPlaneViewSpace) this.clipPlaneViewSpace = new MathLib.Plane();
                this.clipPlaneViewSpace.copy(this.clipPlane);
                this.clipPlaneViewSpace.applyMatrix4(this.matView);
                Utils.clipProjectionMatrix(this.matProj, this.clipPlaneViewSpace, this.matOrgProj);
            }
            this.frustum.setFromMatrix(this.matViewProj);
        };

        Camera.prototype.updateProj = function()
        {
            mat4.perspective(this.matOrgProj, this.fov, canvas.width / canvas.height, this.zn, this.zf);
            if (this.clipPlaneViewSpace)
            {
                Utils.clipProjectionMatrix(this.matProj, this.clipPlaneViewSpace, this.matOrgProj);
            }
            else
            {
                mat4.copy(this.matProj, this.matOrgProj);
            }
            mat4.mul(this.matViewProj, this.matProj, this.matView);
            this.frustum.setFromMatrix(this.matViewProj);
        };

        Camera.prototype.rotateRelative = function(x, y)
        {
            this.rotX += x;
            this.rotY += y;
            this.rotY = Math.min(this.rotY, Math.PI / 2 - 0.001);
            this.rotY = Math.max(this.rotY, 0.001);
            this.dir[0] = -Math.sin(this.rotY) * Math.cos(this.rotX);
            this.dir[2] = -Math.sin(this.rotY) * Math.sin(this.rotX);
            this.dir[1] = -Math.cos(this.rotY);
            this.up = [0, 1, 0];
            var d = vec3.create();
            vec3.scale(d, this.dir, this.distance);
            vec3.sub(this.pos, this.target, d);
            this.updateView();
        };

        Camera.prototype.zoom = function(delta)
        {
            this.distance += delta;
            var d = vec3.create();

            vec3.scale(d, this.dir, this.distance);
            vec3.sub(this.pos, this.target, d);
            this.updateView();
        };

        Camera.prototype.invertDir = function(outDir, x, y, screenW, screenH)
        {
            if (screenW == undefined) screenW = canvas.width;
            if (screenH == undefined) screenH = canvas.height;
            var fx = 2 * x / screenW - 1;
            var fy = 1 - 2 * y / screenH;

            outDir[0] = fx * this.zf / this.matProj[0];
            outDir[1] = fy * this.zf / this.matProj[5];
            outDir[2] = -this.zf;

            var ptWorld = [0, 0, 0];

            vec3.transformMat4(ptWorld, outDir, this.matInvView);
            vec3.sub(outDir, ptWorld, this.pos);
            vec3.normalize(outDir, outDir);
        };

        Camera.prototype.getDirXZ = function()
        {
            var dirh = [this.dir[0], 0, this.dir[2]];
            vec3.normalize(dirh, dirh);
            return dirh;
        };

        Camera.prototype.move = function(offset)
        {
            vec3.add(this.pos, this.pos, offset);
            vec3.add(this.target, this.target, offset);
            this.updateView();
        };

        /**
         * @param {MathLib.Plane} cp
         */
        Camera.prototype.setClipPlane = function(cp)
        {
            if (cp)
            {
                this.clipPlane = cp.clone();
                this.clipPlaneViewSpace = cp.clone();
                this.clipPlaneViewSpace.applyMatrix4(this.matView);
            }
            else
            {
                this.clipPlaneViewSpace = null;
            }
            this.updateProj();
        };

        Camera.prototype.isAABBVisible = function(aabb)
        {
            if (this.clipPlane)
            {
                if (this.clipPlane.intersectAABB(aabb) == 1)
                    return false;
            }
             return this.frustum.intersectAABB(aabb);
        };
        return Camera;

    }
);