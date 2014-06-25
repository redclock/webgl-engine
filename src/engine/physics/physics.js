/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 上午11:35
 */

define(
    ["../model/shape"],
    function(Shape)
    {
        "use strict";

        var PhysicsProxy = function(gameTransform, phyShape, mass, initPos)
        {
            this.transform = gameTransform;
            this.shape = phyShape;
            this.mass = mass;
            this.body = new CANNON.RigidBody(mass, this.shape);
            if (initPos && !vec3.isZero(initPos))
            {
                this.initPos = vec3.clone(initPos);
            }
            this.updateFromTransform();
        }

        PhysicsProxy.prototype.updateFromTransform = function()
        {
            var pos = this.transform.pos;
            var quat = this.transform.quat;

            if (this.initPos)
                this.body.position.set(pos[0] + this.initPos[0], pos[1] + this.initPos[1], pos[2] + this.initPos[2]);
            else
                this.body.position.set(pos[0], pos[1], pos[2]);
            this.body.quaternion.set(quat[0], quat[1], quat[2], quat[3]);
            //this.body.initPosition.copy(this.body.position);
            //this.body.initQuaternion.copy(this.body.quaternion);
        };

        PhysicsProxy.prototype.updateToTransform = function()
        {
            var offsetPos = [0, 0, 0];
            return function()
            {
                var pos = this.transform.pos;
                var quat = this.transform.quat;

                // p' = (p + p0) * q
                // p = p' * q - p0 * q + p1

                quat[0] = this.body.quaternion.x;
                quat[1] = this.body.quaternion.y;
                quat[2] = this.body.quaternion.z;
                quat[3] = this.body.quaternion.w;

                pos[0] = this.body.position.x;
                pos[1] = this.body.position.y;
                pos[2] = this.body.position.z;

                if (this.initPos)
                {
                    //vec3.transformQuat(offsetPos, this.initPos, quat);
                    vec3.sub(pos, pos, this.initPos);
                }
            };
        }();

        PhysicsProxy.prototype.addCollideListener = function(func)
        {
            this.body.addEventListener("collide",
                function(e)
                {
                    var modelIns = bodyToModelInsMap[e.with];
                    func(modelIns, e);
                }
            );
        };


        PhysicsProxy.prototype.setVelocity = function(vx, vy, vz)
        {
            this.body.velocity.set(vx, this.body.velocity.y, vz);
        };

        ////////////////////////////////////

        var PhysicsSystem =
        {
            enabled : true,
            world : new CANNON.World()
        };

        var world = PhysicsSystem.world;

        PhysicsSystem.init = function()
        {
            world.gravity.set(0, -10, 0);
            world.broadphase = new CANNON.NaiveBroadphase();
            world.solver.iterations = 5;
            world.defaultContactMaterial.contactEquationStiffness = 1e7;
            world.defaultContactMaterial.contactEquationRegularizationTime = 2;
            world.broadphase.useBoundingBoxes = true;
        };

        PhysicsSystem.createShapeForMesh = function(mesh)
        {
            var shape;
            var initPos = [0, 0, 0];
            if (mesh instanceof Shape.Plane)
            {
                shape = new CANNON.Plane();
            }
            else if (mesh instanceof Shape.Cube)
            {
                shape = new CANNON.Box(new CANNON.Vec3(mesh.size[0] * 0.5, mesh.size[1] * 0.5, mesh.size[2] * 0.5));
                initPos = vec3.clone(mesh.pos);
            }
            else if (mesh instanceof Shape.Sphere)
            {
                shape = new CANNON.Sphere(mesh.radius);
                initPos = vec3.clone(mesh.pos);
            }
            else
            {
                var radius = vec3.length(mesh.aabb.extend) * 0.5;
                shape = new CANNON.Sphere(radius);
                //shape = new CANNON.Sphere(new CANNON.Vec3(mesh.aabb.extend[0], mesh.aabb.extend[1], mesh.aabb.extend[2]));
                initPos = vec3.clone(mesh.aabb.center);
            }

            return {shape : shape, initPos : initPos};
        };

        PhysicsSystem.createShapeForModel = function(model)
        {
            var meshes = model.meshes;
            if (meshes.length == 0)
                return null;

            if (meshes.length == 1)
            {
                return PhysicsSystem.createShapeForMesh(meshes[0]);
            }

            var compoundShape = new CANNON.Compound();
            var s = 1.5;

            for (var i = 0; i < meshes.length; i++)
            {
                var shapeRec = PhysicsSystem.createShapeForMesh(meshes[i]);
                if (!shapeRec.shape)
                    continue;
                compoundShape.addChild(shapeRec.shape,
                    new CANNON.Vec3(shapeRec.initPos[0], shapeRec.initPos[1], shapeRec.initPos[2])
                );
            }
            return { shape : compoundShape };
        };

        var phyObjs = [];
        var bodyToModelInsMap = {};

        PhysicsSystem.addPhysics = function(modelIns, mass)
        {
            var shapeRec = this.createShapeForModel(modelIns.model);
            if (!shapeRec)
                return null;

            var phyObj = new PhysicsProxy(modelIns.transform, shapeRec.shape, mass, shapeRec.initPos);

            world.add(phyObj.body);
            phyObjs.push(phyObj);
            bodyToModelInsMap[phyObj.body] = modelIns;
            modelIns.phyObj = phyObj;
            return phyObj;

        };

        PhysicsSystem.updateFrequency = 30;
        PhysicsSystem.update = function()
        {
            var updateDelta = 0;
            return function(delatTime)
            {
                if (!this.enabled)
                    return;
                // Step world
                var iterTime = 1000 / this.updateFrequency;
                updateDelta += delatTime;
                var times = Math.ceil(updateDelta / iterTime);
                var i;

                for (i = 0; i < times; i++)
                {
                    world.step(iterTime * 0.001);
                }

                updateDelta -= times * iterTime;

                var phyObjLen = phyObjs.length;
                for (i = 0; i < phyObjLen; i++)
                {
                    if (phyObjs[i].mass > 0)
                    {
                        phyObjs[i].updateToTransform();
                        phyObjs[i].transform.updateMatrix();
                    }
                }
            }
        }();

        return PhysicsSystem;
    }
);
