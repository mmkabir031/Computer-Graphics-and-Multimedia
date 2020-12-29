"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: RunningRobot
 */

var black = vec4(0.0, 0.0, 0.0, 1.0);
var white = vec4(1.0, 1.0, 1.0, 1.0);
var red = vec4(1.0, 0.0, 0.0, 1.0);
var yellow = vec4(1.0, 1.0, 0.0, 1.0);
var lightblue = vec4(0.0, 0.0, 1.0, 1.0);
var darkblue = vec4(0.0, 0.0, 0.5, 1.0);
var lightgreen = vec4(0.0, 1.0, 0.0, 1.0);
var darkgreen = vec4(0.0, 0.5, 0.0, 1.0);
var lightcyan = vec4(0.0, 1.0, 1.0, 1.0);
var darkcyan = vec4(0.0, 0.5, 0.5, 1.0);
var brown = vec4(0.65, 0.16, 0.16, 1);
var colorLoc;
var tBuffer;
var vTexCoord;
var texCoordsArray = [];
var textureLoc;
var showTextureLoc;

var stripedTexture;
var wallpaperTexture;
var fabricTexture;
var surfaceTextures;
var vPosition;

var lightAmbient = vec4(0.4, 0.4, 0.4, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 100.0;

var shinniness;

var ambientColor, diffuseColor, specularColor;
var ambientProduct, diffuseProduct, specularProduct;
var ambientProductLoc, diffuseProductLoc, specularProductLoc;
var shininessLoc;

var lightPosition = vec4(-250.0, 250.0, 250.0, 0.0);
var lightPosition2;
var lightPositionLoc;
var yAngleDeg;
var xAngleDeg;

var nBuffer;
var vNormal;
var normalsArray = [];

var shadowProgram;

var SHADOWTEXTUREWIDTH = 2048, SHADOWTEXTUREHEIGHT = 2048;
var framebuffer, depthBuffer;

var shadowVBuffer;
var shadowVPosition;
var shadowVPositionLoc;

var projectionMatrixFromLight;
var pmvMatrixFromLightLoc1, pmvMatrixFromLightLoc2;

var modelViewMatrix2;
var mvStack2 = [];

var instanceMatrix2;

var shadowTexture;
var shadowTextureLoc;

var near = -10.0;
var far = 150.0;
var left = -75.0;
var right = 75.0;
var ytop = 50.0;
var bottom = -50.0;

var lightRad = 40;
var lightEye = vec3(lightRad, lightRad, lightRad);
var lightAt = vec3(0.0, 0.0, 0.0);
var lightUp = vec3(0.0, 1.0, 0.0);

var visibleState = 0;
var visibleStateLoc;

var inShadow = false;

var xMax = 48;
var xMin = -48;
var zMax = 48;
var zMin = -48;

var walkDistance = 0.25;
var runDistance = 1.0;

var cubeMap;
var cubeFrontImage;
var cubeBackImage;
var cubeTopImage;
var cubeBottomImage;
var cubeLeftImage;
var cubeRightImage;

var showSkyLoc;
var skyboxScale = 600;


var cubeVerts = 0;
var sphereVerts = 0;
var cylinderVerts = 0;
var cylinderEdgeVerts = 0;


var groundWidth = 100;
var groundHeight = .5;
var groundFloor = -4.6;

var groundId = 0;
var columnId1 = 1;
var columnId2 = 2;
var columnId3 = 3;
var columnId4 = 4;
var columnId5 = 5;
var columnId6 = 6;
var columnId7 = 7;
var columnId8 = 8;
var columnId9 = 9;
var columnId10 = 10;

var columnDiameter = 2;
var columnHeight = 18;

var colPosArray = [null, // dummy value
    vec3(5, 0, 5), vec3(40, 0, 40), vec3(30, 0, 30),
    vec3(20, 0, 40), vec3(10, 0, 40), vec3(0, 0, 40),
    vec3(-10, 0, 40), vec3(-20, 0, 40), vec3(-30, 0, 40),
    vec3(-40, 0, 40)];


var sphereId1 = 11;
var sphereId2 = 12;
var sphereId3 = 13;
var sphereId4 = 14;
var sphereId5 = 15;
var sphereId6 = 16;
var sphereId7 = 17;
var sphereId8 = 18;
var sphereId9 = 19;
var sphereId10 = 20;

// the null values are dummy values
var spherePosArray = [null, null, null, null, null, null,
    null, null, null, null, null,
    vec3(5, 13.3, 5), vec3(40, 13.3, 40),
    vec3(30, 13.3, 30), vec3(20, 13.3, 40),
    vec3(10, 13.3, 40), vec3(0, 13.3, 40),
    vec3(-10, 13.3, 40), vec3(-20, 13.3, 40),
    vec3(-30, 13.3, 40), vec3(-40, 13.3, 40)];

var sphereDiameter = 1;
var sphereHeight = 1.25;
var sphereRot = 0;

var numSceneNodes = 21;

var grayish = vec4(0.8, 0.6, 0.6, 1.0);

var scene = [];

var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var eye;

var xAngle = 0.0;
var yAngle = 0.5;
var eyeRadius = 50.0;

var fovy = 37;
var aspect = 1.3;
var pnear = 0.01;
var pfar = 1000.0;

var trackingMouse = false;
var curx = 0;
var cury = 0;

var armStack = [];
var legStack = [];


var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;
var instanceMatrix;

var modelViewMatrixLoc;
var projectionMatrixLoc;

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var torsoId = 0;
var headId = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;

var eye1Id = 11;
var eye2Id = 12;
var mouthId = 13;

var torsoHeight = 5.0;
var torsoWidth = 1.0;
var upperArmHeight = 2.4;
var lowerArmHeight = 1.6;
var upperArmWidth = 0.5;
var lowerArmWidth = 0.5;
var upperLegWidth = 0.5;
var lowerLegWidth = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.0;

var eyeWidth = 0.1;
var eyeDepth = 0.05;
var mouthWidth = 0.3;
var mouthHeight = 0.1;
var mouthDepth = 0.05;

var numFigureNodes = 14;

var figureTheta = [50, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0, 0, 0, 0];
var figure = [];
var figurePos = [0, 0, 0];
var fTheta;
var mvStack = [];

var vBuffer;

var pointsArray = [];

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
    /*program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    instanceMatrix = mat4();
    modelViewMatrix = mat4();

    projectionMatrix = perspective(fovy, aspect, pnear, pfar);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));*/

    makeCube();

    cubeVerts = pointsArray.length;

    makeSphere();
    sphereVerts = pointsArray.length - cubeVerts;

    makeCylinder(true);
    cylinderVerts = pointsArray.length - cubeVerts - sphereVerts;



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

    projectionMatrixFromLight = ortho(left, right, bottom, ytop, near, far);


    gl.useProgram(program);

    pmvMatrixFromLightLoc2 = gl.getUniformLocation(program, "pmvMatrixFromLight");
    shadowTextureLoc = gl.getUniformLocation(program, "shadowTexture");

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    shininessLoc = gl.getUniformLocation(program, "shininess");

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
        flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
        flatten(specularProduct));

    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);

    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    gl.uniform4fv(lightPositionLoc, lightPosition);

    projectionMatrix = perspective(fovy, aspect, pnear, pfar);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    visibleState = 1;
    visibleStateLoc = gl.getUniformLocation(program, "visibleState");
    gl.uniform1i(visibleStateLoc, visibleState);

    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);



    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    /*var*/ vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    for (var i = 0; i < numFigureNodes; i++) {
        figure[i] = createNode(null, null, null, null);
        initFigureNodes(i);
    }
    for (var i = 0; i < numSceneNodes; i++) {
        scene[i] = createNode(null, null, null, null);
        initSceneNodes(i);
    }
    colorLoc = gl.getUniformLocation(program, "fColor");

    canvas.addEventListener("mousedown", function (event) {
        var x = 2 * event.clientX / canvas.width - 1;
        var y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
        startMotion(x, y);
    });

    canvas.addEventListener("mouseup", function (event) {
        var x = 2 * event.clientX / canvas.width - 1;
        var y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
        stopMotion(x, y);
    });

    canvas.addEventListener("mousemove", function (event) {

        var x = 2 * event.clientX / canvas.width - 1;
        var y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
        mouseMotion(x, y);
    });

    document.addEventListener("keydown",
        function (event) {
            if (event.keyCode == 65 || event.keyCode == 37) {   // A or Left
                figureTheta[torsoId] -= 5;
                initFigureNodes(torsoId);
            }

            if (event.keyCode == 68 || event.keyCode == 39) {   // D or Right
                figureTheta[torsoId] += 5;
                initFigureNodes(torsoId);
            }

            if (event.keyCode == 87 || event.keyCode == 38) {   // W or Up
                walkForward();
                
            }

            if (event.keyCode == 83 || event.keyCode == 40) {   // S or Down
                runForward();
            }

            if (event.keyCode == 33) {   // Page Up
                if (eyeRadius < 200) {
                    ++eyeRadius;
                }
            }

            if (event.keyCode == 34) {   // Page Down
                if (eyeRadius > 20) {
                    --eyeRadius;
                }
            }
        }, false);

    document.addEventListener("wheel",
        function (event) {
            var delta = Math.sign(event.deltaY);
            if (eyeRadius < 200 && delta > 0) {
                eyeRadius += 2;
            }
            else if (eyeRadius > 20 && delta < 0) {
                eyeRadius -= 2;
            }
        });

    cubeFrontImage = document.getElementById("cubefront");
    cubeBackImage = document.getElementById("cubeback");
    cubeTopImage = document.getElementById("cubetop");
    cubeBottomImage = document.getElementById("cubebottom");
    cubeLeftImage = document.getElementById("cubeleft");
    cubeRightImage = document.getElementById("cuberight");

    configureCubeMap(cubeFrontImage, cubeBackImage, cubeTopImage,
        cubeBottomImage, cubeRightImage, cubeLeftImage);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);

    showSkyLoc = gl.getUniformLocation(program, "showSky");

    loadImages(document.getElementById("texture1"),
        document.getElementById("texture2"),
        document.getElementById("texture3"));
    textureLoc = gl.getUniformLocation(program, "texture");

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, stripedTexture);
    gl.uniform1i(textureLoc, 2);

    showTextureLoc = gl.getUniformLocation(program, "showTexture");
    gl.uniform1i(showTextureLoc, false);

    // Create texture buffer and vTexCoord attribute
    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    render();
}
function loadImages(texImage1, texImage2, texImage3) {
    stripedTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, stripedTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texImage1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    wallpaperTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, wallpaperTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texImage2);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    fabricTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fabricTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texImage3);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    surfaceTextures = [stripedTexture, wallpaperTexture, fabricTexture];
}
// Sets up the Frame Buffer Objects
function setFBOs() {
    shadowTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SHADOWTEXTUREWIDTH, SHADOWTEXTUREHEIGHT, 0, gl.RGBA,
        gl.UNSIGNED_BYTE, null);

    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

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
        SHADOWTEXTUREWIDTH, SHADOWTEXTUREHEIGHT);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // check for completeness
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE)
        alert('Framebuffer Not Complete');
}
function configureCubeMap(frontImg, backImg, topImg, bottomImg, rightImg, leftImg) {
    cubeMap = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, rightImg);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, leftImg);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, topImg);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, bottomImg);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, frontImg);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, backImg);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
}

