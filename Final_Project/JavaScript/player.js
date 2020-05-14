// Set up Player Canvas and Graphics Context

let playerCnv = document.getElementById("playerCanvas");
let playerCtx = playerCnv.getContext("2d");
playerCnv.width = CNV_WIDTH;
playerCnv.height = CNV_HEIGHT;

// Global Variables
const SPRITE_SIZE = 16;

// Sprite Image
let playerImg = document.getElementById("playerSprite");

// Movement Variables
let up = false;
let left = false;
let right = false;
let down = false;

// Player Object
let player = {
    // Location on Canvas
    x:288,
    y:320,
    dx:288,
    dy:320,
    // Source
    sx: 0,
    sy: 0,
    sw : 16,
    sh: 16,
    // Buffer controls for collision detection
    bufWidth: 5,
    bufHeight: 5,
    // On screen controls
    drawWidth: 32,
    drawHeight: 32,
    hitWidth: 32,
    hitHeight:32,
    // Movement and array variables
    speed: 4,
    tileX: 10,
    tileY: 11,
    // Defense Variables
    lives: 3,
    invincibility: false,
    blinking: false,
    // Offense variables
    facing: "down",
    sword: { x:false, y:false, w:10, h:32 },
    // Animation variables
    action: "standing"
}

// ----------------------------------
// drawPlayer Function start
// ----------------------------------

function drawPlayer(){
    // Draw player
    playerCtx.clearRect(0, 0, playerCnv.width, playerCnv.height);
    playerCtx.drawImage(playerImg, player.sx, player.sy, player.sw, player.sh, player.dx, player.dy, player.drawWidth, player.drawHeight);
    // playerCtx.strokeRect(player.x+player.bufWidth, player.y+player.bufHeight, player.drawWidth-player.bufWidth*2, player.drawHeight-player.bufHeight*2); 

    if(player.invincibility && !player.blinking){ // If player is currently invincible and not already blinking
        player.blinking = true; // currently blinking
        let counter = 0; // begin counter
        let blinkInterval = setInterval(() => {
            counter++;
            if(counter%3 == 0){ // dont draw player every 300ms for 100ms
                playerImg = document.getElementById("blank");
            }
            else { playerImg = document.getElementById("playerSprite"); }
            if(player.invincibility == false){ player.blinking = false; playerImg = document.getElementById("playerSprite"); clearInterval(blinkInterval); }
            if(player.lives <= 0){
                clearInterval(blinkInterval); clearInterval(drawPlayer);
                return;
            }
        }, 100);
    }
    // playerCtx.strokeRect(player.sword.x, player.sword.y, player.sword.w, player.sword.h);
}

// ----------------------------------
// drawPlayer Function end
// ----------------------------------






// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// ---------------------- Movement Functions --------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

// ----------------------------------
// determineDirection Function start
// ----------------------------------

function determineDirection(event){
    
    if(event.keyCode == 87){ // w pressed
        up = false; left = false; down = false; right = false; //reset all movement to false
        up = true;
        player.facing = "up";
    }
    else if(event.keyCode == 83){ // s pressed
        up = false; left = false; down = false; right = false; //reset all movement to false
        down = true;
        player.facing = "down";
    }
    else if(event.keyCode == 65){ // a pressed
        up = false; left = false; down = false; right = false; //reset all movement to false
        left = true;
        player.facing = "left";
    }
    else if(event.keyCode == 68){ // d pressed
        up = false; left = false; down = false; right = false; //reset all movement to false
        right = true;
        player.facing = "right";
    }
    else if(event.keyCode == 32){ // SPACE pressed
        if(player.action != "stabbing" && player.speed != 0){ // if not already attacking
            player.action = "stabbing"; // attacking
            // Set player look
            if(player.facing == "up"){ 
                player.dy = player.y - 16;
                player.sy = 83; player.sw = 16; player.sh = 30; player.drawWidth = 32; player.drawHeight = 60;
            }
            else if(player.facing == "down"){
                player.sy = 83; player.sw = 16; player.sh = 30; player.drawWidth = 32; player.drawHeight = 60;
            }
            else if(player.facing == "right"){
                player.sy = 90; player.sw = 30; player.sh = 16; player.drawWidth = 60; player.drawHeight = 32;
                player.sx = 83;
            }
            else if(player.facing == "left"){
                player.dx = player.x - 16;
                player.sy = 90; player.sw = 30; player.sh = 16; player.drawWidth = 60; player.drawHeight = 32;
                player.sx = 23;
            }
            if(player.facing == "up"){ useSword("up"); }
            else if(player.facing == "left"){ useSword("left"); }
            else if(player.facing == "right"){ useSword("right"); }
            else if(player.facing == "down"){ useSword("down"); }
        }
    }
}

