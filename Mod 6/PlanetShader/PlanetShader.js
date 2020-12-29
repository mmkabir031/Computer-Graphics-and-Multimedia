"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: PlanetShader
 */
var canvas;
var gl;
var program;

var latitudeBands = 30;
var longitudeBands = 30;
var radius = 2;

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
var far = 10;
var left = -3.0;
var right = 3.0;
var ytop = 3.0;
var bottom = -3.0;
var normalsArray = [];
var nBuffer;
var vNormal;

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var moonMaterialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var moonMaterialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var moonMaterialSpecular = vec4(1.0, 0.8, 0.0, 1.0);

var otherMaterialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var otherMaterialDiffuse = vec4(0.8, 0.8, 1.0, 1.0);
var otherMaterialSpecular = vec4(0.8, 0.8, 1.0, 1.0);

var moonShininess = 100.0;
var otherShininess = 50.0;
var shininessLoc;

var lightPosition = [0.0, 1.0, 4.0, 0.0];
var lightPosition2;
var lightPositionLoc;
var lightTheta = 0;
var lightRad = 4;
var rotMat;

var ambientProduct, ambientProductLoc;
var diffuseProduct, diffuseProductLoc;
var specularProduct, specularProductLoc;

var lightingLoc;
var rotateLighting = true;

var theta = 0.0;
var phi = 0.0;
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
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    createSphereMap();

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

    // Create normal buffer and vNormal attribute
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // Setting Lighting variables and their Uniform Locations
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));

    shininessLoc = gl.getUniformLocation(program, "shininess");

    loadImage(document.getElementById("imageVal").value);
    if (document.getElementById("imageVal").value == "moonImage") {
        ambientProduct = mult(lightAmbient, moonMaterialAmbient);
        diffuseProduct = mult(lightDiffuse, moonMaterialDiffuse);
        specularProduct = mult(lightSpecular, moonMaterialSpecular);
        gl.uniform1f(shininessLoc, moonShininess);
    }
    else {
        ambientProduct = mult(lightAmbient, otherMaterialAmbient);
        diffuseProduct = mult(lightDiffuse, otherMaterialDiffuse);
        specularProduct = mult(lightSpecular, otherMaterialSpecular);
        gl.uniform1f(shininessLoc, otherShininess);
    }

    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));

    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));

    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));

    document.getElementById("imageVal").onchange =
        function (event) {
            loadImage(event.target.value);
            if (event.target.value == "moonImage") {
                ambientProduct = mult(lightAmbient, moonMaterialAmbient);
                diffuseProduct = mult(lightDiffuse, moonMaterialDiffuse);
                specularProduct = mult(lightSpecular, moonMaterialSpecular);
                gl.uniform1f(shininessLoc, moonShininess);
            }
            else {
                ambientProduct = mult(lightAmbient, otherMaterialAmbient);
                diffuseProduct = mult(lightDiffuse, otherMaterialDiffuse);
                specularProduct = mult(lightSpecular, otherMaterialSpecular);
                gl.uniform1f(shininessLoc, otherShininess);
            }

            gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
            gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
            gl.uniform4fv(specularProductLoc, flatten(specularProduct));

            createSphereMap();
        };

    lightingLoc = gl.getUniformLocation(program, "useLight");
    gl.uniform1i(lightingLoc, document.getElementById("lighting").checked);

    document.getElementById("lighting").onchange =
        function (event) {
            gl.uniform1i(lightingLoc, event.target.checked);
        };

    document.getElementById("rotateLighting").onchange =
        function (event) {
            rotateLighting = event.target.checked;
        };

    rotateLighting = document.getElementById("rotateLighting").checked;

    document.addEventListener("keydown",
        function (event) {
            if (event.keyCode == 65 || event.keyCode == 37) {   // A or Left
                theta += 0.1;
            }

            if (event.keyCode == 68 || event.keyCode == 39) {   // D or Right
                theta -= 0.1; 
            }

            if (event.keyCode == 87 || event.keyCode == 38) {   // W or Up
                phi += 0.1;
            }

            if (event.keyCode == 83 || event.keyCode == 40) {   // S or Down
                phi-= 0.1;
            }

        }, false);
    render();
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

function loadImage(imageTag) {
    var image = document.getElementById(imageTag); 
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(textureLoc, 0);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (phi < 0)
        phi += 2 * Math.PI;
    if (phi > 2 * Math.PI)
        phi -= 2 * Math.PI;

    if (phi > Math.PI / 2 && phi < 3 * Math.PI / 2)
        up = vec3(0.0, -1.0, 0.0);
    else
        up = vec3(0.0, 1.0, 0.0);

    eye = vec3(Math.sin(theta) * Math.cos(phi),
        Math.sin(phi),
        Math.cos(theta) * Math.cos(phi));


    modelViewMatrix = lookAt(eye, at, up);

    if (rotateLighting) {
        lightTheta -= 0.01;
        lightPosition[0] = lightRad * Math.sin(lightTheta);
        lightPosition[2] = lightRad * Math.cos(lightTheta);
    }

    // Offsetting the light to compensate for rotation of eye
    var lightPosition2 = mult(modelViewMatrix, lightPosition);
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition2));

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);

    requestAnimFrame(render);
}