const camera = new PolarCamera(window.innerWidth, window.innerHeight);
const pointLightPos = vec3.fromValues(30, 0, 0);
const icosa1 = new Icosahedron();
const icosa2 = new Icosahedron();
const icosa3 = new Icosahedron();
const cube = new Cube();
const G_CONST = 1000.0;

let tailsOn = true;
let icosa1History = [];
let icosa2History = [];
let icosa3History = [];

let showMenu = false;
let isPaused = false;

const COLOR = {
    RED : vec4.fromValues(0.9, 0.1, 0.3, 1.0),
    BLUE: vec4.fromValues(0.1, 0.3, 0.9, 1.0),
    PURPLE: vec4.fromValues(0.4, 0.3, 0.7, 1.0),
    ORANGE: vec4.fromValues(1.0, 0.6, 0.1, 1.0),
    GREEN: vec4.fromValues(0.05, 0.9, 0.4, 1.0)
}

function main() {
    const canvas = document.querySelector("#glCanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const menuBtn = document.getElementById("menuBtn");
    const tailButton = document.getElementById("toggleTails");
    const refreshBtn = document.getElementById("refreshBtn")
    const pauseBtn = document.getElementById("pauseBtn");
    const playBtn = document.getElementById("playBtn");

    let gl = canvas.getContext("webgl");
    
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return; 
    }

    const vsSource = plain_vs;
    const fsSource = plain_fs;
    const flatvsSource = flat_vs;
    const flatfsSource = flat_fs;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const flatShaderProgram = initShaderProgram(gl, flatvsSource, flatfsSource);
    icosa1.setglContext(gl);
    icosa2.setglContext(gl);
    icosa3.setglContext(gl);
    cube.setglContext(gl);

    const programInfo = {
        lambShader: {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
                vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                lightPosition: gl.getUniformLocation(shaderProgram, 'uPointLightPos'),
                modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
                boxColor: gl.getUniformLocation(shaderProgram, 'uColor')
            }
        },
        flatShader: {
            program: flatShaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(flatShaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(flatShaderProgram, 'aVertexColor'),
                vertexNormal: gl.getAttribLocation(flatShaderProgram, 'aVertexNormal'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(flatShaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(flatShaderProgram, 'uModelViewMatrix'),
                lightPosition: gl.getUniformLocation(shaderProgram, 'uPointLightPos'),
                modelMatrix: gl.getUniformLocation(flatShaderProgram, 'uModelMatrix'),
                boxColor: gl.getUniformLocation(flatShaderProgram, 'uColor')
            }
        }
    };

    cube.create();
    icosa1.setColor(COLOR.RED);
    icosa2.setColor(COLOR.ORANGE);
    icosa3.setColor(COLOR.PURPLE);

    updateIcosaPosVel();
    updateMass();

    icosa1.create();
    icosa2.create();
    icosa3.create();

    icosa1.subdivide();
    icosa2.subdivide();
    icosa3.subdivide();

    tailButton.addEventListener("click", () => {
        tailsOn = !tailsOn;
        if (!tailsOn) {
            icosa1History = [];
            icosa2History = [];
            icosa3History = [];
        }
    })

    window.addEventListener('resize', () => {
        gl.canvas.width = window.innerWidth;
        gl.canvas.height = window.innerHeight;
        console.log("Height: " + window.innerHeight);
        console.log("Width: " + window.innerWidth);
        camera.changeWidthHeight(window.innerWidth, window.innerHeight);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    })

    menuBtn.addEventListener("click", () => {
        showMenu = !showMenu;
        const menu = document.getElementById("menuContents");
        if (showMenu) {
            menu.style.display = "inline-block";
            menuBtn.innerHTML = ">"
        } else {
            menu.style.display = "none";
            menuBtn.innerHTML = "<"
        }
    })

    refreshBtn.addEventListener("click", () => {
        isPaused = false;
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';

        updateIcosaPosVel();
        updateMass();

        icosa1History = [];
        icosa2History = [];
        icosa3History = [];
    })

    pauseBtn.addEventListener("click", () => {
        if (!isPaused) {
            isPaused = true;
            pauseBtn.style.display = 'none';
            playBtn.style.display = 'inline-block';
        }
    })

    playBtn.addEventListener("click", () => {
        if (isPaused) {
            isPaused = false;
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
        }
    })

    registerControls(canvas);

    var then = 0;
    function render(now) {
        now *= 0.001;
        const deltaTime = now - then;
        then = now;
        if (!isPaused) {
            tick(deltaTime);
        }
        drawScene(gl, programInfo, deltaTime);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function updateIcosaPosVel() {
    const pos1 = vec3.fromValues(parseFloat(document.getElementById("pos1X").value),
        parseFloat(document.getElementById("pos1Y").value),
        parseFloat(document.getElementById("pos1Z").value));
    
    const pos2 = vec3.fromValues(parseFloat(document.getElementById("pos2X").value),
        parseFloat(document.getElementById("pos2Y").value),
        parseFloat(document.getElementById("pos2Z").value));
    
    const pos3 = vec3.fromValues(parseFloat(document.getElementById("pos3X").value),
        parseFloat(document.getElementById("pos3Y").value),
        parseFloat(document.getElementById("pos3Z").value));

    const vel1 = vec3.fromValues(parseFloat(document.getElementById("vel1X").value),
        parseFloat(document.getElementById("vel1Y").value),
        parseFloat(document.getElementById("vel1Z").value));
    
    const vel2 = vec3.fromValues(parseFloat(document.getElementById("vel2X").value),
        parseFloat(document.getElementById("vel2Y").value),
        parseFloat(document.getElementById("vel2Z").value));
    
    const vel3 = vec3.fromValues(parseFloat(document.getElementById("vel3X").value),
        parseFloat(document.getElementById("vel3Y").value),
        parseFloat(document.getElementById("vel3Z").value));

    icosa1.setInitialPosition(pos1);
    icosa2.setInitialPosition(pos2);
    icosa3.setInitialPosition(pos3);

    icosa1.setInitialVelocity(vel1);
    icosa2.setInitialVelocity(vel2);
    icosa3.setInitialVelocity(vel3);
}

function updateMass() {
    const mass1 = parseFloat(document.getElementById("mass1").value);
    const mass2 = parseFloat(document.getElementById("mass2").value);
    const mass3 = parseFloat(document.getElementById("mass3").value);

    icosa1.setMass(mass1);
    icosa2.setMass(mass2);
    icosa3.setMass(mass3);
}

function tick(deltaTime) {

    let f1 = vec3.create();
    let f2 = vec3.create();
    let f3 = vec3.create();

    const p1 = icosa1.getPosition();
    const p2 = icosa2.getPosition();
    const p3 = icosa3.getPosition();

    if (tailsOn) {
        icosa1History.push(vec3.fromValues(p1[0], p1[1], p1[2]));
        icosa2History.push(vec3.fromValues(p2[0], p2[1], p2[2]));
        icosa3History.push(vec3.fromValues(p3[0], p3[1], p3[2]));
    }

    let center = vec3.create();
    vec3.add(center, p1, p2);
    vec3.add(center, center, p3);
    vec3.scale(center, center, 1.0/3.0);

    camera.setRef(center);

    const m1 = icosa1.getMass();
    const m2 = icosa2.getMass();
    const m3 = icosa3.getMass();

    const d12 = icosa1.distanceTo(p2);
    const d13 = icosa1.distanceTo(p3);
    const d23 = icosa2.distanceTo(p3);

    let f12 = G_CONST * m1 * m2 / (d12 * d12);
    let f13 = G_CONST * m1 * m3 / (d13 * d13);
    let f23 = G_CONST * m2 * m3 / (d23 * d23);

    f12 = (f12 > 200.0) ? 200.0 : f12;
    f13 = (f13 > 200.0) ? 200.0 : f13;
    f23 = (f13 > 200.0) ? 200.0 : f23;

    let dir1to2 = vec3.create();
    let dir1to3 = vec3.create();
    let dir2to3 = vec3.create();

    vec3.subtract(dir1to2, p2, p1);
    vec3.subtract(dir1to3, p3, p1);
    vec3.subtract(dir2to3, p3, p2);

    vec3.normalize(dir1to2, dir1to2);
    vec3.normalize(dir1to3, dir1to3);
    vec3.normalize(dir2to3, dir2to3);

    vec3.scale(dir1to2, dir1to2, f12);
    vec3.scale(dir1to3, dir1to3, f13);
    vec3.scale(dir2to3, dir2to3, f23);

    vec3.add(f1, dir1to2, dir1to3);
    vec3.scale(dir1to2, dir1to2, -1.0);
    vec3.add(f2, dir1to2, dir2to3);
    vec3.scale(dir1to3, dir1to3, -1.0);
    vec3.scale(dir2to3, dir2to3, -1.0);
    vec3.add(f3, dir1to3, dir2to3);

    icosa1.tick(f1, deltaTime);
    icosa2.tick(f2, deltaTime);
    icosa3.tick(f3, deltaTime);
}


function drawScene(gl, programInfo, deltaTime) {
    gl.clearColor(0.15, 0.15, 0.15, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let projectionMatrix = camera.getProjMatrix();
    let modelViewMatrix = camera.getViewMatrix();

    gl.useProgram(programInfo.lambShader.program);
    gl.uniformMatrix4fv(programInfo.lambShader.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.lambShader.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniform3fv(programInfo.lambShader.uniformLocations.lightPosition, pointLightPos);
    
    let modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, icosa1.getPosition());
    icosa1.setModelMatrix(modelMatrix);
    icosa1.draw(programInfo.lambShader);

    modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, icosa2.getPosition());
    icosa2.setModelMatrix(modelMatrix);
    icosa2.draw(programInfo.lambShader);

    modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, icosa3.getPosition());
    icosa3.setModelMatrix(modelMatrix);
    icosa3.draw(programInfo.lambShader);

    if (tailsOn) {
        let n = Math.min(icosa1History.length - 10, 500);
        let l = icosa1History.length;
        for (let i = 0; i < n; i++) {
            modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, icosa1History[l - i - 9]);
            mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(0.7, 0.7, 0.7));
            icosa1.setModelMatrix(modelMatrix);
            icosa1.draw(programInfo.lambShader);

            modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, icosa2History[l - i - 9]);
            mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(0.7, 0.7, 0.7));
            icosa2.setModelMatrix(modelMatrix);
            icosa2.draw(programInfo.lambShader);

            modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, icosa3History[l - i - 9]);
            mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(0.7, 0.7, 0.7));
            icosa3.setModelMatrix(modelMatrix);
            icosa3.draw(programInfo.lambShader);
        }
    }
    
    vec3.rotateY(pointLightPos, pointLightPos, vec4.fromValues(0,0,0), deltaTime);
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('Error encountered during shader compiling: ' + gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}


window.onload = main;