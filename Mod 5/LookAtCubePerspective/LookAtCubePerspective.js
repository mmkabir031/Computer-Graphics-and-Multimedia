"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: Look At Cube Perspective
 * NOTE: Since I initially modified this for the extracredit assignment some of the bonus code is left here in comments. Just disregard that. Thanks!
 */
var canvas;
var gl;


var theta = 0.0;
var phi = 0.0;

var points = [];
var colors = [];

var xAngle = 0.0;
var yPos = 0.0;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);


/*for extra cred*/
var radius = 1;
/*for extra cred*/





var near = 0.1;
var far = 4.0;
var fovy = 90;
var ratio = 1.0;

var left = -2.0;
var right = 2.0;
var bottom = -2.0;
var yTop = 2.0;

var modelViewMatrix;
var modelViewMatrixLoc;

var projectionMatrix;
var projectionMatrixLoc;

// Array of angles: 0 = x; 1 = y; 2 = z
var theta = [0, 0, 0];

var isPerspective = false;
var precis = 1000;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL is not available"); }

    // viewport = rectangular area of display window
    gl.viewport(0, 0, canvas.width, canvas.height);
    // clear area of display for rendering at each frame
    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    gl.enable(gl.DEPTH_TEST);

    colorCube();

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

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    document.getElementById("xAngTxt").innerText = "(" + Math.round(xAngle * 100) / 100 + ")";
    document.getElementById("yPosTxt").innerText = "(" + yPos + ")";

 /*   document.getElementById("nearTxt").innerText = "(" + near + ")";
    document.getElementById("farTxt").innerText = "(" + far + ")";
    document.getElementById("fovyTxt").innerText = "(" + fovy + ")";
    document.getElementById("ratioTxt").innerText = "(" + ratio + ")";
    document.getElementById("RLTxt").innerText = "(" + RL + ")";
    document.getElementById("UDTxt").innerText = "(" + UD + ")";*/
    render();

    // ------------------------------------------------------------------
    // Event listeners for buttons

    document.getElementById("perspective").onclick =
        function (event) {
            isPerspective = true;
            document.getElementById('perspective').style.background = '#bebfba';
            document.getElementById('orthographic').style.background = '#FFF';
        };

    document.getElementById("orthographic").onclick =
        function (event) {
            isPerspective = false;
            document.getElementById('perspective').style.background = '#FFF';
            document.getElementById('orthographic').style.background = '#bebfba';
        };

    document.getElementById("xLeft").onclick = function () {
        xAngle += 0.1;
        document.getElementById("xAngTxt").innerText = "(" + Math.round(xAngle * 100) / 100 + ")";
    };

    document.getElementById("xRight").onclick = function () {
        xAngle -= 0.1;
        document.getElementById("xAngTxt").innerText = "(" + Math.round(xAngle * 100) / 100 + ")";
    };

    document.getElementById("yPos").oninput =
        function (event) {
            yPos = Number(event.target.value);
            document.getElementById("yPosTxt").innerText = "(" + yPos + ")";
        };

    document.getElementById("fovy").oninput =
        function (event) {
            fovy = Number(event.target.value);
            document.getElementById("fovyTxt").innerText = "(" + fovy + ")";
        };
    document.getElementById("near").oninput =
        function (event) {
            near = Number(event.target.value);
            document.getElementById("nearTxt").innerText = "(" + near + ")";
        };
    document.getElementById("far").oninput =
        function (event) {
            far = Number(event.target.value);
            document.getElementById("farTxt").innerText = "(" + far + ")";
        };
    document.getElementById("ratio").oninput =
        function (event) {
            ratio = Number(event.target.value);
            document.getElementById("ratioTxt").innerText = "(" + ratio + ")";
        };


    document.getElementById("leftright").oninput =
        function (event) {
            right = Number(event.target.value);
            left = -right;
            document.getElementById("leftrightTxt").innerText = "(" + right + ")";
        };
    document.getElementById("topbottom").oninput =
        function (event) {
            yTop = Number(event.target.value);
            bottom = -yTop;
            document.getElementById("topbottomTxt").innerText = "(" + yTop + ")";
        };




    document.addEventListener("keydown",
        function (event) {

            if (event.keyCode == 37) {   // Left Arrow
                xAngle += 0.1;
                document.getElementById("xAngTxt").innerText = "(" + Math.round(xAngle * 100) / 100 + ")";
                document.getElementById("xAng").value = xAngle;
            }
            if (event.keyCode == 39) {   // Right Arrow
                xAngle -= 0.1;
                document.getElementById("xAngTxt").innerText = "(" + Math.round(xAngle * 100) / 100 + ")";
                document.getElementById("xAng").value = xAngle;
            }
            if (event.keyCode == 38) {   // Up Arrow
                if (isPerspective) {
                    if (fovy > 0 && fovy < 180) {
                        fovy *= 0.9;
                        document.getElementById("fovyTxt").innerText = "(" + fovy + ")";
                        document.getElementById("fovy").value = fovy;
                    }


                }
                else
                    if (right > 0) 
                        left *= 0.9;
                        right *= 0.9;
                        yTop *= 0.9;
                        bottom *= 0.9;
                    
                        if (right < 0.1) {
                            left =0.1;
                            right = 0.1;
                            yTop = 0.1;
                            bottom = 0.1;

                        }
                        document.getElementById("leftrightTxt").innerText = "(" + right + ")";

                        document.getElementById("leftright").value = right;

                        document.getElementById("topbottomTxt").innerText = "(" + yTop + ")";
                        document.getElementById("topbottom").value = yTop;
                    
            }
            if (event.keyCode == 40) {   // Down Arrow
                if (isPerspective) {
                    if (fovy > 0 && fovy < 180) {
                        fovy *= 1.1;
                        if (fovy > 180)
                            fovy = 180;//email prof and ask if it should be this way cuz then the other arrow key (up) doesnt work once it reaches this bound
                            document.getElementById("fovyTxt").innerText = "(" + fovy + ")";
                            document.getElementById("fovy").value = fovy;

                    }


                }
                else
                    if (right < 10) {
                        left *= 1.1;
                        right *= 1.1;
                        yTop *= 1.1;
                        bottom *= 1.1;
                        if (right > 10) {
                            left = 10;
                            right = 10;
                            yTop = 10;
                            bottom = 10;
                        }
                        document.getElementById("leftrightTxt").innerText = "(" + right + ")";
                        document.getElementById("topbottom").value = right;
                        document.getElementById("topbottomTxt").innerText = "(" + yTop + ")";
                        document.getElementById("leftright").value = yTop;
                    }
            }
            


        }, false);



}

