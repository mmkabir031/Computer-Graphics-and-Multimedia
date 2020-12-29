"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: BatmanCube
 */
var canvas;
var gl;
var program;

var numVertices = 36;

var texSize = 64;
var imgSize = 64;
var numChecks = 4;

var checkerImage = new Uint8Array(4 * imgSize * imgSize);

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var texCoord = [
    [vec2(0, 0), vec2(0, 0.5), vec2(0.25, 0.5), vec2(0.25, 0)],
    [vec2(0, 0.5), vec2(0, 1), vec2(0.25, 1), vec2(0.25, 0.5)],
    [vec2(0.25, 0), vec2(0.25, 0.5), vec2(0.5, 0.5), vec2(0.5, 0)],
    [vec2(0.25, 0.5), vec2(0.25, 1), vec2(0.5, 1), vec2(0.5, 0.5)],
    [vec2(0.5, 0), vec2(0.5, 0.5), vec2(0.75, 0.5), vec2(0.75, 0)],
    [vec2(0.5, 0.5), vec2(0.5, 1), vec2(0.75, 1), vec2(0.75, 0.5)]
];

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

var vertexColors = [
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(1.0, 1.0, 1.0, 1.0),  // white
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(1.0, 0.0, 0.0, 1.0)   // red
];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var theta = [45.0, 45.0, 45.0];
var thetaLoc;
var imgIndex = 0;
var drawBlackLoc;

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
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    for (var i = 0; i < imgSize; i++) {
        for (var j = 0; j < imgSize; j++) {
            var patchx = Math.floor(i / (imgSize / numChecks));
            var patchy = Math.floor(j / (imgSize / numChecks));
            var c;
            c = (patchx % 2 ^ patchy % 2) ? 255 : 0;
            checkerImage[4 * i * imgSize + 4 * j] = c;
            checkerImage[4 * i * imgSize + 4 * j + 1] = c;
            checkerImage[4 * i * imgSize + 4 * j + 2] = c;
            checkerImage[4 * i * imgSize + 4 * j + 3] = 255;
        }
    }

    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);


    thetaLoc = gl.getUniformLocation(program, "theta");

    document.getElementById("ButtonX").onclick =
        function () {
            axis = xAxis;
        };

    document.getElementById("ButtonY").onclick =
        function () {
            axis = yAxis;
        };

    document.getElementById("ButtonZ").onclick =
        function () {
            axis = zAxis;
        };

    drawBlackLoc = gl.getUniformLocation(program, "drawBlack");
    gl.uniform1i(drawBlackLoc, false);

    flipImage();

    render();
}

function configureTexture(image) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function colorCube() {
    quad(1, 0, 3, 2, 0);
    quad(2, 3, 7, 6, 1);
    quad(3, 0, 4, 7, 2);
    quad(5, 1, 2, 6, 3);
    quad(4, 5, 6, 7, 4);
    quad(5, 4, 0, 1, 5);
}

function quad(a, b, c, d, faceIndex) {
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[5]);
    texCoordsArray.push(texCoord[faceIndex][0]);

    pointsArray.push(vertices[b]);
    colorsArray.push(vertexColors[5]);
    texCoordsArray.push(texCoord[faceIndex][1]);

    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[5]);
    texCoordsArray.push(texCoord[faceIndex][2]);

    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[5]);
    texCoordsArray.push(texCoord[faceIndex][0]);

    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[5]);
    texCoordsArray.push(texCoord[faceIndex][2]);

    pointsArray.push(vertices[d]);
    colorsArray.push(vertexColors[5]);
    texCoordsArray.push(texCoord[faceIndex][3]);
}

function flipImage() {
    setTimeout(function () {
        ++imgIndex;
        if (imgIndex > 6)
            imgIndex = 1;

        configureTexture(document.getElementById("animImage" + imgIndex));

        flipImage();
    }, 100);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);

    gl.uniform1i(drawBlackLoc, false);
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    gl.uniform1i(drawBlackLoc, true);
    for (var i = 0; i < 6; ++i) {
        gl.drawArrays(gl.LINES, i * 6, 2);
        gl.drawArrays(gl.LINES, i * 6 + 1, 2);
        gl.drawArrays(gl.LINES, i * 6 + 4, 2);
    }
    requestAnimFrame(render);
}