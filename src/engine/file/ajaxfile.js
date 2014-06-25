/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 下午2:39
 */
define(
    ["../common/domutils"],
    function(DomUtils)
    {
        "use strict";

        //AJAX
        var AjaxFile = function()
        {
        };

        AjaxFile.loadXMLDoc = function(dname, async)
        {
            var xhttp = DomUtils.createXmlHttp();
            xhttp.open("GET", dname, async);
            xhttp.send();
            return xhttp.responseXML;
        };

        AjaxFile.loadTextFile = function(dname, async)
        {
            var xhttp = DomUtils.createXmlHttp();

            xhttp.open("GET", dname, async);
            xhttp.send();
            return xhttp.responseText;
        };

        AjaxFile.sendTextToServer = function(dname, text)
        {
            var xhttp = DomUtils.createXmlHttp();

            xhttp.open("POST", dname, false);
            xhttp.send(text);
            return xhttp.status == 200;
        };

        AjaxFile.sendBinaryToServer = function(dname, data)
        {
            var xhttp = DomUtils.createXmlHttp();

            xhttp.open("POST", dname, false);
            xhttp.send(data);
            return xhttp.status == 200;
        };


        return AjaxFile;

    }
);