// ----------------------------------
// determineDirection Function end
// ----------------------------------

// ----------------------------------
// cancelDirection Function start
// ----------------------------------

function cancelDirection(event){
    if(event.keyCode == 87){
        up = false;
        player.action = "standing";
    }
    else if(event.keyCode == 83){
        down = false;
        player.action = "standing";
    }
    else if(event.keyCode == 65){
        left = false;
        player.action = "standing";
    }
    else if(event.keyCode == 68){
        right = false;
        player.action = "standing";
    }
}

// ----------------------------------
// cancelDirection Function end
// ----------------------------------

// ----------------------------------
// movePlayer Function start
// ----------------------------------

function movePlayer(){
    let newX, oldX;
    let newY, oldY;
    let sourceX;
    if(up){
        newY = player.y - player.speed;
        newX = player.x
        sourceX = 60;
    }
    else if(down){
        newX = player.x;
        newY = player.y + player.speed;
        sourceX = 0;
    }
    else if(right){
        newX = player.x + player.speed;
        newY = player.y;
        sourceX = 90;
    }
    else if(left){
        newX = player.x - player.speed;
        newY = player.y;
        sourceX = 30;
    }
    if(newX && newY && player.speed>0){
        player.sx = sourceX;
        player.action = "walking";
        let result = detectCollision(newX, newY, true);
        if(result == true){
            player.x = newX;
            player.y = newY;
            player.dx = player.x;
            player.dy = player.y;
            player.tileX = Math.floor(player.x/32) + 1;
            player.tileY = Math.floor(player.y/32) + 1;
        }
        else if(result == false){}
        else if(result.indexOf("fall") != -1){
            // Determine where pit tile is
            result = result.replace("fall", "");
            // console.log(result);
            let tiles = result.split("|");
            let center = [ (tiles[0]-1)*TILE_SIZE+(TILE_SIZE/2), (tiles[1]-1)*TILE_SIZE+(TILE_SIZE/2)];
            // console.log(center, player.x, player.y);
            // Initiate Player for Fall
            oldX = player.x; oldY = player.y;
            player.x = newX; player.y = newY;
            // Begin falling
            let fallingInterval = setInterval(() => { 
                // Move player towards center
                if(player.x > center[1]){ player.x-=2; player.dx = player.x; }
                else if(player.x < center[1]){ player.x+=2; player.dx = player.x; }
                if(player.y > center[0]){ player.y-=2; player.dy = player.y; }
                else if(player.y < center[0]){ player.y+=2; player.dy = player.y; }
                player.drawWidth--; player.drawHeight--;
                if(player.drawWidth <= 5 && player.drawHeight <= 5){
                    player.x = oldX; player.y = oldY; player.drawHeight = 32; player.drawWidth = 32;
                    player.dx = player.x; player.dy = player.y;
                    player.speed = 4;
                    player.lives--; makeInvincible(player, 3000);
                    clearInterval(fallingInterval);
                }
            }, 50);
        }
    }
}

