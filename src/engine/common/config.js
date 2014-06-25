/**
 * Crearted by ych
 * Date: 13-4-1
 * Time: 下午3:49
 */


define(
    function()
    {
        "use strict";
        return {
            touchable : 'createTouch' in document,
            isiOS : function()
            {
                var ua = navigator.userAgent;
                return /iPad/i.test(ua) || /iPhone OS 3_1_2/i.test(ua) || /iPhone OS 3_2_2/i.test(ua);
            }(),
            maxBone : 35,
            texturePath : "res/images/",
            shaderPath : "res/shaders/",
            modelPath : "res/models/"
        };
    }
);
