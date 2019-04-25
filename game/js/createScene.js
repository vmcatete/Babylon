import {createScene as toadAttack} from "./toadAttackScene.js";
import {createScene as hotBobomb} from "./hotBobombScene.js";

document.addEventListener("DOMContentLoaded", function () {
	if (BABYLON.Engine.isSupported()) {
        createScene();
	}
}, false);

var currentPlayer;
var mainScene;
var gameGui;
var rollMessage;
var playerList = [];
var playerPoints = [];
var playerLabels = [];
var games = [toadAttack, hotBobomb];
var createScene = function () {
    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);
	// This creates a basic Babylon Scene object (non-mesh)
    mainScene = new BABYLON.Scene(engine);
    mainScene.clearColor =  new BABYLON.Color3(0.5, 0.8, 0.8);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), mainScene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), mainScene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    generateTerrain(mainScene);

    playerList = loadCharacters(mainScene);
    setTimeout(function() {    
        currentPlayer=playerList[0];    
    }, 2500);

    playerPoints = [0,0,0,0];
    playerLabels = [];
    loadGUI(mainScene);
    
    engine.runRenderLoop(function() {
        mainScene.render();
    });
    
    return mainScene;

};    

const triggerEvent = () => {
    /* Determine which game */
    var gameIndex = Math.floor(Math.random()*100) % 2;  // CHANGE TO 3 WHEN FRUIT CAPTURE IS IN!!!
    /* Determine how many and which players */
    
    
    gameGui.removeControl(rollMessage);
    updatePlayerScore(playerList.indexOf(currentPlayer), Math.floor(Math.random()*100) % 10 +1);
    nextPlayer();
}


