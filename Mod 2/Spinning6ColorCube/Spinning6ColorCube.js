"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr.Alan Shaw
 * Assignment #: Spinning6ColorCube
 * 
 *   */
var canvas;
var gl;

var numVertices = 36;

var axis = 0;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var theta = vec3(0, 0, 0);
var thetaLoc;

var vertices = [
    //0-7 
    vec3(-0.5, -0.5, 0.5),
    vec3(-0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(-0.5, 0.5, -0.5),
    vec3(0.5, 0.5, -0.5),
    vec3(0.5, -0.5, -0.5),
    //0-7 prime
    vec3(-0.5, -0.5, 0.5),
    vec3(-0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(-0.5, 0.5, -0.5),
    vec3(0.5, 0.5, -0.5),
    vec3(0.5, -0.5, -0.5),
  //0-7 prime prime
    vec3(-0.5, -0.5, 0.5),
    vec3(-0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(-0.5, 0.5, -0.5),
    vec3(0.5, 0.5, -0.5),
    vec3(0.5, -0.5, -0.5),

    
];

var indices = [
    //first set of 8
    1, 0, 3,
    3, 2, 1,
    //Second set of 8
    2 + 8, 3 + 8, 7 + 8,
    7 + 8, 6 + 8, 2 + 8,
    //Third set of 8
    3 + 16, 0 + 16, 4 + 16,
    4 + 16, 7 + 16, 3 + 16,
    //Third set of 8
    6 + 16, 2 + 16, 1 + 16,
    1 + 16, 5 + 16, 6 + 16,
    //first set of 8
    4, 5, 6,
    6, 7, 4,
    //Second set of 8
    5 + 8, 4 + 8, 0 + 8,
    0 + 8, 1 + 8, 5 + 8,
];

var vertexColors = [

    /*first face */
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 0.0, 0.0, 1.0),  // red

    /*Second face */
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow

    /*Third face */
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(0.0, 0.0, 1.0, 1.0),  // blue

    /*Fourth face */
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(0.0, 0.0, 1.0, 1.0),  // blue

    /*Fifth face */
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(0.0, 1.0, 1.0, 1.0),   // cyan
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta

    /*Sixth face */
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),   // cyan
    vec4(0.0, 1.0, 1.0, 1.0),   // cyan
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta


    /*
    vec4(0.0, 0.0, 0.0, 1.0),  // black     0
    vec4(1.0, 0.0, 0.0, 1.0),  // red       1
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow    2
    vec4(0.0, 1.0, 0.0, 1.0),  // green     3
    vec4(0.0, 0.0, 1.0, 1.0),  // blue      4
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta   5
    vec4(1.0, 1.0, 1.0, 1.0),  // white     6
    vec4(0.0, 1.0, 1.0, 1.0),   // cyan     7
    */
];

// indices of the 12 triangles that compise the cube

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


    // array element buffer for vertex indices

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);


    // vertex array attribute buffer code goes here
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);//verices are also called points
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);



    // color array attribute buffer code goes here
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);//verices are also called points
    var vColor = gl.getAttribLocation(program, "vColor"); //from HTML file, has to be the same name  
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    // thetaLoc uniform variable code goes here

    //is named theta in HTML

    thetaLoc = gl.getUniformLocation(program, "theta");//dont need it for today (for thursday)

      gl.uniform3fv(thetaLoc, theta);//3 floating point vector

    // button handlers code goes here
    document.getElementById("xButton").onclick =
        function () {
            axis = xAxis;

        };

    document.getElementById("yButton").onclick =
        function () {
            axis = yAxis
        };

    document.getElementById("zButton").onclick =
        function () {
            axis = zAxis
        };


    render();
}

function render() {
   // render code goes here
    
    gl.clear(gl.COLOR_BUFFER_BIT)
    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);//3 floating point vector
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
    requestAnimFrame(render);
}