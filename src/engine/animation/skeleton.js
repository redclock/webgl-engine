/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 下午1:26
 */

define(
    ["./bone", "./animationclip"],
    function(Bone, AnimationClip)
    {
        "use strict";
        var Skeleton = function()
        {
            this.bones = [];
            this.boneMap = [];
            this.rootBones = [];
            this.animMap = {};
            this.animChannels = [];
            this.setChannelNum(1);
        };

        Skeleton.prototype.clone = function()
        {
            var other = new Skeleton();
            var i, bone;
            var boneLen = this.bones.length;
            for (i = 0; i < boneLen; i++)
            {
                bone = this.bones[i].clone();
                other.bones.push(bone);
                other.boneMap[bone.name] = bone;
            }
            for (i = 0; i < boneLen; i++)
            {
                bone = this.bones[i];
                if (bone.parent)
                {
                    other.bones[i].parent = other.bones[bone.parent.index];
                }
                if (bone.firstChild)
                {
                    other.bones[i].firstChild = other.bones[bone.firstChild.index];
                }
                if (bone.sibling)
                {
                    other.bones[i].sibling = other.bones[bone.sibling.index];
                }
            }

            for (var key in this.animMap)
            {
                if (this.animMap.hasOwnProperty(key))
                {
                    other.animMap[key] = this.animMap[key];
                }
            }
            other.setChannelNum(this.animChannels.length);
            other.reset();
            return other;
        };

        Skeleton.prototype.addBone = function(bonename)
        {
            var idx = this.bones.length;
            var bone = new Bone(bonename, idx);
            this.bones.push(bone);
            this.boneMap[bonename] = bone;
            return bone;
        };

        Skeleton.prototype.setChannelNum = function(n)
        {
            this.animChannels.length = n;
            for (var i = 0; i < n; i++)
            {
                this.animChannels[i] = [];
            }
        };

        /**
         *
         * @param {string} name
         * @param {SkeletonAnim} anim
         */
        Skeleton.prototype.addAnimation = function(name, anim)
        {
            this.animMap[name] = anim;
        };

        Skeleton.prototype.setHierarchy = function(pname, cname)
        {
            var pbone = this.boneMap[pname];
            var cbone = this.boneMap[cname];
            if (!pbone || !cbone)
                return;

            pbone.addChild(cbone);
        };

        Skeleton.prototype.initBoneMat = function()
        {
            var i, bone;
            for (i = 0; i < this.rootBones.length; i++)
            {
                bone = this.rootBones[i];
                bone.update(true);
            }

            for (i = 0; i < this.bones.length; i++)
            {
                bone = this.bones[i];
                //vec3.copy(bone.initPos, bone.derivedPos);
                //quat.copy(bone.initQuat, bone.derivedQuat);
                //quat.invert(bone.initQuatInv, bone.initQuat);
                mat4.fromRotationTranslation(bone.matInit, bone.derivedQuat, bone.derivedPos);
                mat4.invert(bone.matInitInv, bone.matInit);
            }

        };


        Skeleton.prototype.update = function()
        {
            var relativeQuat = quat.create();
            var relativePos = vec3.create();
            return function(deltaTime)
            {
                var i, bone;
                this.updateAnimation(deltaTime);
                var rootBoneLen = this.rootBones.length;
                for (i = 0; i < rootBoneLen; i++)
                {
                    bone = this.rootBones[i];
                    bone.update(true);
                }

                var boneLen = this.bones.length;
                for (i = 0; i < boneLen; i++)
                {
                    bone = this.bones[i];

                    //derivedQuat = initQuat * relativeQuat
                    //derivedPos = initPos + relativePos * derivedQuat
                    //so
                    //relativeQuat = initQuatInv * derivedQuat
                    //relativePos = derivedQuatInv * (derivedPos - initPos)

                    //quat.mul(relativeQuat, bone.initQuatInv, bone.derivedQuat);
                    //vec3.sub(relativePos, bone.derivedPos, bone.initPos);
                    //vec3.transformQuat(relativePos, relativePos, bone.derivedQuat);
                    mat4.fromRotationTranslation(bone.mat, bone.derivedQuat, bone.derivedPos);
                    mat4.multiply4x3(bone.matRelative, bone.mat, bone.matInitInv);
                }
            }
        }();


        Skeleton.prototype.reset = function()
        {
            this.rootBones.length = 0;
            for (var i = 0; i < this.bones.length; i++)
            {
                var bone = this.bones[i];
                vec3.copy(bone.pos, bone.orgPos);
                quat.copy(bone.quat, bone.orgQuat);
                if (!bone.parent)
                    this.rootBones.push(bone);
            }

            for (var ich = 0; ich < this.animChannels.length; ich++)
            {
                this.animChannels[ich].length = 0;
            }
            this.initBoneMat();
        };

        Skeleton.prototype.outputBones = function()
        {
            for (var i = 0; i < this.rootBones.length; i++)
            {
                var bone = this.bones[i];
                this.outputBoneTree(bone, "");
            }
        };

        Skeleton.prototype.outputBoneTree = function(root, prefix)
        {
            console.log(prefix + root.name);
            if (root.firstChild)
            {
                this.outputBoneTree(root.firstChild, prefix + "    ");
            }
            if (root.sibling)
            {
                this.outputBoneTree(root.sibling, prefix);
            }
        };


        Skeleton.prototype.drawBones = function()
        {
            SimpleDraw.setColor(255, 255, 255, 255);
            var mat = mat4.create();
            var aabb = new AABB();
            aabb.mins = [-0.05, -0.05, -0.05];
            aabb.maxs = [0.05, 0.05, 0.05];

            for (var i = 0; i < this.bones.length; i++)
            {
                var bone = this.bones[i];
                var pos = bone.derivedPos;

                mat4.fromRotationTranslation(mat, bone.derivedQuat, pos);
                SimpleDraw.addAABB(aabb, true, bone.mat);

                if (bone.parent)
                {
                    var ppos = bone.parent.derivedPos;
                    SimpleDraw.addLine(pos[0], pos[1], pos[2], ppos[0], ppos[1], ppos[2]);
                }
            }
        };

        Skeleton.prototype.updateAnimation = function(deltaTime)
        {
            for (var ich = 0; ich < this.animChannels.length; ich++)
            {
                var chan = this.animChannels[ich];
                for (var i = 0; i < chan.length; i++)
                {
                    var clip = chan[i];
                    if (clip.state == AnimationClip.State.STOPPED)
                    {
                        chan.splice(i, 1);
                        i--;
                        continue;
                    }

                    clip.update(deltaTime);
                }
            }
        };

        /**
         *
         * @param name animation name
         * @param opts [trans = 0, start, end, loop = false, weight = 1.0, exclusive = true, autofadeout = 0]
         * @return animation clip
         */
        Skeleton.prototype.playAnimationClip = function(channel, name, opts)
        {
            opts = opts || {};
            var anim = this.animMap[name];
            if (!anim)
                return null;

            var clip = anim.createClip(opts.start, opts.end, opts.loop);
            clip.skel = this;
            clip.channel = channel;
            if (opts.weight)
            {
                clip.weight = opts.weight;
            }

            if (!opts.loop && opts.autofadeout)
            {
                clip.fadeOutDuration = opts.autofadeout;
            }

            var chan = this.animChannels[channel];
            if (opts.exclusive)
            {
                if (opts.trans)
                {
                    for (var i = 0; i < chan.length; i++)
                    {
                        chan[i].fadeOut(opts.trans);
                    }
                }
                else
                {
                    for (var i = 0; i < chan.length; i++)
                    {
                        chan[i].state = AnimationClip.State.STOPPED;
                    }
                }
                chan.unshift(clip);
                clip.play();
            }
            else // not exclusive
            {
                chan.push(clip);
                clip.fadeIn(opts.trans);
            }
            return clip;
        };

        return Skeleton;
    }
);