const animateMovement = (scene, roll) => {
    var frameRate = 30;
    var startingPos = currentPlayer.position.x;
    var startingPosZ = currentPlayer.position.z;
    var deltaX = 0, deltaZ = 0;
    if(currentPlayer.position.z == 3.5 && currentPlayer.position.x != 3.5)
    {
        if(startingPos+roll > 3.5){
            deltaX = 3.5 - startingPos;
            deltaZ = -1 * (roll-deltaX);
        } else{
            deltaX = roll;
        }
    } else if(currentPlayer.position.x == 3.5 && currentPlayer.position.z != -3.5)
    {
        if(startingPosZ-roll < -3.5){
            deltaZ = -3.5 - startingPosZ;
            deltaX = -1 * (roll+deltaZ);
        } else{
            deltaZ = -1 * roll;
        }
    } else if (currentPlayer.position.z == -3.5 && currentPlayer.position.x != -3.5)
    {
        if (startingPos-roll < -3.5)  
        {                
            deltaX = -3.5-startingPos;
            deltaZ = roll- Math.abs(deltaX);
        } else 
        {
            deltaX = -1 * roll;                     
        }
    } else if (currentPlayer.position.x == -3.5 && currentPlayer.position.z != 3.5)
    {
        if (startingPosZ+roll > 3.5)   
        {                
            deltaZ = 3.5 - startingPosZ;
            deltaX = roll - Math.abs(deltaZ);
        } else 
        {
            deltaZ =  roll; 
        }
    } 
    var xSlide = new BABYLON.Animation("xSlide", "position.x", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var keyFrames = []; 
    keyFrames.push({
        frame: 0,
        value: startingPos 
    });
    keyFrames.push({
        frame: .66 * frameRate,
        value: startingPos + (.3 * deltaX ) 
    });
    keyFrames.push({
        frame: 1.33 * frameRate,
        value: startingPos + (.6 * deltaX ) 
    });
    keyFrames.push({
        frame: 2 * frameRate,
        value: startingPos + (1 * deltaX )
    });
    xSlide.setKeys(keyFrames);

    var zSlide = new BABYLON.Animation("zSlide", "position.z", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var keyFramesZ = []; 
    keyFramesZ.push({
        frame: 0,
        value: startingPosZ 
    });
    keyFramesZ.push({
        frame: .66 * frameRate,
        value: startingPosZ + (.3 * deltaZ ) 
    });
    keyFramesZ.push({
        frame: 1.33 * frameRate,
        value: startingPosZ + (.6 * deltaZ ) 
    });
    keyFramesZ.push({
        frame: 2 * frameRate,
        value: startingPosZ + (1 * deltaZ )
    });
    zSlide.setKeys(keyFramesZ);

    //Right || Left 
    if (Math.abs(currentPlayer.position.x) == 3.5 && Math.abs(currentPlayer.position.z)!=3.5)
    {
        mainScene.beginDirectAnimation(currentPlayer, [zSlide], 0, 2 * frameRate, false, 1,
            () => {
                mainScene.beginDirectAnimation(currentPlayer, [xSlide], 0, 2 * frameRate, false, triggerEvent());
    });
    } //Front || Back 
    if (Math.abs(currentPlayer.position.z) == 3.5 && Math.abs(currentPlayer.position.x)!=3.5)
    {
        mainScene.beginDirectAnimation(currentPlayer, [xSlide], 0, 2 * frameRate, false, 1, () => {
        mainScene.beginDirectAnimation(currentPlayer, [zSlide], 0, 2 * frameRate, false,  triggerEvent() );
    });
    } //FL || BR
    if (currentPlayer.position.x == currentPlayer.position.z)
    {  
        mainScene.beginDirectAnimation(currentPlayer, [zSlide], 0, 2 * frameRate, false,  triggerEvent()); 
    } // FR || BL
    if (currentPlayer.position.x == (currentPlayer.position.z * -1))
    {
        mainScene.beginDirectAnimation(currentPlayer, [xSlide], 0, 2 * frameRate, false,  triggerEvent());
    }
}

const loadGUI = (scene) => {
    gameGui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    gameGui.idealWidth = 600;

    var createPlayerBadge = function(bkgrName, lab, icon, vert, horz) {
        
        var panel = new BABYLON.GUI.StackPanel();
        panel.horizontalAlignment = horz;
        panel.verticalAlignment = vert;
        panel.isVertical = false;   
        panel.left="5px";
        gameGui.addControl(panel);   

        var image1 = new BABYLON.GUI.Image("", "https://raw.githubusercontent.com/vmcatete/babylon/master/assets/" +icon);
        image1.width = "40px";
        image1.height = "40px";
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

    playerLabels[0] = createPlayerBadge("green", "Points: 0", "Peach_face.png", BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT);
    playerLabels[1] = createPlayerBadge("blue", "Points: 0", "Mario_face.png", BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT);
    playerLabels[2] = createPlayerBadge("gray", "Points: 0", "Luigi_face.png", BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT);
    playerLabels[3] = createPlayerBadge("red", "Points: 0" , "Toad_face.png", BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT);

    var diceButton = BABYLON.GUI.Button.CreateSimpleButton("but1", "Roll!");
    diceButton.width = "50px"
    diceButton.height = "50px";
    diceButton.color = "white";
    diceButton.thickness = 4;
    diceButton.cornerRadius = 10;
    diceButton.background = "gold";
    diceButton.onPointerUpObservable.add(() => {
        var roll = Math.floor(Math.random()*100) % 6 +1 ;                
        rollMessage = createRollSplash(roll);
        gameGui.addControl(rollMessage);  
        animateMovement(mainScene, roll);                      
    });
    gameGui.addControl(diceButton);    
}

const createRollSplash = (move) => {    
    var rect1 = new BABYLON.GUI.Rectangle();
    rect1.width = "200px";
    rect1.height = "100px";
    rect1.cornerRadius = 20;
    rect1.color = "White";
    rect1.thickness = 4;
    rect1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    rect1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    rect1.background = "gold";
    rect1.paddingLeft = "5px";

    var label1 = new BABYLON.GUI.TextBlock();
    label1.text = "You rolled a " + move +"!";
    rect1.addControl(label1); 
    return rect1;
}

const nextPlayer = () => {
    currentPlayer = playerList.indexOf(currentPlayer)===3? playerList[0] : playerList[playerList.indexOf(currentPlayer)+1];
}

const updatePlayerScore = (playerNum, points) => {
    playerPoints[playerNum] += points;
    playerLabels[playerNum].text = "Points: " +  playerPoints[playerNum].toString(); 
}

const generateTerrain = (scene) => {
//Set Parameters for gameboard
    var xmin = -5;
    var zmin = -5;
    var xmax =  5;
    var zmax =  5;
    var precision = {
        "w" : 1,
        "h" : 1
    };
    var subdivisions = {
        'h' : 10,
        'w' : 10
    };
    // Create the Tiled Ground
    var tiledGround = new BABYLON.Mesh.CreateTiledGround("Tiled Ground", xmin, zmin, xmax, zmax, subdivisions, precision, mainScene);

    // Create differents materials
    var groundMaterial = new BABYLON.StandardMaterial("Green", mainScene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
    var darkMaterial = new BABYLON.StandardMaterial("Dirt", mainScene);
    darkMaterial.diffuseColor = new BABYLON.Color3(1, .90, .65);
    var lightMaterial = new BABYLON.StandardMaterial("LightDirt", mainScene);
    lightMaterial.diffuseColor = new BABYLON.Color3(.94, .85, .64);

    // Create Multi Material
    var multimat = new BABYLON.MultiMaterial("multi", mainScene);  
    multimat.subMaterials.push(darkMaterial);
    multimat.subMaterials.push(lightMaterial);
    multimat.subMaterials.push(groundMaterial);

    tiledGround.material = multimat;

    // Needed variables to set subMeshes
    var verticesCount = tiledGround.getTotalVertices();
    var tileIndicesLength = tiledGround.getIndices().length / (subdivisions.w * subdivisions.h);

    // Set subMeshes of the tiled ground
    tiledGround.subMeshes = [];
    var base = 0;
    for (var row = 0; row < subdivisions.h; row++) {
        for (var col = 0; col < subdivisions.w; col++) {
            if((row==1 && col > 0 && col < 9) || (row>1 && row <9 && (col == 1 || col== 8)) || (row==8 && col > 0 && col < 9))
            {
                tiledGround.subMeshes.push(new BABYLON.SubMesh(row%2 ^ col%2, 0, verticesCount, base , tileIndicesLength, tiledGround));
                base += tileIndicesLength;
            } else {
                tiledGround.subMeshes.push(new BABYLON.SubMesh(2, 0, verticesCount, base , tileIndicesLength, tiledGround));
                base += tileIndicesLength;
            }
        }
    }
}

const loadCharacters = (scene, players = []) => {
    BABYLON.SceneLoader.ImportMesh("", "https://raw.githubusercontent.com/vmcatete/babylon/master/assets/", "Peach.babylon", mainScene, function(newMeshes) {
        players[0] = newMeshes[0];
        players[0].scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
        players[0].position = new BABYLON.Vector3(-1.5, .4, 3.5);
        players[0].charName = "peach";      
    });
    BABYLON.SceneLoader.ImportMesh("", "https://raw.githubusercontent.com/vmcatete/babylon/master/assets/", "Mario.babylon", mainScene, function(newMeshes) {
        players[1] = newMeshes[0];
        players[1].scaling = new BABYLON.Vector3(2.5, 3, 2.5);
        players[1].position = new BABYLON.Vector3(-.5, .35, -3.5);
        players[1].charName = "mario";
    });
    BABYLON.SceneLoader.ImportMesh("", "https://raw.githubusercontent.com/vmcatete/babylon/master/assets/", "Luigi.babylon", mainScene, function(newMeshes) {
        players[2] = newMeshes[0];
        players[2].scaling = new BABYLON.Vector3(2.5, 3, 2.5);
        players[2].position = new BABYLON.Vector3(2.5, .35, -3.5);
        players[2].charName = "luigi";
    });
    BABYLON.SceneLoader.ImportMesh("", "https://raw.githubusercontent.com/vmcatete/babylon/master/assets/", "Toad.babylon", mainScene, function(newMeshes) {
        players[3] = newMeshes[0];
        players[3].scaling = new BABYLON.Vector3(2.5, 3, 2.5);
        players[3].position = new BABYLON.Vector3(.5, .35, -3.5);
        players[3].charName = "toad";
    });
    BABYLON.SceneLoader.ImportMesh("", "https://raw.githubusercontent.com/vmcatete/babylon/master/assets/", "Yoshi.babylon", mainScene, function(newMeshes) {
        players[4] = newMeshes[0];
        players[4].scaling = new BABYLON.Vector3(2.5, 3, 2.5);
        players[4].position = new BABYLON.Vector3(1.5, .35, -3.5);
        players[4].charName = "yoshi";
    });
    return players;
}