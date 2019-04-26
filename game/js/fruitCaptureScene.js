        //https://www.babylonjs-playground.com/#ZLUTWE#16
        var players = [];
        var playerLabels=[];
        var playerPoints = [];
        var playersReady = false;
        var scene;
        var engine;
        var nscoreList;
        var boardGame;
        var basedInfo;
        export function createScene(mainScene, baseInfo, scoreList, player1, player2, player3, player4) {
            var canvas = document.getElementById("renderCanvas");
            engine = new BABYLON.Engine(canvas, true);
            nscoreList = scoreList;
            boardGame = mainScene;
            basedInfo = baseInfo;
            engine.loadingUIText = "Nom Nom Fruit Grab Loading...";
            engine.displayLoadingUI();
            engine.stopRenderLoop();
        
            scene = new BABYLON.Scene(engine);
            scene.clearColor = new BABYLON.Color3(0.5, 0.8, 0.8);
            scene.gravity = new BABYLON.Vector3(0, -1, 0);
            scene.collisionsEnabled = true;
            scene.enablePhysics(null, new BABYLON.OimoJSPlugin());
        
            var light = new BABYLON.DirectionalLight("dir02", new BABYLON.Vector3(0.2, -1, 0), scene);
            light.position = new BABYLON.Vector3(0, 80, 0);
        
            var camera =  new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(50, 10, 120), scene);//new BABYLON.ArcRotateCamera("Camera", .6, 1.3, 100, BABYLON.Vector3(50, 0, 0), scene); //
            camera.attachControl(canvas, true);
            camera.setTarget(new BABYLON.Vector3(40, 0, 0));
           // camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
        
            var shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
        
            playerPoints = [0,0,0,0];
            loadGUI(scene);
            
            // Platform
            var ground = BABYLON.Mesh.CreateBox("Ground", 1, scene);
            ground.scaling = new BABYLON.Vector3(100, 1, 20);
            ground.position.x = 40
            ground.checkCollisions = true;
        
            var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
            groundMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
            groundMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            groundMat.backFaceCulling = false;
            ground.material = groundMat;
            ground.receiveShadows = true;
        
            // Physics
            ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, scene);
        
            // Spheres
            var y = 40;
            var spheres = [];
            var totalSpheres = 100;
            
            //Create all the fruit
            for (var index = 0; index < totalSpheres; index++) {
                var sphere = BABYLON.Mesh.CreateSphere("Sphere0", 16, 3, scene);
                sphere.position = new BABYLON.Vector3(Math.random() * 100 - 10, y, 0);
                shadowGenerator.addShadowCaster(sphere);
        
                var ballMaterial = new BABYLON.StandardMaterial("Fruit", scene);
                ballMaterial.diffuseColor = new BABYLON.Color3(1,.5, 0);
                ballMaterial.emissiveColor = new BABYLON.Color3(1, .3, 0);
                sphere.material = ballMaterial;
                
                sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: .2 }, scene);       
                sphere.physicsImpostor.registerOnPhysicsCollide(
                    ground.physicsImpostor,
                    function(main, collided) {
                        try{
                            main.object.position = new BABYLON.Vector3(Math.random() * 100 - 10, y, 0);
                            var linearVelocity = main.object.physicsImpostor.getLinearVelocity();
                            main.object.physicsImpostor.applyImpulse(new BABYLON.Vector3(linearVelocity.x * -1, linearVelocity.y * -1, linearVelocity.z * -1), main.object.getAbsolutePosition());                
                        }
                        catch (e){ /*console.log("Too Late: Deleted"); */ }
                    }
                );
                spheres.push(sphere);
                y += 2;
            }  
            
            // Load Characters then begin game
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
            var inputMap ={};
            scene.actionManager = new BABYLON.ActionManager(scene);
            scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {								
                inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
            }));
            scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {								
                inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
            }));
        
            // Game/Render loop
            scene.onBeforeRenderObservable.add(()=>{
                if(inputMap["a"])
                    players[0].position.x+=0.5        
                if(inputMap["d"])
                    players[0].position.x-=0.5        
                if(inputMap["j"])
                    players[1].position.x+=0.5         
                if( inputMap["l"])
                    players[1].position.x-=0.5
                // if( inputMap["w"])
                // {
                //     displayWinSplash(1);
                //     engine.stopRenderLoop();
                // }
            });
        
            scene.registerBeforeRender(function () {
                if (scene) {
                    //Reset Spheres
                    spheres.forEach( function(s) {
                        if(s.position.y < -100) {
                            s.position = new BABYLON.Vector3(Math.random() * 80 - 10, 55, 0);
                            var linearVelocity = s.physicsImpostor.getLinearVelocity();
                            s.physicsImpostor.applyImpulse(new BABYLON.Vector3(linearVelocity.x * -1, linearVelocity.y * -1, linearVelocity.z * -1), s.getAbsolutePosition());                
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
        
        function updatePlayerScore(playerNum, points) {
            playerPoints[playerNum] += points;
            playerLabels[playerNum].text = "Points: " +  playerPoints[playerNum].toString(); 
            
            var total = playerPoints.reduce(( accumulator, currentValue ) => accumulator + currentValue,0);
            if(total>=400)  {        
                var max = playerPoints.indexOf(Math.max(...playerPoints))+1;
                displayWinSplash(max);
                engine.stopRenderLoop();
            }
        }
        
        function displayWinSplash(winner){    
            var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
            advancedTexture.idealWidth = 600;
        
            var winButton = BABYLON.GUI.Button.CreateSimpleButton("win screen", "Game Over, Player " + winner + " wins!");
            winButton.width = "200px";
            winButton.height = "100px";
            winButton.cornerRadius = 20;
            winButton.color = "White";
            winButton.thickness = 4;
            winButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            winButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            winButton.background = "orange";
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
        
        function snapForward(mesh) {
            var axis = new BABYLON.Vector3(-1,0,0);
        	mesh.rotationQuaternion= new BABYLON.Quaternion.RotationAxis(axis, Math.PI/2);
        }
        
        function loadCharacter(playerNum, mesh, position, scale, spheres) {
            var baseURL = "https://raw.githubusercontent.com/vmcatete/Mario-Babylon/master/assets/";
            BABYLON.SceneLoader.ImportMeshAsync("", baseURL, mesh, scene).then(function (result) {
                    result.meshes[0].scaling = scale;
                    result.meshes[0].position = position;  
                    result.meshes[0].physicsImpostor = new BABYLON.PhysicsImpostor(result.meshes[0], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 10 }, scene);
                    for(var couldCollideIndex = 0; couldCollideIndex < 100; couldCollideIndex ++) {
                        result.meshes[0].physicsImpostor.registerOnPhysicsCollide(
                            spheres[couldCollideIndex].physicsImpostor,
                            function(main, collided) {
                            collided.object.dispose();
                            updatePlayerScore(playerNum, 5);                    
                        }
                    );
                }
                result.meshes[0].checkCollisions = true;
                players[playerNum] = result.meshes[0];
            })
        }
        
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
            playerLabels[0] = createPlayerBadge("green", "Points: 0", "yoshi_face_pink.png", BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT);
            playerLabels[1] = createPlayerBadge("blue", "Points: 0", "yoshi_face_blue.png", BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT);
            playerLabels[2] = createPlayerBadge("gray", "Points: 0", "yoshi_face.png", BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT);
            playerLabels[3] = createPlayerBadge("red", "Points: 0" , "yoshi_face_orange.png", BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT);   
        }