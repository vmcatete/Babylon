export function createScene(mainScene, baseInfo, scoreList, player1, player2, player3) {
    var score = 0;
    var TOAD_MODEL;
    var LANES_POSITIONS = [];
    var ENDINGS = [];
    
    var totalToadsA = 0;
    var totalToadsB = 0;
    var totalToadsC = 0;
    
    var toadsHitA = 0;
    var toadsHitB = 0;
    var toadsHitC = 0;
    
    var player1_model;
    var player2_model;
    var player3_model;

    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);
    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 4, -10), scene);
    // This targets the camera to scene origin
    camera.setTarget(new BABYLON.Vector3(0,0,10));
    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.PointLight("light", new BABYLON.Vector3(0,5,-5), scene);
    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.9;

    // Number of lanes
    var LANE_NUMBER = 3;
    // Space between lanes
    var LANE_INTERVAL = 5;


    // Function to create lanes
    var createLane = function (id, position) {
        var lane = BABYLON.Mesh.CreateBox("lane"+id, 1, scene);   // Each lane will be a very thin rectangular box
        lane.scaling.y = 0.1;   //This is to make the box very thin
        lane.scaling.x = 3;     // Each lane should have a decent width
        lane.scaling.z = 800;   // However, each lane should be very long!
        lane.position.x = position;     // Where the lane is depends on the position argument
        lane.position.z = lane.scaling.z/2-200;     // Each lane should be at a nice fixed spot, and this line does just that
    };

    // Function to create the ending markers on each lane
    var createEnding = function (id, position) {
        var ending = BABYLON.Mesh.CreateGround(id, 3, 4, 1, scene);     //Each ending will be a ground-type shape
        ending.position.x = position;   //The position of each ending marker is based ont he parameter
        ending.position.y = 0.1;    // Each ending is placed at a specific y coordinate
        ending.position.z = 1;  // Each ending is also placed at a specific z coordingate
        var mat = new BABYLON.StandardMaterial("endingMat", scene);
        mat.diffuseColor = new BABYLON.Color3(0.8,0.2,0.2);     // This line will make each ending marker red
        ending.material = mat;  // It will assign the red color to the actual ending marker as a material
        return ending;
    };

    // The next couple of lines will run a for-loop to make the three lanes
    var currentLanePosition = LANE_INTERVAL * -1 * (LANE_NUMBER/2);
    for (var i = 0; i<LANE_NUMBER; i++){
        LANES_POSITIONS[i] = currentLanePosition;
        createLane(i, currentLanePosition);
        var e = createEnding(i, currentLanePosition);
        ENDINGS.push(e);
        currentLanePosition += LANE_INTERVAL;
    }


    camera.position.x = LANES_POSITIONS[Math.floor(LANE_NUMBER/2)];

    // The function ImportMesh will import our custom model in the scene given in parameter
    BABYLON.SceneLoader.ImportMesh("red_toad", "https://cdn.jsdelivr.net/gh/ntgomes/babylonjs_stuff@902cce58f0ca76aed9ac941862463879741d2f69/", "toad.babylon", scene, function (meshes) {
        var m = meshes[0];
        m.isVisible = false;
        m.scaling = new BABYLON.Vector3(0.5,0.5,0.5);
        TOAD_MODEL = m;
    });
    
    BABYLON.SceneLoader.ImportMesh("", "https://cdn.jsdelivr.net/gh/ntgomes/babylonjs_stuff@89766648da6879687822d045e8c7817d3127b852/", "Mario.babylon", scene, function (meshes) {
        var m = meshes[0];
        m.isVisible = true;
        m.position = new BABYLON.Vector3(LANES_POSITIONS[0] + 3, 5, 0);
        m.scaling = new BABYLON.Vector3(3,3,3);
        player1_model = m;
    });
    
    BABYLON.SceneLoader.ImportMesh("", "https://cdn.jsdelivr.net/gh/ntgomes/babylonjs_stuff@89766648da6879687822d045e8c7817d3127b852/", "Peach.babylon", scene, function (meshes) {
        var m = meshes[0];
        m.isVisible = true;
        m.position = new BABYLON.Vector3(LANES_POSITIONS[1], 5.5, 7);
        m.scaling = new BABYLON.Vector3(3,3,3);
        player2_model = m;
    });
    
    BABYLON.SceneLoader.ImportMesh("", "https://cdn.jsdelivr.net/gh/ntgomes/babylonjs_stuff@89766648da6879687822d045e8c7817d3127b852/", "Yoshi.babylon", scene, function (meshes) {
        var m = meshes[0];
        m.isVisible = true;
        m.position = new BABYLON.Vector3(LANES_POSITIONS[2] - 3, 5, 0);
        m.scaling = new BABYLON.Vector3(3,3,3);
        player3_model = m;
    });
    
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    
    var text1 = new BABYLON.GUI.TextBlock();
    var scoreA = 0;
    text1.text = "Player 1 Score: ";
    text1.color = "white";
    text1.fontSize = 20;
    text1.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    text1.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text1);
    
    var text2 = new BABYLON.GUI.TextBlock();
    var scoreB = 0;
    text2.text = "Player 2 Score: ";
    text2.color = "white";
    text2.fontSize = 20;
    text2.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    text2.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text2);
    
    var text3 = new BABYLON.GUI.TextBlock();
    var scoreC = 0;
    text3.text = "Player 3 Score: ";
    text3.color = "white";
    text3.fontSize = 20;
    text3.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    text3.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text3);

    var ENEMIES  = [];  // An array that will contain all spawned in toad models
    // Function that creates a shroom in a random lane
    var createEnemy = function () {
        // The starting position of toads
        var posZ = 100;

        // Get a random lane
        var lanePick = Math.floor(Math.random() * LANE_NUMBER);
        if (lanePick == 0 && totalToadsA == 20) {
            return;
        }
        if (lanePick == 1 && totalToadsB == 20) {
            return;
        }
        if (lanePick == 2 && totalToadsC == 20) {
            return;
        }
        var posX = LANES_POSITIONS[lanePick];

        // Create a clone of our template
        var shroom = TOAD_MODEL.clone(TOAD_MODEL.name);

        shroom.id = TOAD_MODEL.name+(ENEMIES.length+1);
        // Our toad has not been killed yet!
        shroom.killed = false;
        // Set the shroom visible
        shroom.isVisible = true;
        // Update its position
        shroom.position = new BABYLON.Vector3(posX, shroom.position.y/2, posZ);
        ENEMIES.push(shroom);
        switch(lanePick) {
            case 0:
                totalToadsA++;
                break;
            case 1:
                totalToadsB++;
                break;
            case 2:
                totalToadsC++;
                break;
        }
        if (totalToadsA == 20 && totalToadsB == 20 && totalToadsC == 20) {
            engine.stopRenderLoop();
            alert("FINISH");
            var aRatio = toadsHitA/totalToadsA;
            var bRatio = toadsHitB/totalToadsB;
            var cRatio = toadsHitC/totalToadsC;
            switch(Math.max(Math.max(aRatio, bRatio), cRatio)) {
                case aRatio:
                    alert("Player 1 wins! " + aRatio);
                    break;
                case bRatio:
                    alert("Player 2 wins! " + bRatio);
                    break;
                case cRatio:
                    alert("Player 3 wins! " + cRatio);
                    break;
                default:
                    alert("TIE!");
                    break;
            }
            scoreList.player1Score += aRatio * 100;
            scoreList.player2Score += bRatio * 100;
            scoreList.player3Score += cRatio * 100;
            mainScene(baseInfo, scoreList);
        }
    };

    // Creates a clone every 0.5 seconds
    setInterval(createEnemy, 500);

   engine.runRenderLoop(function () {
       scene.render();
       ENEMIES.forEach(function (shroom) {
           if (shroom.killed) {
               // Nothing to do here
           } else {
               shroom.position.z -= 0.5;
           }
       });
        cleanShrooms();
    });


    // The box creation
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 100.0, scene);

    // The sky creation
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;    // Only keep graphics inside the box
    // Necessary diffusion and speculars to set up the sky
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://cdn.jsdelivr.net/gh/ntgomes/babylonjs_stuff@0cf3d296f683fd116b49999626ff4af23788ad44/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    // box + sky = skybox !
    skybox.material = skyboxMaterial;

    // A function to despawn mushrooms once we can't see them anymore
    function cleanShrooms() {
        // For all toads
        for (var n=0; n<ENEMIES.length; n++) {
            if (ENEMIES[n].position.z < -10) {
                var shroom = ENEMIES[n];
                // Destroy the clone !
                shroom.dispose();
                ENEMIES.splice(n, 1);   // Remove that toad from the container of spawned toads
                n--;    // This means there is now one less toad to deal with
            } else if (ENEMIES[n].killed) {
                var shroom = ENEMIES[n];
                // Destroy the clone !
                shroom.dispose();
                ENEMIES.splice(n, 1);   // Remove that toad from the container of spawned toads
                n--;    // This means there is now one less toad to deal with
                score += 1;     // You hit a toad on time, so get a point!
            }
        }
    }

    function animateEnding (ending) {
        // Get the initial position of our ending object
        var posY = ending.position.y;
        // Create the Animation object
        var animateEnding = new BABYLON.Animation(
        "animateEnding",
        "position.y",
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);

        // Animations keys
        var keys = [];
        keys.push({
            frame: 0,
            value: posY
        },{
            frame: 5,
            value: posY+0.5
        },{
            frame: 10,
            value: 0.1
        });

        // Add these keys to the animation
        animateEnding.setKeys(keys);

        // Link the animation to the ending object
        ending.animations.push(animateEnding);

        // Run the animation !
        scene.beginAnimation(ending, 0, 10, false, 1);
    }

    // Function that links a certain keyboard button to each lane animation
    function onKeyDown(evt) {
        var currentEnding = -1;
        switch (evt.keyCode) {
            case 65 : // pressing 'A'
                currentEnding = 0;
                break;
            case 83 : // pressing 'S'
                currentEnding = 1;
                break;
            case 68 : // pressing 'D'
                currentEnding = 2;
                break;
        }
        if (currentEnding != -1) {
            // ANIMATE THE MATCHING ENDING MARKER !!
            animateEnding(ENDINGS[currentEnding]);
            var shroom = getToadOnEnding(ENDINGS[currentEnding]);
            if (shroom) {     // If a toad was on the matching ending marker
                //Kill!
                shroom.killed = true;
                
                var particleSystem = new BABYLON.ParticleSystem("particles", 10, scene);
                particleSystem.particleTexture = new BABYLON.Texture("https://cdn.jsdelivr.net/gh/ntgomes/babylonjs_stuff@4bfc22bbabe975371014453ee9a6b85a2ffbfba1/coins.png", scene);
                particleSystem.emitter = ENDINGS[currentEnding];
                particleSystem.minSize = 0.1;
                particleSystem.maxSize = 0.5;
                particleSystem.updateSpeed = 0.15;
                particleSystem.targetStopDuration  = 2;
                particleSystem.start();
                
                switch(currentEnding) {
                    case 0:
                        toadsHitA++;
                        break;
                    case 1:
                        toadsHitB++;
                        break;
                    case 2:
                        toadsHitC++;
                        break;
                }
            } else {
                score -= 1;  // Bad timing results in score going down
                switch(currentEnding) {
                    case 0:
                        toadsHitA = Math.max(0, toadsHitA--);
                        break;
                    case 1:
                        toadsHitB = Math.max(0, toadsHitB--);
                        break;
                    case 2:
                        toadsHitC = Math.max(0, toadsHitC--);
                        break;
                }
            }
            scoreA = Math.max(0, Math.round(toadsHitA/totalToadsA * 100) / 100) ;
            scoreB = Math.max(0, Math.round(toadsHitB/totalToadsB * 100) / 100) ;
            scoreC = Math.max(0, Math.round(toadsHitC/totalToadsC * 100) / 100) ;
            text1.text = "Player 1 Score: " + scoreA;
            text2.text = "Player 2 Score: " + scoreB;
            text3.text = "Player 3 Score: " + scoreC;
        }
    }

    window.addEventListener("keydown", onKeyDown);

    // Function checking if a shroom is present on a given ending marker
    function getToadOnEnding(ending) {
        // for each mushroom
        for (var i=0; i<ENEMIES.length; i++){
            var shroom = ENEMIES[i];
            // Check if the shroom is horizontally on the ending marker
            if (shroom.position.x === ending.position.x) {
                // Check if the shroom is vertically on the ending
                var diffPRange = ending.position.z + 3; // Account for ending marker length
                var diffNRange = ending.position.z - 3;
                if (shroom.position.z > diffNRange && shroom.position.z < diffPRange ) {
                    return shroom;
                }
            }
        }
        return null;
    }
    
    return scene;

};
