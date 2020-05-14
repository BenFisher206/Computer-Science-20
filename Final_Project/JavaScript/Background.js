// Background Loading and Functions
// Setting up of Terrain Canvas and Graphics context

// Global Constants
const CNV_WIDTH = 800;
const CNV_HEIGHT = 608;
const NUM_ROWS = 21;
const NUM_COLS = 27;
const TILE_SIZE = 32;

// Set up Background Canvas
let backgroundCnv = document.getElementById("backgroundCanvas");
let backgroundCtx = backgroundCnv.getContext("2d");
backgroundCnv.width = CNV_WIDTH;
backgroundCnv.height = CNV_HEIGHT;

// Current Background
let backgroundMap = [];

// Current Monster Spawns
let monsterMap = [];

// Current Room
let currentRoomNmb = 0;

// ----------------------------------
// startup Function start
// ----------------------------------

function startup(){
    // Runs when window fully loads startup
    getBackground(currentRoomNmb, function(){    
        if(monsterMap.length > 0){
        // console.log("spawning");
        spawnMonsters();
    }});
}

// ----------------------------------
// startup Function end
// ----------------------------------






// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ---------------------- Processing Background functions ---------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

// ----------------------------------
// getBackground Function start
// ----------------------------------
function getBackground(roomNmb, callback){
    // Fetches the room information from the text file of "room" + roomNmb and calls required functions 
    backgroundMap = [];
    fetch("Rooms/room" + roomNmb + ".txt")
        .then((rawData) => rawData.text())
        .then(processData)
        .then(callback);
}
// ----------------------------------
// getBackground Function end
// ----------------------------------



// ----------------------------------
// processData Function start
// ----------------------------------

function processData(data){
    // Processes the room information and assign the background map a 2d-array of numbers
        let lines = data.split("\r\n");

        // Loop through lines 2-23 and add to background array
        for(let i = 1; i < 22; i++){ // skips first comment line
            let lineArray = lines[i].split(" ");
            let dataArray = [];
            for(let n = 0; n < lineArray.length; n++){
                // Ground
                if(lineArray[n].indexOf("sand") != -1){ // set tile to be base ground
                    dataArray[n] = 0;
                }
                // Hills
                else if(lineArray[n].indexOf("hill") != -1){ // set tile to be base hill
                    // determine whether tile is a square or corner and set dataArray[n] accordingly
                    if(lineArray[n].indexOf("door") == -1){ // set tile to be a door
                        dataArray[n] = cornerCheck("hill", lineArray[n], 1); 
                    //     lineArray[n] = lineArray[n].replace("hilldoor", "");
                    //     dataArray[n] = "2.1" + lineArray[n]; //adds room number onto the end of 2 as a decimal
                    }
                }
                // Rocks
                else if(lineArray[n].indexOf("rock") != -1){ // set tile to be base rock
                    // determine whether tile is a square or corner and set dataArray[n] accordingly
                    if(lineArray[n].indexOf("door") == -1){ // set tile to be a door
                        dataArray[n] = cornerCheck("rock", lineArray[n], 4);
                    //     lineArray[n] = lineArray[n].replace("rockdoor", "");
                    //     dataArray[n] = "2.4" + lineArray[n]; //adds room number onto the end of 2 as a decimal
                    }       
                }
                // Water
                else if(lineArray[n].indexOf("water") != -1){ // set tile to be base water
                    // determine whether tile is a square or corner and set dataArray[n] accordingly
                    dataArray[n] = cornerCheck("water", lineArray[n], 5);
                }
                // Pit
                else if(lineArray[n].indexOf("pit") != -1){ // set tile to be a pit
                    dataArray[n] = 6;
                }                
                // Doors
                if(lineArray[n].indexOf("door") != -1){ // set tile to be a door
                    lineArray[n] = lineArray[n].replace("door", "");
                    dataArray[n] = "2." + lineArray[n]; //adds room number onto the end of 2 as a decimal
                }
                else if(lineArray[n].indexOf("spawn") != -1){ // set tile to be a door
                    lineArray[n] = lineArray[n].replace("spawn", "");
                    dataArray[n] = "0.9" + lineArray[n]; //adds room number onto the end of 2 as a decimal
                }
            }
            backgroundMap.push(dataArray); // save to backgroundMap
        }
        monsterMap = [];
        // Loop through lines 25-46
        for(let i = 24; i < 45; i++){ // skips first comment line
            let lineArray = lines[i].split(" ");
            for(let n = 0; n < lineArray.length; n++){
                let monsterArray = [];
                // Check for monsters
                if(lineArray[n] != "none"){
                    monsterArray.push(lineArray[n], i-24, n);
                    // createMonster(lineArray[n], i - 24, n);
                    monsterMap.push(monsterArray);
                }

            }
        }
    loadGround();    
}

