"use strict";
/*
 * Course: CS 4722
 * Section: 02
 * Name: Mohsin Kabir
 * Professor: Dr. Shaw
 * Assignment #: ObjManager
 */
var canvas;
var gl;

var program;
var rotateOn = false;
var points = [];
var colors = [];
var normals = [];
var texCoordsArray = [];

var vColor;
var vPosition;
var vNormal;
var vTexCoord;

var modelViewMatrix;
var projectionMatrix;

var modelViewMatrixLoc;
var projectionMatrixLoc;

var numMeshes = 0;
var vertices = [];
var cvertices = [];
var indices = [];

var near = -20;
var far = 20;
var left = -2;
var right = 2;
var ytop = 2;
var bottom = -2;

var norms = [];
var norm_indices = [];

var texbuf = [];
var tex_indices = [];

var lightPosition = vec4(0.0, 0.0, 20.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightAmbient2 = vec4(1.0, 1.0, 1.0, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var lightAng = 0;
var lightRad = 20;

var materialAmbient = [
    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(1.0, 1.0, 0.0, 1.0),
    vec4(0.0, 1.0, 0.0, 1.0),
    vec4(0.0, 0.0, 1.0, 1.0),
    vec4(1.0, 0.0, 1.0, 1.0),
    vec4(0.0, 1.0, 1.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0)
]

var materialDiffuse = [
    vec4(0.8, 0.0, 0.0, 1.0),
    vec4(1.0, 0.8, 0.0, 1.0),
    vec4(0.0, 0.8, 0.0, 1.0),
    vec4(0.0, 0.0, 0.8, 1.0),
    vec4(1.0, 0.0, 0.8, 1.0),
    vec4(0.0, 1.0, 0.8, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0)
];

var materialSpecular = [
    vec4(0.8, 0.0, 0.0, 1.0),
    vec4(1.0, 0.8, 0.0, 1.0),
    vec4(0.0, 0.8, 0.0, 1.0),
    vec4(0.0, 0.0, 0.8, 1.0),
    vec4(1.0, 0.0, 0.8, 1.0),
    vec4(0.0, 1.0, 0.8, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0)
];

var vBufferId;
var cBufferId;
var nBufferId;
var tBufferId;

var materialShininess = 100.0;

var ambientProduct;
var diffuseProduct;
var specularProduct;

var ambientProductLoc;
var diffuseProductLoc;
var specularProductLoc;

var lightPositionLoc;
var materialShininessLoc;

var hasColor = false;
var hasColorLoc;

var cindex = 0;
var objfile = "";

var dirname = "Objs/";
var texdirname = "Textures/";
/* Note: JavaScript will not let you see what file path the file was loaded from for security
         reasons.  If you want to load the .mtl file and the textures you must copy the .mtl
         and any textures to the "/Textures" folder in advance.
*/

const at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var eye;

var axis = 1;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var theta = [0, 0, 0];
var resetTheta = [0, 0, 0];
var resetAxis = 1;

var centerIt = true;
var rotateLight = true;
var smoothIt = true;
var hasNorms = true;
var hasTextures = true;
var firstTime = true;

var fileInput;
var fileDisplayArea;

var mtlfilecode = [];
var mtlfilename = [];

var mtlindcode = [];
var mtlindval = [];

var texture;
var textureLoc;
var showTextureLoc;
var textureArray = [];
var lightingArray = [];
var lightingOverride = true;

var gotTexture = false;

var inread = false;
var imagesPending = [];
var mtlPending = [];
var texturePending = [];
var mtldone = true;
var skip = [];

var rawFile1, rawFile2, rawFile3;

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

    vBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Create texture buffer and vTexCoord attribute
    tBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    nBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    vNormal = gl.getAttribLocation(program, "vNormal");
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

    hasColorLoc = gl.getUniformLocation(program, "hasColor");
    gl.uniform1i(hasColorLoc, hasColor);

    fileInput = document.getElementById('fileInput');
    fileDisplayArea = document.getElementById('fileDisplayArea');
    fileInput.addEventListener('change', function (e) {
        var file = fileInput.files[0];

        if (file.name.toLowerCase().endsWith(".obj")) {
            var reader = new FileReader();
            reader.onload = function (e) {
                imagesPending.push(false);

                objfile = reader.result;
                loadobj();

                document.getElementById("selObject").value = "";

                lightingOverride = true;
                document.getElementById("removeads").checked = true;
            }

            reader.readAsText(file);
        } else {
            fileDisplayArea.innerText = "File not supported!";
        }

    });
    document.getElementById("selObject").onchange =
        function (event) {
            var fileselected = event.target.value;
            if (fileselected == "") {
                objfile = "";
            }
            else if (fileselected == "1") {
                objfile = filedata1;
            }
            else if (fileselected == "2") {
                objfile = filedata2;
            }
            else if (fileselected == "3") {
                objfile = filedata3;
            }
            else if (fileselected == "4") {
                objfile = filedata4;
            }
            else if (fileselected == "5") {
                objfile = filedata5;
            }
            else if (fileselected == "6") {
                objfile = filedata6;
            }
            else if (fileselected == "7") {
                objfile = filedata7;
            }



            

            loadobj();
        };
    lightingOverride = true;
    document.getElementById("selColor").onchange =
        function (event) {
            cindex = Number(event.target.value);
            resetLighting();
            lightingOverride = true;
        };

    document.getElementById("centerit").onchange =
        function (event) {
            centerIt = event.target.checked;
            loadobj();
        };

    document.getElementById("rotatelight").onchange =
        function (event) {

            rotateLight = event.target.checked;
        };

    document.getElementById("smoothit").onchange =
        function (event) {
            smoothIt = event.target.checked;
            loadobj();
        };

    document.getElementById("removeads").onchange =
        function (event) {
            lightingOverride = event.target.checked;
            if (lightingOverride) {
                cindex = 6;
                document.getElementById("selColor").value = "6";
                resetLighting();
            }
        };

    document.getElementById("smoothshading").style.display = "none";

    textureLoc = gl.getUniformLocation(program, "texture");
    gl.uniform1i(textureLoc, 0);

    showTextureLoc = gl.getUniformLocation(program, "showTexture");
    gl.uniform1i(showTextureLoc, false);

    firstTime = false;

    cindex = Number(document.getElementById("selColor").value);

    objfile = filedata1;
    loadobj();
    document.addEventListener("keydown",
        function (event) {
            if (event.keyCode == 38) {   // Up
                if (right > 0.25) {
                    zoomfactor(0.9);
                };
            }
            if (event.keyCode == 40) {   // Down
                zoomfactor(1.1);
            }
        }, false);

    document.addEventListener("wheel",
        function (event) {
            var delta = Math.sign(event.deltaY);
            if (delta > 0) {
                zoomfactor(1.1);
            }
            else if (right > 0.25 && delta < 0) {
                zoomfactor(0.9);
            }
        });
    document.getElementById("rotatex").onclick =
        function () {
            axis = xAxis;
          
        };
    document.getElementById("rotatey").onclick =
        function () {
            axis = yAxis;
          
        };
    document.getElementById("rotatez").onclick =
        function () {
            axis = zAxis;
           
        };


    document.getElementById("toggle").onclick =
        function () {
            rotateOn = !rotateOn;

        };
    render();
}
function zoomfactor(zfactor) {
    left *= zfactor;
    right *= zfactor;
    ytop *= zfactor;
    bottom *= zfactor;
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
}
function clearFileInput(ctrl) {
    try {
        ctrl.value = null;
    } catch (ex) { }
    if (ctrl.value) {
        ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
    }
}

function resetLighting() {
    if (!hasTextures) {
        ambientProduct = mult(lightAmbient, materialAmbient[cindex]);
    }
    else {
        ambientProduct = mult(lightAmbient2, materialAmbient[cindex]);
    }
    diffuseProduct = mult(lightDiffuse, materialDiffuse[cindex]);
    specularProduct = mult(lightSpecular, materialSpecular[cindex]);

    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform1f(materialShininessLoc, materialShininess);
}

function bindLightingEntry(num) {
    var lightEntry = lightingArray[num];

    ambientProduct = mult(lightAmbient2, lightEntry[0]);
    diffuseProduct = mult(lightDiffuse, lightEntry[1]);
    specularProduct = mult(lightSpecular, lightEntry[2]);

    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));

    var shineVal = materialShininess;
    if (!isNaN(lightEntry[3])) {
        shineVal = Number(lightEntry[3]);
    }
    gl.uniform1f(materialShininessLoc, shineVal);
}

