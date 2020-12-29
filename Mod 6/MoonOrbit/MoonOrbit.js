"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: MoonOrbit
 */


var OFFSCREEN_WIDTH = 2048, OFFSCREEN_HEIGHT = 2048;

var shadowProgram;

var shadowVBuffer;
var shadowVPosition;
var shadowTexture;
var shadowTextureLoc;

var framebuffer, depthBuffer;

var pmvMatrixFromLightLoc1, pmvMatrixFromLightLoc2;
var pmvMatrixFromLight1, pmvMatrixFromLight2;

var drawShadowLoc;
var normalsArray = [];
var nBuffer;
var vNormal;

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var moonMaterialAmbient = vec4(0.7, 0.7, 0.7, 1.0);
var moonMaterialDiffuse = vec4(0.7, 0.7, 0.7, 1.0);
var moonMaterialSpecular = vec4(0.0, 0.0, 0.0, 1.0);

var earthMaterialAmbient = vec4(0.8, 0.0, .8, 1.0);
var earthMaterialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var earthMaterialSpecular = vec4(0.0, 0.0, 0.0, 1.0);

var moonShininess = 60.0;
var earthShininess = 40.0;
var shininessLoc;

var lightTheta = 2.8;
var lightRad = 20;
var lightPosition = [0.0, 1.0, lightRad, 0.0];
var lightPositionLoc;

var ambientProduct, ambientProductLoc;
var diffuseProduct, diffuseProductLoc;
var specularProduct, specularProductLoc;

var lightingLoc;
var rotateLighting = true;

var earthTexture, moonTexture;

var eScale = 1.3;
var mScale = 0.12;

var eTrans = [0.0, 1.0, 0];
var mTrans = [-2.6, 1.0, 0];

var earthTheta = 135;
var earthPhi = 10;

var moonTheta = 0;
var moonPhi = 0;

var orbitRad = 2.6;
var orbitAng = 3 * Math.PI / 4;

var modelViewStack = [];
var canvas;
var gl;
var program;

var latitudeBands = 30;
var longitudeBands = 30;
var radius = 1;

var pointsArray = [];
var texCoordsArray = [];

var vBuffer;
var tBuffer;

var vPosition;
var vTexCoord;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var texture, textureLoc;

