"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: ShadowMap2
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
var pmvMatrixFromLight1;  // for rendering the plane
var pmvMatrixFromLight2;  // for rendering the cube
var pmvMatrixFromLight3;  // for rendering the embedded sphere
var pmvMatrixFromLight4;  // for rendering the object loaded


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
var cubeVertCnt = 36;
var cubeVertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var soccerballVertCnt;
var objVertCnt;

var texCoordsArray = [];
var tBuffer;
var vTexCoord;

var textureLoc;
var showTextureLoc;
var stripedTexture;
var soccerballScale = 0.2;

var cubeTrans = [-0.3, 1.5, 0.4];
var cubeRot = [108.0, 15.0, 64.0];
var cubeScale = 0.4;
var cubAng = 0;

var sphereTrans = [-1.2, -0.5, 1.0];
var sphereRot = [0.0, 0.0, 0.0];
var sphereAng = 0;
var sphereXMov = 0;
var sphereYMov = 0;
var sphereZMov = 0;

var objZOff = 0.0;
var objX2Off = 0.0;
var objY2Off = 0.0;
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
    createCube();
    createSphereMap();
    soccerballVertCnt = pointsArray.length - planeVertCnt - cubeVertCnt;

    createSphereMap();  // Load in the sphere as the default object
    objVertCnt = pointsArray.length - planeVertCnt - cubeVertCnt - soccerballVertCnt;
    objScale = sphereScale;
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
    // Create texture buffer and vTexCoord attribute
    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
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


    document.getElementById("oYPos").value = 0;
    document.getElementById("oYPos").oninput =
        function (event) {
            objYOff = Number(event.target.value);
        };

    document.getElementById("oXPos").value = 0;
    document.getElementById("oXPos").oninput =
        function (event) {
            objZOff = -Number(event.target.value);
            objX2Off = -objZOff / 3;
            objY2Off = -objZOff / 20;
        };

    document.getElementById("sphereZPos").value = 0;
    document.getElementById("sphereZPos").oninput =
        function (event) {
            sphereXMov = Number(event.target.value);
            sphereYMov = sphereXMov * 0.27;
            sphereZMov = sphereXMov * 0.8;
        };

    document.getElementById("selObject").onchange =
        function (event) {
            var objSelected = event.target.value;
            var objData = "";

            initPoints();
            createPlane();
            createCube();
            createSphereMap();

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
                var startV = pointsArray.length;
                loadobj(objData);
                for (var nextV = startV; nextV < pointsArray.length; ++nextV)
                    texCoordsArray.push(vec2(0, 0));
                updateBuffers();
            }
        };
    loadImage(document.getElementById("texture1"));
    textureLoc = gl.getUniformLocation(program, "texture");
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, stripedTexture);
    gl.uniform1i(textureLoc, 1);

    showTextureLoc = gl.getUniformLocation(program, "showTexture");
    gl.uniform1i(showTextureLoc, false);
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

    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, shadowVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    document.getElementById("oYPos").value = 0;
    document.getElementById("oXPos").value = 0;
    objYOff = objZOff = objX2Off = objY2Off = 0;
    document.getElementById("sphereZPos").value = 0;
    sphereXMov = sphereYMov = sphereZMov = 0;

    objVertCnt = pointsArray.length - planeVertCnt - cubeVertCnt - soccerballVertCnt;
}

function initPoints() {
    pointsArray = [];
    normalsArray = [];
    texCoordsArray = [];
}

function loadImage(texImage) {
    stripedTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, stripedTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
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

    texCoordsArray.push(vec2(0, 0));
    texCoordsArray.push(vec2(0, 1));
    texCoordsArray.push(vec2(1, 1));
    texCoordsArray.push(vec2(1, 1));
    texCoordsArray.push(vec2(1, 0));
    texCoordsArray.push(vec2(0, 0));
}

// Create Cube filling pointsArray and normalsArray
function createCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(5, 1, 2, 6);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
    var t1 = subtract(cubeVertices[a], cubeVertices[b]);
    var t2 = subtract(cubeVertices[a], cubeVertices[c]);
    var normal = vec3(cross(t1, t2));

    pointsArray.push(cubeVertices[a]);
    normalsArray.push(normal);
    pointsArray.push(cubeVertices[b]);
    normalsArray.push(normal);
    pointsArray.push(cubeVertices[c]);
    normalsArray.push(normal);
    pointsArray.push(cubeVertices[a]);
    normalsArray.push(normal);
    pointsArray.push(cubeVertices[c]);
    normalsArray.push(normal);
    pointsArray.push(cubeVertices[d]);
    normalsArray.push(normal);

    texCoordsArray.push(vec2(0, 0));
    texCoordsArray.push(vec2(0, 1));
    texCoordsArray.push(vec2(1, 1));
    texCoordsArray.push(vec2(1, 1));
    texCoordsArray.push(vec2(1, 0));
    texCoordsArray.push(vec2(0, 0));
}

