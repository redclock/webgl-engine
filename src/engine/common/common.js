/**
 *
 * @author yaochunhui
 */

function extend(Child, Parent)
{
    Child.prototype = new Parent();
    Child.prototype.constructor = Child;
    Child.parent = Parent.prototype;
}

/**
function objToString(obj, depth)
{
    depth = depth || 0;
    if (depth > 1)
        return "!OUT";

    if (obj == null)
        return "null";

    try
    {
        if (obj instanceof  Object)
        {
            var res = "{";
            for (var key in obj)
            {
                res += key.toString() + ":" + objToString(obj[key], depth + 1) + ",";
            }
            res += "}";
            return res;
        }
        else
        {
            return obj.toString();
        }
    }
    catch (err)
    {
        return "ERRPR"  + typeof obj;
    }

}
**/