function mouseMotion(x, y) {
    if (trackingMouse) {
        xAngle += (x - curx);
        curx = x;
        yAngle += (cury - y);
        cury = y;
    }
}

function startMotion(x, y) {
    trackingMouse = true;
    curx = x;
    cury = y;
}

function stopMotion(x, y) {
    trackingMouse = false;
}


function offsetFigurePos(unit) {
    var initX = figurePos[0];
    var initZ = figurePos[2];

    fTheta = Math.PI * figureTheta[torsoId] / 180;
    figurePos[0] += Math.sin(fTheta) * unit;
    figurePos[2] += Math.cos(fTheta) * unit;
    for (var i = 1; i <= 4; ++i) {
        if (!collision()) {
            break;
        } else if (i == 4) {
            figurePos[0] = initX;
            figurePos[2] = initZ;
        } else { // attempts made at different distances
            figurePos[0] = initX + Math.sin(fTheta) * unit * (4 - i) / 4;
            figurePos[2] = initZ + Math.cos(fTheta) * unit * (4 - i) / 4;
        }
    }

    checkEdge();

    initFigureNodes(torsoId);
}
function collision() {
    for (var i = 0; i < colPosArray.length; ++i) {
        if (colPosArray[i] != null) {
            if (circleRectCollide(colPosArray[i][0],
                colPosArray[i][2], columnDiameter / 2,
                figurePos[0] - torsoWidth,
                figurePos[2] - torsoWidth,
                figurePos[0] + torsoWidth,
                figurePos[2] + torsoWidth)) {
                return true;
            }
        }
    }
    return false;
}
function circleRectCollide(circX, circY, circRad,
    rectLeft, rectTop, rectRight, rectBottom) {
    // Find the closest point to the circle within the rectangle
    var closestX = Math.min(rectRight, Math.max(rectLeft, circX));
    var closestY = Math.min(rectBottom, Math.max(rectTop, circY));

    // Find the distance between circle's center and closest point
    var distanceX = circX - closestX;
    var distanceY = circY - closestY;

    // If less than the circle's radius, an collision has occured
    var distanceSquared = (distanceX * distanceX) +
        (distanceY * distanceY);
    return distanceSquared < (circRad * circRad);
}
function checkEdge() {
    if (figurePos[0] < xMin) {
        figurePos[0] = xMin;
    }
    else if (figurePos[0] > xMax) {
        figurePos[0] = xMax;
    }
    if (figurePos[2] < zMin) {
        figurePos[2] = zMin;
    }
    else if (figurePos[2] > zMax) {
        figurePos[2] = zMax;
    }
}

