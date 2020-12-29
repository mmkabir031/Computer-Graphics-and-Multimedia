"use strict";
/*
 * Course: CS 4722
 * Section: 02 Fall
 * Name: Mohsin Kabir
 * Professor: Dr. Alan Shaw
 * Assignemnt: InnerSquare
 * */
var gl;
var points;

// Four Vertices
var vertices = [
    vec2(-0.5, -0.5),
    vec2(-0.5, 0.5),
    vec2(0.5, 0.5),
    vec2(0.5, -0.5)
];


var length = 0.5;
var width = 0.5;
window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 0.0, 0.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);



    document.getElementById("sliderLength").onchange =
        function (event) {
            length = event.target.value;
            vertices = [
                vec2(-width, -length),
                vec2(-width, length),
                vec2(width, length),
                vec2(width, -length)
            ];

            render();
        };




    document.getElementById("sliderWidth").onchange =
        function (event) {
            width = event.target.value;
            vertices = [
                vec2(-width, -length),
                vec2(-width, length),
                vec2(width, length),
                vec2(width, -length)
            ];

            render();
        };

    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}