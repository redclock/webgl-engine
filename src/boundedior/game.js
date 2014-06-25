// Bound editor
var game = {
    showModel : true,
    showSphere : true,
    showAABB : false,
    showPlane : true
};

function createGround()
{
    var planeModel = new Model();
    planeModel.init();
    planeModel.addPlane({size : [30, 30, 0], texScale :[3, 3], texture : Texture.Manager.loadTexture("res/images/rock.png")});
    planeModel.ready = true;
    planeModel.recreate();

    var modelIns = new ModelIns();
    modelIns.init(planeModel);
    modelIns.transform.lookAt([0, 0, 0], [0, 0, 1], [0, 1, 0]);
    modelIns.setMaterial({ shader : game.shader});

    game.ground = modelIns;
}

function createSphereShader()
{
    var shader = new Shader();
    shader.loadFromFile("color-vs.txt", "color-fs.txt");
    shader.name = "sphere";
    shader.attColor = shader.getAttrib("aColor");
    shader.attPosition = shader.getAttrib("aPosition");
    shader.unifVP = shader.getUniform("matVP");
    return shader;
}

function createSphereMesh()
{
    var sphere = new SphereShape();
    var data = SphereShape.createData({widthSegments : 16, heightSegments : 16});
    sphere.numVert = data.position.length / 3;
    sphere.numIndex = data.indices.length;
    sphere.create(data);
    game.sphereMesh = sphere;
}


game.init = function()
{
    game.camera = new Camera({pos:[0, 3, -3], target:[0, 0, 0]});
    game.shader = Shader.createDiffuseShader();
    game.showModel = true;
    createGround();
    game.spheres = [{center : [0, 0, 0], radius : 0.5}];
    game.loadMesh("cat/aa.mesh.xml");
    game.lastPos = {x:0, y:0};
    game.sphereShader = createSphereShader();
    createSphereMesh();

};

game.onMouseMove = function(pos, event)
{
    //ball.left = pos.x;
    //ball.top = pos.y;
    if (Engine.paused)
        return;

    if (game.isdown)
    {
        game.camera.rotateRelative(
            (pos.x - game.lastPos.x) * 0.01,
            -(pos.y - game.lastPos.y) * 0.01);
        game.lastPos = pos;
    }
};

game.onMouseDown = function(pos, event)
{
//    var posTile = game.map.cursorToTilePos(pos.x, pos.y);
//    if (game.map.isValidTilePos(posTile.row, posTile.col))
//    {
//        game.map.tiles[posTile.row][posTile.col] = new Wall(posTile.col, posTile.row)
//    }
    if (Engine.paused)
        return;

    game.isdown = true;
    game.lastPos = pos;
    game.downPos = pos;
};

game.onMouseUp = function(pos, event)
{
    game.isdown = false;

};

game.onMouseWheel = function(pos, delta, event)
{
    //ball.left = pos.x;
    //ball.top = pos.y;
    if (Engine.paused)
        return;
    game.camera.zoom(delta);
};


game.handleKeyInput = function()
{

};

game.drawSpheres = function()
{
    var shader = game.sphereShader;
    shader.appear();

    game.sphereMesh.vb.bindAttribute([shader.attPosition]);
    game.sphereMesh.ib.appear();

    for (var i = 0; i < game.spheres.length; i++)
    {
        var sphere = game.spheres[i];
        var mat =[
            sphere.radius, 0, 0, 0,
            0, sphere.radius, 0, 0,
            0, 0, sphere.radius, 0,
            sphere.center[0], sphere.center[1], sphere.center[2], 1

        ];
        mat4.mul(mat, Engine.activeCamera.matViewProj, mat);
        gl.uniformMatrix4fv(shader.unifVP, false, mat);
        if (i != game.curSphere)
            gl.vertexAttrib4f(shader.attColor, 1, 0, 0, 0.3);
        else
            gl.vertexAttrib4f(shader.attColor, 1, 1, 0.2, 0.3);
        gl.drawElements(gl.TRIANGLES, game.sphereMesh.numIndex, gl.UNSIGNED_SHORT, 0);
    }
}