function walkForward() {
    offsetFigurePos(walkDistance);
    walkArmMove();
    walkLegMove();
}

function runForward() {
    offsetFigurePos(runDistance);
    runArmMove();
    runLegMove();
}
function runArmMove() {
    if (armStack.length == 0) {
        armBackForth(rightLowerArmId, 15, 5, 12, 2);
        armBackForth(leftLowerArmId, 15, -5, 12, 2);
        armBackForth(rightUpperArmId, 15, 5, 12, 2);
        armBackForth(leftUpperArmId, 15, -5, 12, 2);
    }
}

function runLegMove() {
    if (legStack.length == 0) {
        legBackForthV1(rightLowerLegId, 15, 4, 12, 2);
        legBackForthV1(leftLowerLegId, 15, 4, 12, 2);
        legBackForthV2(rightUpperLegId, 15, -6, -4, 12, 2);
        legBackForthV2(leftUpperLegId, 15, 4, 6, 12, 2);
    }
}

function walkArmMove() {
    if (armStack.length == 0) {
        armBackForth(rightLowerArmId, 8, 2, 30, 2);
        armBackForth(leftLowerArmId, 8, -2, 30, 2);
        armBackForth(rightUpperArmId, 8, 2, 30, 2);
        armBackForth(leftUpperArmId, 8, -2, 30, 2);
    }
}
function walkLegMove() {
    if (legStack.length == 0) {
        legBackForthV1(rightLowerLegId, 8, 1, 30, 2);
        legBackForthV1(leftLowerLegId, 8, 1, 30, 2);
        legBackForthV2(rightUpperLegId, 8, -3, -2, 30, 2);
        legBackForthV2(leftUpperLegId, 8, 2, 3, 30, 2);
    }
}

function armBackForth(id, reps, angoff, delay, parts) {
    armStack.push(true);
    armForth(id, reps, reps, angoff, delay, parts);
}

function armForth(id, start, curr, off, delay, parts) {
    figureTheta[id] += off;
    initFigureNodes(id);

    --curr;
    setTimeout(function () {
        if (curr > 0) {
            armForth(id, start, curr, off, delay, parts);
        }
        if (curr == 0) {
            armBack(id, start, start, off, delay, parts);
        }
    }, delay);
}

function armBack(id, start, curr, off, delay, parts) {
    figureTheta[id] -= off;
    initFigureNodes(id);

    --curr;
    if (curr > 0) {
        setTimeout(function () {
            armBack(id, start, curr, off, delay, parts);
        }, delay);
    }
    else {
        --parts;
        if (parts > 0) {
            armForth(id, start, start, -off, delay, parts);
        }
        else {
            armStack.pop();
        }
    }
}

function legBackForthV1(id, reps, angoff, delay, parts) {
    legStack.push(true);
    legForthV1(id, reps, reps, angoff, delay, parts);
}

function legForthV1(id, start, curr, off, delay, parts) {
    figureTheta[id] += off;
    initFigureNodes(id);

    --curr;
    setTimeout(function () {
        if (curr > 0) {
            legForthV1(id, start, curr, off, delay, parts);
        }
        if (curr == 0) {
            legBackV1(id, start, start, off, delay, parts);
        }
    }, delay);
}

function legBackV1(id, start, curr, off, delay, parts) {
    figureTheta[id] -= off;
    initFigureNodes(id);

    --curr;
    if (curr > 0) {
        setTimeout(function () {
            legBackV1(id, start, curr, off, delay, parts);
        }, delay);
    }
    else {
        --parts;
        if (parts > 0) {
            legForthV1(id, start, start, off, delay, parts);
        }
        else {
            legStack.pop();
        }
    }
}

function legBackForthV2(id, reps, angoff1, angoff2, delay, parts) {
    legStack.push(true);
    legForthV2(id, reps, reps, angoff1, angoff2, delay, parts);
}

