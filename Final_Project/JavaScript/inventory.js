// Set up inventory Canvas
let inventoryCnv = document.getElementById("inventoryCanvas");
let inventoryCtx = inventoryCnv.getContext("2d");
inventoryCnv.width = CNV_WIDTH + 200;
inventoryCnv.height = CNV_HEIGHT + 200;

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------- Main Function --------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


function drawInventory(){
    let drawInterval = setInterval(() => {
        inventoryCtx.clearRect(0, 0, inventoryCnv.width, inventoryCnv.height);
        drawHearts();
        drawSlots();
        drawRoomName();

        if(player.lives <= 0){ clearInterval(drawInterval); }
    }, 25);
}

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------- Drawing Functions ----------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

// ----------------------------------
// drawHearts Function start
// ----------------------------------

function drawHearts(){
    // Draw number of hearts left
    let heart = {
        img: document.getElementById("heart"),
        // Source
        sx: 300,
        sy: 195,
        sw: 15,
        sh: 15,
        // Destination
        dx: 100,
        dy: 50,
        dw: 30,
        dh:30
    }
    
    inventoryCtx.font = '30px Arial'; inventoryCtx.fillStyle = 'white'; inventoryCtx.fillText('Player 1', 100, 40); // Draw name above hearts
    for(let i=0; i<player.lives; i++){
        inventoryCtx.drawImage(heart.img, heart.dx, heart.dy, heart.dw, heart.dh);
        heart.dx+=35; // increment hearts to be 5px apart
    }
}

// ----------------------------------
// drawHearts Function end
// ----------------------------------



// ----------------------------------
// drawSlots Function start
// ----------------------------------

function drawSlots(){
    // Draw the active slot and fill it in with equipped item
    let box = {
        x: 820,
        y: 25,
        w: 70,
        h: 70,
        color: "grey"
    }
    let sword = {
        img: document.getElementById("sword"),
        // Source
        sx: 63,
        sy: 194,
        sw: 9,
        sh: 18,
        // Destination
        dx: 840,
        dy: 35,
        dw: 27,
        dh: 54
    }
    inventoryCtx.strokeStyle = box.color; inventoryCtx.strokeRect(box.x, box.y, box.w, box.h); // draw box
    inventoryCtx.font = '15px Arial'; inventoryCtx.fillStyle = 'white'; inventoryCtx.fillText('SPACE', 830, 20); // Draw text above box
    inventoryCtx.drawImage(sword.img, sword.dx, sword.dy, sword.dw, sword.dh); // Draw Sword
}

// ----------------------------------
// drawSlots Function end
// ----------------------------------


// ----------------------------------
// drawRoomName Function start
// ----------------------------------

function drawRoomName(){
    // Print the room name in the middle of the top portion of the screen
    inventoryCtx.font = '30px Creeper, cursive'; inventoryCtx.fillStyle = 'white';
    if     (currentRoomNmb == 0){ inventoryCtx.fillText('Spawn Room', 390, 60); }
    else if(currentRoomNmb == 1){ inventoryCtx.fillText('Cave Entrance', 390, 60); }
    else if(currentRoomNmb == 2){ inventoryCtx.fillText('Crossroads' , 390, 60); }
    else if(currentRoomNmb == 3){ inventoryCtx.fillText('Waterworks' , 390, 60); }
    else if(currentRoomNmb == 4){ inventoryCtx.fillText('Sand Trap' , 390, 60); }
    else if(currentRoomNmb == 5){ inventoryCtx.fillText('Pitfall' , 390, 60); }
    else if(currentRoomNmb == 6){ inventoryCtx.fillText('Connector' , 390, 60); }
    else if(currentRoomNmb == 7){ inventoryCtx.fillText('Quicksand' , 390, 60); }
    else if(currentRoomNmb == 8){ inventoryCtx.fillText('Dust Bowl' , 390, 60); }
    else if(currentRoomNmb == 9){ inventoryCtx.fillText('Marsh' , 390, 60); }
    else if(currentRoomNmb == 10){ inventoryCtx.fillText('WaterWay' , 390, 60); }
    else if(currentRoomNmb == 11){ inventoryCtx.fillText('Crater' , 390, 60); }
    else if(currentRoomNmb == 12){ inventoryCtx.fillText('Lagoon' , 390, 60); }
}

// ----------------------------------
// drawRoomName Function end
// ----------------------------------
