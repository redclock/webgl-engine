define(
    function()
    {
        "use strict";

        var Utils = {};

        Utils.makeCoordinate = function(inoutDir, inoutUp, outRight)
        {
            vec3.normalize(inoutDir, inoutDir);
            vec3.cross(outRight, inoutUp, inoutDir);
            vec3.normalize(outRight, outRight);
            vec3.cross(inoutUp, inoutDir, outRight);
        };

        Utils.mat4Transform = function(out, pos, up, dir)
        {
            var x = vec3.create();
            var z = [-dir[0], -dir[1], -dir[2]];
            var y = up;
            Utils.makeCoordinate(z, y, x);
            out[0] = x[0];
            out[1] = y[0];
            out[2] = z[0];
            out[3] = 0;
            out[4] = x[1];
            out[5] = y[1];
            out[6] = z[1];
            out[7] = 0;
            out[8] = x[2];
            out[9] = y[2];
            out[10] = z[2];
            out[11] = 0;
            out[12] = -(x[0] * pos[0] + x[1] * pos[1] + x[2] * pos[2]);
            out[13] = -(y[0] * pos[0] + y[1] * pos[1] + y[2] * pos[2]);
            out[14] = -(z[0] * pos[0] + z[1] * pos[1] + z[2] * pos[2]);
            out[15] = 1;
        };

        Utils.mat3Transform = function(out, up, dir)
        {
            var x = vec3.create();
            var z = [-dir[0], -dir[1], -dir[2]];
            var y = up;
            Utils.makeCoordinate(z, y, x);
            out[0] = x[0];
            out[1] = y[0];
            out[2] = z[0];
            out[3] = x[1];
            out[4] = y[1];
            out[5] = z[1];
            out[6] = x[2];
            out[7] = y[2];
            out[8] = z[2];
        }

// result.t = length, result.normal = normal
        Utils.rayTraceAABB = function(start, dir, mins, maxs, result)
        {
            var isInside = true;
            result.pos = vec3.clone(start);
            var sign = [0, 0, 0];
            var maxt = [-1, -1, -1];
            // search candidate plane
            for (var i = 0; i < 3; i++)
            {
                if (start[i] < mins[i])
                {
                    result.pos[i] = mins[i];
                    isInside = false;
                    sign[i] = 1.0;
                    if (dir[i] != 0)
                        maxt[i] = (mins[i] - start[i]) / dir[i];
                }
                else if (start[i] > maxs[i])
                {
                    result.pos[i] = maxs[i];
                    isInside = false;
                    sign[i] = -1.0;
                    if (dir[i] != 0)
                        maxt[i] = (maxs[i] - start[i]) / dir[i];
                }
            }
            if (isInside)
            {
                result.t = 0;
                result.normal = [0, 0, 0];
                return true;
            }

            var whichPlane = 0;
            result.normal = [-sign[0], 0.0, 0.0];
            var t = maxt[0];
            if (maxt[1] > maxt[whichPlane])
            {
                whichPlane = 1;
                result.normal = [0.0, -sign[1], 0.0];
                t = maxt[1];
            }
            if (maxt[2] > maxt[whichPlane])
            {
                whichPlane = 2;
                result.normal = [0.0, 0.0, -sign[2]];
                t = maxt[2];
            }

            if (t < 0 || (result.maxt != undefined && result.maxt < t))
            {
                return false;
            }


            for (var i = 0; i < 3; i++)
            {
                if (i != whichPlane)
                {
                    result.pos[i] = start[i] + t * dir[i];
                    if (result.pos[i] < mins[i] || result.pos[i] > maxs[i])
                    {
                        return false;
                    }
                }
            }
            result.t = t;

            return true;
        };

        // result.t = length, result.normal = normal
        Utils.rayTraceSphere = function(start, dir, center, radius, result)
        {
            var startObj = [
                start[0] - center[0],
                start[1] - center[1],
                start[2] - center[2]
            ];
            //Compute A, B and C coefficients
            var a = vec3.dot(dir, dir);
            var b = 2 * vec3.dot(dir, startObj);
            var c = vec3.dot(startObj, startObj) - (radius * radius);

            //Find discriminant
            var disc = b * b - 4 * a * c;

            // if discriminant is negative there are no real roots, so return
            // false as ray misses sphere
            if (disc < 0)
                return false;

            // compute q as described above
            var distSqrt = Math.sqrt(disc);
            var q;
            if (b < 0)
                q = (-b - distSqrt) / 2.0;
            else
                q = (-b + distSqrt) / 2.0;

            // compute t0 and t1
            var t0 = q / a;
            var t1 = c / q;

            // make sure t0 is smaller than t1
            if (t0 > t1)
            {
                // if t0 is bigger than t1 swap them around
                var temp = t0;
                t0 = t1;
                t1 = temp;
            }

            // if t1 is less than zero, the object is in the ray's negative direction
            // and consequently the ray misses the sphere
            if (t1 < 0)
                return false;

            var t;
            // if t0 is less than zero, the intersection point is at t1
            if (t0 < 0)
            {
                t = t1;
            }
            // else the intersection point is at t0
            else
            {
                t = t0;
            }

            if (t < 0 || (result.maxt != undefined && result.maxt < t))
            {
                return false;
            }

            result.t = t;
            result.normal = [startObj[0] + t * dir[0],
                startObj[1] + t * dir[1], startObj[2] + t * dir[2]];

            vec3.scale(result.normal, result.normal, 1 / radius);
            return true;
        };

        Utils.normalizeAngle = function(angle)
        {
            while (angle < 0) angle += 2 * Math.PI;
            while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
            return angle;
        };

        /**
         *
         * @param {mat4} outNewProjMat
         * @param {MathLib.Plane} viewSpacePlane
         * @param {mat4} projMat
         *
         */
        Utils.clipProjectionMatrix = function(outNewProjMat, viewSpacePlane, projMat)
        {
            mat4.copy(outNewProjMat, projMat);
            if (viewSpacePlane.constant > 0)
            {
                return;
            }

            viewSpacePlane.constant += 0.5;
            var clipPlane = [viewSpacePlane.normal[0], viewSpacePlane.normal[1], viewSpacePlane.normal[2], viewSpacePlane.constant];
            //see http://www.terathon.com/code/oblique.html

            var q = [0, 0, 0, 0];

            // Calculate the clip-space corner point opposite the clipping plane
            // as (sgn(clipPlane.x), sgn(clipPlane.y), 1, 1) and
            // transform it into camera space by multiplying it
            // by the inverse of the projection matrix

            var sgn = function(x) { return x > 0 ? 1 : (x < 0 ? -1 : 0)};
            q[0] = (sgn(clipPlane[0]) + projMat[8]) / projMat[0];
            q[1] = (sgn(clipPlane[1]) + projMat[9]) / projMat[5];
            q[2] = -1.0;
            q[3] = (1.0 + projMat[10]) / projMat[14];

            // Calculate the scaled plane vector
            var scale = 2.0 / vec4.dot(clipPlane, q);

            // Replace the third row of the projection matrix
            outNewProjMat[2] = clipPlane[0] * scale;
            outNewProjMat[6] = clipPlane[1] * scale;
            outNewProjMat[10] = clipPlane[2] * scale + 1.0;
            outNewProjMat[14] = clipPlane[3] * scale;
        };


        Utils.trimString = function(str)
        {
            var start = 0;
            while (start < str.length && str.charCodeAt(start) <= 32)
                start++;
            var end = str.length - 1;
            while (end > start && str.charCodeAt(end) <= 32)
                end--;

            return str.substring(start, end + 1);
        };

        vec3.transformQuatInv = function(out, a, q)
        {
            // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

            var x = a[0], y = a[1], z = a[2],
                qx = q[0], qy = q[1], qz = q[2], qw = q[3],

            // calculate quat * vec
                ix = qw * x - qy * z + qz * y,
                iy = qw * y - qz * x + qx * z,
                iz = qw * z - qx * y + qy * x,
                iw = qx * x + qy * y + qz * z;

            // calculate result * inverse quat
            out[0] = ix * qw + iw * qx + iy * qz - iz * qy;
            out[1] = iy * qw + iw * qy + iz * qx - ix * qz;
            out[2] = iz * qw + iw * qz + ix * qy - iy * qx;
            return out;
        };

        vec3.isZero = function(a)
        {
            return a[0] == 0 && a[1] == 0 && a[2] == 0;
        };


// last column is [0, 0, 0, 1]
        mat4.multiply4x3 = function(out, a, b)
        {
            var a00 = a[0], a01 = a[1], a02 = a[2],
                a10 = a[4], a11 = a[5], a12 = a[6],
                a20 = a[8], a21 = a[9], a22 = a[10],
                a30 = a[12], a31 = a[13], a32 = a[14];

            // Cache only the current line of the second matrix
            var b0 = b[0], b1 = b[1], b2 = b[2];
            out[0] = b0 * a00 + b1 * a10 + b2 * a20;
            out[1] = b0 * a01 + b1 * a11 + b2 * a21;
            out[2] = b0 * a02 + b1 * a12 + b2 * a22;
            //out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

            b0 = b[4];
            b1 = b[5];
            b2 = b[6];
            out[4] = b0 * a00 + b1 * a10 + b2 * a20;
            out[5] = b0 * a01 + b1 * a11 + b2 * a21;
            out[6] = b0 * a02 + b1 * a12 + b2 * a22;
            //out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

            b0 = b[8];
            b1 = b[9];
            b2 = b[10];
            out[8] = b0 * a00 + b1 * a10 + b2 * a20;
            out[9] = b0 * a01 + b1 * a11 + b2 * a21;
            out[10] = b0 * a02 + b1 * a12 + b2 * a22;
            //out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

            b0 = b[12];
            b1 = b[13];
            b2 = b[14];
            out[12] = b0 * a00 + b1 * a10 + b2 * a20 + a30;
            out[13] = b0 * a01 + b1 * a11 + b2 * a21 + a31;
            out[14] = b0 * a02 + b1 * a12 + b2 * a22 + a32;
            //out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
            return out;
        };

        vec3.transformMat4NoTranslation = function(out, a, m)
        {
            var x = a[0], y = a[1], z = a[2];
            out[0] = m[0] * x + m[4] * y + m[8] * z;
            out[1] = m[1] * x + m[5] * y + m[9] * z;
            out[2] = m[2] * x + m[6] * y + m[10] * z;
            return out;
        };

        vec3.distanceXZ = function(a, b)
        {
            var dx = a[0] - b[0];
            var dz = a[2] - b[2];
            return Math.sqrt(dx * dx + dz * dz);
        };

        vec3.ToString = function(v)
        {
            return "(" + v[0].toFixed(2) + "," + v[1].toFixed(2) + "," + v[2].toFixed(2) + ")";
        };

        vec3.randomInBox = function(out, mins, maxs)
        {
            out[0] = Math.random() * (maxs[0] - mins[0]) + mins[0];
            out[1] = Math.random() * (maxs[1] - mins[1]) + mins[1];
            out[2] = Math.random() * (maxs[2] - mins[2]) + mins[2];
        };

        vec3.randomOnSphere = function(out, center, radius)
        {
            var theta = Math.PI * Math.random();
            var phi = Math.PI * 2 * Math.random();
            var cosTheta = Math.cos(theta);
            var sinTheta = Math.sin(theta);
            var cosPhi = Math.cos(phi);
            var sinPhi = Math.sin(phi);
            out[0] = sinTheta * cosPhi * radius + center[0];
            out[1] = cosTheta * radius + center[1];
            out[2] = sinTheta * sinPhi * radius + center[2];
        };

        vec3.randomOnCircleXZ = function(out, center, radius)
        {
            var theta = Math.PI * 2 * Math.random();
            var cosTheta = Math.cos(theta);
            var sinTheta = Math.sin(theta);
            out[0] = cosTheta * radius + center[0];
            out[1] = center[1];
            out[2] = sinTheta * radius + center[2];
        };


        return Utils;

    }
);