function addLightingArrayEntry() {
    lightingArray.push([materialAmbient[cindex], materialDiffuse[cindex],
    materialSpecular[cindex], materialShininess]);
}

function updateLightingArrayEntry(aVal, dVal, sVal, shineness) {
    var lightEntry = lightingArray.pop();

    if (aVal != null) {
        lightEntry[0] = aVal;
    }
    if (dVal != null) {
        lightEntry[1] = dVal;
    }
    if (sVal != null) {
        lightEntry[2] = sVal;
    }
    if (shineness != null) {
        lightEntry[3] = shineness;
    }
    lightingArray.push(lightEntry);
}

function loadfile(file) {
    rawFile1 = new XMLHttpRequest();
    rawFile1.open("GET", file);
    rawFile1.overrideMimeType('text/plain; charset=x-user-defined');
    rawFile1.onreadystatechange = function () {
        if (rawFile1.readyState === 4) {
            if (rawFile1.status === 200 || rawFile1.status == 0) {
                objfile = rawFile1.responseText;
                loadobj();
            }
        }
    }
    rawFile1.send(null);
}

function loadmtl(file) {
    rawFile2 = new XMLHttpRequest();
    rawFile2.open("GET", file);
    rawFile2.overrideMimeType('text/plain; charset=x-user-defined');
    rawFile2.onreadystatechange = function () {
        if (rawFile2.readyState === 4) {
            if (rawFile2.status === 200 || rawFile2.status == 0) {
                loadmtlkeypairs(rawFile2.responseText);
            }
        }
    }
    rawFile2.send(null);
}

