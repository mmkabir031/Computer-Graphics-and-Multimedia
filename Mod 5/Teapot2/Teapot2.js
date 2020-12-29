"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: Teapot2
 */
var canvas;
var gl;

var numDivisions = 5;

var index = 0;

var points = [];

var modelViewMatrix = [];
var projectionMatrix = [];

var modelViewMatrixLoc;
var projectionMatrixLoc;

var patch;
var temp;

var normals = [];

var lightPosition = vec4(0.0, 0.0, 5.0, 0.0);   // move it out of scene
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = [
    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(1.0, 1.0, 0.0, 1.0),
    vec4(0.0, 1.0, 0.0, 1.0),
    vec4(0.0, 0.0, 1.0, 1.0),
    vec4(1.0, 0.0, 1.0, 1.0),
    vec4(0.0, 1.0, 1.0, 1.0)
];

var materialDiffuse = [
    vec4(0.8, 0.0, 0.0, 1.0),
    vec4(1.0, 0.8, 0.0, 1.0),
    vec4(0.0, 0.8, 0.0, 1.0),
    vec4(0.0, 0.0, 0.8, 1.0),
    vec4(1.0, 0.0, 0.8, 1.0),
    vec4(0.0, 1.0, 0.8, 1.0)
];

var materialSpecular = [
    vec4(0.8, 0.0, 0.0, 1.0),
    vec4(1.0, 0.8, 0.0, 1.0),
    vec4(0.0, 0.8, 0.0, 1.0),
    vec4(0.0, 0.0, 0.8, 1.0),
    vec4(1.0, 0.0, 0.8, 1.0),
    vec4(0.0, 1.0, 0.8, 1.0)
];

var materialShininess = 100.0;

var ambientProduct;
var diffuseProduct;
var specularProduct;

var ambientProductLoc;
var diffuseProductLoc;
var specularProductLoc;

var lightPositionLoc;
var materialShininessLoc;

var cindex = 1;

var theta = 0.0;
var phi = 0.0;

const at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var eye;

var nBuffer;
var vBufferId;

var lightAng = 0;
var lightRad = 5;
window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    buildTeapot();

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    vBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    projectionMatrix = ortho(-2, 2, -2, 2, -20, 20);
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    ambientProduct = mult(lightAmbient, materialAmbient[cindex]);
    diffuseProduct = mult(lightDiffuse, materialDiffuse[cindex]);
    specularProduct = mult(lightSpecular, materialSpecular[cindex]);

    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));

    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));

    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));

    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));

    materialShininessLoc = gl.getUniformLocation(program, "shininess");
    gl.uniform1f(materialShininessLoc, materialShininess);

    document.addEventListener("keydown",
        function (event) {
            if (event.keyCode == 65 || event.keyCode == 37) {   // A or Left
            }

            if (event.keyCode == 68 || event.keyCode == 39) {   // D or Right
            }

            if (event.keyCode == 87 || event.keyCode == 38) {   // W or Up
            }

            if (event.keyCode == 83 || event.keyCode == 40) {   // S or Down
            }
        }, false);

    document.getElementById("subdivisionsID").onchange =
        function (event) {
            numDivisions = Number(event.target.value);

            // you should know what goes here
        };
    document.getElementById("colorID").onchange =
        function (event) {
            cindex = Number(event.target.value);

            ambientProduct = mult(lightAmbient, materialAmbient[cindex]);
            diffuseProduct = mult(lightDiffuse, materialDiffuse[cindex]);
            specularProduct = mult(lightSpecular, materialSpecular[cindex]);

            gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
            gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
            gl.uniform4fv(specularProductLoc, flatten(specularProduct));


        };

    render();
}
function buildTeapot() {
    points = [];
    normals = [];

    var h = 1.0 / numDivisions;
    var patch = new Array(numTeapotPatches);
    for (var i = 0; i < numTeapotPatches; i++)
        patch[i] = new Array(16);
    for (var i = 0; i < numTeapotPatches; i++)
        for (j = 0; j < 16; j++) {
            patch[i][j] = vec4([vertices[indices[i][j]][0],
            vertices[indices[i][j]][2],
            vertices[indices[i][j]][1], 1.0]);
        }

    for (var n = 0; n < numTeapotPatches; n++) {
        var data = new Array(numDivisions + 1);
        for (var j = 0; j <= numDivisions; j++)
            data[j] = new Array(numDivisions + 1);
        for (var i = 0; i <= numDivisions; i++)
            for (var j = 0; j <= numDivisions; j++) {
                data[i][j] = vec4(0, 0, 0, 1);
                var u = i * h;
                var v = j * h;
                var t = new Array(4);
                for (var ii = 0; ii < 4; ii++)
                    t[ii] = new Array(4);
                for (var ii = 0; ii < 4; ii++)
                    for (var jj = 0; jj < 4; jj++)
                        t[ii][jj] = bezier(u)[ii] * bezier(v)[jj];

                for (var ii = 0; ii < 4; ii++) for (var jj = 0; jj < 4; jj++) {
                    var temp = vec4(patch[n][4 * ii + jj]);
                    temp = scale(t[ii][jj], temp);
                    data[i][j] = add(data[i][j], temp);
                }
            }

        for (var i = 0; i < numDivisions; i++)
            for (var j = 0; j < numDivisions; j++) {
                points.push(data[i][j]);
                points.push(data[i + 1][j]);
                points.push(data[i + 1][j + 1]);
                points.push(data[i][j]);
                points.push(data[i + 1][j + 1]);
                points.push(data[i][j + 1]);

                var t1 = subtract(data[i + 1][j], data[i][j]);
                var t2 = subtract(data[i + 1][j + 1], data[i][j]);
                var normal = cross(t1, t2);
                normal[3] = 0;

                normals.push(normal);
                normals.push(normal);
                normals.push(normal);
                normals.push(normal);
                normals.push(normal);
                normals.push(normal);
            }
    }
}

function bezier(u) {
    var b = new Array(4);
    var a = 1 - u;
    b[3] = a * a * a;
    b[2] = 3 * a * a * u;
    b[1] = 3 * a * u * u;
    b[0] = u * u * u;
    return b;
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (theta < 0)
        theta += 2 * Math.PI;
    if (theta > 2 * Math.PI)
        theta -= 2 * Math.PI;
    if (phi < 0)
        phi += 2 * Math.PI;
    if (phi > 2 * Math.PI)
        phi -= 2 * Math.PI;

    if (phi > Math.PI / 2 && phi < 3 * Math.PI / 2) {
        up = vec3(0.0, -1.0, 0.0);
    }
    else {
        up = vec3(0.0, 1.0, 0.0);
    }

    eye = vec3(Math.sin(theta) * Math.cos(phi),
        Math.sin(phi),
        Math.cos(theta) * Math.cos(phi));

    modelViewMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    lightAng += 0.02;
    lightPosition[0] = lightRad * Math.sin(lightAng);
    lightPosition[2] = lightRad * Math.cos(lightAng);

    // Offsetting the light to compensate for rotation of eye
    var thetaDeg = 180.0 * theta / Math.PI;
    var phiDeg = 180.0 * phi / Math.PI;
    var lightPosition2 = mult(rotateX(phiDeg), lightPosition);
    lightPosition2 = mult(rotateY(-thetaDeg), lightPosition2);
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition2));

    gl.drawArrays(gl.TRIANGLES, 0, points.length);

    requestAnimFrame(render);
}