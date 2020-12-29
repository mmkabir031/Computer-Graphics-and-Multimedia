"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. SHaw
 * Assignment #: CubeTetraOcta
 */
var canvas;
var gl;

// Cube
var points = [];
var colors = [];

// Axes: 0 = x; 1 = y; 2 = z
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;

// Array of angles: 0 = x; 1 = y; 2 = z
var theta = [0, 0, 0];
var thetaLoc;
var transMat;
var transMatLoc;

var scaleMat;
var scaleMatLoc;

var transMatCube;
var transMatTetra;
var transMatOcta;

var cubeScale = 1.0;
var tetraScale = 1.0;
var octaScale = 1.0;

var cubeOff = [-0.5, 0.4, 0.0];
var tetraOff = [0.5, 0.4, 0.0];
var octaOff = [0.0, -0.5, 0.0];

var cTheta = [0, 0, 0];
var tTheta = [0, 0, 0];
var oTheta = [0, 0, 0];

var cSpinning = true;
var tSpinning = true;
var oSpinning = true;

var totCubePts = 0;
var totTetraPts = 0;
var totOctaPts = 0;
var cBuffer;
var vBuffer;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL is not available"); }

    // viewport = rectangular area of display window
    gl.viewport(0, 0, canvas.width, canvas.height);
    // clear area of display for rendering at each frame
    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    gl.enable(gl.DEPTH_TEST);

    // --------------- Load shaders and initialize attribute buffers

    // ---------- Initialize Cube Vertices --------------
    colorCube();
    // ------ Initialize Tetrahedron Vertices -----------
    colorTetra();
    // ------- Initialize Octahedron Vertices -----------
    colorOcta();

    // ------- Create Translation Matrices -----------
    transMatCube = translate(cubeOff[0], cubeOff[1], cubeOff[2]);
    transMatTetra = translate(tetraOff[0], tetraOff[1], tetraOff[2]);
    transMatOcta = translate(octaOff[0], octaOff[1], octaOff[2]);

    // Create a buffer object, initialise it, and associate it 
    // with the associated attribute variable in our vertex shader
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // color array attribute buffer
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // vertex array attribute buffer
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");
    gl.uniform3fv(thetaLoc, theta);

    // ------------------------------------------------------------------
    // Event listeners for buttons

    document.getElementById("xButton").onclick = function () {
        axis = xAxis;
        document.getElementById('xButton').style.background = '#bebfba';
        document.getElementById('yButton').style.background = '#FFF';
        document.getElementById('zButton').style.background = '#FFF';
    };
    document.getElementById("yButton").onclick = function () {
        axis = yAxis;
        document.getElementById('yButton').style.background = '#bebfba';
        document.getElementById('xButton').style.background = '#FFF';
        document.getElementById('zButton').style.background = '#FFF';
    };
    document.getElementById("zButton").onclick = function () {
        axis = zAxis;
        document.getElementById('zButton').style.background = '#bebfba';
        document.getElementById('xButton').style.background = '#FFF';
        document.getElementById('yButton').style.background = '#FFF';
    };

    document.getElementById("startStopCube").onclick = function () {
        cSpinning = !cSpinning;
        document.getElementById("startStopCube").innerText = (cSpinning) ? "Stop Cube" : "Start Cube";
    };

    document.getElementById("startStopTetrahedron").onclick = function () {
        tSpinning = !tSpinning;
        document.getElementById("startStopTetrahedron").innerText = (tSpinning) ? "Stop Tetrahedron" : "Start Tetrahedron";
    };

    document.getElementById("startStopOctahedron").onclick = function () {
        oSpinning = !oSpinning;
        document.getElementById("startStopOctahedron").innerText = (oSpinning) ? "Stop Octahedron" : "Start Octahedron";
    };

    document.getElementById("cubeSlider").onchange =
        function (event) {
            cubeScale = Number(event.target.value);
        };
    document.getElementById("tetraSlider").onchange =
        function (event) {
            tetraScale = Number(event.target.value);
        };
    document.getElementById("octaSlider").onchange =
        function (event) {
            octaScale = Number(event.target.value);
        };

    transMatLoc = gl.getUniformLocation(program, "transMat");
    scaleMatLoc = gl.getUniformLocation(program, "scaleMat");

    cubeScale = Number(document.getElementById("cubeSlider").value);
    tetraScale = Number(document.getElementById("tetraSlider").value);
    octaScale = Number(document.getElementById("octaSlider").value);

    render();
}

// -------------------------------------------------------------------

// DEFINE CUBE

function colorCube() {
    square(1, 0, 3, 2);
    square(2, 3, 7, 6);
    square(3, 0, 4, 7);
    square(5, 1, 2, 6);
    square(4, 5, 6, 7);
    square(5, 4, 0, 1);
}

