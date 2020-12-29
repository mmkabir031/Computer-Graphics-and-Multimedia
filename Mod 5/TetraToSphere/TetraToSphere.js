"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: TetraToSphere
 */
var canvas;
var gl;

var index = 0;

var pointsArray = [];

var near = -10;
var far = 10;
var radius = 6.0;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

const at = vec3(0.0, 0.0, 0.0);

var up = vec3(0.0, 1.0, 0.0);
var eye;

var theta = 0.0;
var phi = 0.0;

var useBlackLoc;

var numTimesToSubdivide = 0;

var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);

var vBuffer;
window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);



    tetrahedron(va, vb, vc, vd, 0);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    useBlackLoc = gl.getUniformLocation(program, "useBlack");

    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));



    document.getElementById("increaseTheta").onclick =
        function () {
            theta += 0.1;
        };

    document.getElementById("decreaseTheta").onclick =
        function () {
            theta -= 0.1;
        };

    document.getElementById("increasePhi").onclick =
        function () {
            phi += 0.1;
        };

    document.getElementById("decreasePhi").onclick =
        function () {
            phi -= 0.1;
        };

    document.getElementById("increaseSubdivisions").onclick =
        function () {
            if (numTimesToSubdivide < 6) {
                ++numTimesToSubdivide;

                index = 0;
                pointsArray = [];

                tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
            }
        };

    document.getElementById("decreaseSubdivisions").onclick =
        function () {
            if (numTimesToSubdivide > 0) {
                --numTimesToSubdivide;

                index = 0;
                pointsArray = [];

                tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
            }
        };


    document.addEventListener("keydown",
        function (event) {

            if (event.keyCode == 37) {   // Left Arrow
                theta +=0.1
            }
            if (event.keyCode == 39) {   // Right Arrow
                theta -= 0.1
            }
            if (event.keyCode == 38) {   // Up Arrow
                phi -= 0.1
            }
            if (event.keyCode == 40) {   // Down Arrow
                phi -= 0.1
            }


        }, false);





    render();
}

function triangle(a, b, c) {
    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);
    index += 3;
}


function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = normalize(mix(a, b, 0.5), true);
        var ac = normalize(mix(a, c, 0.5), true);
        var bc = normalize(mix(b, c, 0.5), true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else { // draw tetrahedron at end of recursion
        triangle(a, b, c);
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (theta > 2 * Math.PI)
        theta -= 2 * Math.PI;
    if (theta < 0)
        theta += 2 * Math.PI;

    if (phi > 2 * Math.PI)
        phi -= 2 * Math.PI;
    if (phi < 0)
        phi += 2 * Math.PI;

    if (phi > Math.PI / 2 && phi < 3 * Math.PI / 2) {
        up = vec3(0.0, -1.0, 0.0);
    }
    else {
        up = vec3(0.0, 1.0, 0.0);
    }


    eye = vec3(radius * Math.sin(theta) * Math.cos(phi), radius * Math.sin(phi), radius * Math.cos(theta) * Math.cos(phi));


    modelViewMatrix = lookAt(eye, at, up);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.uniform1i(useBlackLoc, false);

    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);

    gl.uniform1i(useBlackLoc, true);

    for (var i = 0; i < index; i += 3)
        gl.drawArrays(gl.LINE_LOOP, i, 3);

    window.requestAnimFrame(render);
}