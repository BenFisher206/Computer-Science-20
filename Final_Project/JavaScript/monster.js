// Set up Monster Canvas and Graphics Context

let monsterCnv = document.getElementById("monsterCanvas");
let monsterCtx = monsterCnv.getContext("2d");
monsterCnv.width = CNV_WIDTH;
monsterCnv.height = CNV_HEIGHT;

// Global Varaibles
let drawingMonsterInterval;
let intervals = [];
let roomChange = false;

// ---------------------------------------------
// spawnMonsters Start
// ---------------------------------------------

function spawnMonsters(){
    // Initializes all monsters at spawn points and create an interval to re-draw them every 25ms
    let monsters = [];
    
    // Create monsters
    for(let i=0; i<monsterMap.length; i++){ //create a monster object array given the monsterMap
        let temp = {
            type: monsterMap[i][0],
            img: document.getElementById(monsterMap[i][0]),
            x: monsterMap[i][2] * 32,
            y: monsterMap[i][1] * 32,
            sx: 0,
            sy: 0,
            height: 32,
            width: 32,
            alive: true,
            movementInterval: 0,
            facing: down
        }
        monsters[i] = (temp);
    }
    
    // Begin movements
    for(let i=0; i<monsters.length; i++){ //begin moving every monster
        checkPlayerDistance(monsters[i]);
    }
    drawMonsters(monsters);
}

// ---------------------------------------------
// spawnMonsters function end
// ---------------------------------------------


function drawMonsters(monsters){
    // Declare drawing interval
    drawingMonsterInterval = setInterval(() => { // continue to clear canvas and re-draw monsters that are alive until room changes
        monsterCtx.clearRect(0, 0, CNV_WIDTH, CNV_HEIGHT);
        for(let i=monsters.length - 1; i>=0; i--){ // draw every monster
            checkIfStabbed(monsters[i]);
            if(monsters[i].alive){
                monsterCtx.drawImage(monsters[i].img, monsters[i].sx, monsters[i].sy, SPRITE_SIZE, SPRITE_SIZE, monsters[i].x, monsters[i].y, monsters[i].width, monsters[i].height);
                checkPlayerCollision(monsters[i]);
            }
            else {
                monsters.splice(i, 1);
            }
        }
    }, 25);
}



// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------- Monster Movement Functions -------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------


// ---------------------------------------------
// moveMonster function start
// ---------------------------------------------


function moveMonster(monster, direction, targetTile){
    // Given a direction and monster move that monster 4px in the given direction
    let newX, newY;
    let newBackX, newBackY;
    // Clear current movement Interval
    clearInterval(monster.movementInterval);
    // Set new movement Interval
    monster.movementInterval = setInterval(() => {
        if(direction == "left" || direction <= 0.25){ //move left
            newX = monster.x - 4;
            newY = monster.y;
            monster.facing = "left";
        }
        else if (direction == "right" || direction <= 0.5){ //move right
            newX = monster.x + 4;
            newY = monster.y;
            monster.facing = "right";
        }
        else if (direction == "up" || direction <= 0.75){ //move up
            newX = monster.x;
            newY = monster.y - 4;
            monster.facing = "up";
        }
        else if (direction == "down" || direction <= 1){ // move down
            newX = monster.x;
            newY = monster.y + 4;
            monster.facing = "down";
        }
        
        // Check for collision, if no collision move monster
        if(detectCollision(newX, newY)){
            monster.x = newX;
            monster.y = newY;
        }
        else { //If obstacle in way stop moving and clear interval
            clearInterval(monster.movementInterval);
        }
        // Determine back sides of monster
        newBackX = newX + 32 - 4;
        newBackY = newY + 32 - 4;
        animateMonster(monster, direction);

        // Break out of interval once reached destination
        if((targetTile == Math.floor(newBackX/32) + 1 && direction == "left")){
            clearInterval(monster.movementInterval);
        }
        else if((targetTile == Math.floor(newX/32) + 1 && direction == "right")){
            clearInterval(monster.movementInterval);
        }
        else if((targetTile == Math.floor(newBackY/32) + 1 && direction == "up")){
            clearInterval(monster.movementInterval);
        }
        else if((targetTile == Math.floor(newY/32) + 1 && direction == "down")){
            clearInterval(monster.movementInterval);
        }
    }, 50);
}

// ---------------------------------------------
// moveMonster function end
// ---------------------------------------------



// ---------------------------------------------
// checkPlayerDistance function start
// ---------------------------------------------

