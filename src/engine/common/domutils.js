/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 下午3:02
 */

define(
    function()
    {
        "use strict";

        var DomUtils =
        {

        };

        DomUtils.mousePosFromEvent = function(ev)
        {
            if (ev.offsetX || ev.offsetY)
            {
                return {x : ev.offsetX, y : ev.offsetY};
            }
            if (ev.layerX || ev.layerY)
            {
                return {x : ev.layerX, y : ev.layerY};
            }
            return { x : ev.pageX - ev.target.offsetLeft, y : ev.pageY - ev.target.offsetTop };
        };

// function handleFunc(delta)
        DomUtils.setWheelEvent = function(obj, handleFunc)
        {
            var wheel = function(event)
            {
                var delta = 0;
                if (!event) event = window.event;
                if (event.wheelDelta)
                {
                    delta = event.wheelDelta / 120;
                }
                else if (event.detail)
                {
                    delta = -event.detail / 3;
                }
                var pos = DomUtils.mousePosFromEvent(event);

                if (delta)
                {
                    handleFunc(pos, delta, event);
                }
                if (event.preventDefault)
                    event.preventDefault();
                event.returnValue = false;
            };

            /* Initialization code. */
            if (obj.addEventListener)
                obj.addEventListener('DOMMouseScroll', wheel, false);
            obj.onmousewheel = wheel;
        };

        DomUtils.getTextFromElement = function(id)
        {
            var node = document.getElementById(id);
            if (!node)
            {
                return "";
            }

            var str = "";
            var k = node.firstChild;
            while (k)
            {
                if (k.nodeType == 3)
                {
                    str += k.textContent;
                }
                k = k.nextSibling;
            }
            return str;
        };

        DomUtils.createXmlHttp = function()
        {
            if (window.XMLHttpRequest)
            {
                return new XMLHttpRequest();
            }
            else
            {
                return ActiveXObject("Microsoft.XMLHTTP");
            }
        };

        return DomUtils;
    }
);