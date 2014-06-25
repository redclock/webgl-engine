/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 上午11:28
 */

define(
    ["../common/utils"],
    function(Utils)
    {
        "use strict";
        /////////////////////////////////////
        //
        //  Transform
        //
        /////////////////////////////////////
        var Transform = function()
        {
            this.pos = [0, 0, 0];
            this.quat = [0, 0, 0, 1];
            this.scale = [1, 1, 1];
            this.mat = mat4.create();

            this.dirty = true;
        };

        Transform.prototype.setUpDir = function(up, dir)
        {
            var xAxis = [1, 0, 0];
            var yAxis = [0, 1, 0];
            var zAxis = [0, 0, 1];
            vec3.normalize(yAxis, up);
            vec3.normalize(zAxis, dir);
            Utils.makeCoordinate(zAxis, yAxis, xAxis);
            quat.setAxes(this.quat, zAxis, xAxis, yAxis);
            this.updateMatrix();
        };

        Transform.prototype.lookAt = function(pos, up, dir)
        {
            var xAxis = [1, 0, 0];
            var yAxis = [0, 1, 0];
            var zAxis = [0, 0, 1];
            vec3.normalize(yAxis, up);
            vec3.normalize(zAxis, dir);
            Utils.makeCoordinate(zAxis, yAxis, xAxis);
            quat.setAxes(this.quat, zAxis, xAxis, yAxis);
            vec3.copy(this.pos, pos);
            this.updateMatrix();
        };


        Transform.prototype.updateMatrix = function()
        {
            mat4.fromRotationTranslation(this.mat, this.quat, this.pos);
            this.dirty = true;
        };

        Transform.prototype.getDirUpRight = function()
        {
            var mat = mat3.create();
            return function(dir, up, right)
            {
                mat3.fromQuat(mat, this.quat);
                if (right)
                {
                    right[0] = mat[0];
                    right[1] = mat[3];
                    right[2] = mat[6];
                }
                if (up)
                {
                    up[0] = mat[1];
                    up[1] = mat[4];
                    up[2] = mat[7];
                }
                if (dir)
                {
                    dir[0] = mat[2];
                    dir[1] = mat[5];
                    dir[2] = mat[8];
                }
            }
        }();

        return Transform;
    }
);