function loadTexture(file) {
    texturePending.push(file);
    if (texturePending.length == 1) {
        loadNextTexture();
    }
}

function loadNextTexture() {
    rawFile3 = new XMLHttpRequest();
    rawFile3.open("GET", texturePending[0]);
    rawFile3.overrideMimeType('text/plain; charset=x-user-defined');
    rawFile3.onreadystatechange = function () {
        if (rawFile3.readyState === 4) {
            if (rawFile3.status === 200 || rawFile3.status == 0) {
                loadTextureData(texturePending[0]);
            }
        }
    }
    rawFile3.send(null);
}

function loadTextureData(file) {
    imagesPending.push(true);
    textureArray.push("");
    var img = new Image();
    img.onload = function () {
        imagesPending.pop();
        configureTexture(img, img.src);
    };
    img.src = file;
}

function configureTexture(img, filename) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    var x = filename.indexOf(texdirname);
    var name = (x > -1) ? filename.substring(x) : filename;

    for (var m = 0; m < mtlfilename.length; ++m) {
        if (mtlfilename[m] == ("!" + name)) {
            mtlfilename[m] = name;

            for (var n = 0; n < mtlfilename.length; ++n) {
                if (mtlfilename[n] == name && textureArray[n] == "") {
                    textureArray[n] = texture;
                    texturePending.shift();
                    if (texturePending.length == 0) {
                        makemesh();
                    } else {
                        loadNextTexture();
                    }

                    break;
                }
            }
            break;
        }
    }
}

