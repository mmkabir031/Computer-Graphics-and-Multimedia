"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: ShadowMap
 */
var canvas;
var gl;
var program;

var latitudeBands = 30;
var longitudeBands = 30;
var radius = 1;

var planeVertCnt = 6;
var planeVertices = [
    vec4(-1.15, -1.75, 1.25, 1.0),
    vec4(-1.80, 0.5, 1.25, 1.0),
    vec4(-0.45, 0.75, -0.45, 1.0),
    vec4(-1.15, -1.75, 1.25, 1.0),
    vec4(-0.45, 0.75, -0.45, 1.0),
    vec4(0.05, -1.35, -0.45, 1.0)
];

var pointsArray = [];
var normalsArray = [];

var vBuffer;
var nBuffer;

var vPosition;
var vNormal;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var up = vec3(0.0, 1.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
var eye = vec3(0.0, 0.0, 1.0);

var near = -10;
var far = 110;
var left = -3.0;
var right = 3.0;
var ytop = 3.0;
var bottom = -3.0;

var planeTrans = [0.0, 1.0, 0];
var planeScale = 1.3;

var objScale = 0.3;
var objYMid = 1.2;
var objX = 2.12;
var objZ = 2.91;

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.8, 0.0, .8, 1.0);
var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4(0.0, 0.0, 0.0, 1.0);

var shininess = 40.0;
var shininessLoc;

var lightTheta = 0.9;
var lightRad = 48;
var lightPosition = [lightRad * Math.sin(lightTheta), 10,
lightRad * Math.cos(lightTheta), 0];

var cameraPosition = [0.0, 0.0, 1.0];

var ambientProduct, ambientProductLoc;
var diffuseProduct, diffuseProductLoc;
var specularProduct, specularProductLoc;

var lightingLoc;

var OFFSCREEN_WIDTH = 2048, OFFSCREEN_HEIGHT = 2048;

var shadowProgram;

var shadowVBuffer;
var shadowVPosition;
var shadowTexture;
var shadowTextureLoc;

var framebuffer, depthBuffer;

var pmvMatrixFromLightLoc1, pmvMatrixFromLightLoc2;
var pmvMatrixFromLight1, pmvMatrixFromLight2;

var modelViewStack = [];

var sphereScale = 0.3;
var polyhedronScale = 1.2;
var battledroneScale = 1.8;
var duckScale = 0.8;
var teapotScale = 0.8;
var treeScale = 1.2;

var theta = [0, 0, 0];
var rotateObject = true;

var axis = 1;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var objYOff = 0.0;
window.onload = function init() {
    
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);


    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //

    initPoints();
    createPlane();
    createSphereMap();

    objScale = sphereScale;

    setFBOs();
    shadowProgram = initShaders(gl, "vertex-shader1", "fragment-shader1");
    program = initShaders(gl, "vertex-shader2", "fragment-shader2");

    gl.useProgram(shadowProgram);

    shadowVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, shadowVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    shadowVPosition = gl.getAttribLocation(shadowProgram, "vPosition");
    gl.vertexAttribPointer(shadowVPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shadowVPosition);

    pmvMatrixFromLightLoc1 = gl.getUniformLocation(shadowProgram, "pmvMatrixFromLight");

    gl.useProgram(program);

    // Create vertex buffer and vPosition attribute
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Create normal buffer and vNormal attribute
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // Get buffer locations for the following shader variables
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Setting Lighting variables and their Uniform Locations
    var lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    gl.uniform4fv(lightPositionLoc, lightPosition);

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    gl.uniform1f(shininessLoc, shininess);

    shininessLoc = gl.getUniformLocation(program, "shininess");
    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");

    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));


    pmvMatrixFromLightLoc2 = gl.getUniformLocation(program, "pmvMatrixFromLight");
    shadowTextureLoc = gl.getUniformLocation(program, "shadowTexture");

    document.getElementById("rotateX").onclick =
        function () {
            axis = xAxis;
        };

    document.getElementById("rotateY").onclick =
        function () {
            axis = yAxis;
        };

    document.getElementById("rotateZ").onclick =
        function () {
            axis = zAxis;
        };

    document.getElementById("toggleRotation").onclick =
        function () {
            rotateObject = !rotateObject;
        };


    document.getElementById("oYPos").oninput =
        function (event) {
            objYOff = Number(event.target.value);
        };


    document.getElementById("selObject").onchange =
        function (event) {
            var objSelected = event.target.value;
            var objData = "";

            initPoints();
            createPlane();

            if (objSelected == "0") {
                createSphereMap();
                updateBuffers();
                objScale = sphereScale;
            }
            else {
                axis = 1;
                theta[0] = theta[1] = theta[2] = 0;
                if (objSelected == "1") {
                    objData = filedata1;
                    objScale = polyhedronScale;
                }
                else if (objSelected == "2") {
                    objData = filedata2;
                    objScale = battledroneScale;
                }
                else if (objSelected == "3") {
                    objData = filedata3;
                    objScale = duckScale;
                }
                else if (objSelected == "4") {
                    objData = filedata6;
                    objScale = teapotScale;
                }
                else if (objSelected == "5") {
                    objData = filedata7;
                    objScale = treeScale;
                }
                loadobj(objData);
                updateBuffers();
            }
        };

    render();
}
// Sets up the Frame Buffer Objects
function setFBOs() {
    shadowTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
        OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT,
        0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, null);

    // Allocate a frame buffer object
    framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // Attach color buffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D, shadowTexture, 0);

    // create a depth renderbuffer
    depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

    // make a depth buffer and the same size as the targetTexture
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
        OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER, depthBuffer);

    // check for completeness
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE)
        alert('Framebuffer Not Complete');

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
}