function legForthV2(id, start, curr, off, off2, delay, parts) {
    figureTheta[id] += off;
    initFigureNodes(id);

    --curr;
    setTimeout(function () {
        if (curr > 0) {
            legForthV2(id, start, curr, off, off2, delay, parts);
        }
        if (curr == 0) {
            legBackV2(id, start, start, off, off2, delay, parts);
        }
    }, delay);
}

function legBackV2(id, start, curr, off, off2, delay, parts) {
    figureTheta[id] -= off;
    initFigureNodes(id);

    --curr;
    if (curr > 0) {
        setTimeout(function () {
            legBackV2(id, start, curr, off, off2, delay, parts);
        }, delay);
    }
    else {
        --parts;
        if (parts > 0) {
            legForthV2(id, start, start, -off2, -off, delay, parts);
        }
        else {
            legStack.pop();
        }
    }
}

function createNode(transform, render, sibling, child, color1, color2, texIndex1, texIndex2) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
        color1: color1,
        color2: color2,
        texIndex1: texIndex1,
        texIndex2: texIndex2
    }
    return node;
}


function initFigureNodes(Id) {
    var m;

    switch (Id) {

        case torsoId:
            m = translate(figurePos);
            m = mult(m, rotate(figureTheta[torsoId], 0, 1, 0));
            figure[torsoId] = createNode(m, torso, null, headId, red, null, null, null);
            break;

        case headId:
        case head1Id:
        case head2Id:
            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(figureTheta[head1Id], 1, 0, 0))
            m = mult(m, rotate(figureTheta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[headId] = createNode(m, head, leftUpperArmId, eye1Id, yellow,
                null, null, null);
            break;

        case eye1Id:
            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(figureTheta[head1Id], 1, 0, 0))
            m = mult(m, rotate(figureTheta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[eye1Id] = createNode(m, lefteye, eye2Id, null, black, null, null, null);
            break;

        case eye2Id:
            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(figureTheta[head1Id], 1, 0, 0))
            m = mult(m, rotate(figureTheta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[eye2Id] = createNode(m, righteye, mouthId, null, black, null, null, null);
            break;

        case mouthId:
            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(figureTheta[head1Id], 1, 0, 0))
            m = mult(m, rotate(figureTheta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[mouthId] = createNode(m, mouth, null, null, black, null, null, null);
            break;

        case leftUpperArmId:
            m = translate(-(torsoWidth * 0.75), 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(figureTheta[leftUpperArmId], 1, 0, 0));
            figure[leftUpperArmId] = createNode(m, leftUpperArm, rightUpperArmId, leftLowerArmId,
                lightgreen, null, null, null);
            break;

        case rightUpperArmId:
            m = translate(torsoWidth * 0.75, 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(figureTheta[rightUpperArmId], 1, 0, 0));
            figure[rightUpperArmId] = createNode(m, rightUpperArm, leftUpperLegId, rightLowerArmId,
                lightgreen, null, null, null);
            break;

        case leftUpperLegId:
            m = translate(-(torsoWidth * 0.75), 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(figureTheta[leftUpperLegId], 1, 0, 0));
            figure[leftUpperLegId] = createNode(m, leftUpperLeg, rightUpperLegId, leftLowerLegId,
                lightblue, null, null, null);
            break;

        case rightUpperLegId:
            m = translate(torsoWidth * 0.75, 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(figureTheta[rightUpperLegId], 1, 0, 0));
            figure[rightUpperLegId] = createNode(m, rightUpperLeg, null, rightLowerLegId,
                lightblue, null, null, null);
            break;

        case leftLowerArmId:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(figureTheta[leftLowerArmId], 1, 0, 0));
            figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null,
                darkgreen, null, null, null);
            break;

        case rightLowerArmId:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(figureTheta[rightLowerArmId], 1, 0, 0));
            figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null,
                darkgreen, null, null, null);
            break;

        case leftLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(figureTheta[leftLowerLegId], 1, 0, 0));
            figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null,
                darkblue, null, null, null);
            break;

        case rightLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(figureTheta[rightLowerLegId], 1, 0, 0));
            figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null,
                darkblue, null, null, null);
            break;

    }
}
function initFigureNodes(Id) {
    var m;

    switch (Id) {

        case torsoId:
            m = translate(figurePos);
            m = mult(m, rotate(figureTheta[torsoId], 0, 1, 0));
            figure[torsoId] = createNode(m, torso, null, headId, red, null, null, null);
            break;

        case headId:
        case head1Id:
        case head2Id:
            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(figureTheta[head1Id], 1, 0, 0))
            m = mult(m, rotate(figureTheta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[headId] = createNode(m, head, leftUpperArmId, eye1Id, yellow,
                null, null, null);
            break;

        case eye1Id:
            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(figureTheta[head1Id], 1, 0, 0))
            m = mult(m, rotate(figureTheta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[eye1Id] = createNode(m, lefteye, eye2Id, null, black, null, null, null);
            break;

        case eye2Id:
            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(figureTheta[head1Id], 1, 0, 0))
            m = mult(m, rotate(figureTheta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[eye2Id] = createNode(m, righteye, mouthId, null, black, null, null, null);
            break;

        case mouthId:
            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(figureTheta[head1Id], 1, 0, 0))
            m = mult(m, rotate(figureTheta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[mouthId] = createNode(m, mouth, null, null, black, null, null, null);
            break;

        case leftUpperArmId:
            m = translate(-(torsoWidth * 0.75), 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(figureTheta[leftUpperArmId], 1, 0, 0));
            figure[leftUpperArmId] = createNode(m, leftUpperArm, rightUpperArmId, leftLowerArmId,
                lightgreen, null, null, null);
            break;

        case rightUpperArmId:
            m = translate(torsoWidth * 0.75, 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(figureTheta[rightUpperArmId], 1, 0, 0));
            figure[rightUpperArmId] = createNode(m, rightUpperArm, leftUpperLegId, rightLowerArmId,
                lightgreen, null, null, null);
            break;

        case leftUpperLegId:
            m = translate(-(torsoWidth * 0.75), 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(figureTheta[leftUpperLegId], 1, 0, 0));
            figure[leftUpperLegId] = createNode(m, leftUpperLeg, rightUpperLegId, leftLowerLegId,
                lightblue, null, null, null);
            break;

        case rightUpperLegId:
            m = translate(torsoWidth * 0.75, 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(figureTheta[rightUpperLegId], 1, 0, 0));
            figure[rightUpperLegId] = createNode(m, rightUpperLeg, null, rightLowerLegId,
                lightblue, null, null, null);
            break;

        case leftLowerArmId:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(figureTheta[leftLowerArmId], 1, 0, 0));
            figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null,
                darkgreen, null, null, null);
            break;

        case rightLowerArmId:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(figureTheta[rightLowerArmId], 1, 0, 0));
            figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null,
                darkgreen, null, null, null);
            break;

        case leftLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(figureTheta[leftLowerLegId], 1, 0, 0));
            figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null,
                darkblue, null, null, null);
            break;

        case rightLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(figureTheta[rightLowerLegId], 1, 0, 0));
            figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null,
                darkblue, null, null, null);
            break;

    }
}

