/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 下午2:07
 */

define(
    function()
    {
        "use strict";

        var AnimationClip = function(anim, start, end, loop)
        {
            this.anim = anim;
            this.skel = anim.skel;
            this.start = start;
            this.end = end;
            this.loop = loop;
            this.state = State.NONE;
            this.weight = 1.0;
            this.time = 0;
            this.fadeOutDuration = 0;
            this.fadeInDuration = 0;
            this.fadeTime = 0;
            this.trackCache = new Array(anim.tracks.length);
            for (var i = 0; i < this.trackCache.length; i++)
            {
                this.trackCache[i] = { startKey : { time : 0}, endKey : { time : -1}, period : 1 };
            }
        };


        // STATES
        var State = {
            NONE : 0,
            RUNNING : 1,
            STOPPED : 2,
            FADEIN : 3,
            FADEOUT : 4
        };

        AnimationClip.prototype.isPlaying = function()
        {
            return this.state == State.RUNNING
                || this.state == State.FADEIN
                || this.state == State.FADEOUT;

        };

        AnimationClip.prototype.updateFade = function(deltaTime)
        {
            var blendWeight = 1.0;
            // deal fade in
            if (this.state == State.FADEIN)
            {
                this.fadeTime += deltaTime;
                if (this.fadeTime >= this.fadeInDuration)
                {
                    this.fadeTime = this.fadeInDuration;
                    this.state = State.RUNNING;
                }
                else if (this.fadeInDuration > 0)
                {
                    blendWeight = this.fadeTime / this.fadeInDuration;
                }
            }
            // deal fade out
            if (this.state == State.FADEOUT)
            {
                this.fadeTime += deltaTime;
                if (this.fadeTime >= this.fadeOutDuration)
                {
                    this.fadeTime = this.fadeOutDuration;
                    this.state = State.STOPPED;
                    blendWeight = 0;
                }
                else if (this.fadeOutDuration > 0)
                {
                    blendWeight = 1 - this.fadeTime / this.fadeOutDuration;
                }
            }
            else
            {
                // deal auto fade out
                if (!this.loop && this.fadeOutDuration > 0
                    && this.time + this.fadeOutDuration >= this.end - this.start)
                {
                    this.state = State.FADEOUT;
                    this.fadeTime = (1 - blendWeight) * this.fadeOutDuration;
                }
            }
            return blendWeight;
        };

        AnimationClip.prototype.update = function(deltaTime)
        {
            var running = this.isPlaying();

            if (running)
            {
                this.time += deltaTime;
                var time = this.time + this.start;
                var blendWeight = this.weight;

                blendWeight *= this.updateFade(deltaTime);
                if (blendWeight > 0)
                {
                    var tracks = this.anim.tracks;
                    var bones = this.skel.bones;
                    for (var i = 0, tracksLen = tracks.length; i < tracksLen; i++)
                    {
                        var track = tracks[i];
                        if (!track)
                            continue;

                        var key = track.getInterplatedKey(time, this.loop, this.trackCache[i]);
                        var bone = bones[i];
                        if (blendWeight < 1)
                        {
                            vec3.lerp(bone.pos, bone.pos, key.pos, blendWeight);
                            quat.slerp(bone.quat, bone.quat, key.quat, blendWeight);
                            quat.normalize(bone.quat, bone.quat);
                        }
                        else
                        {
                            vec3.copy(bone.pos, key.pos);
                            quat.copy(bone.quat, key.quat);
                        }
                    }
                }

                if (!this.loop && this.time >= this.end)
                {
                    this.state = State.STOPPED;
                }
            }
        };

        AnimationClip.prototype.play = function()
        {
            this.state = State.RUNNING;
            this.time = 0;
        };

        AnimationClip.prototype.pause = function()
        {
            this.state = State.NONE;
        };

        AnimationClip.prototype.stop = function()
        {
            this.state = State.STOPPED;
        };

        AnimationClip.prototype.fadeOut = function(time)
        {
            this.state = State.FADEOUT;
            this.fadeTime = 0;
            this.fadeOutDuration = time;
        };

        AnimationClip.prototype.fadeIn = function(time)
        {
            if (!time || time <= 0)
                return this.play();

            this.state = State.FADEIN;
            this.fadeTime = 0;
            this.fadeInDuration = time;
            return null;
        };

        AnimationClip.State = State;
        return AnimationClip;
    }
);