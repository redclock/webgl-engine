define(
    function()
    {
        return {
            MODEL       : 0x00001,

            MESH        : 0x00101,
            POSITIONS   : 0x00102,
            NORMALS     : 0x00103,
            COLORS      : 0x00104,
            TEXCOORD0   : 0x00105,
            TEXCOORD1   : 0x00106,
            TEXCOORD2   : 0x00107,
            TEXCOORD3   : 0x00108,
            BLENDWEIGHTS: 0x00109,
            INDICES     : 0x00110,

            SUBMESH     : 0x00121,
            BLENDINDICES: 0x00122,
            BONEMAP     : 0x00123,

            SKELETON    : 0x00201,
            BONE        : 0x00202,
            ANIMATION   : 0x00203,
            TRACK       : 0x00204,
            KEYFRAME    : 0x00205
        };

    }
);