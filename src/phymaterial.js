/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-7-7
 * Time: 上午10:49
 * To change this template use File | Settings | File Templates.
 */

define(
    ["./engine/physics/physics"],
    function(PhysicsSystem)
    {
        return {
            materialNames : ["wall", "ball", "actor"],
            contactTable : [
                // friction, restitution,
                //wall          ball           actor
                [
                    [0.0, 0.0],  [0.5, 0.5], [0.0, 0.0]
                ],
                // wall
                [
                    [],          [0.5, 0.5], [0.4, 0.0]
                ],
                // ball
                [
                    [],          [],          [0.0, 0.0]
                ]   // actor
            ],

            materials : {},
            init : function()
            {
                var world = PhysicsSystem.world;
                var i, j;
                var materialCount = this.materialNames.length;
                var ms = [];
                for (i = 0; i < materialCount; i++)
                {
                    var m = new CANNON.Material(this.materialNames[i]);
                    this.materials[this.materialNames[i]] = m;
                    world.addMaterial(m);
                    ms.push(m);
                }

                for (i = 0; i < materialCount; i++)
                {
                    for (j = i; j < materialCount; j++)
                    {
                        var cm = new CANNON.ContactMaterial(ms[i], ms[j], this.contactTable[i][j][0], this.contactTable[i][j][1]);
                        world.addContactMaterial(cm);
                    }
                }

            }
        };



    }
);