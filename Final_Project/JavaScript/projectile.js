// Set up Projectile Canvas and Graphics Context
let projectileCnv = document.getElementById("projectileCanvas");
let projectileCtx = projectileCnv.getContext("2d");
projectileCnv.width = CNV_WIDTH;
projectileCnv.height = CNV_HEIGHT;

// Global Variables
let AllProjectiles = [];

function initiateProjectiles(){
    let spawnRoom = currentRoomNmb;
    setInterval(moveProjectiles, 25);

    function moveProjectiles(){
        if(spawnRoom != currentRoomNmb){ AllProjectiles = []; spawnRoom = currentRoomNmb; }
        if(AllProjectiles.length === 0){ return; }
        projectileCtx.clearRect(0, 0, projectileCnv.width, projectileCnv.height);
        for(let i = AllProjectiles.length - 1; i>=0; i--){
            if(AllProjectiles[i].travelling == "up"){ AllProjectiles[i].dy-=6; }
            if(AllProjectiles[i].travelling == "down"){ AllProjectiles[i].dy+=6; }
            if(AllProjectiles[i].travelling == "left"){ AllProjectiles[i].dx-=6; }
            if(AllProjectiles[i].travelling == "right"){ AllProjectiles[i].dx+=6; }
            if(spawnRoom != currentRoomNmb){ AllProjectiles = []; spawnRoom = currentRoomNmb; return; }
            // checkProjectileCollision(AllProjectiles[i]);
            if(checkProjectileCollision(AllProjectiles[i]) == false){ projectileCtx.clearRect(0, 0, projectileCnv.width, projectileCnv.height); continue; }
            if(AllProjectiles[i].travelling == false){ AllProjectiles.splice(i, 1); continue; }
            drawProjectile(AllProjectiles[i]);
        }
    }
}

function checkProjectileCollision(projectile){
    if(backgroundMap.length === 0){ return false; }
    // Determine what tiles the 4 corners of the projectile is touching
    let frontSideTile = Math.floor((projectile.dy)/32) + 1;
    let backSideTile = Math.floor((projectile.dy + projectile.dh)/32) + 1;
    let leftSideTile = Math.floor((projectile.dx)/32) + 1;
    let rightSideTile = Math.floor((projectile.dx + projectile.dw)/32) + 1;
    
    if(backgroundMap.length === 0){ return false; }
    // Determine what the front number of each tile is
    let classTopRight = Math.floor(backgroundMap[frontSideTile][rightSideTile]);
    let classTopLeft = Math.floor(backgroundMap[frontSideTile][leftSideTile]);
    let classBotRight = Math.floor(backgroundMap[backSideTile][rightSideTile]);
    let classBotLeft = Math.floor(backgroundMap[backSideTile][leftSideTile]);
    if(projectile.travelling == "up"){ 
        if(classTopRight > 0 && classTopRight < 5 || classTopLeft > 0 && classTopLeft < 5){ // If hitting a tile that is not ground, water, pit
            projectile.travelling = false;
            return true;
        }
    }
    else if(projectile.travelling == "down"){
        if(classBotRight > 0 && classBotRight < 5 || classBotLeft > 0 && classBotLeft < 5){ // If hitting a tile that is not ground, water, pit
            projectile.travelling = false;
            return true;
        }
    }
    else if(projectile.travelling == "left"){
        if(classBotLeft > 0 && classBotLeft < 5 || classTopLeft > 0 && classTopLeft < 5){ // If hitting a tile that is not ground, water, pit
            projectile.travelling = false;
            return true;
        }
    }
    else if(projectile.travelling == "right"){
        if(classTopRight > 0 && classTopRight < 5 || classBotRight > 0 && classBotRight < 5){ // If hitting a tile that is not ground, water, pit
            projectile.travelling = false;
            return true;
        }
    }

    if(projectile.dx < player.x + player.drawWidth - player.bufWidth && projectile.dx + projectile.dw > player.x + player.bufWidth){ // Check X axis
        if(projectile.dy < player.y + player.drawHeight - player.bufHeight && projectile.dy + projectile.dh > player.y + player.bufHeight){ // Check Y axis
            if(!player.invincibility){ player.lives--; makeInvincible(player, 3000); }
            projectile.travelling = false;
            return true;
        }
    }

}

function drawProjectile(projectile){
    projectileCtx.drawImage(projectile.img, projectile.sx, projectile.sy, projectile.sw, projectile.sh, projectile.dx, projectile.dy, projectile.dw, projectile.dh)
}