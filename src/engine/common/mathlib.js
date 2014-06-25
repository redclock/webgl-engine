/**
 * Crearted by ych
 * Date: 2013-7-15
 * Time: 9:24
 */

define(
    function()
    {
        "use strict";

        var INSIDE = 0;
        var OUTSIDE = 1;
        var INTERSECT = 2;

        var Plane = function(normal, constant)
        {

            this.normal = ( normal !== undefined ) ? normal : [ 1, 0, 0 ];
            this.constant = ( constant !== undefined ) ? constant : 0;

        };

        Plane.prototype = {

            constructor : Plane,

            set : function(normal, constant)
            {

                vec3.copy(this.normal, normal);
                this.constant = constant;

                return this;

            },

            fromNormalAndCoplanarPoint : function(normal, point)
            {

                vec3.copy(this.normal, normal);
                this.constant = -vec3.dot(point, this.normal);	// must be this.normal, not normal, as this.normal is normalized

                return this;
            },

            fromCoplanarPoints : function()
            {

                var v1 = [0, 0, 0];
                var v2 = [0, 0, 0];

                return function(a, b, c)
                {

                    vec3.sub(v1, c, b);
                    vec3.sub(v2, a, b);
                    vec3.cross(this.normal, v1, v2);
                    vec3.normalize(this.normal, this.normal);
                    this.constant = -vec3.dot(a, this.normal);	// must be this.normal, not normal, as this.normal is normalized

                    return this;

                };

            }(),


            copy : function(plane)
            {

                vec3.copy(this.normal, plane.normal);
                this.constant = plane.constant;

                return this;

            },

            clone : function()
            {
                var plane = new Plane();
                vec3.copy(plane.normal, this.normal);
                plane.constant = this.constant;

                return plane;

            },

            normalize : function()
            {

                // Note: will lead to a divide by zero if the plane is invalid.

                var inverseNormalLength = 1.0 / vec3.length(this.normal);
                vec3.scale(this.normal, this.normal, inverseNormalLength);
                this.constant *= inverseNormalLength;

                return this;

            },

            negate : function()
            {

                this.constant *= -1;
                vec3.negate(this.normal, this.normal);

                return this;

            },

            distanceToPoint : function(point)
            {

                return vec3.dot(this.normal, point) + this.constant;

            },

            distanceToSphere : function(center, radius)
            {

                return this.distanceToPoint(center) - radius;

            },

            projectPoint : function(out, point)
            {

                this.orthoPoint(out, point);
                vec3.sub(out, point, out);

            },

            orthoPoint : function(out, point)
            {

                var perpendicularMagnitude = this.distanceToPoint(point);
                vec3.scale(out, this.normal, perpendicularMagnitude);

            },

            isIntersectionLine : function(p1, p2)
            {

                // Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.

                var startSign = this.distanceToPoint(p1);
                var endSign = this.distanceToPoint(p2);

                return ( startSign < 0 && endSign > 0 ) || ( endSign < 0 && startSign > 0 );

            },

            intersectAABB : function()
            {
                var absNormal = [0, 0, 0];
                return function(aabb)
                {
                    absNormal[0] = Math.abs(this.normal[0]);
                    absNormal[1] = Math.abs(this.normal[1]);
                    absNormal[2] = Math.abs(this.normal[2]);
                    var e = vec3.dot(aabb.extend, absNormal);
                    var s = this.distanceToPoint(aabb.center);
                    // Note that the following is reverse than in [Akenine-Moller's Real-Time Rendering 3rd Ed],
                    // since we define outside as the negative halfspace
                    if (s - e > 0)
                    {
                        return INSIDE;
                    }
                    if (s + e < 0)
                    {
                        return OUTSIDE;
                    }
                    return INTERSECT;
                };
            }(),

            coplanarPoint : function(out)
            {

                vec3.scale(out, this.normal, -this.constant);

            },

            applyMatrix4 : function()
            {

                var mat = mat4.create();
                var newNormal = [0, 0, 0];
                var newPoint = [0, 0, 0];
                return function(matrix)
                {

                    // compute new normal based on theory here:
                    // http://www.songho.ca/opengl/gl_normaltransform.html
                    mat4.invert(mat, matrix);
                    mat4.transpose(mat, mat);

                    vec3.transformMat4NoTranslation(newNormal, this.normal, mat);

                    this.coplanarPoint(newPoint);

                    vec3.transformMat4(newPoint, newPoint, matrix);

                    this.fromNormalAndCoplanarPoint(newNormal, newPoint);

                    return this;

                };

            }(),

            translate : function(offset)
            {

                this.constant = this.constant - vec3.dot(this.normal, offset);

                return this;

            },

            mirrorVector : function()
            {
                var n = [0, 0, 0];
                return function(out, v)
                {
                    vec3.scale(n, this.normal, -2 * vec3.dot(v, this.normal));
                    vec3.add(out, v, n);
                }
            }(),

            mirrorPoint : function()
            {
                var pp = [0, 0, 0];
                return function(out, p)
                {
                    this.projectPoint(pp, p);
                    vec3.scale(pp, pp, 2);
                    vec3.sub(out, pp, p);
                }
            }()

        };

        var Frustum = function(p0, p1, p2, p3, p4, p5)
        {

            this.planes = [

                ( p0 !== undefined ) ? p0 : new Plane(),
                ( p1 !== undefined ) ? p1 : new Plane(),
                ( p2 !== undefined ) ? p2 : new Plane(),
                ( p3 !== undefined ) ? p3 : new Plane(),
                ( p4 !== undefined ) ? p4 : new Plane(),
                ( p5 !== undefined ) ? p5 : new Plane()

            ];

        };

        Frustum.prototype = {

            constructor : Frustum,

            set : function(p0, p1, p2, p3, p4, p5)
            {

                var planes = this.planes;

                planes[0].copy(p0);
                planes[1].copy(p1);
                planes[2].copy(p2);
                planes[3].copy(p3);
                planes[4].copy(p4);
                planes[5].copy(p5);

                return this;

            },

            copy : function(frustum)
            {

                var planes = this.planes;

                for (var i = 0; i < 6; i++)
                {

                    planes[i].copy(frustum.planes[i]);

                }

                return this;

            },

            setFromMatrix : function(m)
            {

                var planes = this.planes;
                var me0 = m[0], me1 = m[1], me2 = m[2], me3 = m[3];
                var me4 = m[4], me5 = m[5], me6 = m[6], me7 = m[7];
                var me8 = m[8], me9 = m[9], me10 = m[10], me11 = m[11];
                var me12 = m[12], me13 = m[13], me14 = m[14], me15 = m[15];

                planes[ 0 ].set([me3 - me0, me7 - me4, me11 - me8], me15 - me12).normalize();
                planes[ 1 ].set([me3 + me0, me7 + me4, me11 + me8], me15 + me12).normalize();
                planes[ 2 ].set([me3 + me1, me7 + me5, me11 + me9], me15 + me13).normalize();
                planes[ 3 ].set([me3 - me1, me7 - me5, me11 - me9], me15 - me13).normalize();
                planes[ 4 ].set([me3 - me2, me7 - me6, me11 - me10], me15 - me14).normalize();
                planes[ 5 ].set([me3 + me2, me7 + me6, me11 + me10], me15 + me14).normalize();

                return this;

            },

            intersectsSphere : function(center, radius)
            {

                var planes = this.planes;
                var negRadius = -radius;

                for (var i = 0; i < 6; i++)
                {

                    var distance = planes[ i ].distanceToPoint(center);

                    if (distance < negRadius)
                    {

                        return false;

                    }

                }

                return true;

            },

            containsPoint : function(point)
            {

                var planes = this.planes;

                for (var i = 0; i < 6; i++)
                {

                    if (planes[ i ].distanceToPoint(point) < 0)
                    {

                        return false;

                    }

                }

                return true;

            },

            intersectAABB : function(aabb)
            {
                for (var i = 0; i < 6; i++)
                {
                    var test = this.planes[i].intersectAABB(aabb);
                    if (test === OUTSIDE)
                    {
                        return false;
                    }
                }
                return true;
            },

            clone : function()
            {

                return new Frustum().copy(this);

            }

        };

        return {
            Plane : Plane,
            Frustum : Frustum
        };

    }
);