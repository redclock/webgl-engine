/**
 * Crearted by ych
 * Date: 13-7-29
 * Time: 上午9:34
 */
define(
    ["engine/common/config", "engine/core/engine"],
    function(config, Engine)
    {
        "use strict";

        var ui = {};

        var profileDoms = {};

        var game;

        var profileGrid = document.getElementById("profileGrid");


        var staticDiv = {
            drawcall : document.getElementById("drawcount"),
            mesh : document.getElementById("meshcount"),
            triangle : document.getElementById("trianglecount")
        };

        var fpsDiv = document.getElementById("fps");

        ui.init = function(g)
        {
            game = g;
            var profileDiv = document.getElementById("profile");
            if (profileDiv)
            {
                addProfileItem(profileDiv, "RenderActor", true);
                addProfileItem(profileDiv, "RenderWall", true);
                addProfileItem(profileDiv, "RenderNormal", true);
                addProfileItem(profileDiv, "RenderReflect", true);
                addProfileItem(profileDiv, "RenderParticle", true);
                addProfileItem(profileDiv, "RenderDebug", false);

                addProfileItem(profileDiv, "UpdateActor", true);
                addProfileItem(profileDiv, "UpdateEngine", true);
            }

            setupButton("fire1", function() {game.fire([0, 255, 0, 255], 0.1, [255, 0, 0, 0], 0.5)});
            setupButton("fire2", function() {game.fire([255, 255, 0, 255], 0.5, [0, 0, 255, 0], 0.1)});

        };

        ui.update = function()
        {
            if (Engine.frameCountFPS == 1)
            {
                for (var statName in profileDoms)
                {
                    if (profileDoms.hasOwnProperty(statName))
                    {
                        var stat = Engine.getStat(statName);
                        profileDoms[statName].data = (stat / Engine.FPS).toFixed(2);// / engine.frameCount;
                    }
                }
                Engine.clearStat();

                var fps = "FPS:" + engine.FPS;
                fps += vec3.ToString(game.camera.pos);
                fpsDiv.innerText = fps;
                staticDiv.drawcall.innerText = engine.statistics.drawCall.toString();
                staticDiv.mesh.innerText = engine.statistics.meshes.toString();
                staticDiv.triangle.innerText = engine.statistics.triangles.toString();
            }

        };

        var addProfileItem = function(p, name, value)
        {
            game.profile[name] = value;
            var labelDiv = document.createElement("div");
            labelDiv.className = "itemLabel";

            labelDiv.appendChild(document.createTextNode(name));
            var checkBox = document.createElement("input");
            checkBox.type = "checkbox";
            checkBox.checked = value ?  "checked" : undefined;
            checkBox.addEventListener("change",
                function() { game.profile[name] = !!checkBox.checked });

            var contentDiv = document.createElement("div");
            contentDiv.className = "itemContent";
            contentDiv.appendChild(checkBox);
            var label = document.createTextNode("aa");
            profileDoms[name] = label;

            contentDiv.appendChild(label);
            p.appendChild(labelDiv);
            p.appendChild(contentDiv);
        };

        var setupButton = function(id, func)
        {
            var div = document.getElementById(id);
            if (!div)
                return;

            if (config.isiOS)
            {
                div.addEventListener("touchstart",
                    function(event)
                    {
                        func();
                        event.preventDefault();
                    });
            }
            else
            {
                div.addEventListener("click",
                    function(event)
                    {
                        func();
                        event.preventDefault();
                    });
            }
        };

        ui.showProfile = function(show)
        {
            if (show)
            {
                profileGrid.style.display = "block";
            }
            else
            {
                profileGrid.style.display = "none";
            }
        };

        return ui;

    }
);    