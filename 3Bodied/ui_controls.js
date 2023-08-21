const registerControls = canvas => {

    const rad = 0.1;
    const keyDownHandler = (event) => {
        if (event.keyCode == 65) {
            camera.rotateTheta(-rad);
        } else if (event.keyCode == 68) {
            camera.rotateTheta(rad);
        } else if (event.keyCode == 87) {
            camera.rotatePhi(rad);
        } else if (event.keyCode == 83) {
            camera.rotatePhi(-rad);
        } else if (event.keyCode == 82) {
            camera.reset();
        } else if (event.keyCode == 80) {
            camera.debug();
        }
     }

    let isClicked = false;
    const movementSpeed = 0.001;
    const moveHandler = e => {
        if (isClicked) {
            let xMove = e.movementX * movementSpeed;
            let yMove = e.movementY * movementSpeed;
            camera.rotateTheta(xMove);
            camera.rotatePhi(yMove);
        }
    }

    const zoomSpeed = 0.008;
    const mousewheelHandler = e => {
        e.preventDefault();
        let zoom = e.deltaY * zoomSpeed;
        camera.zoom(zoom);
    }

    document.addEventListener('keydown', keyDownHandler, false);
    canvas.addEventListener('mousedown', e => { isClicked = true; }, false);
    canvas.addEventListener('mouseup', e => { isClicked = false; }, false);
    canvas.addEventListener('mousemove', moveHandler, false);
    canvas.addEventListener('mousewheel', mousewheelHandler, false);

    var xBefore, yBefore;
    var distBefore;
    const touchStartHandler = e => {
        e.preventDefault();
        if (e.touches.length == 1) {
            xBefore = e.touches[0].clientX;
            yBefore = e.touches[0].clientY;
        } else if (e.touches.length > 1) {
            let x = e.touches[0].clientX - e.touches[1].clientX;
            let y = e.touches[0].clientY - e.touches[1].clientY;

            x *= x;
            y *= y;

            distBefore = Math.sqrt(x + y);
        }
    }
    const touchMoveHandler = e => {
        e.preventDefault();
        if (e.touches.length == 1) {
            let xMove = (e.touches[0].clientX - xBefore) * movementSpeed;
            let yMove = (e.touches[0].clientY - yBefore) * movementSpeed;
            camera.rotateTheta(xMove);
            camera.rotatePhi(yMove);
            xBefore = e.touches[0].clientX;
            yBefore = e.touches[0].clientY;
        } else if (e.touches.length > 1) {
            let x = e.touches[0].clientX - e.touches[1].clientX;
            let y = e.touches[0].clientY - e.touches[1].clientY;

            x *= x;
            y *= y;

            let distNow = Math.sqrt(x + y);
            let zoom = (distBefore - distNow) * zoomSpeed;
            camera.zoom(zoom);

            distBefore = distNow;
        }
    }

    canvas.addEventListener('touchstart', touchStartHandler, false);
    canvas.addEventListener('touchmove', touchMoveHandler, false);
}