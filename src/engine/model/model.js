define(

    ["../core/aabb" , "../file/modelloaderxml", "./shape"],
    function(AABB, ModelLoaderXML, Shape)
    {
        "use strict";

        var Model = function()
        {
        };

        Model.prototype.init = function()
        {
            this.meshes = [];
            this.aabb = new AABB();
            this.ready = false;
        };

        Model.prototype.load = function(filename, loader, opts)
        {
            this.modelData = loader.loadMesh(filename);
            if (!this.modelData)
            {
                alert("load model error!");
                return;
            }
            for (var i = 0; i < this.modelData.meshes.length; i++)
            {
                this.modelData.meshes[i].opts = opts || {};
                this.modelData.meshes[i].creator = Shape.Mesh;
            }
            this.ready = true;
            this.recreate();
        };

        Model.prototype.addCube = function(opts)
        {
            this.modelData = this.modelData || { meshes : [] };
            var meshData = {};
            Shape.copyData(meshData, Shape.Cube.Data);
            meshData.opts = opts || {};
            meshData.creator = Shape.Cube;
            this.modelData.meshes.push(meshData);
        };

        Model.prototype.addPlane = function(opts)
        {
            this.modelData = this.modelData || { meshes : [] };
            var meshData = {};
            Shape.copyData(meshData, Shape.Plane.Data);
            meshData.opts = opts || {};
            meshData.creator = Shape.Plane;
            this.modelData.meshes.push(meshData);
        };

        Model.prototype.addSphere = function(opts)
        {
            this.modelData = this.modelData || { meshes : [] };
            var meshData = Shape.Sphere.createData(opts);
            meshData.opts = opts || {};
            meshData.creator = Shape.Sphere;
            this.modelData.meshes.push(meshData);
        };

        Model.prototype.recreate = function()
        {
            if (!this.ready)
                return false;
            this.aabb.clear();
            for (var i = 0; i < this.modelData.meshes.length; i++)
            {
                var meshData = this.modelData.meshes[i];
                var mesh = new meshData.creator();

                mesh.numVert = meshData.position.length / 3;
                mesh.numIndex = meshData.indices.length;

                mesh.create(meshData, meshData.opts);
                mesh.texture = meshData.opts.texture || meshData.texture;
                this.meshes.push(mesh);
                this.aabb.mergeAABB(mesh.aabb);
            }
            return true;
        };

        return Model;
    }
);