// Create SphereMap by filling pointsArray and normalsArray
function createSphereMap() {
    var phi1, phi2, sinPhi1, sinPhi2, cosPhi1, cosPhi2;
    var theta1, theta2, sinTheta1, sinTheta2, cosTheta1, cosTheta2;
    var p1, p2, p3, p4, u1, u2, v1, v2, uv1, uv2, uv3, uv4;

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

            p1 = vec4(cosTheta1 * sinPhi1 * radius, cosPhi1 * radius, sinTheta1 * sinPhi1 * radius, 1.0);
            p2 = vec4(cosTheta2 * sinPhi1 * radius, cosPhi1 * radius, sinTheta2 * sinPhi1 * radius, 1.0);
            p3 = vec4(cosTheta1 * sinPhi2 * radius, cosPhi2 * radius, sinTheta1 * sinPhi2 * radius, 1.0);
            p4 = vec4(cosTheta2 * sinPhi2 * radius, cosPhi2 * radius, sinTheta2 * sinPhi2 * radius, 1.0);

            pointsArray.push(p1);
            pointsArray.push(p2);
            pointsArray.push(p3);
            pointsArray.push(p2);
            pointsArray.push(p4);
            pointsArray.push(p3);

            normalsArray.push(vec3(p1));
            normalsArray.push(vec3(p2));
            normalsArray.push(vec3(p3));
            normalsArray.push(vec3(p2));
            normalsArray.push(vec3(p4));
            normalsArray.push(vec3(p3));

            u1 = 1 - ((longNumber - 1) / longitudeBands);
            u2 = 1 - (longNumber / longitudeBands);
            v1 = 1 - ((latNumber - 1) / latitudeBands);
            v2 = 1 - (latNumber / latitudeBands);

            uv1 = vec2(u1, v1);
            uv2 = vec2(u2, v1);
            uv3 = vec2(u1, v2);
            uv4 = vec2(u2, v2);

            texCoordsArray.push(uv1);
            texCoordsArray.push(uv2);
            texCoordsArray.push(uv3);
            texCoordsArray.push(uv2);
            texCoordsArray.push(uv4);
            texCoordsArray.push(uv3);
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
    gl.disableVertexAttribArray(vTexCoord);

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


    ///////////// Render the Cube ///////////////

    modelViewMatrix = translate(cubeTrans);
    modelViewMatrix = mult(modelViewMatrix, rotateX(cubeRot[0]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(cubeRot[1]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(cubeRot[2]));
    modelViewMatrix = mult(modelViewMatrix, scalem(cubeScale, cubeScale, cubeScale));

    pmvMatrixFromLight2 = mult(projectionMatrix, lookAt(eye, at, up));
    pmvMatrixFromLight2 = mult(pmvMatrixFromLight2, modelViewMatrix);
    gl.uniformMatrix4fv(pmvMatrixFromLightLoc1, false, flatten(pmvMatrixFromLight2));

    gl.drawArrays(gl.TRIANGLES, planeVertCnt, cubeVertCnt);


    //////////// Render the Embedded Sphere /////////////

    sphereAng += 2.0

    var xAdd = (sphereZMov == 0) ? 0 :
        (sphereZMov < 0.5) ? 0.5 : sphereZMov;
    var yAdd = xAdd * 0.27;
    var zAdd = xAdd * 0.8;
    modelViewMatrix = translate(sphereTrans[0] + xAdd,
        sphereTrans[1] + yAdd,
        sphereTrans[2] + zAdd);
    modelViewMatrix = mult(modelViewMatrix, rotateX(sphereRot[0]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(sphereRot[1] + sphereAng));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(sphereRot[2]));
    modelViewMatrix = mult(modelViewMatrix, scalem(soccerballScale, soccerballScale, soccerballScale));

    pmvMatrixFromLight3 = mult(projectionMatrix, lookAt(eye, at, up));
    pmvMatrixFromLight3 = mult(pmvMatrixFromLight3, modelViewMatrix);
    gl.uniformMatrix4fv(pmvMatrixFromLightLoc1, false, flatten(pmvMatrixFromLight3));

    gl.drawArrays(gl.TRIANGLES, planeVertCnt + cubeVertCnt, soccerballVertCnt);


    ///////////// Render the Loaded Object ///////////////

    if (rotateObject)
        theta[axis] += 2.0;

    modelViewMatrix = translate(objX, objYMid + objYOff, objZ + objZOff);
    modelViewMatrix = mult(modelViewMatrix, rotateX(theta[xAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(theta[yAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[zAxis]));
    modelViewMatrix = mult(modelViewMatrix, scalem(objScale, objScale, objScale));

    pmvMatrixFromLight4 = mult(projectionMatrix, lookAt(eye, at, up));
    pmvMatrixFromLight4 = mult(pmvMatrixFromLight4, modelViewMatrix);
    gl.uniformMatrix4fv(pmvMatrixFromLightLoc1, false, flatten(pmvMatrixFromLight4));

    gl.drawArrays(gl.TRIANGLES,
        planeVertCnt + cubeVertCnt + soccerballVertCnt, objVertCnt);


    ///////////////// Part 2 /////////////////
    // This Second Part goes to the Screen  //
    //////////////////////////////////////////

    gl.useProgram(program);

    // send data to GPU for normal render
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.disableVertexAttribArray(shadowVPosition);

    gl.enableVertexAttribArray(vPosition);
    gl.enableVertexAttribArray(vNormal);
    gl.enableVertexAttribArray(vTexCoord);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);


    ///////////// Set Camera Position As Eye ///////////////

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = cameraPosition;
    modelViewMatrix = lookAt(eye, at, up);


    //////////// Render the Plane /////////////

    modelViewStack.push(modelViewMatrix);

    modelViewMatrix = mult(modelViewMatrix, translate(planeTrans));
    modelViewMatrix = mult(modelViewMatrix, scalem(planeScale, planeScale, planeScale));

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(pmvMatrixFromLightLoc2, false, flatten(pmvMatrixFromLight1));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
    gl.uniform1i(shadowTextureLoc, 0);

    gl.drawArrays(gl.TRIANGLES, 0, planeVertCnt);


    //////////// Render the Cube /////////////

    modelViewMatrix = modelViewStack.pop();
    modelViewStack.push(modelViewMatrix);

    modelViewMatrix = mult(modelViewMatrix, translate(cubeTrans));
    modelViewMatrix = mult(modelViewMatrix, rotateX(cubeRot[0]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(cubeRot[1]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(cubeRot[2]));
    modelViewMatrix = mult(modelViewMatrix, scalem(cubeScale, cubeScale, cubeScale));

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(pmvMatrixFromLightLoc2, false, flatten(pmvMatrixFromLight2));

    gl.drawArrays(gl.TRIANGLES, planeVertCnt, cubeVertCnt);


    //////////// Render the Embedded Sphere /////////////

    modelViewMatrix = modelViewStack.pop();
    modelViewStack.push(modelViewMatrix);

    modelViewMatrix = mult(modelViewMatrix,
        translate(sphereTrans[0] + sphereXMov,
            sphereTrans[1] + sphereYMov,
            sphereTrans[2] + sphereZMov));
    modelViewMatrix = mult(modelViewMatrix, rotateX(sphereRot[0]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(sphereRot[1] + sphereAng));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(sphereRot[2]));
    modelViewMatrix = mult(modelViewMatrix, scalem(soccerballScale, soccerballScale, soccerballScale));

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(pmvMatrixFromLightLoc2, false, flatten(pmvMatrixFromLight3));

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, stripedTexture);
    gl.uniform1i(textureLoc, 1);
    gl.uniform1i(showTextureLoc, true);

    gl.drawArrays(gl.TRIANGLES, planeVertCnt + cubeVertCnt, soccerballVertCnt);

    gl.uniform1i(showTextureLoc, false);


    //////////// Render the Object /////////////

    modelViewMatrix = modelViewStack.pop();

    modelViewMatrix = mult(modelViewMatrix, translate(objX + objX2Off, objYMid + objYOff + objY2Off, objZ));
    modelViewMatrix = mult(modelViewMatrix, rotateX(theta[xAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(theta[yAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[zAxis]));
    modelViewMatrix = mult(modelViewMatrix, scalem(objScale, objScale, objScale));

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(pmvMatrixFromLightLoc2, false, flatten(pmvMatrixFromLight4));

    gl.drawArrays(gl.TRIANGLES,
        planeVertCnt + cubeVertCnt + soccerballVertCnt, objVertCnt);

    requestAnimFrame(render);
}