var up = vec3(0.0, 1.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
var eye = vec3(0.0, 0.0, 1.0);

var near = -10;
var far = 30;
var left = -3.0;
var right = 3.0;
var ytop = 3.0;
var bottom = -3.0;

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

    loadImages(document.getElementById("earthImage"),
        document.getElementById("moonImage"));

    createSphereMap();

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
    textureLoc = gl.getUniformLocation(program, "texture");

    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    

    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Create normal buffer and vNormal attribute
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // Setting Lighting variables and their Uniform Locations
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    gl.uniform4fv(lightPositionLoc, lightPosition);

    shininessLoc = gl.getUniformLocation(program, "shininess");
    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");

    pmvMatrixFromLightLoc2 = gl.getUniformLocation(program, "pmvMatrixFromLight");
    shadowTextureLoc = gl.getUniformLocation(program, "shadowTexture");
    drawShadowLoc = gl.getUniformLocation(program, "drawShadow");
    gl.uniform1i(drawShadowLoc, false);


    render();
}
// Sets up the Frame Buffer Objects
function setFBOs() {
    shadowTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA,
        gl.UNSIGNED_BYTE, null);

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
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // check for completeness
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE)
        alert('Framebuffer Not Complete');

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
}
// Create SphereMap by filling pointsArray, normalsArray and texCoordsArray
function createSphereMap() {
    pointsArray = [];
    texCoordsArray = [];
    normalsArray = [];

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

            texCoordsArray.push(uv1);
            texCoordsArray.push(uv2);
            texCoordsArray.push(uv3);
            texCoordsArray.push(uv2);
            texCoordsArray.push(uv4);
            texCoordsArray.push(uv3);


            normalsArray.push(vec3(p1));
            normalsArray.push(vec3(p2));
            normalsArray.push(vec3(p3));
            normalsArray.push(vec3(p2));
            normalsArray.push(vec3(p4));
            normalsArray.push(vec3(p3));
        }
    }
}
function loadImages(earthImage, moonImage) {
    earthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, earthTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, earthImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, earthTexture);

    moonTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, moonTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, moonImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, moonTexture);
}
function setIllumination(isEarth) {
    if (isEarth) {
        ambientProduct = mult(lightAmbient, earthMaterialAmbient);
        diffuseProduct = mult(lightDiffuse, earthMaterialDiffuse);
        specularProduct = mult(lightSpecular, earthMaterialSpecular);
        gl.uniform1f(shininessLoc, earthShininess);
    }
    else {
        ambientProduct = mult(lightAmbient, moonMaterialAmbient);
        diffuseProduct = mult(lightDiffuse, moonMaterialDiffuse);
        specularProduct = mult(lightSpecular, moonMaterialSpecular);
        gl.uniform1f(shininessLoc, moonShininess);
    }

    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
}
function render() {

    /////////////////// Part 1 ////////////////////
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


    ///////////// Light Source and Camera Eye ///////////////

    lightTheta -= 0.01;
    if (lightTheta < 0)
        lightTheta += 2 * Math.PI;

    lightPosition[0] = lightRad * Math.sin(lightTheta);
    lightPosition[2] = lightRad * Math.cos(lightTheta);

    eye = vec3(lightPosition[0], lightPosition[1], lightPosition[2]);
    lightTheta += 0.01;


    ///////////// Render the Earth ///////////////

    modelViewMatrix = translate(eTrans);
    modelViewMatrix = mult(modelViewMatrix, rotateX(earthPhi));
    modelViewMatrix = mult(modelViewMatrix, rotateY(earthTheta));
    modelViewMatrix = mult(modelViewMatrix, scalem(eScale, eScale, eScale));

    pmvMatrixFromLight1 = mult(projectionMatrix, lookAt(eye, at, up));
    pmvMatrixFromLight1 = mult(pmvMatrixFromLight1, modelViewMatrix);
    gl.uniformMatrix4fv(pmvMatrixFromLightLoc1, false, flatten(pmvMatrixFromLight1));

    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);


    ///////////// Render the Moon ///////////////

    orbitAng -= 0.005;
    var shadowMoonX = orbitRad * Math.cos(orbitAng);
    var shadowMoonZ = orbitRad * Math.sin(orbitAng)
    orbitAng += 0.005;

    modelViewMatrix = translate(shadowMoonX, mTrans[1], shadowMoonZ);
    modelViewMatrix = mult(modelViewMatrix, rotateX(moonPhi));
    modelViewMatrix = mult(modelViewMatrix, rotateY(moonTheta));
    modelViewMatrix = mult(modelViewMatrix, scalem(mScale, mScale, mScale));

    pmvMatrixFromLight2 = mult(projectionMatrix, lookAt(eye, at, up));
    pmvMatrixFromLight2 = mult(pmvMatrixFromLight2, modelViewMatrix);
    gl.uniformMatrix4fv(pmvMatrixFromLightLoc1, false, flatten(pmvMatrixFromLight2));

    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);


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


    ///////////// Camera Eye ///////////////

    eye = vec3(0.0, 0.0, 1.0);

    gl.viewport(0, 0, canvas.width, canvas.height);


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    lightTheta -= 0.01;
    if (lightTheta < 0)
        lightTheta += 2 * Math.PI;

    lightPosition[0] = lightRad * Math.sin(lightTheta);
    lightPosition[2] = lightRad * Math.cos(lightTheta);

    gl.uniform4fv(lightPositionLoc, lightPosition);
    modelViewMatrix = lookAt(eye, at, up);

    //////////// Render the Earth /////////////

    modelViewStack.push(modelViewMatrix);

    modelViewMatrix = mult(modelViewMatrix, translate(eTrans));
    modelViewMatrix = mult(modelViewMatrix, rotateX(earthPhi));
    modelViewMatrix = mult(modelViewMatrix, rotateY(earthTheta));
    modelViewMatrix = mult(modelViewMatrix, scalem(eScale, eScale, eScale));

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, earthTexture);
    gl.uniform1i(textureLoc, 0);
    setIllumination(true);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
    gl.uniform1i(shadowTextureLoc, 2);

    gl.uniformMatrix4fv(pmvMatrixFromLightLoc2, false, flatten(pmvMatrixFromLight1));
    gl.uniform1i(drawShadowLoc, true);
    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);
    gl.uniform1i(drawShadowLoc, false);

    //////////// Render the Moon /////////////

    modelViewMatrix = modelViewStack.pop();

    orbitAng -= 0.005;
    var moonX = orbitRad * Math.cos(orbitAng);
    var moonZ = orbitRad * Math.sin(orbitAng)

    modelViewMatrix = mult(modelViewMatrix, translate(moonX, mTrans[1], moonZ));
    modelViewMatrix = mult(modelViewMatrix, rotateX(moonPhi));
    modelViewMatrix = mult(modelViewMatrix, rotateY(moonTheta));
    modelViewMatrix = mult(modelViewMatrix, scalem(mScale, mScale, mScale));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, moonTexture);
    gl.uniform1i(textureLoc, 1);
    setIllumination(false);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
    gl.uniform1i(shadowTextureLoc, 2);

    gl.uniformMatrix4fv(pmvMatrixFromLightLoc2, false, flatten(pmvMatrixFromLight2));
    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);


    requestAnimFrame(render);
}