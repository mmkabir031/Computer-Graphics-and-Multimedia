"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: SkyBoxDemo
 */
var gl;

var pointsArray = [];

var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);

var fovy = 37;
var near = 0.1;
var far = 100;
var radius = 10;

const at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var eye = vec3(0, 0, radius);

var modelViewMatrix;
var modelViewMatrixLoc;
var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var fovy = 37;
var near = 0.1;
var far = 100;
var radius = 10;
var skyboxScale = 60;

var theta = 0.0;
var phi = 0.0;

var cubeMap;
var cubeFrontImage;
var cubeBackImage;
var cubeTopImage;
var cubeBottomImage;
var cubeLeftImage;
var cubeRightImage;

var spherePoints = 0;
var cubePoints = 0;

var trackingMouse = false;
var curx = 0;
var cury = 0;
window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // enable depth testing and polygon offset
    // so lines will be in front of filled triangles

    gl.enable(gl.DEPTH_TEST);

    tetrahedron(va, vb, vc, vd, 5);
    spherePoints = pointsArray.length;
    cube();
    cubePoints = pointsArray.length - spherePoints;
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    var vBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    var projectionMatrix = perspective(fovy, 1.0, near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    cubeFrontImage = document.getElementById("cubefront");
    cubeBackImage = document.getElementById("cubeback");
    cubeTopImage = document.getElementById("cubetop");
    cubeBottomImage = document.getElementById("cubebottom");
    cubeLeftImage = document.getElementById("cubeleft");
    cubeRightImage = document.getElementById("cuberight"); 
    configureCubeMap(cubeFrontImage, cubeBackImage, cubeTopImage,
        cubeBottomImage, cubeRightImage, cubeLeftImage);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);

    canvas.addEventListener("mousedown", function (event) {
        var x = 2 * event.clientX / canvas.width - 1;
        var y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
        startMotion(x, y);
    });

    canvas.addEventListener("mouseup", function (event) {
        var x = 2 * event.clientX / canvas.width - 1;
        var y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
        stopMotion(x, y);
    });

    canvas.addEventListener("mousemove", function (event) {
        var x = 2 * event.clientX / canvas.width - 1;
        var y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
        mouseMotion(x, y);
    });

    document.addEventListener("keydown",
        function (event) {
            if (event.keyCode == 65 || event.keyCode == 37) {   // A or Left
                theta += 0.01;
            }

            if (event.keyCode == 68 || event.keyCode == 39) {   // D or Right
                theta -= 0.01;
            }

            if (event.keyCode == 87 || event.keyCode == 38) {   // W or Up
                phi += 0.01;
            }

            if (event.keyCode == 83 || event.keyCode == 40) {   // S or Down
                phi -= 0.01;
            }

            if (event.keyCode == 33) {   // Page Up
                if (radius < 30) {
                    ++radius;
                }
            }

            if (event.keyCode == 34) {   // Page Down
                if (radius > 3) {
                    --radius;
                }
            }
        }, false);


    document.addEventListener("wheel",
        function (event) {
            var delta = Math.sign(event.deltaY);
            if (radius < 29 && delta > 0) {
                radius += 2;
            }
            if (radius == 29 && delta > 0) {
                radius += 1;
            }
            else if (radius > 4 && delta < 0) {
                radius -= 2;
            }
            else if (radius == 4 && delta < 0) {
                radius -= 1;
            }
        });
    render();
}
function mouseMotion(x, y) {
    if (trackingMouse) {
        theta += (x - curx);
        curx = x;
        phi += (cury - y);
        cury = y;
    }
}

function startMotion(x, y) {
    trackingMouse = true;
    curx = x;
    cury = y;
}

function stopMotion(x, y) {
    trackingMouse = false;
}


function configureCubeMap(frontImg, backImg, topImg, bottomImg, rightImg, leftImg) {

    cubeMap = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, rightImg);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, leftImg);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, topImg);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, bottomImg);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, frontImg);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, backImg);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
}

function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(5, 1, 2, 6);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);
}
function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function triangle(a, b, c) {
    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);
}

function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else {
        triangle(a, b, c);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (phi < 0)
        phi += 2 * Math.PI;
    if (phi > 2 * Math.PI)
        phi -= 2 * Math.PI;
    if (phi > Math.PI / 2 && phi < 3 * Math.PI / 2) {
        up = vec3(0.0, -1.0, 0.0);
    }
    else {
        up = vec3(0.0, 1.0, 0.0);
    }

    eye = vec3(radius * Math.cos(theta) * Math.cos(phi),
        radius * Math.sin(phi),
        radius * Math.sin(theta) * Math.cos(phi));
    modelViewMatrix = lookAt(eye, at, up);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, spherePoints);

    modelViewMatrix = mult(modelViewMatrix,
        scalem(skyboxScale, skyboxScale, skyboxScale));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.drawArrays(gl.TRIANGLES, spherePoints, cubePoints);


    requestAnimFrame(render);
}