function initSceneNodes(Id) {
    var m;

    switch (Id) {
        case groundId:
            m = mat4();
            scene[groundId] = createNode(m, ground, columnId1, null, darkcyan, null, 1, null);
            break;

        case columnId1:
            m = translate(colPosArray[columnId1]);
            scene[columnId1] = createNode(m, column, columnId2, null, brown, grayish, 2, null);
            break;

        case columnId2:
            m = translate(colPosArray[columnId2]);
            scene[columnId2] = createNode(m, column, columnId3, null, brown, grayish, null, 1);
       /*     scene[columnId2] = createNode(m, column, columnId3, null, brown, grayish, null, null);*/
            break;

        case columnId3:
            m = translate(colPosArray[columnId3]);
            scene[columnId3] = createNode(m, column, columnId4, null, brown, grayish, null, 2);
            break;

        case columnId4:
            m = translate(colPosArray[columnId4]);
            scene[columnId4] = createNode(m, column, columnId5, null, brown, grayish, 1, 1);
            break;

        case columnId5:
            m = translate(colPosArray[columnId5]);
            scene[columnId5] = createNode(m, column, columnId6, null, brown, grayish, 1, 2);
            break;

        case columnId6:
            m = translate(colPosArray[columnId6]);
            scene[columnId6] = createNode(m, column, columnId7, null, brown, grayish, 2, 1);
            break;

        case columnId7:
            m = translate(colPosArray[columnId7]);
            scene[columnId7] = createNode(m, column, columnId8, null, brown, grayish, 2, 2);
            break;

        case columnId8:
            m = translate(colPosArray[columnId8]);
            scene[columnId8] = createNode(m, column, columnId9, null, brown, grayish, null, 1);
            break;

        case columnId9:
            m = translate(colPosArray[columnId9]);
            scene[columnId9] = createNode(m, column, columnId10, null, brown, grayish, null, 2);
            break;

        case columnId10:
            m = translate(colPosArray[columnId10]);
            scene[columnId10] = createNode(m, column, sphereId1, null, brown, grayish, 1, null);
            break;

        case sphereId1:
            m = translate(spherePosArray[sphereId1]);
            scene[sphereId1] = createNode(m, sphere, sphereId2, null, red, null, 0, null);
            break;

        case sphereId2:
            m = translate(spherePosArray[sphereId2]);
            scene[sphereId2] = createNode(m, sphere, sphereId3, null, yellow, null, 0, null);
            break;

        case sphereId3:
            m = translate(spherePosArray[sphereId3]);
            scene[sphereId3] = createNode(m, sphere, sphereId4, null, lightgreen, null, null, null);
            break;

        case sphereId4:
            m = translate(spherePosArray[sphereId4]);
            scene[sphereId4] = createNode(m, sphere, sphereId5, null, lightblue, null, 0, null);
            break;

        case sphereId5:
            m = translate(spherePosArray[sphereId5]);
            scene[sphereId5] = createNode(m, sphere, sphereId6, null, darkgreen, null, null, null);
            break;

        case sphereId6:
            m = translate(spherePosArray[sphereId6]);
            scene[sphereId6] = createNode(m, sphere, sphereId7, null, darkblue, null, 0, null);
            break;

        case sphereId7:
            m = translate(spherePosArray[sphereId7]);
            scene[sphereId7] = createNode(m, sphere, sphereId8, null, lightcyan, null, null, null);
            break;

        case sphereId8:
            m = translate(spherePosArray[sphereId8]);
            scene[sphereId8] = createNode(m, sphere, sphereId9, null, darkcyan, null, 0, null);
            break;

        case sphereId9:
            m = translate(spherePosArray[sphereId9]);
            scene[sphereId9] = createNode(m, sphere, sphereId10, null, white, null, null, null);
            break;

        case sphereId10:
            m = translate(spherePosArray[sphereId10]);
            scene[sphereId10] = createNode(m, sphere, null, null, black, null, 0, null);
            break;
    }
}
function traverseFigure(Id) {
    if (Id == null) return;
    mvStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    mvStack2.push(modelViewMatrix2);
    modelViewMatrix2 = mult(modelViewMatrix2, figure[Id].transform);
    figure[Id].render(figure[Id].color1, figure[Id].color2,
        figure[Id].texIndex1, scene[Id].texIndex2);
    if (figure[Id].child != null) traverseFigure(figure[Id].child);
    modelViewMatrix = mvStack.pop();
    modelViewMatrix2 = mvStack2.pop();
    if (figure[Id].sibling != null) traverseFigure(figure[Id].sibling);
}


function traverseScene(Id) {
    if (Id == null) return;
    mvStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, scene[Id].transform);
    mvStack2.push(modelViewMatrix2);
    modelViewMatrix2 = mult(modelViewMatrix2, scene[Id].transform);
   scene[Id].render(scene[Id].color1, scene[Id].color2,
                           scene[Id].texIndex1, scene[Id].texIndex2);
    if (scene[Id].child != null)
        traverseScene(scene[Id].child);
    modelViewMatrix = mvStack.pop();
    modelViewMatrix2 = mvStack2.pop();
    if (scene[Id].sibling != null)
        traverseScene(scene[Id].sibling);
}

