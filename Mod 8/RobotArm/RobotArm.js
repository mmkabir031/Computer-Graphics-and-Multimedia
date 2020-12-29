"use strict";

/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: RobotArm
 */
var canvas;
var gl;

var NumVertices = 36;

var points = [];
var colors = [];

var ARM1_HEIGHT = 2.5;
var ARM1_WIDTH = 1.5;
var ARM2_HEIGHT = 2.5;
var ARM2_WIDTH = 1.5;
var ARM3_HEIGHT = 2.5;
var ARM3_WIDTH = 1.5;
var ARM4_HEIGHT = 2.5;
var ARM4_WIDTH1 = 0.5;
var ARM4_WIDTH2 = 1.7;

var drawColorLoc;
var redColor = vec4(1, 0, 0, 1);
var blueColor = vec4(0, 1, 0, 1);
var greenColor = vec4(0, 0, 1, 1);
var yellowColor = vec4(1, 1, 0, 1);

var arm1Theta = 0;
var arm2Theta = 1;
var arm3Theta = 2;
var arm4Scale = 1;

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

// RGBA colors
var vertexColors = [
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(1.0, 1.0, 1.0, 1.0),  // white
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];


// Parameters controlling the size of the Robot's arm
var BASE_HEIGHT = 2.0;
var BASE_WIDTH = 5.0;
var LOWER_ARM_HEIGHT = 5.0;
var LOWER_ARM_WIDTH = 0.5;
var UPPER_ARM_HEIGHT = 5.0;
var UPPER_ARM_WIDTH = 0.5;

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

var Base = 0;
var LowerArm = 1;
var UpperArm = 2;

// Array of rotation angles (in degrees) for each rotation axis

var theta = [0, 0, 0];

var angle = 0;

var modelViewMatrixLoc;

var vBuffer, cBuffer;

var yOff = 0.0;
var xOff = 0.0;

var isOrtho = true;
var fovy = 140;
var up = vec3(0.0, 1.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
var eye = vec3(0.0, 0.0, 0.0);

var near = 0.1;
var far = 40;
var left = -10;
var right = 10;
var ytop = 10;
var bottom = -10;
var radius = 4;

var projectionLoc;
var cameraMode = false;
var phi = 0;

//----------------------------------------------------------------------------

function quad(a, b, c, d) {
    colors.push(vertexColors[c]);
    points.push(vertices[a]);
    colors.push(vertexColors[c]);
    points.push(vertices[b]);
    colors.push(vertexColors[c]);
    points.push(vertices[c]);
    colors.push(vertexColors[c]);
    points.push(vertices[a]);
    colors.push(vertexColors[c]);
    points.push(vertices[c]);
    colors.push(vertexColors[c]);
    points.push(vertices[d]);
}


function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(5, 1, 2, 6);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

//____________________________________________

// Remmove when scale in MV.js supports scale matrices

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}