// DEFINE CUBE

function colorCube() {
    square(1, 0, 3, 2);
    square(2, 3, 7, 6);
    square(3, 0, 4, 7);
    square(6, 5, 1, 2);
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
        [0.9, 0.9, 0.2, 1.0],  // orange
        [0.0, 1.0, 1.0, 1.0],  // cyan
        [1.0, 0.0, 0.0, 1.0],  // red
        [1.0, 1.0, 0.0, 1.0],  // yellow
        [0.0, 1.0, 0.0, 1.0],  // green
        [1.0, 0.0, 1.0, 1.0],  // magenta
        [0.0, 0.0, 1.0, 1.0],  // blue
        [1.0, 1.0, 1.0, 1.0]   // white

    ];

    // Partion the square into two triangles in order for
    // WebGL to be able to render it.      
    // Vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
        points.push(verticesC[indices[i]]);
        //colorsC.push( vertexColors[indices[i]] );

        //for solid colored faces use 
        colors.push(vertexColors[a]);
    }
}

// -------------------------------------------------------------------

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //for extra cred

/*
    var eye =  vec3(radius * Math.cos(theta) * Math.cos(phi),
        radius * Math.sin(phi),
        radius * Math.sin(theta) * Math.cos(phi));

*/
    //orignal eye
    var eye = vec3(Math.sin(xAngle), yPos, Math.cos(xAngle));

    modelViewMatrix = lookAt(eye, at, up);

    if (isPerspective)
        projectionMatrix = perspective(fovy, ratio, near, far);
    else
        projectionMatrix = ortho(left, right, bottom, yTop, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Render cube
    gl.drawArrays(gl.TRIANGLES, 0, points.length);

    requestAnimationFrame(render);
}