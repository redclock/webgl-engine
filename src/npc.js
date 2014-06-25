define(
    ["engine/common/utils", "engine/model/modelins", "engine/physics/physics", "./phymaterial"],
    function(Utils, ModelIns, PhysicsSystem, PhysicsMaterials)
    {
        var Actor = function()
        {
        };

        var maxID = 100;

        var ActorState =
        {
            STAND : 0,
            MOVE : 1,
            ATTACK : 2,
            HURT : 3,
            DYING : 4,
            DEAD : 5
        };

        var AttackType =
        {
            NONE : 0,
            ATTACK1 : 1,
            ATTACK2 : 1,
        };

        Actor.prototype.init = function(model, skel, material)
        {
            this.id = maxID;
            maxID++;

            this.name = "Actor";
            this.skel = skel;
            this.model = model;
            this.modelIns = new ModelIns();
            this.modelIns.init(model, skel);
            this.transform = this.modelIns.transform;
            this.modelIns.setMaterial(material);
        };

        Actor.prototype.update = function(deltaTime)
        {
            if (this.skel)
            {
                this.skel.update(deltaTime);
            }

            if (this.modelIns)
            {
                this.modelIns.update();
            }
        };

        Actor.prototype.draw = function()
        {
            if (this.modelIns)
            {
                this.modelIns.draw();
            }
        };

        Actor.prototype.playAnimationClip = function(channel, name, opts)
        {
            if (!this.skel)
                return null;
            return this.skel.playAnimationClip(channel, name, opts);
        };


        var Npc = function()
        {

        };

        extend(Npc, Actor);

        Npc.prototype.init = function(model, skel, material)
        {
            Actor.prototype.init.call(this, model, skel, material);
            this.speed = 4;
            this.angle = 0;
            this.targetAngle = this.angle;
            this.angleSpeed = 8;
            this.targetPos = null;
            this.phyObj = PhysicsSystem.addPhysics(this.modelIns, 100000);
            this.phyObj.body.angularDamping = 0.5;
            this.phyObj.body.linearDamping = 0.9;
            this.modelIns.phyObj.body.material = PhysicsMaterials.materials["actor"];
            this.attackType = AttackType.NONE;
            this.stand();
        };

        Npc.prototype.stand = function()
        {
            if (this.state != ActorState.STAND)
            {
                this.state = ActorState.STAND;
                this.playAnimationClip(0, "idle", {loop : true, exclusive : true, trans : 100});
            }

        };

        Npc.prototype.walk = function()
        {
            if (this.state != ActorState.MOVE)
            {
                this.state = ActorState.MOVE;
                this.playAnimationClip(0, "walk", {loop : true, trans : 100, exclusive : true});
            }

        };

        Npc.prototype.attack = function()
        {
            this.attackType = AttackType.MOVE;
            this.playAnimationClip(1, "attack", { exclusive : true, trans : 100, autofadeout : 100 });
        };

        Npc.prototype.update = function(deltaTime)
        {
            var dir = [0, 0, 0];
            this.transform.getDirUpRight(dir);
            if (this.transform.dirty)
            {
                this.angle = Utils.normalizeAngle(Math.atan2(dir[0], dir[2]));
            }
            var angleDiff = Utils.normalizeAngle(this.targetAngle - this.angle);
            if (angleDiff != 0)
            {
                var maxAngleDiff = this.angleSpeed * deltaTime * 0.001;
                if (angleDiff > Math.PI)
                {
                    angleDiff = Math.PI * 2 - angleDiff;
                    angleDiff = Math.min(angleDiff, maxAngleDiff);
                    this.angle -= angleDiff;
                }
                else
                {
                    angleDiff = Math.min(angleDiff, maxAngleDiff);
                    this.angle += angleDiff;
                }

                //this.phyObj.updateToTransform();
                this.transform.setUpDir([0, 1, 0], [Math.sin(this.angle), 0, Math.cos(this.angle)]);
                this.phyObj.updateFromTransform();
            }

            if (this.state == ActorState.MOVE)
            {
                if (this.targetPos)
                {
                    var targetDir = [Math.sin(this.targetAngle), Math.cos(this.targetAngle)];
                    var targetDirPos = [this.targetPos[0] - this.transform.pos[0],  this.targetPos[2] - this.transform.pos[2]];

                    if (vec2.dot(targetDir, targetDirPos) <= 0)
                    {
                        //moveDelta = disTarget;
                        this.targetPos = null;
                        this.phyObj.setVelocity(0, 0, 0);
                        this.stand();
                    }
                    else
                    {
                        this.phyObj.setVelocity(this.speed * targetDir[0], 0, this.speed * targetDir[1]);
                    }
                }

                //this.transform.updateMatrix();
            }
            else
            {
                this.phyObj.setVelocity(0, 0, 0);
            }
            Actor.prototype.update.call(this, deltaTime);
        };

        Npc.prototype.faceTo = function(dirOrAngle)
        {
            if (typeof dirOrAngle != "number")
            {
                dirOrAngle = Math.atan2(dirOrAngle[0], dirOrAngle[2]);
            }
            this.targetAngle = Utils.normalizeAngle(dirOrAngle);
        };

        Npc.prototype.moveTo = function(pos)
        {
            if (vec3.distance(this.transform.pos, pos) < 1e-6)
            {
                this.targetPos = null;
                if (this.state == ActorState.MOVE)
                {
                    this.stand();
                }
            }
            else
            {
                this.faceTo([pos[0] - this.transform.pos[0], 0, pos[2] - this.transform.pos[2]]);
                this.walk();
                this.targetPos = vec3.clone(pos);
            }
        };

        return Npc;
    }
);