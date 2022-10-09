/**
 * Crearted by ych
 * Date: 13-7-14
 * Time: 下午9:18
 */
define(
    ["./filemanager", "../common/domutils", "../common/utils"],
    function(FileManager, DomUtils, Utils)
    {
        "use strict";

        var TextFileManager = new FileManager();

        TextFileManager.doLoadFile = function(name)
        {
            var xhttp = DomUtils.createXmlHttp();
            xhttp.open("GET", name, false);
            xhttp.send();
            if (xhttp.status > 200)
            {
                alert("File open error:" + name + "\n" + xhttp.statusText);
                return null;
            }

            var file = new FileManager.Item();
            file.content = xhttp.responseText;
            if (!file.content)
                return null;
            this.onFileReady(file);
            return file;
        };

        TextFileManager.doLoadFileAsync = function(name, onCompleted)
        {
            var xhttp = DomUtils.createXmlHttp();
            xhttp.open("GET", name, true);
            xhttp.onload = function() {
                var file = new FileManager.Item();
                file.content = xhttp.responseText;
                onCompleted(file, name);
            }

            xhttp.onerror = function() {
                alert("File open error:" + name + "\n" + xhttp.statusText);
                onCompleted(null, name)
            }

            xhttp.send();
        };

        // return content, if failed return empty string
        TextFileManager.simpleLoad = function(name)
        {
            var file = this.loadFile(name);
            if (!file)
                return "";
            else
                return file.content;

        };

        TextFileManager.loadFileWithInclude = function()
        {
            var fileHistory = {};
            var recursionDepth = 0;
            return function(filename, baseDir)
            {
                baseDir = baseDir || "";
                if (fileHistory[filename])
                {
                    //alert("Loop include :" + filename);
                    // return "";
                }

                recursionDepth++;

                fileHistory[filename] = true;

                var plainContent = this.simpleLoad(filename);
                //return plainContent;
                var lines = plainContent.split("\n");
                var newContent = "";
                for (var i = 0; i < lines.length; i++)
                {
                    var match = null;
                    var trimed = Utils.trimString(lines[i]);
                    if (trimed.charAt(0) == "#")
                        match = trimed.match(/#include\s*[<"](.+)[>"]/);
                    if (match && match[1])
                    {
                        newContent += this.loadFileWithInclude(baseDir + match[1], baseDir);
                    }
                    else
                    {
                        newContent += trimed;
                    }
                    newContent += "\n";
                }
                recursionDepth--;
                if (recursionDepth == 0)
                    fileHistory = {};
                return newContent;
            }
        }();

        TextFileManager.loadXML = function(name)
        {
            var content = TextFileManager.simpleLoad(name);
            var xml = null;
            try
            {
                var parser = new DOMParser();
                xml = parser.parseFromString(content, "text/xml");
            }
            catch (e)
            {
                alert(e.message);
            }
            return xml;
        };

        return TextFileManager;
    }
);