//https://www.babylonjs-playground.com/#ZLUTWE#16
var players = []; //List of characters
var playerLabels=[]; //GUI Label text
var playerPoints = []; //GUI Label points
var playersReady = false; //have player meshes been loaded
var scene;
var engine;
var nscoreList; // List of new player scores
var boardGame;
var basedInfo; //position on gameboard

export function createScene(mainScene, baseInfo, scoreList, player1, player2, player3, player4) {
    //Initialize the game
    var canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    nscoreList = scoreList;
    playerPoints = [0,0,0,0];
    playerLabels = ["1", "2", "3", "4"];
    boardGame = mainScene;
    basedInfo = baseInfo;
    engine.loadingUIText = "Nom Nom Fruit Grab Loading...";
    engine.displayLoadingUI();
    engine.stopRenderLoop();

    //create the scene
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.8, 0.8); //background color
    scene.gravity = new BABYLON.Vector3(0, -1, 0); //vertical acceleration
    scene.collisionsEnabled = true;
    scene.enablePhysics(null, new BABYLON.OimoJSPlugin());

    var light = new BABYLON.DirectionalLight("dir02", new BABYLON.Vector3(0.2, -1, 0), scene);
    light.position = new BABYLON.Vector3(0, 80, 0);    
    var shadowGenerator = new BABYLON.ShadowGenerator(2048, light);

    var camera =  new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(50, 10, 120), scene);
    camera.attachControl(canvas, true);
    camera.setTarget(new BABYLON.Vector3(40, 0, 0));
    
    //load the interface
    loadGUI(scene);
    
    //Generate terrain
    var ground = BABYLON.Mesh.CreateBox("Ground", 1, scene);
    ground.checkCollisions = true;
    /****************************************** */
    //          Add platform code here          //
    //     Scale the ground to fit players      //
    //        Hint set position.x to 40         //
    /****************************************** */
   
    var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
    groundMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    groundMat.backFaceCulling = false;
    ground.material = groundMat;
    ground.receiveShadows = true;

    /****************************************** */
    //          Add skybox code here            //
    // https://doc.babylonjs.com/how_to/skybox  //
    /****************************************** */
    var skybox;
    var skyboxMaterial;


    // Physics
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, scene);

    // Spheres
    var y = 40; // maximum height
    var spheres = [];
    var totalSpheres = 100; //falling fruit
    
    //Create all the fruit

    //For each position in the sphere array
    for (var index = 0; index < totalSpheres; index++) {
        //create a sphere
        var sphere = BABYLON.Mesh.CreateSphere("Sphere0", 16, 3, scene);
        //put the sphere somewhere random
        sphere.position = new BABYLON.Vector3(Math.random() * 100 - 10, y, 0); 
        //add a shadow to see where the sphere is falling
        shadowGenerator.addShadowCaster(sphere);

        /****************************************** */
        //     Generate randomly colored fruit      //
        //  (Also consider changing sizes [above])  //
        /****************************************** */
        var fruitMaterial = new BABYLON.StandardMaterial("Fruit", scene);
        fruitMaterial.diffuseColor = new BABYLON.Color3(1,.5, 0);
        fruitMaterial.emissiveColor = new BABYLON.Color3(1, .3, 0);
        sphere.material = fruitMaterial;
        
        //give the spheres physics
        sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: .2 }, scene);       
        //when the spheres stick to the ground
        sphere.physicsImpostor.registerOnPhysicsCollide(
            ground.physicsImpostor,
            function(main, collided) {
                try{
                    // neutralize the sphere's velocity
                    var linearVelocity = main.object.physicsImpostor.getLinearVelocity();
                    main.object.physicsImpostor.applyImpulse(new BABYLON.Vector3(linearVelocity.x * -1, linearVelocity.y * -1, linearVelocity.z * -1), main.object.getAbsolutePosition());                
                    
                    /****************************************** */
                    //ToDo: Position the fruit back in the sky  //
                    /****************************************** */
                    //main.object.

                }
                catch (e){ /*console.log("Too Late: Deleted"); */ }
            }
        );
        spheres.push(sphere); // add this object to our list of fruit/spheres
        y += 2; //make the next fruit higher in the sky
    }  
    
    // Load Characters then begin game
    //(optionally tinker with Vector3's to change position and size)
    Promise.all([
        loadCharacter(0, "Yoshi_pink.babylon", new BABYLON.Vector3(80, 4.5, 0), new BABYLON.Vector3(25, 100, 25), spheres),
        loadCharacter(1, "Yoshi_blue.babylon", new BABYLON.Vector3(0, 4.5, 0), new BABYLON.Vector3(18, 100, 18), spheres), 
        loadCharacter(2, "Yoshi.babylon", new BABYLON.Vector3(55, 4.5, 0), new BABYLON.Vector3(27, 100, 27), spheres),
        loadCharacter(3, "Yoshi_orange.babylon", new BABYLON.Vector3(30, 4.5, 0), new BABYLON.Vector3(25, 100, 25), spheres),    
        ]).then(() => {
            playersReady=true;
            engine.hideLoadingUI();
            engine.runRenderLoop(function () {
                scene.render();
            });
        });

    //Handle player keyboard input

    /****************************************** */
    //    Add logic or key input to control     //
    //   players 3 and 4 (developers choice)    //
    /****************************************** */
    function onKeyDown(evt) {
        if (playersReady) {
            switch(evt.keyCode) {
                case 65:   { //A
                    players[player1].position.x+=0.5; 
                    break;
                }case 68: { //D
                    players[player1].position.x-=0.5; 
                    break;
                }case 74: { //J
                    players[player2].position.x+=0.5; 
                    break;
                }case 76:{ //L
                    players[player2].position.x-=0.5; 
                    break;
                }
                case 66:{ //B
                    displayWinSplash(1);
                    break;
                }
            }
        }
    }
    window.addEventListener("keydown", onKeyDown);   

    //update object locations before next Frame
    scene.registerBeforeRender(function () {
        if (scene) {
            //Reset Spheres
            spheres.forEach( function(s) {
                //If falling into oblivion
                if(s.position.y < -100) {
                    //put back up top
                    s.position = new BABYLON.Vector3(Math.random() * 80 - 10, 55, 0);
                    
                    /* ***************************************** */
                    //        Exploding Fruits; Run away         //
                    // Neutralize the velocity of the falling s  //
                    /* ***************************************** */
                    
               }
            });
            //Reset Players
            if(playersReady){
                players.forEach( function (p) {
                    p.position.z = 0;
                    snapForward(p);
                });                
            }
        }
    });

    return scene;
}


