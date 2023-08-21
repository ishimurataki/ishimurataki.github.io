const plain_vs = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
        attribute vec4 aVertexNormal;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uModelMatrix;

        varying lowp vec4 vColor;
        varying lowp vec4 vNorm;
        varying lowp vec3 vPos;

        void main() {
            vec4 world_pos = uModelMatrix * aVertexPosition;
            gl_Position = uProjectionMatrix * uModelViewMatrix * world_pos;
            vColor = aVertexColor;
            vNorm = aVertexNormal;
            vPos = world_pos.xyz;
        }
    `;