function torso(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scalem(torsoWidth, torsoHeight, torsoWidth));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.0, 0.5 * torsoHeight, 0.0));
        instanceMatrix2 = mult(instanceMatrix2, scalem(torsoWidth, torsoHeight, torsoWidth));
    }
    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, 0, cubeVerts);
    unsetDrawState(texIndex1);
}

function head(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scalem(headWidth, headHeight, headWidth));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.0, 0.5 * headHeight, 0.0));
        instanceMatrix2 = mult(instanceMatrix2, scalem(headWidth, headHeight, headWidth));
    }
    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, 0, cubeVerts);
    unsetDrawState(texIndex1);
}

function leftUpperArm(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scalem(upperArmWidth, upperArmHeight, upperArmWidth));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.0, 0.5 * upperArmHeight, 0.0));
        instanceMatrix2 = mult(instanceMatrix2, scalem(upperArmWidth, upperArmHeight, upperArmWidth));
    }
    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, 0, cubeVerts);
    unsetDrawState(texIndex1);
}

function leftLowerArm(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scalem(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.0, 0.5 * lowerArmHeight, 0.0));
        instanceMatrix2 = mult(instanceMatrix2, scalem(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    }
    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, 0, cubeVerts);
    unsetDrawState(texIndex1);
}

function rightUpperArm(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scalem(upperArmWidth, upperArmHeight, upperArmWidth));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.0, 0.5 * upperArmHeight, 0.0));
        instanceMatrix2 = mult(instanceMatrix2, scalem(upperArmWidth, upperArmHeight, upperArmWidth));
    }
    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, 0, cubeVerts);
    unsetDrawState(texIndex1);
}

function rightLowerArm(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scalem(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.0, 0.5 * lowerArmHeight, 0.0));
        instanceMatrix2 = mult(instanceMatrix2, scalem(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    }
    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, 0, cubeVerts);
    unsetDrawState(texIndex1);
}

function leftUpperLeg(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scalem(upperLegWidth, upperLegHeight, upperLegWidth));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.0, 0.5 * upperLegHeight, 0.0));
        instanceMatrix2 = mult(instanceMatrix2, scalem(upperLegWidth, upperLegHeight, upperLegWidth));
    }
    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, 0, cubeVerts);
    unsetDrawState(texIndex1);
}

function leftLowerLeg(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scalem(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.0, 0.5 * lowerLegHeight, 0.0));
        instanceMatrix2 = mult(instanceMatrix2, scalem(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    }
    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, 0, cubeVerts);
    unsetDrawState(texIndex1);
}

function rightUpperLeg(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scalem(upperLegWidth, upperLegHeight, upperLegWidth));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.0, 0.5 * upperLegHeight, 0.0));
        instanceMatrix2 = mult(instanceMatrix2, scalem(upperLegWidth, upperLegHeight, upperLegWidth));
    }
    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, 0, cubeVerts);
    unsetDrawState(texIndex1);
}

function rightLowerLeg(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scalem(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.0, 0.5 * lowerLegHeight, 0.0));
        instanceMatrix2 = mult(instanceMatrix2, scalem(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    }
    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, 0, cubeVerts);
    unsetDrawState(texIndex1);
}

function lefteye(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(-0.2, -4.0, 0.5));
    instanceMatrix = mult(instanceMatrix, scalem(eyeWidth, eyeWidth, eyeDepth));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(-0.2, -4.0, 0.5));
        instanceMatrix2 = mult(instanceMatrix2, scalem(eyeWidth, eyeWidth, eyeDepth));
    }
    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, cubeVerts, sphereVerts);
    unsetDrawState(texIndex1);
}

function righteye(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.2, -4.0, 0.5));
    instanceMatrix = mult(instanceMatrix, scalem(eyeWidth, eyeWidth, eyeDepth));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.2, -4.0, 0.5));
        instanceMatrix2 = mult(instanceMatrix2, scalem(eyeWidth, eyeWidth, eyeDepth));
    }
    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, cubeVerts, sphereVerts);
    unsetDrawState(texIndex1);
}

function mouth(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, -4.5, 0.5));
    instanceMatrix = mult(instanceMatrix, scalem(mouthWidth, mouthHeight, mouthDepth));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.0, -4.5, 0.5));
        instanceMatrix2 = mult(instanceMatrix2, scalem(mouthWidth, mouthHeight, mouthDepth));
    }
    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, 0, cubeVerts);
    unsetDrawState(texIndex1);
}

function ground(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, groundFloor, 0.0));
    instanceMatrix = mult(instanceMatrix, scalem(groundWidth, groundHeight, groundWidth));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.0, groundFloor, 0.0));
        instanceMatrix2 = mult(instanceMatrix2, scalem(groundWidth, groundHeight, groundWidth));
    }
    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, 0, cubeVerts);
    unsetDrawState(texIndex1);
}

function sphere(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, sphereHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, rotateY(sphereRot));
    instanceMatrix = mult(instanceMatrix, scalem(sphereDiameter, sphereHeight, sphereDiameter));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.0, sphereHeight, 0.0));
        instanceMatrix2 = mult(instanceMatrix2, scalem(sphereDiameter, sphereHeight, sphereDiameter));
    }
    setDrawState(color1, texIndex1);
    if (!inShadow)
        gl.uniform1i(visibleStateLoc, 0);
    gl.drawArrays(gl.TRIANGLES, cubeVerts, sphereVerts);
    if (!inShadow)
        gl.uniform1i(visibleStateLoc, visibleState);
    unsetDrawState(texIndex1);
}

