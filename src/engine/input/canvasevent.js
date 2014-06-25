/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 下午4:03
 */

define(
    ["../common/config", "../common/domutils"],
    function(config, DomUtils)
    {
        "use strict";

        return {
            bindCanvasEvent : function(canvas, listener)
            {
                var getTouchPos = function(touch)
                {
                    var canvas = touch.target;
                    var bbox = canvas.getBoundingClientRect();

                    return { x:(touch.clientX - bbox.left) * (canvas.width / bbox.width), y:(touch.clientY - bbox.top) * (canvas.height / bbox.height)};
                };


                if (config.isiOS)
                {
                    canvas.addEventListener("touchstart",
                        function(event)
                        {
                            var touch = event.touches[0];
                            if (!touch)
                                return;
                            touch.button = 0;
                            var pos = getTouchPos(touch);

                            if (listener.onMouseDown)
                                listener.onMouseDown(pos, touch);
                            event.preventDefault();
                        });
                    canvas.addEventListener("touchmove",
                        function(event)
                        {
                            var touch = event.touches[0];
                            if (!touch)
                                return;
                            touch.button = 0;
                            var pos = getTouchPos(touch);

                            if (listener.onMouseMove)
                                listener.onMouseMove(pos, touch);
                            event.preventDefault();
                        });
                    canvas.addEventListener("touchend",
                        function(event)
                        {
                            var touch = event.changedTouches[0];
                            if (!touch)
                                return;
                            touch.button = 0;
                            var pos = getTouchPos(touch);
                            if (listener.onMouseUp)
                                listener.onMouseUp(pos, touch);
                            event.preventDefault();
                        });
                }
                else
                {
                    canvas.addEventListener("mousemove",
                        function(event)
                        {
                            event = event || window.event;
                            var pos = DomUtils.mousePosFromEvent(event);
                            if (listener.onMouseMove)
                                listener.onMouseMove(pos, event);
                        });
                    canvas.addEventListener("mousedown",
                        function(event)
                        {
                            event = event || window.event;
                            var pos = DomUtils.mousePosFromEvent(event);
                            if (listener.onMouseDown)
                                listener.onMouseDown(pos, event);
                        });
                    canvas.addEventListener("mouseup",
                        function(event)
                        {
                            event = event || window.event;
                            var pos = DomUtils.mousePosFromEvent(event);
                            if (listener.onMouseUp)
                                listener.onMouseUp(pos, event);
                        });

                    DomUtils.setWheelEvent(canvas,
                        function(pos, delta, event)
                        {
                            listener.onMouseWheel(pos, delta, event);
                        });
                }
            }
        }
    }
);