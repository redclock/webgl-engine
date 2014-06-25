/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 上午10:32
 */

define(
    function()
    {
        "use strict";
        var AABB = function()
        {
            this.clear();
        };

        AABB.prototype.clear = function()
        {
            this.maxs = [-1000000, -1000000, -1000000];
            this.mins = [ 1000000, 1000000, 1000000];
            this.center = [0, 0, 0];
            this.extend = [0, 0, 0];
        };

        AABB.prototype.addVertex = function(x, y, z)
        {
            this.maxs[0] = Math.max(x, this.maxs[0]);
            this.maxs[1] = Math.max(y, this.maxs[1]);
            this.maxs[2] = Math.max(z, this.maxs[2]);
            this.mins[0] = Math.min(x, this.mins[0]);
            this.mins[1] = Math.min(y, this.mins[1]);
            this.mins[2] = Math.min(z, this.mins[2]);
        };

        AABB.prototype.completeCenterExt = function()
        {
            this.center[0] = 0.5 * (this.maxs[0] + this.mins[0]);
            this.center[1] = 0.5 * (this.maxs[1] + this.mins[1]);
            this.center[2] = 0.5 * (this.maxs[2] + this.mins[2]);

            this.extend[0] = 0.5 * (this.maxs[0] - this.mins[0]);
            this.extend[1] = 0.5 * (this.maxs[1] - this.mins[1]);
            this.extend[2] = 0.5 * (this.maxs[2] - this.mins[2]);
        };

        AABB.prototype.mergeAABB = function(aabb)
        {
            this.maxs[0] = Math.max(aabb.maxs[0], this.maxs[0]);
            this.maxs[1] = Math.max(aabb.maxs[1], this.maxs[1]);
            this.maxs[2] = Math.max(aabb.maxs[2], this.maxs[2]);
            this.mins[0] = Math.min(aabb.mins[0], this.mins[0]);
            this.mins[1] = Math.min(aabb.mins[1], this.mins[1]);
            this.mins[2] = Math.min(aabb.mins[2], this.mins[2]);
        };

        AABB.prototype.transformAABB = function(mat)
        {
            var corners = this.getCorners();

            var aabb = new AABB();
            for (var i = 0; i < 8; i++)
            {
                vec3.transformMat4(corners[i], corners[i], mat);
                aabb.addVertex(corners[i][0], corners[i][1], corners[i][2]);
            }
            aabb.completeCenterExt();
            return aabb;
        };


        AABB.prototype.clone = function()
        {
            var aabb = new AABB();
            aabb.maxs = this.aabb.maxs.slice();
            aabb.mins = this.aabb.mins.slice();
            aabb.center = this.aabb.center.slice();
            aabb.extend = this.aabb.extend.slice();
            return aabb;
        };

        AABB.prototype.getCorners = function()
        {
            return  new Array(
                [this.mins[0], this.mins[1], this.mins[2]],
                [this.mins[0], this.mins[1], this.maxs[2]],
                [this.mins[0], this.maxs[1], this.mins[2]],
                [this.mins[0], this.maxs[1], this.maxs[2]],
                [this.maxs[0], this.mins[1], this.mins[2]],
                [this.maxs[0], this.mins[1], this.maxs[2]],
                [this.maxs[0], this.maxs[1], this.mins[2]],
                [this.maxs[0], this.maxs[1], this.maxs[2]]
            );
        };

        return AABB;
    }
);