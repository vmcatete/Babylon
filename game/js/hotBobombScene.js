export function createScene(mainScene, baseInfo, scoreList, player1, player2, player3, player4) {
    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);
    
    var P1_MODEL;
    var P2_MODEL;
    var P3_MODEL;
    var P4_MODEL;
    var BALL = [];
    var ready = false;
    var tReady = false;
    var gameEnd = false;

    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    BABYLON.SceneLoader.ImportMesh("", "https://cdn.jsdelivr.net/gh/ntgomes/babylonjs_stuff@89766648da6879687822d045e8c7817d3127b852/", "Mario.babylon", scene, function (meshes) {
        var m = meshes[0];
        m.isVisible = true;
        m.position = new BABYLON.Vector3(0, 1, -3);
        m.scaling = new BABYLON.Vector3(3,3,3);
        P1_MODEL = m;
    });
    
    BABYLON.SceneLoader.ImportMesh("", "https://cdn.jsdelivr.net/gh/ntgomes/babylonjs_stuff@89766648da6879687822d045e8c7817d3127b852/", "Peach.babylon", scene, function (meshes) {
        var m = meshes[0];
        m.isVisible = true;
        m.position = new BABYLON.Vector3(-1, 1, -1.5);
        m.scaling = new BABYLON.Vector3(1.5,1.5,1.5);
        P2_MODEL = m;
    });
    
    BABYLON.SceneLoader.ImportMesh("", "https://cdn.jsdelivr.net/gh/ntgomes/babylonjs_stuff@34b9dbfbaa4f96c989dd8cd0649863fa4af5fe9c/", "rToad.babylon", scene, function (meshes) {
        var m = meshes[0];
        m.isVisible = true;
        m.position = new BABYLON.Vector3(0, 1, 0);
        m.scaling = new BABYLON.Vector3(3,3,3);
        P3_MODEL = m;
    });

    BABYLON.SceneLoader.ImportMesh("", "https://cdn.jsdelivr.net/gh/ntgomes/babylonjs_stuff@89766648da6879687822d045e8c7817d3127b852/", "Luigi.babylon", scene, function (meshes) {
        var m = meshes[0];
        m.isVisible = true;
        m.position = new BABYLON.Vector3(1, 1, -1.5);
        m.scaling = new BABYLON.Vector3(3,3,3);
        P4_MODEL = m;
    });
    
    BABYLON.SceneLoader.ImportMesh("", "https://cdn.jsdelivr.net/gh/ntgomes/babylonjs_stuff@aa4bd5cc0e49bf27f744b7ee41449c8eb24fcd34/", "bombe-mario.babylon", scene, function (meshes) {
        meshes.map(function(m) {
            m.scaling = new BABYLON.Vector3(0.2,0.2,0.2);
            m.position = new BABYLON.Vector3(0, 1, -2.3); //Defaults to Mario/Player 1's position
            m.animations.push(ballPass);
        });
        BALL = meshes;
        ready = true;
        tReady = true;
    });
    // Mario: (0, 1, -2.3)
    // Peach: (-0.6, 1, -1.5)
    // Yoshi: (0, 1, -0.7)
    // Luigi: (0.6, 1, -1.5)

    // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
    var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
    var mat = new BABYLON.StandardMaterial("endingMat", scene);
    mat.diffuseColor = new BABYLON.Color3(0.9,0.9,0.2);     // This line will make the ground yellow
    ground.material = mat;  // It will assign the yellow color to the actual ground as a material
    
    /* THE GUI */
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    
    var text1 = new BABYLON.GUI.TextBlock();
    var timeLeft = "";
    text1.text = "Time: ";
    text1.color = "white";
    text1.fontSize = 30;
    text1.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    text1.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text1);
    
    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "Press A to pass left!\nPress D to pass right!";
    text2.color = "white";
    text2.fontSize = 30;
    text2.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    text2.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text2);

    /* This code was inspired by https://stackoverflow.com/questions/20618355/the-simplest-possible-javascript-countdown-timer */
    function startTimer(duration) {
        var timer = duration, minutes, seconds;
        setInterval(function () {
            minutes = parseInt(timer / 60, 10)
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            if (parseInt(minutes) == 0 && parseInt(seconds) <= 10){
                text1.color = "red";
            }
            if (parseInt(minutes) == 0 && parseInt(seconds) == 0){
                gameEnd = true;
            }
            timeLeft = minutes + ":" + seconds;
            text1.text = "Time: " + timeLeft;

            if (--timer < 0) {
                timer = duration;
            }
        }, 1000);
    }


    engine.runRenderLoop(function () {
       scene.render();
       if (tReady == true) {
           startTimer(20);
           tReady = false;
       }
       if (gameEnd) {
           engine.stopRenderLoop();
           alert("BOOM! THE BOMB EXPLODES!");
           if (BALL[0].position.x == 0 && BALL[0].position.y == 1 && BALL[0].position.z == -2.3) {
               alert("Player 1 loses! Player 2, 3, and 4 win!");
               scoreList.player2Score += 100;
               scoreList.player3Score += 100;
               scoreList.player4Score += 100;
           } else if (BALL[0].position.x == -0.6 && BALL[0].position.y == 1 && BALL[0].position.z == -1.5) {
               alert("Player 2 loses! Player 1, 3, and 4 win!");
               scoreList.player1Score += 100;
               scoreList.player3Score += 100;
               scoreList.player4Score += 100;
           } else if (BALL[0].position.x == 0 && BALL[0].position.y == 1 && BALL[0].position.z == -0.7) {
               alert("Player 3 loses! Player 1, 2, and 4 win!");
               scoreList.player1Score += 100;
               scoreList.player2Score += 100;
               scoreList.player4Score += 100;
           } else if (BALL[0].position.x == 0.6 && BALL[0].position.y == 1 && BALL[0].position.z == -1.5) {
               alert("Player 4 loses! Player 1, 2, and 3 win!");
               scoreList.player1Score += 100;
               scoreList.player2Score += 100;
               scoreList.player3Score += 100;
           } else {
               alert("The bomb was in the middle of being passed, so IT'S A TIE!");
           }
           mainScene(baseInfo, scoreList);
       }
    });

    // Here, add animations objects similar to Toad Attack, with each possible movement as an object
    var PASS_ANIMATIONS = [];

    var ballPass = new BABYLON.Animation("ballPass", "position", 24, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var keyFrames = [];
    keyFrames.push(
        /* Mario --> Peach */
        {frame: 0, value: new BABYLON.Vector3(0, 1, -2.3)},
        {frame: 1, value: new BABYLON.Vector3(-0.2, 1, -2.0)},
        {frame: 2, value: new BABYLON.Vector3(-0.3, 1, -1.8)},
        {frame: 3, value: new BABYLON.Vector3(-0.4, 1, -1.7)},
        {frame: 4, value: new BABYLON.Vector3(-0.5, 1, -1.6)},
        {frame: 5, value: new BABYLON.Vector3(-0.6, 1, -1.5)},
        /* Mario --> Luigi */
        {frame: 6, value: new BABYLON.Vector3(0, 1, -2.3)},
        {frame: 7, value: new BABYLON.Vector3(0.2, 1, -2.0)},
        {frame: 8, value: new BABYLON.Vector3(0.3, 1, -1.8)},
        {frame: 9, value: new BABYLON.Vector3(0.4, 1, -1.7)},
        {frame: 10, value: new BABYLON.Vector3(0.5, 1, -1.6)},
        {frame: 11, value: new BABYLON.Vector3(0.6, 1, -1.5)},
        /* Peach --> Mario */
        {frame: 12, value: new BABYLON.Vector3(-0.6, 1, -1.5)},
        {frame: 13, value: new BABYLON.Vector3(-0.5, 1, -1.6)},
        {frame: 14, value: new BABYLON.Vector3(-0.4, 1, -1.7)},
        {frame: 15, value: new BABYLON.Vector3(-0.3, 1, -1.8)},
        {frame: 16, value: new BABYLON.Vector3(-0.2, 1, -2.0)},
        {frame: 17, value: new BABYLON.Vector3(0, 1, -2.3)},
        /* Peach --> Yoshi */
        {frame: 18, value: new BABYLON.Vector3(-0.6, 1, -1.5)},
        {frame: 19, value: new BABYLON.Vector3(-0.5, 1, -1.2)},
        {frame: 20, value: new BABYLON.Vector3(-0.4, 1, -1.1)},
        {frame: 21, value: new BABYLON.Vector3(-0.3, 1, -1.0)},
        {frame: 22, value: new BABYLON.Vector3(-0.2, 1, -0.9)},
        {frame: 23, value: new BABYLON.Vector3(0, 1, -0.7)},
        /* Yoshi --> Peach */
        {frame: 24, value: new BABYLON.Vector3(0, 1, -0.7)},
        {frame: 25, value: new BABYLON.Vector3(-0.2, 1, -0.9)},
        {frame: 26, value: new BABYLON.Vector3(-0.3, 1, -1.0)},
        {frame: 27, value: new BABYLON.Vector3(-0.4, 1, -1.1)},
        {frame: 28, value: new BABYLON.Vector3(-0.5, 1, -1.2)},
        {frame: 29, value: new BABYLON.Vector3(-0.6, 1, -1.5)},
        /* Yoshi --> Luigi */
        {frame: 30, value: new BABYLON.Vector3(0, 1, -0.7)},
        {frame: 31, value: new BABYLON.Vector3(0.1, 1, -1.0)},
        {frame: 32, value: new BABYLON.Vector3(0.2, 1, -1.1)},
        {frame: 33, value: new BABYLON.Vector3(0.3, 1, -1.2)},
        {frame: 34, value: new BABYLON.Vector3(0.4, 1, -1.3)},
        {frame: 35, value: new BABYLON.Vector3(0.6, 1, -1.5)},
        /* Luigi --> Yoshi */
        {frame: 36, value: new BABYLON.Vector3(0.6, 1, -1.5)},
        {frame: 37, value: new BABYLON.Vector3(0.4, 1, -1.3)},
        {frame: 38, value: new BABYLON.Vector3(0.3, 1, -1.2)},
        {frame: 39, value: new BABYLON.Vector3(0.2, 1, -1.1)},
        {frame: 40, value: new BABYLON.Vector3(0.1, 1, -1.0)},
        {frame: 41, value: new BABYLON.Vector3(0, 1, -0.7)},
        /* Luigi --> Mario */
        {frame: 42, value: new BABYLON.Vector3(0.6, 1, -1.5)},
        {frame: 43, value: new BABYLON.Vector3(0.5, 1, -1.6)},
        {frame: 44, value: new BABYLON.Vector3(0.4, 1, -1.7)},
        {frame: 45, value: new BABYLON.Vector3(0.3, 1, -1.8)},
        {frame: 46, value: new BABYLON.Vector3(0.2, 1, -2.0)},
        {frame: 47, value: new BABYLON.Vector3(0, 1, -2.3)}
    );
    ballPass.setKeys(keyFrames);
     // Function that links a certain keyboard button to each lane animation
    function onKeyDown(evt) {
        if (ready) {
            switch(evt.keyCode) {
                case 65:    // left!
                    if (BALL[0].position.x == 0 && BALL[0].position.y == 1 && BALL[0].position.z == -2.3) {
                        BALL.map(function(m) {
                            scene.beginAnimation(m, 0, 5, true, 1);
                        });
                    } else if (BALL[0].position.x == -0.6 && BALL[0].position.y == 1 && BALL[0].position.z == -1.5) {
                        BALL.map(function(m) {
                            scene.beginAnimation(m, 18, 23, true, 1);
                        });
                    } else if (BALL[0].position.x == 0 && BALL[0].position.y == 1 && BALL[0].position.z == -0.7) {
                        BALL.map(function(m) {
                            scene.beginAnimation(m, 30, 35, true, 1);
                        });
                    } else if (BALL[0].position.x == 0.6 && BALL[0].position.y == 1 && BALL[0].position.z == -1.5) {
                        BALL.map(function(m) {
                            scene.beginAnimation(m, 42, 47, true, 1);
                        });
                    }
                    break;
                case 68:    // right!
                    if (BALL[0].position.x == 0 && BALL[0].position.y == 1 && BALL[0].position.z == -2.3) {
                        BALL.map(function(m) {
                            scene.beginAnimation(m, 6, 11, true, 1);
                        });
                    } else if (BALL[0].position.x == -0.6 && BALL[0].position.y == 1 && BALL[0].position.z == -1.5) {
                        BALL.map(function(m) {
                            scene.beginAnimation(m, 12, 17, true, 1);
                        });
                    } else if (BALL[0].position.x == 0 && BALL[0].position.y == 1 && BALL[0].position.z == -0.7) {
                        BALL.map(function(m) {
                            scene.beginAnimation(m, 24, 29, true, 1);
                        });
                    } else if (BALL[0].position.x == 0.6 && BALL[0].position.y == 1 && BALL[0].position.z == -1.5) {
                        BALL.map(function(m) {
                            scene.beginAnimation(m, 36, 41, true, 1);
                        });
                    }
                    break;
            }
        }
    }

    window.addEventListener("keydown", onKeyDown);
    
    return scene;

};