function square(a, b, c, d) {
    var verticesC = [
        vec3(-0.25, -0.25, 0.25),
        vec3(-0.25, 0.25, 0.25),
        vec3(0.25, 0.25, 0.25),
        vec3(0.25, -0.25, 0.25),
        vec3(-0.25, -0.25, -0.25),
        vec3(-0.25, 0.25, -0.25),
        vec3(0.25, 0.25, -0.25),
        vec3(0.25, -0.25, -0.25)
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

    // Partion the square into two triangles in order for
    // WebGL to be able to render it.      
    // Vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
        points.push(verticesC[indices[i]]);
        //colors.push( vertexColors[indices[i]] );

        //for solid colored faces use 
        colors.push(vertexColors[c]);

        ++totCubePts;
    }
}

// DEFINE TETRAHEDRON

function colorTetra() {

    var verticesT = [
        vec3(0.0000, 0.0000, -0.3500),
        vec3(0.0000, 0.3500, 0.1500),
        vec3(-0.3500, -0.1500, 0.1500),
        vec3(0.3500, -0.1500, 0.1500)
    ];

    tetra(verticesT[0], verticesT[1], verticesT[2], verticesT[3]);
}

function makeTetra(a, b, c, color) {
    // add colors and vertices for one triangle

    var baseColors = [
        vec4(0.7, 0.7, 0.9, 1.0),
        vec4(0.6, 0.8, 0.9, 1.0),
        vec4(0.5, 0.6, 0.9, 1.0),
        vec4(1.0, 1.0, 0.2, 1.0)
    ];

    colors.push(baseColors[color]);
    points.push(a);
    colors.push(baseColors[color]);
    points.push(b);
    colors.push(baseColors[color]);
    points.push(c);

    totTetraPts += 3;
}

function tetra(p, q, r, s) {
    // tetrahedron with each side using
    // a different color

    makeTetra(p, r, q, 0);
    makeTetra(p, r, s, 1);
    makeTetra(p, q, s, 2);
    makeTetra(q, r, s, 3);
}


// DEFINE OCTAHEDRON

function colorOcta() {

    var verticesO = [
        vec3(0.2000, 0.0000, -0.2000),
        vec3(-0.2000, 0.0000, -0.2000),
        vec3(-0.2000, 0.0000, 0.2000),
        vec3(0.2000, 0.0000, 0.2000),
        vec3(0.0000, 0.3000, 0.0000),
        vec3(0.0000, -0.3000, 0.0000)
    ];

    octa(verticesO[0], verticesO[1], verticesO[2], verticesO[3], verticesO[4], verticesO[5]);
}

function makeOcta(a, b, c, color) {
    // add colors and vertices for one triangle

    var baseColors = [
        vec4(0.6, 0.6, 0.6, 1.0),
        vec4(0.3, 0.4, 0.9, 1.0),
        vec4(0.9, 0.9, 0.9, 1.0),
    ];

    colors.push(baseColors[color]);
    points.push(a);
    colors.push(baseColors[color]);
    points.push(b);
    colors.push(baseColors[color]);
    points.push(c);

    totOctaPts += 3;
}

function octa(a, b, c, d, e, f) {
    // tetrahedron with each side using
    // a different color

    makeOcta(a, d, e, 0);
    makeOcta(a, b, e, 1);
    makeOcta(b, c, e, 0);
    makeOcta(c, d, e, 1);
    makeOcta(a, d, f, 1);
    makeOcta(a, b, f, 2);
    makeOcta(b, c, f, 1);
    makeOcta(c, d, f, 2);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (cSpinning)
        cTheta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, cTheta);
    gl.uniformMatrix4fv(transMatLoc, false, flatten(transMatCube));
    scaleMat = scalem(cubeScale / 4, cubeScale / 4, cubeScale / 4);
    gl.uniformMatrix4fv(scaleMatLoc, false, flatten(scaleMat));
    // Render cube
    gl.drawArrays(gl.TRIANGLES, 0, totCubePts);

    if (tSpinning)
        tTheta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, tTheta);
    gl.uniformMatrix4fv(transMatLoc, false, flatten(transMatTetra));
    scaleMat = scalem(tetraScale / 4, tetraScale / 4, tetraScale / 4);
    gl.uniformMatrix4fv(scaleMatLoc, false, flatten(scaleMat));
    // Render tetrahedron
    gl.drawArrays(gl.TRIANGLES, totCubePts, totTetraPts);

    if (oSpinning)
        oTheta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, oTheta);
    gl.uniformMatrix4fv(transMatLoc, false, flatten(transMatOcta));
    scaleMat = scalem(octaScale / 4, octaScale / 4, octaScale / 4);
    gl.uniformMatrix4fv(scaleMatLoc, false, flatten(scaleMat));
    // Render octahedron
    gl.drawArrays(gl.TRIANGLES, totCubePts + totTetraPts, totOctaPts);

    requestAnimationFrame(render);
}