/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 下午1:57
 */

define(
    ["./animationclip"],
    function(AnimationClip)
    {
        "use strict";

        //////////////////////////////////
        // Track
        //////////////////////////////////

        var Track = function()
        {
            this.keys = [];
            this.time = 0.01;
            this.startTime = 0;
            this.endTime = this.startTime;
            this.boneName = "";
            this.orgPos = vec3.create();
            this.orgQuat = quat.create();
        };

        Track.prototype.addKey = function(time, pos, q)
        {
            var key = {time : time, pos : vec3.create(), quat : quat.create()};
            vec3.add(key.pos, this.orgPos, pos);
            quat.mul(key.quat, this.orgQuat, q);
            if (this.keys.length == 0)
                this.startTime = time;
            this.keys.push(key);
            this.endTime = time;
        };


        Track.prototype.getInterplatedKey = function()
        {
            var s_emptyAnimKey = { time : 0, pos : [0, 0, 0], quat : [0, 0, 0, 1] };
            var s_tempAnimKeyOut = { time : 0, pos : [0, 0, 0], quat : [0, 0, 0, 1] };

            var lerpKey = function(out, k1, k2, s)
            {
                var t = 1 - s;
                out.pos[0] = k1.pos[0] * t + k2.pos[0] * s;
                out.pos[1] = k1.pos[1] * t + k2.pos[1] * s;
                out.pos[2] = k1.pos[2] * t + k2.pos[2] * s;


                quat.lerp(out.quat, k1.quat, k2.quat, s);
            };

            return function(time, isLoop, cache)
            {
                var t = time;
                if (this.keys.length == 0) return s_emptyAnimKey;
                if (this.keys.length == 1) return this.keys[0];

                var s = 1;
                if (isLoop)
                {
                    t -= Math.floor(t / this.time) * this.time; // get remainder
                }

                //var startKey = this.keys[cache.startKeyIndex];
                //var endKey = this.keys[cache,endKeyIndex];
                // lookup cache
                if (t >= cache.startKey.time && t <= cache.endKey.time)
                {
                    s = cache.period > 0 ? (t - cache.startKey.time) / cache.period : 1;
                    lerpKey(s_tempAnimKeyOut, cache.startKey, cache.endKey, s);
                    return s_tempAnimKeyOut;
                }

                else if (t <= this.startTime)
                {
                    return this.keys[0];
                }
                else if (t >= this.endTime)
                {
                    return this.keys[this.keys.length - 1];
                }

                // one by one
                for (var i = 1, keyLen = this.keys.length; i < keyLen; i++)
                {
                    var key = this.keys[i];
                    if (key.time > t)
                    {
                        cache.startKey = this.keys[i - 1];
                        cache.endKey = key;
                        cache.period = cache.endKey.time - cache.startKey.time;
                        if (cache.period > 0)
                            s = (t - cache.startKey.time) / cache.period;

                        break;
                    }
                }

                lerpKey(s_tempAnimKeyOut, cache.startKey, cache.endKey, s);
                return s_tempAnimKeyOut;
            }
        }();

        //////////////////////////////////
        // SkelAnim
        //////////////////////////////////

        var SkelAnim = function(skel)
        {
            this.time = 0;
            this.tracks = new Array(skel.bones.length);
            this.skel = skel;
        };

        SkelAnim.prototype.addTrack = function(track)
        {
            var bone = this.skel.boneMap[track.boneName];
            if (!bone) return;
            var idx = bone.index;
            this.tracks[idx] = track;
        };


        SkelAnim.prototype.createClip = function(start, end, loop)
        {
            start = start || 0.0;
            end = end || this.time;
            loop = loop || false;

            return new AnimationClip(this, start, end, loop);
        };

        SkelAnim.Track = Track;
        return SkelAnim;

    }
);