function loadmtlkeypairs(objText) {
    var regExp1 = new RegExp("\n|\r");
    var regExp2 = new RegExp("\\s+");
    var havekey = false;
    var havekeyfile = false;
    var line;
    var lineArr;
    var lightVal;

    mtldone = false;
    mtlPending.push(true);
    var lines = objText.split(regExp1);
    for (var p = 0; p < lines.length; ++p) {
        line = lines[p].trim();
        while (line.length > 0 && line.charCodeAt(0) == 0) {
            line = line.substring(1);
        }
        if (line.indexOf("newmtl") == 0) {
            if (havekey && !havekeyfile) {
                mtlfilename.push("");
                textureArray.push("");
                havekey = false;
            }
            line = line.substring(6).trim();
            if (line.length > 0) {
                mtlfilecode.push(line);
                addLightingArrayEntry();
                havekey = true;
            }
            havekeyfile = false;
        }
        else if (havekey && !havekeyfile && (line.indexOf("map_Ka") == 0 ||
            line.indexOf("map_Kd") == 0)) {
            line = line.substring(6).trim();
            var nn = line.lastIndexOf("/");
            if (nn > -1) {
                line = line.substring(nn + 1);
            }
            nn = line.lastIndexOf("\\");
            if (nn > -1) {
                line = line.substring(nn + 1);
            }
            mtlfilename.push("!" + texdirname + line);
            havekeyfile = true;
            loadTexture(texdirname + line);
        }
        else if (havekey && line.indexOf("Ka ") == 0) {
            line = line.substring(3).trim();
            lineArr = line.split(regExp2);
            if (lineArr.length == 3) {
                lightVal = vec4(lineArr[0], lineArr[1], lineArr[2], 1.0);
                updateLightingArrayEntry(lightVal, null, null, null);
            }
        }
        else if (havekey && line.indexOf("Kd ") == 0) {
            line = line.substring(3).trim();
            lineArr = line.split(regExp2);
            if (lineArr.length == 3) {
                lightVal = vec4(lineArr[0], lineArr[1], lineArr[2], 1.0);
                updateLightingArrayEntry(null, lightVal, null, null);
            }
        }
        else if (havekey && line.indexOf("Ks ") == 0) {
            line = line.substring(3).trim();
            lineArr = line.split(regExp2);
            if (lineArr.length == 3) {
                lightVal = vec4(lineArr[0], lineArr[1], lineArr[2], 1.0);
                updateLightingArrayEntry(null, null, lightVal, null);
            }
        }
        else if (havekey && line.indexOf("Ns ") == 0) {
            updateLightingArrayEntry(null, null, null, line.substring(3).trim());
        }
    }
    if (havekey && !havekeyfile) {
        mtlfilename.push("");
        textureArray.push("");
    }
    mtldone = true;
    mtlPending.pop();
}

function loadobj() {
    readfile(objfile);
    processobj();
}

function processobj() {
    if (imagesPending.length > 0) {
        window.setTimeout(processobj, 50);
        return;
    }
    makemesh();
}

