function Cube() {
    this.baseColor = vec4.fromValues(0.460, 0.758, 0.484, 1.0);
    this.modelMatrix = mat4.create();
}

Cube.prototype.setglContext = function(gl) {
    this.glContext = gl;
}

Cube.prototype.setModelMatrix = function(m) {
    this.modelMatrix = m;
}

Cube.prototype.create = function() {
    const positionBuffer = this.glContext.createBuffer();
    this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, positionBuffer);

    const positions = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        
        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
        
        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,
        
        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        
        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,
        
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
      ];

    this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Float32Array(positions), this.glContext.STATIC_DRAW);

    const colorBuffer = this.glContext.createBuffer();
    this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, colorBuffer);

    const faceColors = [
        [1.0,  1.0,  1.0,  1.0],    // Front face: white
        [1.0,  0.0,  0.0,  1.0],    // Back face: red
        [0.0,  1.0,  0.0,  1.0],    // Top face: green
        [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
        [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
        [1.0,  0.0,  1.0,  1.0],    // Left face: purple
    ];

    let colors = [];

    for (let j = 0; j < faceColors.length; j++) {
        const c = faceColors[j];
        colors = colors.concat(c, c, c, c);
    }
    this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Float32Array(colors), this.glContext.STATIC_DRAW);
    
    const normalBuffer = this.glContext.createBuffer();
    this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, normalBuffer);

    const faceNormals = [
        [ 0.0,  0.0,  1.0],
        [ 0.0,  0.0, -1.0],
        [ 0.0,  1.0,  0.0],
        [ 0.0, -1.0,  0.0],
        [ 1.0,  0.0,  0.0],
        [-1.0,  0.0,  0.0]
    ];

    let normals = [];
    for (let j = 0; j < faceNormals.length; j++) {
        const n = faceNormals[j];
        normals = normals.concat(n, n, n, n);
    }
    this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Float32Array(normals), this.glContext.STATIC_DRAW);

    const indexBuffer = this.glContext.createBuffer();
    this.glContext.bindBuffer(this.glContext.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = [
        0, 1, 2,    0, 2, 3,
        4, 5, 6,    4, 6, 7,
        8, 9, 10,   8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23,
    ];

    this.glContext.bufferData(this.glContext.ELEMENT_ARRAY_BUFFER, new Int16Array(indices), this.glContext.STATIC_DRAW);

    this.buffers = {
        position: positionBuffer,
        color: colorBuffer,
        normal: normalBuffer,
        indices: indexBuffer,
        nDrawCount: 36
    };
}

Cube.prototype.draw = function (shaderProgram, color=null) {
    this.glContext.useProgram(shaderProgram.program);

    this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.buffers.position);
    this.glContext.vertexAttribPointer( shaderProgram.attribLocations.vertexPosition, 3, this.glContext.FLOAT, false, 0, 0);
    this.glContext.enableVertexAttribArray(shaderProgram.attribLocations.vertexPosition);

    this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.buffers.color);
    this.glContext.vertexAttribPointer(shaderProgram.attribLocations.vertexColor, 4, this.glContext.FLOAT, false, 0, 0);
    this.glContext.enableVertexAttribArray(shaderProgram.attribLocations.vertexColor);

    this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.buffers.normal);
    this.glContext.vertexAttribPointer(shaderProgram.attribLocations.vertexNormal, 3, this.glContext.FLOAT, false, 0, 0);
    this.glContext.enableVertexAttribArray(shaderProgram.attribLocations.vertexNormal);

    this.glContext.uniformMatrix4fv(shaderProgram.uniformLocations.modelMatrix, false, this.modelMatrix);
    if (color != null) {
        this.glContext.uniform4fv(shaderProgram.uniformLocations.boxColor, color);
    }

    this.glContext.bindBuffer(this.glContext.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
    this.glContext.drawElements(this.glContext.TRIANGLES, this.buffers.nDrawCount, this.glContext.UNSIGNED_SHORT, 0);
}