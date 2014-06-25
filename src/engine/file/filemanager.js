define(

    function()
    {
        "use strict";

        var FileManager = function()
        {
            this.fileMap = {};
        };

        FileManager.Item = function(name)
        {
            this.name = name;
            this.callbacks = [];
            this.ready = false;
            this.content = null;
        };

        FileManager.prototype.loadFile = function(name, owner, onLoadFunc)
        {
            var file;
            if (this.fileMap[name])
            {
                file = this.fileMap[name];
            }
            else
            {
                file = this.doLoadFile(name);
                if (!file)
                {
                    return file;
                }
                if (file)
                {
                    this.fileMap[name] = file;
                }
            }

            if (onLoadFunc)
            {
                if (file.ready)
                {
                    onLoadFunc.call(owner, file)
                }
                else
                {
                    file.callbacks.push({ owner:owner, func:onLoadFunc });
                }
            }
            return file;

        };

        FileManager.prototype.onFileReady = function(file)
        {
            file.ready = true;
            for (var i = 0; i < file.callbacks.length; i++)
            {
                file.callbacks[i].func.call(file.callbacks[i].owner, file);
            }
            file.callbacks.length = 0;
        };

        FileManager.prototype.doLoadFile = function()
        {
        };

        FileManager.prototype.clear = function()
        {
            this.fileMap = {};
        };

        return FileManager;
    }
);