function readfile(objText) {
    inread = true;

    var regExp1 = new RegExp("\n|\r");
    var regExp2 = new RegExp("\\s+");
    var lines = objText.split(regExp1);
    var line;
    var lineArr;
    var wordArr;
    var indSet;
    var indNum;
    var indCnt = 0;
    var norm_indSet;
    var norm_indNum;
    var norm_indCnt = 0;
    var hasNorm = false;
    var tex_indSet;
    var tex_indNum;
    var tex_indCnt = 0;
    var hasTex = false;
    var div1, div2, div3;
    var highDiv = 1;
    var tempVert = [];
    var toppoint = 0;      // y+
    var bottompoint = 0;   // y-
    var leftpoint = 0;     // x-
    var rightpoint = 0;    // x+
    var farpoint = 0;      // z-
    var nearpoint = 0;     // z+
    var firstpass = true;
    var xshift = 0;
    var yshift = 0;
    var zshift = 0;
    var vCnt = 0;

    vertices = [];
    cvertices = [];
    indices = [];
    norm_indices = [];
    norms = [];
    tex_indices = [];
    texbuf = [];
    mtlindcode = [];
    mtlindval = [];
    mtlfilecode = [];
    mtlfilename = [];
    textureArray = [];
    lightingArray = [];

    mtlPending = [];
    texturePending = [];

    numMeshes = 0;
    hasColor = false;

    for (var q = 0; q < lines.length; ++q) {
        line = lines[q].trim();
        while (line.length > 0 && line.charCodeAt(0) == 0) {
            line = line.substring(1);
        }
        if (line.length > 1 && line.charAt(0) == "v" && line.charAt(1) == " ") {
            lineArr = line.split(regExp2);
            if (lineArr.length == 4 || lineArr.length == 7) {
                div1 = Number(lineArr[1]);
                div2 = Number(lineArr[2]);
                div3 = Number(lineArr[3]);
                if (Math.abs(div1) > highDiv) {
                    highDiv = Math.abs(div1);
                }
                if (Math.abs(div2) > highDiv) {
                    highDiv = Math.abs(div2);
                }
                if (Math.abs(div3) > highDiv) {
                    highDiv = Math.abs(div3);
                }
                if (firstpass) {
                    rightpoint = div1;
                    leftpoint = div1;
                    toppoint = div2;
                    bottompoint = div2;
                    nearpoint = div3;
                    farpoint = div3;
                    firstpass = false;
                }
                if (div1 > rightpoint) {
                    rightpoint = div1;
                }
                if (div1 < leftpoint) {
                    leftpoint = div1;
                }
                if (div2 > toppoint) {
                    toppoint = div2;
                }
                if (div2 < bottompoint) {
                    bottompoint = div2;
                }
                if (div3 > nearpoint) {
                    nearpoint = div3;
                }
                if (div3 < farpoint) {
                    farpoint = div3;
                }

                tempVert.push([div1, div2, div3]);
                ++indCnt;

                if (lineArr.length == 7) {
                    cvertices.push(vec4(Number(lineArr[4]), Number(lineArr[5]),
                        Number(lineArr[6]), 1.0));
                    hasColor = true;
                }
                else {
                    cvertices.push(vec4(1.0, 1.0, 1.0, 1.0));
                }
            }
        }
        else if (line.length > 2 && line.charAt(0) == "v"
            && line.charAt(1) == "n" && line.charAt(2) == " ") {
            lineArr = line.split(regExp2);
            if (lineArr.length == 4) {
                norms.push(vec3(-Number(lineArr[1]), -Number(lineArr[2]), -Number(lineArr[3])));
                ++norm_indCnt;
            }
        }
        else if (line.length > 2 && line.charAt(0) == "v"
            && line.charAt(1) == "t" && line.charAt(2) == " ") {
            lineArr = line.split(regExp2);
            if (lineArr.length > 1) {
                texbuf.push(vec2(Number(lineArr[1]), Number(lineArr[2])));
                ++tex_indCnt;
            }
        }
        else if ((line.length > 1 && line.charAt(0) == "f" && line.charAt(1) == " ") ||
            (line.length > 2 && line.charAt(0) == "f" && line.charAt(1) == "o" && line.charAt(2) == " ")) {
            lineArr = line.split(regExp2);
            if (lineArr.length >= 4) {
                indSet = [];
                norm_indSet = [];
                tex_indSet = [];
                hasNorm = false;
                hasTex = false;
                for (var r = 1; r < lineArr.length; ++r) {
                    wordArr = lineArr[r].split("/");
                    if (wordArr.length > 0) {
                        indNum = Number(wordArr[0]);

                        if (wordArr.length > 1) {
                            hasTex = true;
                            tex_indNum = Number(wordArr[1]);

                            if (tex_indNum > 0) {
                                --tex_indNum;
                            } else {
                                tex_indNum = tex_indCnt + tex_indNum;
                            }
                            tex_indSet.push(tex_indNum);
                        }

                        if (wordArr.length > 2) {
                            hasNorm = true;
                            norm_indNum = Number(wordArr[2]);

                            if (norm_indNum > 0) {
                                --norm_indNum;
                            } else {
                                norm_indNum = norm_indCnt + norm_indNum;
                            }
                            norm_indSet.push(norm_indNum);
                        }
                    }
                    else {
                        indNum = Number(wordArr);
                    }
                    if (indNum > 0) {
                        --indNum;
                    } else {
                        indNum = indCnt + indNum;
                    }
                    indSet.push(indNum);
                }
                if (indSet.length == 3) {
                    indices.push(indSet);
                    if (hasTex) {
                        tex_indices.push(tex_indSet);
                    }
                    else {
                        tex_indices.push([0, 0, 0]);
                    }
                    if (hasNorm) {
                        norm_indices.push(norm_indSet);
                    }
                    vCnt += 3;
                }
                else {
                    for (var s = 0; s < indSet.length - 2; ++s) {
                        indices.push([indSet[0], indSet[s + 1], indSet[s + 2]]);
                        if (hasTex) {
                            tex_indices.push([tex_indSet[0], tex_indSet[s + 1], tex_indSet[s + 2]]);
                        }
                        else {
                            tex_indices.push([0, 0, 0]);
                        }
                        if (hasNorm) {
                            norm_indices.push([norm_indSet[0], norm_indSet[s + 1], norm_indSet[s + 2]]);
                        }
                        vCnt += 3;
                    }
                }
            }
        }
        else if (line.indexOf("mtllib") == 0 && line.indexOf(".mtl") > 0) {
            line = line.substring(6).trim();
            var mm = line.indexOf(".mtl");
            if (mm > 0) {
                var mtlfile = line.substring(0, mm) + ".js";
                mm = mtlfile.lastIndexOf("/");
                if (mm > -1) {
                    mtlfile = mtlfile.substring(mm + 1);
                }
                mm = mtlfile.lastIndexOf("\\");
                if (mm > -1) {
                    mtlfile = mtlfile.substring(mm + 1);
                }
                loadmtl(texdirname + mtlfile);
            }
        }
        else if (line.indexOf("usemtl") == 0) {
            lineArr = line.split(regExp2);
            if (lineArr.length > 1) {
                mtlindcode.push(lineArr[1]);
                mtlindval.push(vCnt);
            }
        }
    }
    numMeshes = indices.length;

    if (centerIt) {
        xshift = (rightpoint - leftpoint) / 2;
        yshift = (toppoint - bottompoint) / 2;
        zshift = (nearpoint - farpoint) / 2;
    }
    for (var t = 0; t < tempVert.length; ++t) {
        div1 = Number(tempVert[t][0]);
        div2 = Number(tempVert[t][1]);
        div3 = Number(tempVert[t][2]);

        if (centerIt) {
            div1 -= leftpoint + xshift;
            div2 -= bottompoint + yshift;
            div3 -= farpoint + zshift;
        }

        vertices.push(vec3((div1 / highDiv), (div2 / highDiv), (div3 / highDiv)));
    }
    inread = false;
}