function column(color1, color2, texIndex1, texIndex2) {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, groundFloor + columnHeight / 2, 0.0));
    instanceMatrix = mult(instanceMatrix, scalem(columnDiameter, columnHeight, columnDiameter));
    if (!inShadow) {
        instanceMatrix2 = mult(modelViewMatrix2, translate(0.0, groundFloor + columnHeight / 2, 0.0));
        instanceMatrix2 = mult(instanceMatrix2, scalem(columnDiameter, columnHeight, columnDiameter));
    }

    setDrawState(color1, texIndex1);
    gl.drawArrays(gl.TRIANGLES, cubeVerts + sphereVerts, cylinderVerts - cylinderEdgeVerts);
    unsetDrawState(texIndex1);

    setDrawState(color2, texIndex2);
    gl.drawArrays(gl.TRIANGLES, cubeVerts + sphereVerts + cylinderVerts - cylinderEdgeVerts,
        cylinderEdgeVerts);
    unsetDrawState(texIndex2);
}

function setDrawState(color, texIndex) {
    if (inShadow) {
        gl.uniformMatrix4fv(pmvMatrixFromLightLoc1, false, flatten(instanceMatrix));
    } else {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
        gl.uniformMatrix4fv(pmvMatrixFromLightLoc2, false, flatten(instanceMatrix2));
        gl.uniform4fv(colorLoc, color);
        if (texIndex != null) {
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, surfaceTextures[texIndex]);
            gl.uniform1i(textureLoc, 2);
            gl.uniform1i(showTextureLoc, true);
        }
    }
}

function unsetDrawState(texIndex) {
    if (!inShadow && texIndex != null) {
        gl.uniform1i(showTextureLoc, false);
    }
}

function makeCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(5, 1, 2, 6);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);
    var t1 = subtract(vertices[a], vertices[b]);
    var t2 = subtract(vertices[a], vertices[c]);
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