function checkPlayerDistance(monster){
    
    // Given a monster determine how far away it is from the player and call movement functions accordingly
    let currentInterval = intervals.length;
    intervals[intervals.length] = setInterval(() => {
        // Fetch current location
        let tileX = Math.floor(monster.x/32) + 1;
        let tileY = Math.floor(monster.y/32) + 1;
        if (!monster.alive){ clearInterval(intervals[currentInterval]); } // monster is dead/not in room and interval no longer needed
        else { // monster is still alive and the room hasn't changed so move monster
            // Determine distance to player
            let distanceX = player.x - monster.x
            let distanceY = player.y - monster.y
            
            if(Math.abs(distanceX) <= 96 && Math.abs(distanceY) < 96){ // If monster is within 3 tiles of player
                determineMonsterDirection(monster); //moves monster towards player
            }
            else { // move monster in random direction
                let checker = Math.random()
                if(checker <= 0.25){ //move left
                    moveMonster(monster, "left", tileX - 1);
                }
                else if (checker <= 0.5){ //move right
                    moveMonster(monster, "right", tileX + 1);
                }
                else if (checker <= 0.75){ //move down
                    moveMonster(monster, "down", tileY + 1);
                }
                else if (checker <= 1){ // move up
                    moveMonster(monster, "up", tileY - 1);
                }
            }
        }
        if (!monster.alive){ clearInterval(intervals[currentInterval]); } // recheck in case monster has been killed since last check
        if(monster.type == "octorok"){
            shootProjectile(monster);
        }
    }, 1000);
}

// ---------------------------------------------
// checkPlayerDistance function end
// ---------------------------------------------


// ---------------------------------------------
// determineMonsterDirection function start
// ---------------------------------------------

function determineMonsterDirection(monster){
    // move monster to be in line with the player via the shortest route, then move monster towards player

    let tileX = Math.floor(monster.x/32) + 1;
    let tileY = Math.floor(monster.y/32) + 1;

    let distanceX = player.x - monster.x
    let distanceY = player.y - monster.y
    // Move monster 8 times to the next tile by increments of 4px
    if(distanceX < distanceY){ // Monster is closer to player horizontally so move horizontally first
        if(tileX > player.tileX){ // move left 1 tile
            moveMonster(monster, "left", tileX - 1);
        }
        else if(tileX < player.tileX){ //move right 1 tile
            moveMonster(monster, "right", tileX + 1);
        }
        else if(tileY < player.tileY){ //move down 1 tile
            moveMonster(monster, "down", tileY + 1);
        }
        else if(tileY > player.tileY){ //move up 1 tile
            moveMonster(monster, "up", tileY - 1);
        }
    }
    else { // Monster is closer to player vertically so move vertically first
        if(tileY < player.tileY){ //move down 1 tile
            moveMonster(monster, "down", tileY + 1);
        }
        else if(tileY > player.tileY){ //move up 1 tile
            moveMonster(monster, "up", tileY - 1);
        }        
        else if(tileX > player.tileX){ // move left 1 tile
            moveMonster(monster, "left", tileX - 1);
        }
        else if(tileX < player.tileX){ //move right 1 tile
            moveMonster(monster, "right", tileX + 1);
        }
    }
}


// ---------------------------------------------
// determineMonsterDirection function end
// ---------------------------------------------


// ---------------------------------------------
// shootProjectile function start
// ---------------------------------------------

function shootProjectile(monster){ // Called after every movement of the monsters
    // Initailize projetile object and then store into global projectile array to be drawn on screen
    let projectile = {
        img: document.getElementById("pellets"),
        // Source
        sx: 0,
        sy: 0,
        sw: 8,
        sh: 10,
        // Destination
        dx: 0,
        dy: 0,
        dw: 16,
        dh: 20,
        // Info
        travelling: false
    }
    // Determine Projectile Direction and starting point
    if(monster.facing == "up"){ //Projectile will be shot upwards from the mouth
        projectile.dx = monster.x + monster.width/2;
        projectile.dy = monster.y;
        projectile.travelling = "up";
    }
    else if(monster.facing == "down"){ //Projectile will be shot downwards from the mouth
        projectile.dx = monster.x + monster.width/2;
        projectile.dy = monster.y + monster.height;
        projectile.travelling = "down";
    }
    else if(monster.facing == "left"){ //Projectile will be shot leftwards from the mouth
        projectile.dx = monster.x;
        projectile.dy = monster.y + monster.height/2;
        projectile.travelling = "left";
    }
    else if(monster.facing == "right"){ //Projectile will be shot rightwards from the mouth
        projectile.dx = monster.x + monster.width;
        projectile.dy = monster.y + monster.height/2;
        projectile.travelling = "right";
    }
    else{ return; } // monster has just been intialized so no projectile should be shot
    if (!monster.alive ){ return; } // recheck in case monster has been killed since last check
    AllProjectiles.push(projectile);
}
// ---------------------------------------------
// shootProjectile function end
// ---------------------------------------------




// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------- Monster Collsion Functions -------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

// ---------------------------------------------
// checkPlayerCollision function start
// ---------------------------------------------

function checkPlayerCollision(monster){
    // Determine if monster is hitting player and if so then make the player take damage, (they also get bumped backwards) - optional, currently not implemented
    let playerLeft = player.x + player.bufWidth;
    let playerRight = player.x + player.hitWidth - player.bufWidth;
    let playerTop = player.y + player.bufHeight;
    let playerBot = player.y + player.hitHeight - player.bufHeight;

    if(player.invincibility == false){ // if the player is not invincible
        if(playerLeft >= monster.x && playerLeft <= monster.x + monster.width){ // if left side of monster is inline on the x-axis
            if(playerTop >= monster.y && playerTop <= monster.y + monster.height){ // monster below link / below and to the right
                player.lives--; makeInvincible(player, 3000); // lose a life and make player invincible for 3 seconds
                // console.log("hit");
            }
            else if(playerBot >= monster.y && playerBot <= monster.y + monster.height){ // monster above link / above and to the right
                player.lives--; makeInvincible(player, 3000); // lose a life and make player invincible for 3 seconds
                // console.log("hit");
            }
        }
        else if(playerRight >= monster.x && playerRight <= monster.x + monster.width){ // if right side of monster is inline on x-axis
            if(playerTop >= monster.y && playerTop <= monster.y + monster.height){ // monster below link / below and to the right
                player.lives--; makeInvincible(player, 3000); // lose a life and make player invincible for 3 seconds
                // console.log("hit");
            }
            else if(playerTop >= monster.y && playerTop <= monster.y + monster.height){ // monster above link / above and to the right
                player.lives--; makeInvincible(player, 3000); // lose a life and make player invincible for 3 seconds
                // console.log("hit");
            }
        }
    }
}

// ---------------------------------------------
// checkPlayerCollision function end
// ---------------------------------------------


// ---------------------------------------------
// checkIfStabbed function start
// ---------------------------------------------
function checkIfStabbed(monster){
    // Determine if monster is touching sword and if so then kill monster
    if(player.swordX != false && player.swordY != false){ // if sword drawn
        // determine tile monster is in
        let tileX = Math.floor(monster.x/32) + 1;
        let tileY = Math.floor(monster.y/32) + 1; 

        if(Math.abs(tileX - player.tileX) <= 1 && Math.abs(tileY - player.tileY) <= 1 ){ // If monster is within 1 tile of player
            if(player.sword.x >= monster.x && player.sword.x <= monster.x + monster.width || player.sword.x + player.sword.w >= monster.x && player.sword.x + player.sword.w <= monster.x + monster.width){ // If monster inline vertically with either edge
                if(player.sword.y >= monster.y && player.sword.y <= monster.y + monster.height || player.sword.y + player.sword.h >= monster.y && player.sword.y + player.sword.h <= monster.y + monster.height){ // If the monster inline horizontally with either end
                    monster.alive = false;
                }
            }
        }
    }
}
// ---------------------------------------------
// checkifStabbed function end
// ---------------------------------------------



// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------- Monster Animation Functions ------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

function animateMonster(monster, direction){
    // Animate monster by changing the coordinates of the source selection

    if(direction == "down"){ // Monster sprite is in the first column 
        monster.sx = 0;
        if(monster.sy == 0){ monster.sy = 30; }
        else{                monster.sy = 0; }
    }
    else if(direction == "up"){ // Monster sprite is in the 3rd column
        monster.sx = 60;
        if(monster.sy == 0){ monster.sy = 30; }
        else{                monster.sy = 0; }
    }
    else if(direction == "left"){ // monster sprite is in the 2nd column
        monster.sx = 30;
        if(monster.sy == 0){ monster.sy = 30; }
        else{                monster.sy = 0; }
    }
    else if(direction == "right"){ // monster sprite is in the 4th column
        monster.sx = 90;
        if(monster.sy == 0){ monster.sy = 30; }
        else{                monster.sy = 0; }
    }
}



