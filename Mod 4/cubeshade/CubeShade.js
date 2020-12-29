"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: CubeShade
 */var canvas;
var gl;

var points = [];
var colors = [];

var axis = 1;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var theta = [0.0, 0.0, 0.0];
var thetaLoc;

var near = 0.1;
var far = 4;
var left = -3.0;
var right = 3.0;
var ytop = 3.0;
var bottom = -3.0;

var fovy = 120.0;

var transMatrix, transMatrixLoc;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var useBlackLoc;

var lightX = -4.0;
var lightY = 4.0;
var lightZ = 0.0;

var cubeX = 0.7;
var cubeY = 0.7;
var cubeZ = 0.0;

var vColor;

var eye, at, up;
var light;

var shadowMV;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    thetaLoc = gl.getUniformLocation(program, "theta");

    light = vec3(lightX, lightY, lightZ);

    // matrix for shadow projection
    shadowMV = mat4();
    shadowMV[3][3] = 0;
    shadowMV[3][1] = -1 / light[1];

    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.1, 1.0, 0.0);
    eye = vec3(-0.9, -1.0, 1.0);

    transMatrix = translate(cubeX, cubeY, cubeZ);
    transMatrixLoc = gl.getUniformLocation(program, "transMatrix");
    gl.uniformMatrix4fv(transMatrixLoc, false, flatten(transMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    useBlackLoc = gl.getUniformLocation(program, "useBlack");
    gl.uniform1i(useBlackLoc, false);

    document.getElementById("xRotate").onclick =
        function () {
            axis = xAxis;
        };

    document.getElementById("yRotate").onclick =
        function () {
            axis = yAxis;
        };

    document.getElementById("zRotate").onclick =
        function () {
            axis = zAxis;
        };

    render();
}

function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(5, 1, 2, 6);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
    var vertices = [
        vec4(-0.25, -0.25, 0.25, 1.0),
        vec4(-0.25, 0.25, 0.25, 1.0),
        vec4(0.25, 0.25, 0.25, 1.0),
        vec4(0.25, -0.25, 0.25, 1.0),
        vec4(-0.25, -0.25, -0.25, 1.0),
        vec4(-0.25, 0.25, -0.25, 1.0),
        vec4(0.25, 0.25, -0.25, 1.0),
        vec4(0.25, -0.25, -0.25, 1.0)
    ];

    var vertexColors = [
        [0.0, 1.0, 1.0, 1.0],  // cyan
        [0.0, 0.0, 0.0, 1.0],  // black
        [1.0, 0.0, 0.0, 1.0],  // red
        [1.0, 1.0, 0.0, 1.0],  // yellow
        [0.0, 1.0, 0.0, 1.0],  // green
        [1.0, 1.0, 1.0, 1.0],  // white
        [0.0, 0.0, 1.0, 1.0],  // blue
        [1.0, 0.0, 1.0, 1.0]   // magenta
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[c]);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);

    // model-view matrix for the square
    modelViewMatrix = lookAt(eye, at, up);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.uniform1i(useBlackLoc, false);

    gl.drawArrays(gl.TRIANGLES, 0, points.length);

    // model-view matrix for the shadow
    modelViewMatrix = mult(modelViewMatrix, translate(light[0], light[1], light[2]));
    modelViewMatrix = mult(modelViewMatrix, shadowMV);
    modelViewMatrix = mult(modelViewMatrix, translate(-light[0], -light[1], -light[2]));

    // send color and matrix for shadow
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.uniform1i(useBlackLoc, true);

    gl.drawArrays(gl.TRIANGLES, 0, points.length);

    requestAnimFrame(render);
}