// ----------------------------------
// processData Function end
// ----------------------------------


// ----------------------------------
// determineNextRoom Function start
// ----------------------------------

function determineNextRoom(nextRoom){
    // determine where the doormat of the next room is and place link on it then spawn monsters
    // Get the map of the next room 
    getBackground(nextRoom, function(){
    // Determine where the entrance door is
    for(let row = 0; row<NUM_ROWS; row++){
        for(let col = 0; col<NUM_COLS; col++){
            if(backgroundMap[row][col] == ("0.9" + currentRoomNmb)){
                console.log("NewRoom");
                player.x = (col-1)*32; // set player to be 4px into the tile
                player.y = (row-1)*32;
                player.dx = player.x;
                player.dy = player.y;
            }
        }
    }
    currentRoomNmb = nextRoom;
    if(monsterMap.length > 0){
        console.log("spawning");
        monsterCtx.clearRect(0, 0, CNV_WIDTH, CNV_HEIGHT); // clear canvas
        clearInterval(drawingMonsterInterval); // clear the interval saved in drawingMonsterInterval
        spawnMonsters();
    }
    });
}

// ----------------------------------
// determineNextRoom Function end
// ----------------------------------


// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
// -------------------------- Drawing and positioning functions ---------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------------

// ----------------------------------
// loadGround Function start
// ----------------------------------

