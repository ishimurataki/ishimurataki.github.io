const plain_fs = `
        precision mediump float;
        uniform vec3 uPointLightPos;
        uniform vec4 uColor;

        varying lowp vec4 vColor;
        varying lowp vec4 vNorm;
        varying lowp vec3 vPos;

        void main() {
            vec3 lightDir = normalize(uPointLightPos - vPos);
            float diffuseTerm = 0.5*dot(normalize(vNorm.xyz), lightDir);

            diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);
            float ambientTerm = 0.7;
            float specularTerm = 0.5*max(pow(dot(lightDir, normalize(vNorm.xyz)), 5.0), 0.0);
            float lightIntensity = diffuseTerm + ambientTerm + specularTerm;

            gl_FragColor = vec4(lightIntensity*vColor.rgb, vColor.a);
        }
    `;