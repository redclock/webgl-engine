define(
    ["./binarystream", "./chunkflags"],
    function(BinaryStream, cf)
    {
        var Saver = function()
        {

        };

        var stream;
        Saver.prototype.saveModel = function(model)
        {
            stream = new BinaryStream();

            var chunk = new BinaryStream.Chunk();
            chunk.id = cf.MODEL;
            chunk.stream.writeInt(model.meshes.length);

            for (var i = 0; i < model.meshes.length; i++)
            {
                var mesh = model.modelData.meshes[i];
                var meshChunk = chunk.addChild();

                this.saveMesh(meshChunk, mesh);
            }
            stream.create
        }

        Saver.

    }
);