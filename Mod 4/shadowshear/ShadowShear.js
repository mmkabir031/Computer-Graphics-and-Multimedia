"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: ShadowShear
 */
var canvas;
var gl;
var shearAng = [0, 45, 90];

var transMatCube2;
var transMatOcta2;
var transMatTetra2;

var cubeOff2 = [0.1, -0.4, 0.5];
var tetraOff2 = [0.8, -0.4, 0.5];
var octaOff2 = [-0.6, -0.4, 0.5];

var shearAngLoc;
var showShearLoc;
var points = [];
var colors = [];

// Axes: 0 = x; 1 = y; 2 = z
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 1;

// Array of angles: 0 = x; 1 = y; 2 = z
var theta = [0, 0, 0];

var totCubePts = 0;
var totTetraPts = 0;
var totOctaPts = 0;

var thetaLoc;

var transMatLoc;

var transMatCube1;
var transMatTetra1;
var transMatOcta1;

var scaleMatLoc;

var cubeOff1 = [-0.1, 0.2, 0.0];
var tetraOff1 = [0.6, 0.2, 0.0];
var octaOff1 = [-0.8, 0.2, 0.0];
var useBlackLoc;
window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL is not available"); }

    // viewport = rectangular area of display window
    gl.viewport(0, 0, canvas.width, canvas.height);

    // clear area of display for rendering at each frame
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    colorCube();
    colorTetra();
    colorOcta();

    // --------------- Load shaders and initialize attribute buffers
    
    // Create a buffer object, initialise it, and associate it 
    // with the associated attribute variable in our vertex shader

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Buffer    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // Cube colour; set attributes 
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Cube create points buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Cube create position
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");

    transMatLoc = gl.getUniformLocation(program, "transMat");

    scaleMatLoc = gl.getUniformLocation(program, "scaleMat");
    gl.uniformMatrix4fv(scaleMatLoc, false, flatten(scalem(0.5, 0.5, 0.5)));

    transMatCube1 = translate(cubeOff1[0], cubeOff1[1], cubeOff1[2]);
    transMatTetra1 = translate(tetraOff1[0], tetraOff1[1], tetraOff1[2]);
    transMatOcta1 = translate(octaOff1[0], octaOff1[1], octaOff1[2]);



    transMatCube2 = translate(cubeOff2[0], cubeOff2[1], cubeOff2[2]);
    transMatTetra2 = translate(tetraOff2[0], tetraOff2[1], tetraOff2[2]);
    transMatOcta2 = translate(octaOff2[0], octaOff2[1], octaOff2[2]);

    shearAngLoc = gl.getUniformLocation(program, "shearAng");
    gl.uniform3fv(shearAngLoc, shearAng);

    showShearLoc = gl.getUniformLocation(program, "showShear");
    gl.uniform1i(showShearLoc, false);

    useBlackLoc = gl.getUniformLocation(program, "useBlack");
    gl.uniform1i(useBlackLoc, false);
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

    render();
}

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
    // tetrahedron with each side using a different color

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
    // tetrahedron with each side using a different color

    makeOcta(a, d, e, 0);
    makeOcta(a, b, e, 1);
    makeOcta(b, c, e, 0);
    makeOcta(c, d, e, 1);
    makeOcta(a, d, f, 1);
    makeOcta(a, b, f, 2);
    makeOcta(b, c, f, 1);
    makeOcta(c, d, f, 2);
}

// -------------------------------------------------------------------

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);

   
    // Render cube
    gl.uniformMatrix4fv(transMatLoc, false, flatten(transMatCube1));
    gl.uniform1i(useBlackLoc, false);
    gl.uniform1i(showShearLoc, false);
    gl.uniformMatrix4fv(scaleMatLoc, false, flatten(scalem(0.5, 0.5, 0.5)));
    gl.drawArrays(gl.TRIANGLES, 0, totCubePts);

    // Render cube shadow
    gl.uniformMatrix4fv(transMatLoc, false, flatten(transMatCube2));
    gl.uniform1i(useBlackLoc, true);
    gl.uniform1i(showShearLoc, true);
    gl.uniformMatrix4fv(scaleMatLoc, false, flatten(scalem(0.4, 0.4, 0.4)));
    gl.drawArrays(gl.TRIANGLES, 0, totCubePts);

    //----------------

    // Render tetrahedron
    gl.uniformMatrix4fv(transMatLoc, false, flatten(transMatTetra1));
    gl.uniform1i(useBlackLoc, false);
    gl.uniform1i(showShearLoc, false);
    gl.uniformMatrix4fv(scaleMatLoc, false, flatten(scalem(0.5, 0.5, 0.5)));
    gl.drawArrays(gl.TRIANGLES, totCubePts, totTetraPts);


    //render tet shadow
    gl.uniformMatrix4fv(transMatLoc, false, flatten(transMatTetra2));
    gl.uniform1i(useBlackLoc, true);
    gl.uniform1i(showShearLoc, true);
    gl.uniformMatrix4fv(scaleMatLoc, false, flatten(scalem(0.4, 0.4, 0.4)));
    gl.drawArrays(gl.TRIANGLES, totCubePts, totTetraPts);



    //----------------

    // Render octahedron
    gl.uniformMatrix4fv(transMatLoc, false, flatten(transMatOcta1));
    gl.uniform1i(useBlackLoc, false);
    gl.uniform1i(showShearLoc, false);
    gl.uniformMatrix4fv(scaleMatLoc, false, flatten(scalem(0.5, 0.5, 0.5)));
    gl.drawArrays(gl.TRIANGLES, totCubePts + totTetraPts, totOctaPts);
    //shadow

    gl.uniformMatrix4fv(transMatLoc, false, flatten(transMatOcta2));
    gl.uniform1i(useBlackLoc, true);
    gl.uniform1i(showShearLoc, true);
    gl.uniformMatrix4fv(scaleMatLoc, true, flatten(scalem(0.4, 0.4, 0.4)));
    gl.drawArrays(gl.TRIANGLES, totCubePts + totTetraPts, totOctaPts);

    requestAnimationFrame(render);
}