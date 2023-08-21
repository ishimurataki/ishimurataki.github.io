var mat4 = glMatrix.mat4;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;

class PolarCamera {
    constructor(width, height) {
        this.fovy = 45.0;
        this.width = width;
        this.height = height;
        this.nearClip = 0.1;
        this.farClip = 1000;
        this.eye = vec3.create();
        this.ref = vec3.fromValues(0.0, 0.0, 0.0);
        this.up = vec3.fromValues(0.0, 1.0, 0.0);

        this.theta = 0.7;         // theta ranges from 0 to 2pi
        this.phi = (1/20) * Math.PI;           // phi ranges from 0 to pi
        this.r = 27;
    }

    changeWidthHeight(w, h) {
        this.width = w;
        this.height = h;
    }

    getPosition() {
        return this.eye;
    }

    setRef(r) {
        this.ref = r;
    }

    getViewProj() {
        let projMatrix = this.getProjMatrix();
        let viewMatrix = this.getViewMatrix();
        let viewProjMatrix = mat4.create();

        mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);
        return viewProjMatrix;
    }

    getViewMatrix() {

        let viewMatrix = mat4.create();
        let t = this.r * Math.cos(this.phi);

        this.eye[0] = t * Math.cos(this.theta) + this.ref[0];
        this.eye[1] = this.r * Math.sin(this.phi) + this.ref[1]; 
        this.eye[2] = t * Math.sin(this.theta) + this.ref[2];

        mat4.lookAt(viewMatrix, this.eye, this.ref, this.up);
        return viewMatrix;
    }

    getProjMatrix() {
        var projMatrix = mat4.create();
        mat4.perspective(projMatrix, this.fovy, 
            this.width / this.height, 
            this.nearClip, this.farClip);
        return projMatrix;
    }

    rotateTheta(rad) 
    {
        this.theta += rad;
        this.theta %= 2 * Math.PI;
    }

    rotatePhi(rad) 
    {
        this.phi += rad;
        if (this.phi > (1/2) * Math.PI - 0.01) this.phi = (1/2) * Math.PI - 0.01;
        if (this.phi < (-1/2) * Math.PI + 0.01) this.phi = (-1/2) * Math.PI + 0.01;
    }

    zoom(amt) {
        this.r += amt * this.r * 0.1;
    }

    reset() {
        this.theta = 0;
        this.phi = (1/2) * Math.PI;
        this.r = 50;

        this.ref = vec3.fromValues(0.0, 0.0, 0.0);
        this.up = vec3.fromValues(0.0, 1.0, 0.0);
    }

    debug() {
        console.log('Eye: ' + this.eye);
        console.log('Look: ' + this.look);
        console.log('Up: ' + this.up);
        console.log('Right: ' + this.right);
    }
}