define(
    function()
    {
        "use strict";

        var Keyboard =
        {
            KeyCodes : {
                BackSpace : 8,
                Tab : 9,
                Enter : 13,
                Shift : 16,
                Ctrl : 17,
                Alt : 18,
                Pause : 19,
                CapsLock : 20,
                Escape : 27,
                Space : 32,
                PageUp : 33,
                PageDown : 34,
                End : 35,
                Home : 36,
                Left : 37,
                Up : 38,
                Right : 39,
                Down : 40,
                Insert : 45,
                Delete : 46,
                0 : 48,
                1 : 49,
                2 : 50,
                3 : 51,
                4 : 52,
                5 : 53,
                6 : 54,
                7 : 55,
                8 : 56,
                9 : 57,
                A : 65,
                B : 66,
                C : 67,
                D : 68,
                E : 69,
                F : 70,
                G : 71,
                H : 72,
                I : 73,
                J : 74,
                K : 75,
                L : 76,
                M : 77,
                N : 78,
                O : 79,
                P : 80,
                Q : 81,
                R : 82,
                S : 83,
                T : 84,
                U : 85,
                V : 86,
                W : 87,
                X : 88,
                Y : 89,
                Z : 90,
                LeftWin : 91,
                RightWin : 92,
                Select : 93,
                Numpad0 : 96,
                Numpad1 : 97,
                Numpad2 : 98,
                Numpad3 : 99,
                Numpad4 : 100,
                Numpad5 : 101,
                Numpad6 : 102,
                Numpad7 : 103,
                Numpad8 : 104,
                Numpad9 : 105,
                NumpadMultiply : 106,
                NumpadAdd : 107,
                NumpadSubtract : 109,
                NumpadDot : 110,
                NumpadDivide : 111,
                F1 : 112,
                F2 : 113,
                F3 : 114,
                F4 : 115,
                F5 : 116,
                F6 : 117,
                F7 : 118,
                F8 : 119,
                F9 : 120,
                F10 : 121,
                F11 : 122,
                F12 : 123,
                NumLock : 144,
                ScrollLock : 145,
                SemiColon : 186,
                EqualSign : 187,
                Comma : 188,
                Dash : 189,
                Period : 190,
                ForwardSlash : 191,
                GraveAccent : 192,
                OpenBracket : 219,
                BackSlash : 220,
                CloseBraket : 221,
                SinglEquote : 222
            },
            KeyNames : [],

            keyPressed : [],
            keyJustPressed : [],
            keyJustReleased : [],

            init : function()
            {
                for (var key in this.KeyCodes)
                {
                    if (this.KeyCodes.hasOwnProperty(key))
                    {
                        this.KeyNames[this.KeyCodes[key]] = key;
                    }
                }

                document.onkeydown = function(event)
                {
                    event = event || window.event;
                    var keyCode = event.which || event.keyCode;
                    Keyboard.onKeyDown(keyCode, event);
                };
                document.onkeyup = function(event)
                {
                    event = event || window.event;
                    var keyCode = event.which || event.keyCode;
                    Keyboard.onKeyUp(keyCode, event);
                };

            },

            reset : function()
            {
                this.keyPressed.length = 0;
                this.keyJustPressed.length = 0;
                this.keyJustReleased.length = 0;
            },

            beginFrame : function()
            {

            },

            endFrame : function()
            {
                this.keyJustPressed.length = 0;
                this.keyJustReleased.length = 0;
            },

            onKeyDown : function(key)
            {
                if (!this.keyPressed[key])
                    this.keyJustPressed[key] = true;
                this.keyPressed[key] = true;
            },

            onKeyUp : function(key)
            {
                if (this.keyPressed[key])
                    this.keyJustReleased[key] = true;
                this.keyPressed[key] = false;
            },

            isKeyPressed : function(codeOrName)
            {
                if (typeof codeOrName == "string")
                    codeOrName = this.KeyCodes[codeOrName];
                if (!codeOrName)
                    return false;
                return this.keyPressed[codeOrName];
            },

            isKeyJustPressed : function(codeOrName)
            {
                if (typeof codeOrName == "string")
                    codeOrName = this.KeyCodes[codeOrName];
                if (!codeOrName)
                    return false;
                return this.keyJustPressed[codeOrName];
            },

            isKeyJustReleased : function(codeOrName)
            {
                if (typeof codeOrName == "string")
                    codeOrName = this.KeyCodes[codeOrName];
                if (!codeOrName)
                    return false;
                return this.keyJustReleased[codeOrName];
            }
        };

        return Keyboard;
    }
);