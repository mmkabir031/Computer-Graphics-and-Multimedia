"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Alan Shaw
 * Assignment #: StaticCube
 * 
 * 
 * 
 * //                                                   
 */
var canvas;
var gl;

var theta = vec3(45, 45, 45);
var thetaLoc;

var vertices = [

    vec3(-0.5, 0.5, 0.5), //point 1
    vec3(-0.5, -0.5, 0.5), //point 0
    vec3(0.5, -0.5, 0.5),//point3

    vec3(0.5, -0.5, 0.5),//point3
    vec3(0.5, 0.5, 0.5),//point 2
    vec3(-0.5, 0.5, 0.5), //point 1
    
    

    vec3(0.5, 0.5, 0.5),//point 2
    vec3(0.5, -0.5, 0.5),//point3
    vec3(0.5, -0.5, -0.5),//point 7

   
    vec3(0.5, -0.5, -0.5),//point 7
    vec3(0.5, 0.5, -0.5),//point 6
    vec3(0.5, 0.5, 0.5),//point 2

    vec3(0.5, -0.5, 0.5),//point3
    vec3(-0.5, -0.5, 0.5), //point 0
    vec3(-0.5, -0.5, -0.5),//point 4


    vec3(-0.5, -0.5, -0.5),//point 4
    vec3(0.5, -0.5, -0.5),//point 7
    vec3(0.5, -0.5, 0.5),//point3


    vec3(0.5, 0.5, -0.5),//point 6
    vec3(0.5, 0.5, 0.5),//point 2
    vec3(-0.5, 0.5, 0.5), //point 1


    vec3(-0.5, 0.5, 0.5), //point 1
    vec3(-0.5, 0.5, -0.5),//point 5
    vec3(0.5, 0.5, -0.5),//point 6


    vec3(-0.5, -0.5, -0.5),//point 4
    vec3(-0.5, 0.5, -0.5),//point 5
    vec3(0.5, 0.5, -0.5),//point 6

    vec3(0.5, 0.5, -0.5),//point 6
    vec3(0.5, -0.5, -0.5),//point 7
    vec3(-0.5, -0.5, -0.5),//point 4

    
    vec3(-0.5, 0.5, -0.5),//point 5
    vec3(-0.5, -0.5, -0.5),//point 4
    vec3(-0.5, -0.5, 0.5), //point 0


    vec3(-0.5, -0.5, 0.5), //point 0
    vec3(-0.5, 0.5, 0.5), //point 1
    vec3(-0.5, 0.5, -0.5),//point 5

    /*
    vec3(-0.5, -0.5, 0.5), //point 0
    vec3(-0.5, 0.5, 0.5), //point 1
    vec3(0.5, 0.5, 0.5),//point 2
    vec3(0.5, -0.5, 0.5),//point3
    vec3(-0.5, -0.5, -0.5),//point 4
    vec3(-0.5, 0.5, -0.5),//point 5
    vec3(0.5, 0.5, -0.5),//point 6
    vec3(0.5, -0.5, -0.5),//point 7
    */
];







var vertexColors = [

    vec4(1.0, 0.0, 0.0, 1.0),  // red       1
    vec4(0.0, 0.0, 0.0, 1.0),  // black     0
    vec4(0.0, 1.0, 0.0, 1.0),  // green     3




    vec4(0.0, 1.0, 0.0, 1.0),  // green     3
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow    2
    vec4(1.0, 0.0, 0.0, 1.0),  // red       1


    vec4(1.0, 1.0, 0.0, 1.0),  // yellow    2
    vec4(0.0, 1.0, 0.0, 1.0),  // green     3
    vec4(0.0, 1.0, 1.0, 1.0),   // cyan      7


    vec4(0.0, 1.0, 1.0, 1.0),   // cyan      7
    vec4(1.0, 1.0, 1.0, 1.0),  // white     6

    vec4(1.0, 1.0, 0.0, 1.0),  // yellow    2


    vec4(0.0, 1.0, 0.0, 1.0),  // green     3
    vec4(0.0, 0.0, 0.0, 1.0),  // black     0
    vec4(0.0, 0.0, 1.0, 1.0),  // blue      4


    vec4(0.0, 0.0, 1.0, 1.0),  // blue      4
    vec4(0.0, 1.0, 1.0, 1.0),   // cyan      7
    vec4(0.0, 1.0, 0.0, 1.0),  // green     3


    vec4(1.0, 1.0, 1.0, 1.0),  // white     6
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow    2
    vec4(1.0, 0.0, 0.0, 1.0),  // red       1

    vec4(1.0, 0.0, 0.0, 1.0),  // red       1
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta   5
    vec4(1.0, 1.0, 1.0, 1.0),  // white     6


    vec4(0.0, 0.0, 1.0, 1.0),  // blue      4
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta   5
    vec4(1.0, 1.0, 1.0, 1.0),  // white     6


    vec4(1.0, 1.0, 1.0, 1.0),  // white     6
    vec4(0.0, 1.0, 1.0, 1.0),   // cyan      7
    vec4(0.0, 0.0, 1.0, 1.0),  // blue      4

    vec4(1.0, 0.0, 1.0, 1.0),  // magenta   5
    vec4(0.0, 0.0, 1.0, 1.0),  // blue      4
    vec4(0.0, 0.0, 0.0, 1.0),  // black     0

    vec4(0.0, 0.0, 0.0, 1.0),  // black     0
    vec4(1.0, 0.0, 0.0, 1.0),  // red       1
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta   5
    /*
    vec4(0.0, 0.0, 0.0, 1.0),  // black     0
    vec4(1.0, 0.0, 0.0, 1.0),  // red       1
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow    2
    vec4(0.0, 1.0, 0.0, 1.0),  // green     3
    vec4(0.0, 0.0, 1.0, 1.0),  // blue      4
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta   5
    vec4(1.0, 1.0, 1.0, 1.0),  // white     6
    vec4(0.0, 1.0, 1.0, 1.0),   // cyan      7
    */
];

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



    render();
}

function render() {
    // render code goes here
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

}