//--------------------------------------------------


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

    colorCube();

    // Load shaders and use the resulting shader program

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create and initialize  buffer objects

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    projectionLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMatrix));

   //Listeners for keystrokes

    document.addEventListener("keydown",
        function (event) {
            if (event.keyCode == 81) {   // Q
                theta[arm1Theta] += 5;

            }
            if (event.keyCode == 87) {   // W

                theta[arm1Theta] -= 5;

            }
            if (event.keyCode == 65) {   // A
                if (theta[arm2Theta] < 45) {
                    theta[arm2Theta] += 5;
                }
            }
            if (event.keyCode == 83) {   // S
                if (theta[arm2Theta] > -45) {
                    theta[arm2Theta] -= 5;
                }
            }
            if (event.keyCode == 88) {   // X
                if (theta[arm3Theta] > -45) {
                    theta[arm3Theta] -= 5;
                }
            }
            if (event.keyCode == 90) {   // Z
                if (theta[arm3Theta] < 45) {
                    theta[arm3Theta] += 5;
                }
            }
            if (event.keyCode >= 49 && event.keyCode <= 51) {   // 1, 2 or 3
                var whArm = event.keyCode - 49;
            }
            if (event.keyCode == 72) {   // H
                if (arm4Scale == 1) {
                    arm4Scale = 10;
                } else {
                    arm4Scale = 1;
                }
            }
            if (event.keyCode == 69) {   // E
                if (yOff < 10) {
                    yOff += 0.1;
                }
            }
            if (event.keyCode == 68) {   // D
                if (yOff > -10) {
                    yOff -= 0.1;
                }
            }
            if (event.keyCode == 82) {   // R
                if (xOff < 10) {
                    xOff += 0.1;
                }
            }
            if (event.keyCode == 84) {   // T
                if (xOff > -10) {
                    xOff -= 0.1;
                }
            }
            if (event.keyCode == 80) {   // P
                isOrtho = !isOrtho;

            }
            if (event.keyCode == 77) {   // M
                cameraMode = !cameraMode;
                if (cameraMode) {//1st person
                    phi = Math.PI / 2;
                } else {
                    phi = 0;
                }
            }
            if (event.keyCode == 37) {   // Left
                angle -= 0.1;
            }
            if (event.keyCode == 39) {   // Right
                angle += 0.1;
            }
            if (event.keyCode == 38) {   // Up
                radius *= 0.9;
                left *= 0.9;
                right *= 0.9;
                ytop *= 0.9;
                bottom *= 0.9;
            }
            if (event.keyCode == 40) {   // Down
                radius *= 1.1;
                left *= 1.1;
                right *= 1.1;
                ytop *= 1.1;
                bottom *= 1.1;
            }

        }, false);

    drawColorLoc = gl.getUniformLocation(program, "drawColor");

    render();
}

//----------------------------------------------------------------------------

function arm1() {
    var s = scalem(ARM1_WIDTH, ARM1_HEIGHT, ARM1_WIDTH);
    var instanceMatrix = mult(translate(0.0, 0.5 * -ARM1_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

//----------------------------------------------------------------------------

function arm2() {
    var s = scalem(ARM2_WIDTH, ARM2_HEIGHT, ARM2_WIDTH);
    var instanceMatrix = mult(translate(0.0, 0.5 * -ARM2_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

//----------------------------------------------------------------------------

function arm3() {
    var s = scalem(ARM3_WIDTH, ARM3_HEIGHT, ARM3_WIDTH);
    var instanceMatrix = mult(translate(0.0, 0.5 * -ARM3_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

//----------------------------------------------------------------------------

function arm4() {
    var s = scalem(ARM4_WIDTH1, ARM4_HEIGHT, ARM4_WIDTH2);
    var instanceMatrix = mult(translate(0.0, 0.5 * -ARM4_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

//----------------------------------------------------------------------------

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius * Math.sin(angle) * Math.cos(phi),
        radius * Math.sin(phi),
        radius * Math.cos(angle) * Math.cos(phi));

    if (isOrtho) {
        projectionMatrix = ortho(left, right, bottom, ytop, near, far);


    } else {
        projectionMatrix = perspective(fovy, 1.0, near, far);
    }


    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMatrix));

    modelViewMatrix = lookAt(eye, at, up);

    gl.uniform4fv(drawColorLoc, redColor);
    modelViewMatrix = mult(modelViewMatrix, translate(xOff, yOff, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[arm1Theta], 0, 0, 1));
    arm1();

    gl.uniform4fv(drawColorLoc, greenColor);
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, -ARM1_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[arm2Theta], 0, 0, 1));
    arm2();

    gl.uniform4fv(drawColorLoc, blueColor);
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, -ARM2_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[arm3Theta], 0, 0, 1));
    arm2();

    gl.uniform4fv(drawColorLoc, yellowColor);
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, -ARM3_HEIGHT / 2, 0.0));
    modelViewMatrix = mult(modelViewMatrix, scalem(arm4Scale, 1, 1));
    arm4();

    requestAnimFrame(render);
}

