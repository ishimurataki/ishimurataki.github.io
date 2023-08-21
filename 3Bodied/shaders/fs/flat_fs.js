const flat_fs = `
        precision mediump float;
        uniform vec4 uColor;
        uniform vec4 uPointLightPos;

        void main() {
            gl_FragColor = uColor;
        }
    `;