game.render = function()
{
    game.handleKeyInput();

    gl.depthMask(true);

    gl.clearColor(0.1, 0.5, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.depthFunc(gl.LESS);
    gl.depthRange(0, 1);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    Engine.activeCamera = game.camera;

    Engine.beforeRender();
    if (game.showPlane)
        game.ground.draw();

    if (game.showModel)
    {
        if (game.model)
            game.model.draw();
    }
    Engine.renderList();

    gl.depthMask(false);

    if (game.showSphere)
    {
        game.drawSpheres();
    }
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);


    gl.depthMask(false);
    SimpleDraw.beginDraw();
    SimpleDraw.setColor(255, 0, 0, 255);
    SimpleDraw.addLine(0, 0, 0, 10, 0, 0);
    SimpleDraw.setColor(0, 255, 0, 255);
    SimpleDraw.addLine(0, 0, 0, 0, 10, 0);
    SimpleDraw.setColor(0, 0, 255, 255);
    SimpleDraw.addLine(0, 0, 0, 0, 0, 10);

    if (game.showAABB && game.model)
    {
        SimpleDraw.setColor(100, 0, 200, 100);
        SimpleDraw.addAABB(game.model.aabb);
        SimpleDraw.setColor(255, 255, 200, 255);
        SimpleDraw.addAABB(game.model.aabb, true);
    }

    SimpleDraw.flush();

    SimpleDraw.setColor(0, 0, 255, 128);

    SimpleDraw.endDraw();

    gl.useProgram(null);


};

game.addSphere = function()
{
    var model = game.model.model;
    game.spheres.push({ center : vec3.clone(model.aabb.center), radius : vec3.len(model.aabb.extend) * 0.5 });
    game.updateSphereUI();
    game.curSphere = game.spheres.length - 1;
};

game.updateSphereUI = function()
{
    $("#sphereCount").text(game.spheres.length);
    var sel = $("#currentIndex").empty();

    for (var i = 0; i < game.spheres.length; i++)
    {
        if (game.curSphere != i)
            sel.append("<option value='" + i + "'>" + i + "</option>");
        else
            sel.append("<option value='" + i + "' selected='selected'>" + i + "</option>");
    }

    var selSphere = game.spheres[game.curSphere];
    if (selSphere)
    {
        $("#sphereX").val(selSphere.center[0]);
        $("#sphereY").val(selSphere.center[1]);
        $("#sphereZ").val(selSphere.center[2]);
        $("#sphereR").val(selSphere.radius);
        $("#sphereXLabel").text(selSphere.center[0].toFixed(2));
        $("#sphereYLabel").text(selSphere.center[1].toFixed(2));
        $("#sphereZLabel").text(selSphere.center[2].toFixed(2));
        $("#sphereRLabel").text(selSphere.radius.toFixed(2));
    }
};

game.loadMesh = function(filename)
{
    var model = new Model();
    model.init();

    model.load(GlobalSetting.modelPath + filename, null, {size:[1, 1, 1]});

    var modelIns = new ModelIns();
    modelIns.init(model);
    modelIns.setMaterial({ shader : game.shader});
    game.model = modelIns;
    model.aabb.completeCenterExt();
    $("#aabbmin").text(vec3ToString(model.aabb.mins));
    $("#aabbmax").text(vec3ToString(model.aabb.maxs));
    $("#aabbcenter").text(vec3ToString(model.aabb.center));
    $("#aabbextend").text(vec3ToString(model.aabb.extend));

    $("#sphereX").attr("min", model.aabb.mins[0]).attr("max", model.aabb.maxs[0]);
    $("#sphereY").attr("min", model.aabb.mins[1]).attr("max", model.aabb.maxs[1]);
    $("#sphereZ").attr("min", model.aabb.mins[2]).attr("max", model.aabb.maxs[2]);
    $("#sphereR").attr("min", 0).attr("max", 2);

    game.spheres.length = 0;
    game.addSphere();
};

game.onSliderChange = function(name, value)
{
    var v = parseFloat(value);
    $("#"+name+"Label").text(v.toFixed(2));
    var sphere = game.spheres[game.curSphere];
    if (!sphere)
        return;

    switch (name)
    {
        case "sphereX" :
            sphere.center[0] = v;
            break;
        case "sphereY" :
            sphere.center[1] = v;
            break;
        case "sphereZ" :
            sphere.center[2] = v;
            break;
        case "sphereR" :
            sphere.radius = v;
            break;

    }
};

game.foldGrid = function(gridHead)
{
    $('.gridContent', gridHead.parentNode).slideToggle("fast");
};

game.save = function()
{
    var data = {};


    var s = JSON.stringify(game.spheres);
    if (!AjaxFile.sendTextToServer("/savefile?filename=res/aaa.txt", s))
    {
        alert("save file err!");
    }
};

game.load = function()
{
    var text = AjaxFile.loadTextFile("res/aaa.txt");
    game.spheres = JSON.parse(text);
    game.updateSphereUI();
};

game.setSelected = function(index)
{
    game.curSphere = index;
    game.updateSphereUI();
};

