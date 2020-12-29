"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: Mod 03 Assignment 01 Exercise 02
 */
var canvas;
var gl;

var maxNumVertices = 200;
var index = 0;

var cindex = 0;
var useBlackLoc;
var useBlackLoc;
var colors = [
    vec4(1.0, 0.0, 1.0, 1.0),  // Fuschia
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];
var t;
var numPolygons = 0;
var numIndices = [];
numIndices[0] = 0;
var start = [0];

var bufferId;
var cBufferId;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    canvas.addEventListener("mousedown", function (event) {
        t = vec2(2 * event.clientX / canvas.width - 1,
            2 * (canvas.height - event.clientY) / canvas.height - 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));

        t = colors[cindex];
        gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));

        index++;
        numIndices[numPolygons]++;

        render(true);
    });

    document.getElementById("mymenu").onchange =
        function (event) {
            cindex = event.target.value;
        };

    document.getElementById("buttonval").onclick =
        function () {
            numPolygons++;
            numIndices[numPolygons] = 0;
            start[numPolygons] = index;

            render(false);
        };

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STATIC_DRAW);
    var vPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);


    cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    useBlackLoc = gl.getUniformLocation(program, "useBlack");
    gl.uniform1i(useBlackLoc, false);
}

function render(showLine) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (var i = 0; i < numPolygons; i++) {
        gl.drawArrays(gl.TRIANGLE_STRIP, start[i], numIndices[i]);

        gl.uniform1i(useBlackLoc, true);

        if (numIndices[i] > 2) {
            for (var j = start[i]; j < start[i] + numIndices[i] - 2; j++) {
                gl.drawArrays(gl.LINE_LOOP, j, 3);
            }
        }

        gl.uniform1i(useBlackLoc, false);
    }

    if (showLine == true) {
        gl.drawArrays(gl.LINE_STRIP, start[numPolygons], numIndices[numPolygons]);
    }
}