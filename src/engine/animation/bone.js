/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 下午1:25
 */
define(
    function()
    {
        "use strict";
        var Bone = function(name, idx)
        {
            this.name = name;
            this.index = idx;
            this.firstChild = null;
            this.sibling = null;
            this.parent = null;
            this.orgPos = vec3.create();
            this.orgQuat = quat.create();
            this.pos = vec3.create();
            this.quat = quat.create();
            this.derivedPos = vec3.create();
            this.derivedQuat = quat.create();
            this.mat = mat4.create();
            this.matRelative = mat4.create();

            this.matInit = mat4.create();
            this.matInitInv = mat4.create();
        };

        Bone.prototype.clone = function()
        {
            var other = new Bone(this.name, this.index);
            vec3.copy(other.orgPos, this.orgPos);
            vec3.copy(other.pos, this.pos);
            vec3.copy(other.derivedPos, this.derivedPos);
            quat.copy(other.orgQuat, this.orgQuat);
            quat.copy(other.quat, this.quat);
            quat.copy(other.derivedQuat, this.derivedQuat);
            mat4.copy(other.matInitInv, this.matInitInv);
            mat4.copy(other.matInit, this.matInit);
            mat4.copy(other.mat, this.mat);
            mat4.copy(other.matRelative, this.matRelative);
            return other;
        };

        Bone.prototype.addSibling = function(bone)
        {
            if (this.sibling)
            {
                this.sibling.addSibling(bone);
            }
            else
            {
                this.sibling = bone;
            }
        };

        Bone.prototype.addChild = function(bone)
        {
            if (this.firstChild)
            {
                this.firstChild.addSibling(bone);
            }
            else
            {
                this.firstChild = bone;
            }
            bone.parent = this;
        };

        Bone.prototype.update = function(tree)
        {
            if (this.parent)
            {
                quat.mul(this.derivedQuat, this.parent.derivedQuat, this.quat);
                vec3.transformQuat(this.derivedPos, this.pos, this.parent.derivedQuat);
                vec3.add(this.derivedPos, this.derivedPos, this.parent.derivedPos);
            }
            else
            {
                quat.copy(this.derivedQuat, this.quat);
                vec3.copy(this.derivedPos, this.pos);
            }

            if (tree)
            {
                if (this.firstChild)
                    this.firstChild.update(tree);
                if (this.sibling)
                    this.sibling.update(tree);
            }
        };

        return Bone;
    }
);