// ----------------------------------
// movePlayer Function end
// ----------------------------------











// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
// ----------------------- Collsion Detection Functions -----------------------------
// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------


// ----------------------------------
// detectCollision Function start
// ----------------------------------

function detectCollision(newX, newY, isPlayer){
    // Determine if player is moving offscreen or into a wall (if isPlayer is set to false the creature is amonster and does not go through doors)
    
    // Determine what tiles the 4 corners of the player is touching
    if(backgroundMap.length === 0){ return; }
    let frontSideTile = Math.floor((newY - player.bufHeight + 12)/32) + 1;
    let backSideTile = Math.floor((newY + player.hitHeight - player.bufHeight + 4)/32) + 1;
    let leftSideTile = Math.floor((newX + player.bufWidth)/32) + 1;
    let rightSideTile = Math.floor((newX + player.hitWidth - player.bufWidth)/32) + 1;

    if(backgroundMap.length === 0){ return; }
    // Determine what the front number of each tile is
    let classTopRight = Math.floor(backgroundMap[frontSideTile][rightSideTile]);
    let classTopLeft = Math.floor(backgroundMap[frontSideTile][leftSideTile]);
    let classBotRight = Math.floor(backgroundMap[backSideTile][rightSideTile]);
    let classBotLeft = Math.floor(backgroundMap[backSideTile][leftSideTile]);

    if(backgroundMap.length === 0){ return; }
    // Determine what the decimal number of each tile is
    let typeTopRight = Number(backgroundMap[frontSideTile][rightSideTile].toString().split(".")[1]);
    let typeTopLeft = Number(backgroundMap[frontSideTile][leftSideTile].toString().split(".")[1]);
    let typeBotRight = Number(backgroundMap[backSideTile][rightSideTile].toString().split(".")[1]);
    let typeBotLeft = Number(backgroundMap[backSideTile][leftSideTile].toString().split(".")[1]);
    // console.log(leftSideTile, rightSideTile);

    // Determine whether it is ground/obstacle/door
    if(classTopRight != 0 || classTopLeft != 0 || classBotRight != 0 || classBotLeft != 0){ // Non-ground tile

        if((classTopRight == 2 || classBotRight == 2|| classTopLeft == 2 || classBotLeft == 2) && isPlayer){ // Player touching a door 
            // Determine what edge passed through the door and pass along the corresponding arguements
            clearInterval(drawingMonsterInterval);
            for(let i=0; i<intervals.length; i++){ clearInterval(intervals[i]); }
            intervals = [];
            if(classTopLeft == 2 && classTopRight == 2){
                determineNextRoom(typeTopRight);
                return true;
            }
            else if(classTopRight == 2 && classBotRight == 2) {
                determineNextRoom(typeBotRight);
                return true;
            }
            else if(classBotLeft == 2 && classTopLeft == 2) {
                determineNextRoom(typeTopLeft);
                return true;
            }
            else if(classBotLeft == 2 && classBotRight == 2) {
                determineNextRoom(typeBotLeft);
                return true;
            }
        }
        if((classTopRight == 6 || classBotRight == 6 || classTopLeft == 6 || classBotLeft == 6) && isPlayer){ // PLayer on top of pit
            player.speed = 0;
            if(classTopRight == 6){ return "fall" + frontSideTile + "|" + rightSideTile; }
            else if(classBotRight == 6){ return "fall" + backSideTile + "|" + rightSideTile; }
            else if(classTopLeft == 6){ return "fall" + frontSideTile + "|" + leftSideTile; }
            else if(classBotLeft == 6){ return "fall" + backSideTile + "|" + leftSideTile; }
            
        }

        // Corner Check 
        // Characters will be able to enter the approximately 1/3 of the tile that is ground
        if(typeTopRight == 11 || typeTopLeft == 12){ // walking up into a corner
            if(backgroundMap[frontSideTile][leftSideTile] != 1 && backgroundMap[frontSideTile][rightSideTile] != 1){ // check that link is not inside a hill
                if((newY + player.bufHeight) > (frontSideTile * 32 -16)){ // Allow link to enter the first y-half of the corner
                    if(typeTopRight == 11){ // check which corner (11 or 12) link is entering and allow him to walk the first x-half of the corner 
                        if((newX + player.hitWidth - player.bufWidth) < (rightSideTile * 32 -5)){ // allow link to walk on the area that is ground
                            return true;
                        }
                    }
                    if(typeTopLeft == 12){
                        if((newX + player.bufWidth) > (leftSideTile * 32 - 32 + 10)){ // allow link to walk on the area that is ground
                            return true;
                        }
                    }
                }
            }
        } // end of if statement for corners facing down
        else if(typeBotRight == 13 || typeBotLeft == 14){ // walking down into a corner
            if(backgroundMap[backSideTile][rightSideTile] != 1 && backgroundMap[backSideTile][leftSideTile] != 1){ // check that link is not inside a hill
                if((newY + player.hitHeight - player.bufHeight) < (backSideTile * 32 - 16)){ // Allow link to enter the first y-half of the corner
                    if(typeBotRight == 13){ // check which corner (11 or 12) link is entering and allow him to walk the first x-half of the corner 
                        if((newX + player.hitWidth - player.bufWidth) < (rightSideTile * 32 -10)){ // allow link to walk on the area that is ground
                            return true;
                        }
                    }
                    if(typeBotLeft == 14){
                        if((newX + player.bufWidth) > (leftSideTile * 32 - 32 + 10)){ // allow link to walk on the area that is ground
                            return true;
                        }
                    }
                }
            }
        } // end of if statement for corners facing up;

        
        //If not a corner or door but is a non-terrain tile
        return false;
    }      
    return true;
}