function makeSphere() {
    var phi1, phi2, sinPhi1, sinPhi2, cosPhi1, cosPhi2;
    var theta1, theta2, sinTheta1, sinTheta2, cosTheta1, cosTheta2;
    var p1, p2, p3, p4;
    var latitudeBands = 30;
    var longitudeBands = 30;
    var u1, u2, v1, v2;
    var uv1, uv2, uv3, uv4;
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

            p1 = vec4(cosTheta1 * sinPhi1, cosPhi1, sinTheta1 * sinPhi1, 1.0);
            p2 = vec4(cosTheta2 * sinPhi1, cosPhi1, sinTheta2 * sinPhi1, 1.0);
            p3 = vec4(cosTheta1 * sinPhi2, cosPhi2, sinTheta1 * sinPhi2, 1.0);
            p4 = vec4(cosTheta2 * sinPhi2, cosPhi2, sinTheta2 * sinPhi2, 1.0);

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
}/*
function makeSphere() {
    var phi1, phi2, sinPhi1, sinPhi2, cosPhi1, cosPhi2;
    var theta1, theta2, sinTheta1, sinTheta2, cosTheta1, cosTheta2;
    var p1, p2, p3, p4;
    var latitudeBands = 30;
    var longitudeBands = 30;
    var u1, u2, v1, v2;
    var uv1, uv2, uv3, uv4;
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

            p1 = vec4(cosTheta1 * sinPhi1, cosPhi1, sinTheta1 * sinPhi1, 1.0);
            p2 = vec4(cosTheta2 * sinPhi1, cosPhi1, sinTheta2 * sinPhi1, 1.0);
            p3 = vec4(cosTheta1 * sinPhi2, cosPhi2, sinTheta1 * sinPhi2, 1.0);
            p4 = vec4(cosTheta2 * sinPhi2, cosPhi2, sinTheta2 * sinPhi2, 1.0);

            pointsArray.push(p1);
            pointsArray.push(p2);
            pointsArray.push(p3);
            pointsArray.push(p2);
            pointsArray.push(p4);
            pointsArray.push(p3);
        }
    }
}*/
function makeCylinder(isClosed) {
    var x1, x2, y1, y2, xoff;
    var theta1, theta2, sinTheta1, sinTheta2, cosTheta1, cosTheta2;
    var p1, p2, p3, p4;
    var radialSlices = 30;
    var verticalSlices = 1;
    var u1, u2, v1, v2;
    var uv1, uv2, uv3, uv4;

    // For each vertical slice get the y values
    for (var vertNumber = 1; vertNumber <= verticalSlices; vertNumber++) {
        y1 = ((vertNumber - 1) * (1 / verticalSlices) - 0.5);
        y2 = (vertNumber * (1 / verticalSlices) - 0.5);

        // For each radial slice determine theta's value and other calculations
        for (var radNumber = 1; radNumber <= radialSlices; radNumber++) {
            theta1 = 2 * Math.PI * (radNumber - 1) / radialSlices;
            sinTheta1 = Math.sin(theta1);
            cosTheta1 = Math.cos(theta1);

            theta2 = 2 * Math.PI * radNumber / radialSlices;
            sinTheta2 = Math.sin(theta2);
            cosTheta2 = Math.cos(theta2);

            p1 = vec4(cosTheta1 * 0.5, y1, sinTheta1 * 0.5, 1.0);
            p2 = vec4(cosTheta2 * 0.5, y1, sinTheta2 * 0.5, 1.0);
            p3 = vec4(cosTheta1 * 0.5, y2, sinTheta1 * 0.5, 1.0);
            p4 = vec4(cosTheta2 * 0.5, y2, sinTheta2 * 0.5, 1.0);

            pointsArray.push(p1);
            pointsArray.push(p2);
            pointsArray.push(p3);
            pointsArray.push(p2);
            pointsArray.push(p4);
            pointsArray.push(p3);

            var t1 = subtract(p2, p1);
            var t2 = subtract(p2, p3);
            var normal = vec3(cross(t1, t2));
            normalsArray.push(normal);
            normalsArray.push(normal);
            normalsArray.push(normal);

            t1 = subtract(p4, p2);
            t2 = subtract(p4, p3);
            normal = vec3(cross(t1, t2));
            normalsArray.push(normal);
            normalsArray.push(normal);
            normalsArray.push(normal);

            u1 = 1 - ((radNumber - 1) / radialSlices);
            u2 = 1 - (radNumber / radialSlices);
            v1 = 1 - ((vertNumber - 1) / verticalSlices);
            v2 = 1 - (vertNumber / verticalSlices);

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
    if (isClosed) {
        var count = pointsArray.length;
        for (var radNumber = 1; radNumber <= radialSlices; radNumber++) {
            theta1 = 2 * Math.PI * (radNumber - 1) / radialSlices;
            sinTheta1 = Math.sin(theta1);
            cosTheta1 = Math.cos(theta1);

            theta2 = 2 * Math.PI * radNumber / radialSlices;
            sinTheta2 = Math.sin(theta2);
            cosTheta2 = Math.cos(theta2);

            p1 = vec4(0, -0.5, 0);
            p2 = vec4(cosTheta1 * 0.5, -0.5, sinTheta1 * 0.5, 1.0);
            p3 = vec4(cosTheta2 * 0.5, -0.5, sinTheta2 * 0.5, 1.0);

            pointsArray.push(p1);
            pointsArray.push(p2);
            pointsArray.push(p3);

            p1 = vec4(0, 0.5, 0);
            p2 = vec4(cosTheta1 * 0.5, 0.5, sinTheta1 * 0.5, 1.0);
            p3 = vec4(cosTheta2 * 0.5, 0.5, sinTheta2 * 0.5, 1.0);

            pointsArray.push(p1);
            pointsArray.push(p2);
            pointsArray.push(p3);

            var t1 = subtract(p1, p2);
            var t2 = subtract(p1, p3);
            var normal = vec3(cross(t1, t2));
            normalsArray.push(normal);
            normalsArray.push(normal);
            normalsArray.push(normal);

            t1 = subtract(p1, p3);
            t2 = subtract(p1, p2);
            normal = vec3(cross(t1, t2));
            normalsArray.push(normal);
            normalsArray.push(normal);
            normalsArray.push(normal);

            if (radNumber <= radialSlices / 2) {
                u1 = (2 * (radNumber - 1)) / radialSlices;
                u2 = (2 * radNumber) / radialSlices;
                v1 = 1;
                v2 = 1;
            }
            else {
                u1 = 1;
                u2 = 1;
                v1 = (2 * (radialSlices - radNumber + 1)) / radialSlices;
                v2 = (2 * (radialSlices - radNumber)) / radialSlices;
            }
            u2 = 1 - (radNumber / radialSlices);
            v1 = 1 - ((vertNumber - 1) / verticalSlices);
            v2 = 1 - (vertNumber / verticalSlices);

            uv1 = vec2(0, 0);
            uv2 = vec2(u1, v1);
            uv3 = vec2(u2, v2);

            texCoordsArray.push(uv1);
            texCoordsArray.push(uv2);
            texCoordsArray.push(uv3);
            texCoordsArray.push(uv1);
            texCoordsArray.push(uv2);
            texCoordsArray.push(uv3);
        }
        cylinderEdgeVerts = pointsArray.length - count;
    }
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

    gl.enableVertexAttribArray(shadowVPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, shadowVBuffer);
    gl.vertexAttribPointer(shadowVPosition, 4, gl.FLOAT, false, 0, 0);

    gl.viewport(0, 0, SHADOWTEXTUREWIDTH, SHADOWTEXTUREHEIGHT);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelViewMatrix = mult(projectionMatrixFromLight, lookAt(lightEye, lightAt, lightUp));
    modelViewMatrix2 = mult(projectionMatrixFromLight, lookAt(lightEye, lightAt, lightUp));

    inShadow = true;
    traverseScene(groundId);
    traverseFigure(torsoId);
    inShadow = false;


    ///////////////// Part 2 /////////////////
    // This Second Part goes to the Screen  //
    //////////////////////////////////////////

    gl.useProgram(program);
    // send data to GPU for normal render
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.disableVertexAttribArray(shadowVPosition);

    gl.enableVertexAttribArray(vPosition);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
    gl.uniform1i(shadowTextureLoc, 1);

    if (eyeRadius * Math.sin(yAngle) < -4.5) {
        visibleState = 0;
    } else {
        visibleState = 1;
    }
    gl.uniform1i(visibleStateLoc, visibleState);

    sphereRot += 2.0;

    yAngleDeg = 180.0 * yAngle / Math.PI;
    xAngleDeg = 180.0 * xAngle / Math.PI;
    lightPosition2 = vec4(lightPosition[0] - figurePos[0], lightPosition[1],
        lightPosition[2] - figurePos[2], 0.0);
    lightPosition2 = mult(rotateY(xAngleDeg), lightPosition);
    lightPosition2 = mult(rotateX(yAngleDeg), lightPosition2);
    gl.uniform4fv(lightPositionLoc, lightPosition2);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (yAngle < 0)
        yAngle += 2 * Math.PI;
    if (yAngle > 2 * Math.PI)
        yAngle -= 2 * Math.PI;
    if (xAngle < 0)
        xAngle += 2 * Math.PI;
    if (xAngle > 2 * Math.PI)
        xAngle -= 2 * Math.PI;

    if (yAngle > Math.PI / 2 && yAngle < 3 * Math.PI / 2) {
        up = vec3(0.0, -1.0, 0.0);
    }
    else {
        up = vec3(0.0, 1.0, 0.0);
    }

    var eye = vec3(figurePos[0] + eyeRadius * Math.cos(xAngle) * Math.cos(yAngle),
        figurePos[1] + eyeRadius * Math.sin(yAngle),
        figurePos[2] + eyeRadius * Math.sin(xAngle) * Math.cos(yAngle));

    at = vec3(figurePos);

    modelViewMatrix = lookAt(eye, at, up);


    // This draws the SkyBox
    mvStack.push(modelViewMatrix);
    gl.uniform1i(showSkyLoc, true);
    modelViewMatrix = mult(modelViewMatrix, scalem(skyboxScale, skyboxScale, skyboxScale));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, cubeVerts);
    gl.uniform1i(showSkyLoc, false);
    modelViewMatrix = mvStack.pop();
    traverseScene(groundId);
    traverseFigure(torsoId);

    requestAnimFrame(render);
}