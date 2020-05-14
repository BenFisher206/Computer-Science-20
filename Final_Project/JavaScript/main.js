// Legend Of Zelda

// Event Listeners
window.addEventListener("load", drawPlayer);
window.addEventListener("load", drawInventory);
window.addEventListener("load", startup);
document.addEventListener("keydown", determineDirection);
document.addEventListener("keyup", cancelDirection);

// One Time Startups

setInterval(drawPlayer, 25);
setInterval(movePlayer, 25);
initiateProjectiles();
setInterval(animatePlayer, 100);
gameOver();

let endCnv = document.getElementById("gameOver");
let endCtx = endCnv.getContext("2d");
endCnv.width = CNV_WIDTH;
endCnv.height = CNV_HEIGHT;



// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// ---------------------- Helper Functions ----------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

// ----------------------------------
// makeInvincible Function start
// ----------------------------------

function makeInvincible(anObject, aTime){
    // Given an object make that object invincible for a given period of time
    anObject.invincibility = true;
    setTimeout(function() { anObject.invincibility = false; }, aTime);
}

// ----------------------------------
// makeInvincible Function end
// ----------------------------------

function gameOver(){
    let checkInterval = setInterval(() => {
        if(player.lives > 0){ return; }
        endCtx.fillStyle = "black";
        endCtx.fillRect(0, 0, endCnv.width, endCnv.height);
        endCtx.font = '100px Creeper, cursive'; endCtx.fillStyle = 'Red';
        endCtx.fillText('GAME OVER', 100, 300);
        document.getElementById('retry').innerHTML = '<button id="refresh">Restart Game</button>';
        document.getElementById('refresh').addEventListener('click', refreshPage);
        clearInterval(checkInterval);
    },25);
}


function refreshPage(){
    window.location.reload();
}