function loadGround(){
    // Draw background according to the backgroundMap

    // Fetch Tile Images
    // Hills
    let hill = getImages("hill");
    // Door
    let door = getImages("door");
    // Rocks
    let rock = getImages("rock");
    // Water
    let water = getImages("water");

    // Clear Background canvases
    backgroundCtx.clearRect(0, 0, CNV_WIDTH, CNV_HEIGHT);

    for(let row = 0; row<NUM_ROWS; row++){
        for(let col = 0; col<NUM_COLS; col++){
            // Ground
            if(Math.floor(backgroundMap[row][col]) == 0){
                if(backgroundMap[row][col] == 0){
                    backgroundCtx.fillStyle = "#FCD8A8";
                    backgroundCtx.fillRect((col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE)
                }
                else if(Math.floor(backgroundMap[row][col]*10) == 9){
                    backgroundCtx.fillStyle = "grey";
                    backgroundCtx.fillRect((col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE)
                }
            }
            // Hills
            else if(Math.floor(backgroundMap[row][col]) == 1){ // hill
                backgroundCtx.drawImage(determineTile(hill, backgroundMap[row][col], 1), (col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);                
            }
            // Door
            else if(backgroundMap[row][col].toString().substr(0, 1) == "2"){
                let faceUp = false;
                let faceDown = false;
                let faceLeft = false;
                let faceRight = false;
                // Determine which direction the entrance of the door will face
                // Then proceed to remove direction from string
                if(backgroundMap[row][col].indexOf("down") != - 1){
                    backgroundMap[row][col] = backgroundMap[row][col].replace("down", "");
                    faceDown = true;
                }
                else if(backgroundMap[row][col].indexOf("up") != - 1){
                    backgroundMap[row][col] = backgroundMap[row][col].replace("up", "");
                    faceUp = true;
                }
                else if(backgroundMap[row][col].indexOf("left") != - 1){
                    backgroundMap[row][col] = backgroundMap[row][col].replace("left", "");
                    faceLeft = true;
                }
                else if(backgroundMap[row][col].indexOf("right") != - 1){
                    backgroundMap[row][col] = backgroundMap[row][col].replace("right", "");
                    faceRight = true;
                }
                // Determine what type of door will apppear and remove type from string
                // Then proceed to draw door
                if(backgroundMap[row][col].indexOf("hill") != -1){ // hill door
                    backgroundMap[row][col] = backgroundMap[row][col].replace("hill", "");
                    if(faceDown)
                    backgroundCtx.drawImage(door.hilldown, (col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    else if(faceUp)
                    backgroundCtx.drawImage(door.hillup, (col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    else if(faceLeft)
                    backgroundCtx.drawImage(door.hillleft, (col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    else if(faceRight)
                    backgroundCtx.drawImage(door.hillright, (col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
                else if(backgroundMap[row][col].indexOf("rock") != -1){ // rock door
                    backgroundMap[row][col] = backgroundMap[row][col].replace("rock", "");
                    if(faceDown)
                    backgroundCtx.drawImage(door.rockdown, (col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    if(faceUp)
                    backgroundCtx.drawImage(door.rockup, (col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    if(faceLeft)
                    backgroundCtx.drawImage(door.rockleft, (col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    if(faceRight)
                    backgroundCtx.drawImage(door.rockright, (col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
            // Rocks
            else if(Math.floor(backgroundMap[row][col]) == 4){
                backgroundCtx.drawImage(determineTile(rock, backgroundMap[row][col], 4), (col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);                
            }
            // Water
            else if(Math.floor(backgroundMap[row][col]) == 5){
                backgroundCtx.drawImage(determineTile(water, backgroundMap[row][col], 5), (col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);                
            }
            // Pit
            else if(Math.floor(backgroundMap[row][col]) == 6){
                backgroundCtx.fillStyle = "black";
                backgroundCtx.fillRect((col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);                
            }
            // CREATES BLACK BORDER AROUND EACH TILE
            // backgroundCtx.strokeRect( (col - 1) * TILE_SIZE, (row - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

// ----------------------------------
// loadGround Function end
// ----------------------------------

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
// ----------------------------- Helper Functions ----------------------------------
// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

// ----------------------------------
// getImages Function start
// ----------------------------------

function getImages(tileClass){
    // Declare an object with the square tile and its corners as properties
    if(tileClass != "door"){ //door will have its own type of tiles
        let obj = {
            square: document.getElementById(tileClass),
            BLCorner: document.getElementById(tileClass + "CornerBL"),
            BRCorner: document.getElementById(tileClass + "CornerBR"),
            TLCorner: document.getElementById(tileClass + "CornerTL"),
            TRCorner: document.getElementById(tileClass + "CornerTR"),
        }
        return obj;
    }
    else {
        let obj = {
            hilldown: document.getElementById("hilldoordown"),
            hillup: document.getElementById("hilldoorup"),
            hillleft: document.getElementById("hilldoorleft"),
            hillright: document.getElementById("hilldoorright"),
            rockdown: document.getElementById("rockdoordown"),
            rockup: document.getElementById("rockdoorup"),
            rockright: document.getElementById("rockdoorright"),
            rockleft: document.getElementById("rockdoorleft")
        }
        return obj;
    }
}

// ----------------------------------
// getImages Function end
// ----------------------------------

// ----------------------------------
// determineTile Function start
// ----------------------------------

function determineTile(tileClass, tileValue, defaultValue){
    // Determine which image is required for the tile and return it
        if(tileValue == defaultValue){ //if default
            return tileClass.square;
        }
        else if(Math.floor(tileValue*10)/10 == defaultValue + 0.1){ // hill corner
            if(tileValue == Math.round((defaultValue + 0.11) * 100) / 100){ //hill curved at bottom left
                return tileClass.BLCorner;
            }
            else if(tileValue == Math.round((defaultValue + 0.12) * 100) / 100){ //hill curved at bottom right
                return tileClass.BRCorner;
            }
            else if(tileValue == Math.round((defaultValue + 0.13) * 100) / 100){ //hill curved at top left
                return tileClass.TLCorner;
            }
            else if(tileValue == Math.round((defaultValue + 0.14) * 100) / 100){ //hill curved at top right
                return tileClass.TRCorner;
            }
        }
}

// ----------------------------------
// determineTile Function end
// ----------------------------------

// ----------------------------------
// processCorner Function start
// ----------------------------------

function processCorner(aString){
    let cornerNmb = 0;
    if(aString == "BL"){ // corner faces downwards and to the left side
        cornerNmb = 0.11;
    }
    else if(aString == "BR"){ // corner faces downwards and to the right side
        cornerNmb = 0.12;
    }
    else if(aString == "TL"){ // corner faces upwards and to the left side
        cornerNmb = 0.13;
    }
    else if(aString == "TR"){ // corner faces upwards and to the right side
        cornerNmb = 0.14;
    }
    // console.log(cornerNmb, aString);
    return cornerNmb;
}

// ----------------------------------
// processCorner Function end
// ----------------------------------


// ----------------------------------
// cornerCheck Function start
// ----------------------------------

function cornerCheck(tileClass, aString, defaultValue){
    if(aString.indexOf(tileClass + "C") != -1){ // corner type 
        aString = aString.replace(tileClass + "C", ""); //remove "hillC"
        defaultValue += processCorner(aString);
        defaultValue = Math.round(defaultValue * 100) / 100;
        // console.log(value, aString);
    }
    return defaultValue;
}

// ----------------------------------
// cornerCheck Function end
// ----------------------------------