// ----------------------------------
// detectCollision Function end
// ----------------------------------


// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
// --------------------------- Use Item Functions -----------------------------------
// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------


// ----------------------------------
// useSword Function start
// ----------------------------------


function useSword(direction){
    // Set sprite to be sword drawn link and set sword variables as required by direction
    // console.log("attacking " + direction);
    player.speed = 0; // player cannot move while jabbing
    // Sword x and y values are always the TL corner of the rectangle hitbox
    if(direction == "up"){
        player.sword.w = 10; player.sword.h = 32;
        player.sword.x = player.x + player.drawWidth/3 - 3; player.sword.y = player.y - player.sword.h + 10;
    }
    else if(direction == "down"){
        player.sword.w = 10; player.sword.h = 32;
        player.sword.x = player.x + player.drawWidth/3 + 2; player.sword.y = player.y + 32;
    }
    else if(direction == "left"){
        player.sword.w = 32; player.sword.h = 10;
        player.sword.x = player.x - player.sword.w + 10; player.sword.y = player.y + player.drawHeight/3;
    }
    else if(direction == "right"){
        player.sword.w = 32; player.sword.h = 10;
        player.sword.x = player.x + 32; player.sword.y = player.y + player.drawHeight/3;
    }
    setTimeout(
        function(){ 
            player.speed = 4; player.sword.x = false; player.sword.y = false; 
            player.action = "standing"; player.sy = 0; 
            player.drawWidth = 32; player.drawHeight = 32; player.sw = 16; player.sh = 16;
            player.dy = player.y; player.dx = player.x;
            if(player.facing == "right"){ player.sx = 90; }
            else if(player.facing == "left"){ player.sx = 30; }
    }, 500);

}

// ----------------------------------
// useSword Function end
// ----------------------------------




// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------- Player Animation Functions ------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

function animatePlayer(){
    if(player.action == "walking"){
        if(player.sy == 0){
            player.sy = 30;
        }
        else if(player.sy == 30){
            player.sy = 0;
        }
        else{
            player.sy = 0;
        }
    }
}