function makemesh() {
    var t1, t2, normal;

    hasNorms = (indices.length == norm_indices.length);
    var y = document.getElementById("smoothshading");
    if (hasNorms) {
        y.style.display = "block";
    } else {
        y.style.display = "none";
    }

    hasTextures = (indices.length == tex_indices.length &&
        mtlindcode.length > 0 && mtlfilecode.length > 0);

    y = document.getElementById("adscontrol");
    if (hasTextures) {
        lightingOverride = true;
        document.getElementById("removeads").checked = true;
        y.style.display = "block";
    } else {
        y.style.display = "none";
    }
    if (hasTextures) {
        var found = false;
        for (var u = 0; u < mtlfilename.length; ++u) {
            if (mtlfilename[u] != null && mtlfilename[u] != "" &&
                mtlfilename[u].substring(0, 1) != "!") {
                found = true;
                break;
            }
        }
        if (!found) {
            hasTextures = false;
        }
    }

    theta = resetTheta;
    axis = resetAxis;

    points = [];
    colors = [];
    normals = [];
    texCoordsArray = [];
    for (var a = 0; a < numMeshes; ++a) {
        for (var b = 0; b < indices[a].length - 2; ++b) {
            if (!hasNorms || !smoothIt) {
                t1 = subtract(vertices[indices[a][b]], vertices[indices[a][b + 1]]);
                t2 = subtract(vertices[indices[a][b]], vertices[indices[a][b + 2]]);
                normal = cross(t2, t1);
                normal[3] = 0;
            }
            for (var c = 0; c < 3; c++) {
                points.push(vec4(vertices[indices[a][b + c]]));
                colors.push(cvertices[indices[a][b + c]]);
                if (!hasNorms || !smoothIt) {
                    normals.push(normal);
                }
                else {
                    normals.push(vec4(norms[norm_indices[a][b + c]]));
                }

                if (!hasTextures) {
                    texCoordsArray.push(vec2(0, 0));
                }
                else {
                    texCoordsArray.push(vec2(texbuf[tex_indices[a][b + c]]));
                }
            }
        }
    }

    if (!hasTextures) {
        var txtStr = "No Texture";
        if (!hasNorms || objfile == "") {
            txtStr = "<br />" + txtStr;
        }
        document.getElementById("texturepresent").innerHTML = txtStr;
        resetLighting();

    }
    else {
        document.getElementById("texturepresent").innerHTML = "";
    }

    if (!firstTime) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, nBufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, tBufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

        gl.uniform1i(hasColorLoc, hasColor);
    }
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (mtldone == true && imagesPending.length == 1 && imagesPending[0] == false) {
        imagesPending.pop();
    }
    if (rotateOn)
        theta[axis] += 2.0;
    var modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, rotateX(theta[xAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(theta[yAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[zAxis]));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    if (rotateLight) {
        lightAng += 0.02;
        lightPosition[0] = lightRad * Math.sin(lightAng);
        lightPosition[2] = lightRad * Math.cos(lightAng);
        gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
    }


    if (inread || imagesPending.length > 0 || mtlPending.length > 0 || texturePending.length > 0) {
        ;
    }
    else if (hasTextures) {
        if (lightingOverride) {
            resetLighting();
        }
        for (var h1 = 0; h1 < mtlindcode.length; ++h1) {
            if (skip.indexOf(h1) > -1)
                continue;

            var start = Number(mtlindval[h1]);
            var len = ((h1 == mtlindcode.length - 1) ?
                points.length : Number(mtlindval[h1 + 1])) - start;
            var mtlFile = "";
            var mtlNum = -1;
            for (var h2 = 0; h2 < mtlfilecode.length; ++h2) {
                if (mtlindcode[h1] == mtlfilecode[h2]) {
                    mtlFile = mtlfilename[h2];
                    mtlNum = h2;
                    break;
                }
            }
            if (mtlFile == "" || mtlNum == -1 || mtlNum >= textureArray.length) {
                gl.uniform1i(showTextureLoc, false);
                resetLighting();
            }
            else {
                if (mtlNum > -1 && textureArray[mtlNum] != "") {
                    gl.uniform1i(showTextureLoc, true);

                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, textureArray[mtlNum]);
                    gl.uniform1i(textureLoc, 0);

                    if (!lightingOverride) {
                        bindLightingEntry(mtlNum);
                    }
                }
            }

            if (len > 0) {
                gl.drawArrays(gl.TRIANGLES, start, len);
            }
        }
    }
    else { 
        gl.uniform1i(showTextureLoc, false);
        gl.drawArrays(gl.TRIANGLES, 0, points.length);
    }
   
    requestAnimFrame(render);
}