/*
 * Give players an additional number of points
 * PlayerNum - player receiving points
 * Points - how many points to add 
 */

function updatePlayerScore(playerNum, points) {
    playerPoints[playerNum] += points;
    playerLabels[playerNum].text = "Points: " +  playerPoints[playerNum].toString(); 
    
    //add everyone's points together
    var total = playerPoints.reduce(( accumulator, currentValue ) => accumulator + currentValue,0);
    
    //decide if the game should end
    if(total>=400)  {        
        var max = playerPoints.indexOf(Math.max(...playerPoints))+1;
        displayWinSplash(max);
        engine.stopRenderLoop();
    }
}

/*
 * Winner - the number of the winning player
 */
function displayWinSplash(winner){    
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    advancedTexture.idealWidth = 600;

    /* ***************************************** */
    //        Add more properties to make        //
    //         the win screen satisfying         //
    /* ***************************************** */
    var winButton = BABYLON.GUI.Button.CreateSimpleButton("win screen", "Game Over, Player " + winner + " wins!");
    winButton.width = "200px";
    winButton.height = "100px";


    winButton.onPointerUpObservable.add(function() {
        //Exit Scene
        engine.stopRenderLoop();
        nscoreList.player1Score += playerPoints[0];
        nscoreList.player2Score += playerPoints[1];
        nscoreList.player3Score += playerPoints[2];
        nscoreList.player4Score += playerPoints[3];
        boardGame(basedInfo, nscoreList);
    });
    advancedTexture.addControl(winButton);  
}


//load characters into the game
function loadCharacter(playerNum, mesh, position, scale, spheres) {
    var baseURL = "https://raw.githubusercontent.com/vmcatete/Mario-Babylon/master/assets/";
    BABYLON.SceneLoader.ImportMeshAsync("", baseURL, mesh, scene).then(function (result) {
        result.meshes[0].scaling = scale;
        result.meshes[0].position = position;  
        result.meshes[0].physicsImpostor = new BABYLON.PhysicsImpostor(result.meshes[0], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 10 }, scene);
        //for each item in our sphere list
        for(var couldCollideIndex = 0; couldCollideIndex < 100; couldCollideIndex ++) {
            //if it collides with the player
            result.meshes[0].physicsImpostor.registerOnPhysicsCollide(
                spheres[couldCollideIndex].physicsImpostor,
                function(main, collided) {
                    //Destroy the sphere
                    collided.object.dispose();
                    //get points
                    updatePlayerScore(playerNum, 5);                    
                }
            );
        }
        result.meshes[0].checkCollisions = true;
        players[playerNum] = result.meshes[0];
    });
}

function snapForward(mesh) {
    var axis = new BABYLON.Vector3(-1,0,0);
    mesh.rotationQuaternion= new BABYLON.Quaternion.RotationAxis(axis, Math.PI/2);
}

/* 
 * Create character pics and point notifications
 */ 

function loadGUI(scene) {
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    advancedTexture.idealWidth = 600;

    var createPlayerBadge = function(bkgrName, lab, icon, vert, horz) {        
        var panel = new BABYLON.GUI.StackPanel();
        panel.horizontalAlignment = horz;
        panel.verticalAlignment = vert;
        panel.isVertical = false;   
        panel.left="5px";
        advancedTexture.addControl(panel);   

        var image1 = new BABYLON.GUI.Image("", "https://raw.githubusercontent.com/vmcatete/Mario-Babylon/master/assets/" +icon);
        image1.width = "40px";
        image1.height = "35px";
        image1.left = "5px";
        image1.verticalAlignment = vert;
        image1.horizontalAlignment = horz;
        panel.addControl(image1); 

        var rect1 = new BABYLON.GUI.Rectangle();
        rect1.width = "100px";
        rect1.height = "40px";
        rect1.cornerRadius = 20;
        rect1.color = "White";
        rect1.thickness = 4;
        rect1.horizontalAlignment = horz;
        rect1.verticalAlignment = vert;
        rect1.background = bkgrName;
        rect1.paddingLeft = "5px";
        panel.addControl(rect1);  

        var label1 = new BABYLON.GUI.TextBlock();
        label1.text = lab;
        rect1.addControl(label1);
        return label1;
    }

    /* ***************************************** */
    //   Add player badges for two more players  //
    //        (yoshi face green & orange)        //
    /* ***************************************** */
    playerLabels[0] = createPlayerBadge("green", "Points: 0", "yoshi_face_pink.png", BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT);
    playerLabels[1] = createPlayerBadge("blue", "Points: 0", "yoshi_face_blue.png", BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT);

}