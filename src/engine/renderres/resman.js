/**
 * Crearted by ych
 * Date: 13-7-14
 * Time: 下午10:40
 */

define(
    function()
    {
        "use strict";

        var resID = 100;

        var resTable = [];

        return {
            newResource : function(obj)
            {
                resID++;
                obj.resid = resID;
                resTable[resID] = obj;
            },

            freeResource : function(obj)
            {
                obj.resid = resID;
                resTable[obj.resid] = undefined;
            },

            getResourceById : function(resid)
            {
                return resTable[resid];
            }
        };

    }
);