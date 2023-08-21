function Icosahedron() {
    this.position = vec3.create();
    this.velocity = vec3.fromValues(0, 0, 0);
    this.mass = 1.0;

    const t = (1.0 + Math.sqrt(5.0)) / 2.0;

    this.vertices = [vec3.fromValues(-1.0, t, 0.0),
        vec3.fromValues(1.0, t, 0.0),
        vec3.fromValues(-1.0, -t, 0.0),
        vec3.fromValues(1.0, -t, 0.0),
        vec3.fromValues(0.0, -1.0, t),
        vec3.fromValues(0.0, 1.0, t),
        vec3.fromValues(0.0, -1.0, -t),
        vec3.fromValues(0.0, 1.0, -t),
        vec3.fromValues(t, 0.0, -1.0),
        vec3.fromValues(t, 0.0, 1.0),
        vec3.fromValues(-t, 0.0, -1.0),
        vec3.fromValues(-t, 0.0, 1.0)
    ];

    this.vertices.forEach((x) => vec3.normalize(x, x));

    this.faces = [vec3.fromValues(0, 11, 5),
        vec3.fromValues(0, 5, 1),
        vec3.fromValues(0, 1, 7),
        vec3.fromValues(0, 7, 10),
        vec3.fromValues(0, 10, 11),
        vec3.fromValues(1, 5, 9),
        vec3.fromValues(5, 11, 4),
        vec3.fromValues(11, 10, 2),
        vec3.fromValues(10, 7, 6),
        vec3.fromValues(7, 1, 8),
        vec3.fromValues(3, 9, 4),
        vec3.fromValues(3, 4, 2),
        vec3.fromValues(3, 2, 6),
        vec3.fromValues(3, 6, 8),
        vec3.fromValues(3, 8, 9),
        vec3.fromValues(4, 9, 5),
        vec3.fromValues(2, 4, 11),
        vec3.fromValues(6, 2, 10),
        vec3.fromValues(8, 6, 7),
        vec3.fromValues(9, 8, 1)
    ];

    this.baseColor = vec4.fromValues(0.460, 0.758, 0.484, 1.0);
    this.modelMatrix = mat4.create();
    // mat4.translate(this.modelMatrix, this.modelMatrix, vec3.fromValues(3.0, 0.0, 0.0));
}

Icosahedron.prototype.setInitialPosition = function(p) {
    this.position = p;
}

Icosahedron.prototype.setInitialVelocity = function(v) {
    this.velocity = v;
}

Icosahedron.prototype.setglContext = function(gl) {
    this.glContext = gl;
}

Icosahedron.prototype.setModelMatrix = function(m) {
    this.modelMatrix = m;
}

Icosahedron.prototype.setColor = function(c) {
    this.baseColor = c;
}

Icosahedron.prototype.tick = function(force, t) {
    let a = vec3.create();
    vec3.scale(a, force, (1.0/this.mass) * t);
    vec3.add(this.velocity, this.velocity, a);

    let v = vec3.create();
    vec3.scale(v, this.velocity, t);
    vec3.add(this.position, this.position, v);
}

Icosahedron.prototype.getPosition = function() {
    return this.position;
}

Icosahedron.prototype.create = function() {
    const positionBuffer = this.glContext.createBuffer();
    const normalBuffer = this.glContext.createBuffer();
    const indexBuffer = this.glContext.createBuffer();
    const colorBuffer = this.glContext.createBuffer();

    ver = [];
    nor = [];
    ind = [];
    col = [];

    let count = 0;
    this.faces.forEach((f) => {
        const v1 = this.vertices[f[0]];
        const v2 = this.vertices[f[1]];
        const v3 = this.vertices[f[2]];

        let normal = vec3.create();
        vec3.add(normal, v1, v2);
        vec3.add(normal, normal, v3);
        vec3.scale(normal, normal, 1.0/3.0);

        let color = vec4.create();
        color[0] = this.baseColor[0] + (Math.random() * 0.2 - 0.1);
        color[1] = this.baseColor[1] + (Math.random() * 0.2 - 0.1);
        color[2] = this.baseColor[2] + (Math.random() * 0.2 - 0.1);
        color[3] = this.baseColor[3];

        ver.push(v1[0], v1[1], v1[2], v2[0], v2[1], v2[2], v3[0], v3[1], v3[2]);
        for (let i = 0; i < 3; i++) {
            nor.push(normal[0], normal[1], normal[2]);
            col.push(color[0], color[1], color[2], color[3]);
        }
        ind.push(count, count + 1, count + 2);
        count += 3;
    })

    this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, positionBuffer);
    this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Float32Array(ver), this.glContext.STATIC_DRAW);

    this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, normalBuffer);
    this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Float32Array(nor), this.glContext.STATIC_DRAW);

    this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, colorBuffer);
    this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Float32Array(col), this.glContext.STATIC_DRAW);

    this.glContext.bindBuffer(this.glContext.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.glContext.bufferData(this.glContext.ELEMENT_ARRAY_BUFFER, new Int16Array(ind), this.glContext.STATIC_DRAW);

    console.log(positionBuffer);
    console.log(normalBuffer);
    console.log(colorBuffer);
    console.log(indexBuffer);

    this.buffers = {
        position: positionBuffer,
        normal: normalBuffer,
        color: colorBuffer,
        indices: indexBuffer,
        nDrawCount: this.faces.length * 3
    };
}

Icosahedron.prototype.draw = function(shaderProgram) {
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

    this.glContext.bindBuffer(this.glContext.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
    this.glContext.drawElements(this.glContext.TRIANGLES, this.buffers.nDrawCount, this.glContext.UNSIGNED_SHORT, 0);
}

Icosahedron.prototype.subdivide = function() {
    let verticesTemp = [];
    let facesTemp = [];

    let count = 0;
    this.faces.forEach((f) => {
        const v1 = this.vertices[f[0]];
        const v2 = this.vertices[f[1]];
        const v3 = this.vertices[f[2]];
        let v4 = vec3.create();
        let v5 = vec3.create();
        let v6 = vec3.create();

        vec3.add(v4, v1, v2);
        vec3.add(v5, v2, v3);
        vec3.add(v6, v1, v3);
        vec3.scale(v4, v4, 0.5);
        vec3.scale(v5, v5, 0.5);
        vec3.scale(v6, v6, 0.5);

        vec3.normalize(v4, v4);
        vec3.normalize(v5, v5);
        vec3.normalize(v6, v6);

        const face1 = vec3.fromValues(count, count + 3, count + 5);
        const face2 = vec3.fromValues(count + 3, count + 1, count + 4);
        const face3 = vec3.fromValues(count + 4, count + 2, count + 5);
        const face4 = vec3.fromValues(count + 3, count + 4, count + 5);

        count += 6;
        
        verticesTemp.push(v1, v2, v3, v4, v5, v6);
        facesTemp.push(face1, face2, face3, face4);
    });

    this.vertices = verticesTemp;
    this.faces = facesTemp;
    this.create();
}

Icosahedron.prototype.distanceTo = function(p) {
    let diff = vec3.create();
    vec3.subtract(diff, this.position, p);
    return vec3.length(diff);
}

Icosahedron.prototype.setMass= function (m) {
    this.mass = m;
}

Icosahedron.prototype.getMass = function() {
    return this.mass;
}