function updateBuffers() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, shadowVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
}
function initPoints() {
    pointsArray = [];
    normalsArray = [];
}

// Create Plane filling pointsArray and normalsArray
function createPlane() {
    pointsArray.push(planeVertices[0]);
    pointsArray.push(planeVertices[1]);
    pointsArray.push(planeVertices[2]);
    pointsArray.push(planeVertices[3]);
    pointsArray.push(planeVertices[4]);
    pointsArray.push(planeVertices[5]);

    var t1 = subtract(planeVertices[1], planeVertices[0]);
    var t2 = subtract(planeVertices[1], planeVertices[2]);
    var normal = vec3(cross(t1, t2));

    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
}

// Create SphereMap by filling pointsArray and normalsArray
function createSphereMap() {
    var phi1, phi2, sinPhi1, sinPhi2, cosPhi1, cosPhi2;
    var theta1, theta2, sinTheta1, sinTheta2, cosTheta1, cosTheta2;
    var p1, p2, p3, p4, u1, u2, v1, v2, uv1, uv2, uv3, uv4;
    var r = radius;

    // For each latitudinal band determine phi's value
    for (var latNumber = 1; latNumber <= latitudeBands; latNumber++) {
        phi1 = Math.PI * (latNumber - 1) / latitudeBands;
        sinPhi1 = Math.sin(phi1);
        cosPhi1 = Math.cos(phi1);

        phi2 = Math.PI * latNumber / latitudeBands;
        sinPhi2 = Math.sin(phi2);
        cosPhi2 = Math.cos(phi2);

        // For each longitudinal band determine theta's value and other calculations
        for (var longNumber = 1; longNumber <= longitudeBands; longNumber++) {
            theta1 = 2 * Math.PI * (longNumber - 1) / longitudeBands;
            sinTheta1 = Math.sin(theta1);
            cosTheta1 = Math.cos(theta1);

            theta2 = 2 * Math.PI * longNumber / longitudeBands;
            sinTheta2 = Math.sin(theta2);
            cosTheta2 = Math.cos(theta2);

            p1 = vec4(cosTheta1 * sinPhi1 * r, cosPhi1 * r, sinTheta1 * sinPhi1 * r, 1.0);
            p2 = vec4(cosTheta2 * sinPhi1 * r, cosPhi1 * r, sinTheta2 * sinPhi1 * r, 1.0);
            p3 = vec4(cosTheta1 * sinPhi2 * r, cosPhi2 * r, sinTheta1 * sinPhi2 * r, 1.0);
            p4 = vec4(cosTheta2 * sinPhi2 * r, cosPhi2 * r, sinTheta2 * sinPhi2 * r, 1.0);

            pointsArray.push(p1);
            pointsArray.push(p2);
            pointsArray.push(p3);
            pointsArray.push(p2);
            pointsArray.push(p4);
            pointsArray.push(p3);

            u1 = 1 - ((longNumber - 1) / longitudeBands);
            u2 = 1 - (longNumber / longitudeBands);
            v1 = 1 - ((latNumber - 1) / latitudeBands);
            v2 = 1 - (latNumber / latitudeBands);

            uv1 = vec2(u1, v1);
            uv2 = vec2(u2, v1);
            uv3 = vec2(u1, v2);
            uv4 = vec2(u2, v2);

            normalsArray.push(vec3(p1));
            normalsArray.push(vec3(p2));
            normalsArray.push(vec3(p3));
            normalsArray.push(vec3(p2));
            normalsArray.push(vec3(p4));
            normalsArray.push(vec3(p3));
        }
    }
}
function render() {
    ////////////////// Part 1 ////////////////////
    // This First Part goes to the Shadow Buffer //
    ///////////////////////////////////////////////

    gl.useProgram(shadowProgram);

    // send data to framebuffer for off-screen render
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    gl.disableVertexAttribArray(vPosition);
    gl.disableVertexAttribArray(vNormal);

    gl.enableVertexAttribArray(shadowVPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, shadowVBuffer);
    gl.vertexAttribPointer(shadowVPosition, 4, gl.FLOAT, false, 0, 0);

    gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    ///////////// Set Light Position As Eye ///////////////

    eye = vec3(lightPosition);


    ///////////// Render the Plane ///////////////

    modelViewMatrix = translate(planeTrans);
    modelViewMatrix = mult(modelViewMatrix, scalem(planeScale, planeScale, planeScale));

    pmvMatrixFromLight1 = mult(projectionMatrix, lookAt(eye, at, up));
    pmvMatrixFromLight1 = mult(pmvMatrixFromLight1, modelViewMatrix);
    gl.uniformMatrix4fv(pmvMatrixFromLightLoc1, false, flatten(pmvMatrixFromLight1));

    gl.drawArrays(gl.TRIANGLES, 0, planeVertCnt);


    ///////////// Render the Object ///////////////

    if (rotateObject)
        theta[axis] += 2.0;

    modelViewMatrix = translate(objX, objYMid + objYOff, objZ);
    modelViewMatrix = mult(modelViewMatrix, rotateX(theta[xAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(theta[yAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[zAxis]));
    modelViewMatrix = mult(modelViewMatrix, scalem(objScale, objScale, objScale));

    pmvMatrixFromLight2 = mult(projectionMatrix, lookAt(eye, at, up));
    pmvMatrixFromLight2 = mult(pmvMatrixFromLight2, modelViewMatrix);
    gl.uniformMatrix4fv(pmvMatrixFromLightLoc1, false, flatten(pmvMatrixFromLight2));

    gl.drawArrays(gl.TRIANGLES, planeVertCnt, pointsArray.length - planeVertCnt);
    ///////////////// Part 2 /////////////////
    // This Second Part goes to the Screen  //
    //////////////////////////////////////////

    gl.useProgram(program);

    // send data to GPU for normal render
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.disableVertexAttribArray(shadowVPosition);

    gl.enableVertexAttribArray(vPosition);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);


    ///////////// Set Camera Position As Eye ///////////////

    eye = cameraPosition;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelViewMatrix = lookAt(eye, at, up);


    //////////// Render the Plane /////////////

    modelViewStack.push(modelViewMatrix);

    modelViewMatrix = mult(modelViewMatrix, translate(planeTrans));
    modelViewMatrix = mult(modelViewMatrix, scalem(planeScale, planeScale, planeScale));

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
    gl.uniform1i(shadowTextureLoc, 0);

    gl.uniformMatrix4fv(pmvMatrixFromLightLoc2, false, flatten(pmvMatrixFromLight1));

    gl.drawArrays(gl.TRIANGLES, 0, planeVertCnt);


    //////////// Render the Object /////////////

    modelViewMatrix = modelViewStack.pop();

    modelViewMatrix = mult(modelViewMatrix, translate(objX, objYMid + objYOff, objZ));
    modelViewMatrix = mult(modelViewMatrix, rotateX(theta[xAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(theta[yAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[zAxis]));
    modelViewMatrix = mult(modelViewMatrix, scalem(objScale, objScale, objScale));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
    gl.uniform1i(shadowTextureLoc, 0);

    gl.uniformMatrix4fv(pmvMatrixFromLightLoc2, false, flatten(pmvMatrixFromLight2));
    gl.drawArrays(gl.TRIANGLES, planeVertCnt, pointsArray.length - planeVertCnt);


    requestAnimFrame(render);
}