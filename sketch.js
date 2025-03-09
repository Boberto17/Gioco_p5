// Importazioni
import { Player } from './player.js';
import { Platform, platformTypes, generatePlatform } from './platform.js';
import { drawMenu, drawRules, drawGameOver } from './gameStates.js';
import { setupControls, keys, lastClickedButton, resetLastClickedButton } from './controls.js';
import { drawButton, drawJumpIndicator } from './ui.js';

// Variabili globali
let skyBackground;
let player;
let platforms = [];
let gravity = 0.5;
let gameOver = false;
let score = 0;
let highScore = 0;
let cameraPosY = 0;
let gameState = "MENU"; // Stati possibili: MENU, PLAYING, RULES, GAME_OVER

// Variabili per l'indicatore di salto
let jumpCharging = false;
let jumpPower = 0;
let maxJumpPower = 20;
let jumpChargeRate = 0.25;
let jumpDirection = { x: 0, y: -1 }; // Direzione predefinita verso l'alto

// Immagini per animazioni
let slimeIdle;
let slimeWalk;
let slimeJump;

function preload() {
  slimeIdle = loadImage('assets/slimeCamminata.gif');
  slimeWalk = loadImage('assets/slimeCamminata.gif');
  slimeJump = loadImage('assets/slimeSalto.gif');
  skyBackground = loadImage('assets/sky_background.jpg');
}

function setup() {
  createCanvas(800, 600);
  textFont('Arial');
  setupControls();
  prepareGame(); // Prepara il gioco senza iniziare subito
}

function prepareGame() {
  player = new Player(width / 2, height - 100, slimeIdle, slimeWalk, slimeJump);
  platforms = [];
  gameOver = false;
  score = 0;
  cameraPosY = 0;
  jumpCharging = false;
  jumpPower = 0;
  
  // Piattaforma iniziale (posizionata sotto il giocatore)
  platforms.push(new Platform(width / 2 - 100, height - 30, 200, 20, platformTypes.NORMAL));
  
  // Genera le piattaforme iniziali
  for (let i = 0; i < 20; i++) {
    generatePlatform(height - 150 - i * 150, width, platforms, platformTypes);
  }
}

function startGame() {
  gameState = "PLAYING";
  // Assicurati che il giocatore sia sopra la piattaforma iniziale
  player.y = platforms[0].y - player.height;
  player.grounded = true;
}

function draw() {
  background(100, 180, 255);
  
  // Gestisci i diversi stati di gioco
  switch(gameState) {
    case "MENU":
      drawMenu(skyBackground, width, height, drawButton, startGame);
      break;
    case "PLAYING":
      drawGameplay();
      break;
    case "RULES":
      drawRules(width, height, drawButton);
      break;
    case "GAME_OVER":
      drawGameOver(width, height, score, highScore, drawButton, prepareGame, startGame);
      break;
  }
}

function drawGameplay() {
  if (!gameOver) {
    // Aggiorna la posizione della camera
    let targetCameraY = -player.y + height * 0.7;
    cameraPosY = lerp(cameraPosY, targetCameraY, 0.1);
    cameraPosY = min(0, cameraPosY); // La camera non può andare più in basso del fondo

    image(skyBackground, 0, cameraPosY * 0.3, width, height);
    
    push();
    translate(0, cameraPosY);
    
    // Calcola il punteggio basato sull'altezza raggiunta
    score = Math.floor((-player.minY) / 100);
    if (score > highScore) highScore = score;
    
    // Genera nuove piattaforme man mano che il giocatore sale
    if (player.y < platforms[platforms.length - 1].y - 300) {
      generatePlatform(player.y - 300, width, platforms, platformTypes);
    }
    
    // Gestisci il caricamento del salto con spazio
    if (keys.space && player.grounded && !jumpCharging) {
      jumpCharging = true;
      jumpPower = 0;
    }
    
    // Aggiorna la potenza del salto se stiamo caricando
    if (jumpCharging && keys.space) {
      jumpPower = min(jumpPower + jumpChargeRate, maxJumpPower);
      
      // Aggiorna la direzione del salto in base ai tasti premuti
      updateJumpDirection();
    }
    
    // Esegui il salto quando il tasto spazio viene rilasciato
    if (jumpCharging && !keys.space && player.grounded) {
      executeJump();
    }
    
    // Aggiorna e mostra il giocatore
    player.update(platforms, gravity);
    player.show();
    
    // Disegna l'indicatore di salto se stiamo caricando
    if (jumpCharging && player.grounded) {
      drawJumpIndicator(player, jumpDirection, jumpPower, maxJumpPower);
    }
    
    // Aggiorna e mostra le piattaforme
    for (let i = platforms.length - 1; i >= 0; i--) {
      platforms[i].update();
      platforms[i].show();
      
      // Rimuovi piattaforme che sono troppo in basso (per ottimizzazione)
      if (platforms[i].y > -cameraPosY + height + 100) {
        platforms.splice(i, 1);
      }
    }
    
    // Controlla se il giocatore è caduto fuori dallo schermo
    if (player.y > -cameraPosY + height + 50) {
      gameState = "GAME_OVER";
    }
    
    pop();
    
    // Mostra il punteggio
    fill(0);
    textSize(24);
    text("Score: " + score, 20, 30);
    text("High Score: " + highScore, 20, 60);
    
    // Pulsante pausa/menu
    fill(0, 0, 0, 80);
    rect(width - 140, 15, 120, 40, 5);
    fill(255);
    textAlign(CENTER, CENTER);
    text("MENU", width - 80, 35);
    textAlign(LEFT, BASELINE);
    
    // Aggiungi gestione del clic sul pulsante menu
    if (mouseIsPressed && 
        mouseX > width - 140 && mouseX < width - 20 &&
        mouseY > 15 && mouseY < 55) {
      lastClickedButton = function() {
        gameState = "MENU";
      };
    }
  }
}

function updateJumpDirection() {
  // Direzione predefinita verso l'alto
  jumpDirection = { x: 0, y: -1 };
  
  // Aggiorna la direzione del salto in base ai tasti premuti
  if (keys.left) {
    jumpDirection.x = -0.7;
    jumpDirection.y = -0.7;
    player.direction = -1;
  } else if (keys.right) {
    jumpDirection.x = 0.7;
    jumpDirection.y = -0.7;
    player.direction = 1;
  }
  
  // Modifica verticale della direzione
  if (keys.up) {
    jumpDirection.y = -1;
    if (keys.left || keys.right) {
      jumpDirection.y = -0.8;
      jumpDirection.x *= 0.6;
    }
  } else if (keys.down) {
    jumpDirection.y = -0.5;
    if (keys.left || keys.right) {
      jumpDirection.x *= 1.2;
    }
  }
  
  // Normalizza il vettore direzione
  let magnitude = Math.sqrt(jumpDirection.x * jumpDirection.x + jumpDirection.y * jumpDirection.y);
  jumpDirection.x /= magnitude;
  jumpDirection.y /= magnitude;
}

function executeJump() {
  // Calcola la velocità del salto in base alla potenza e direzione
  player.vx = jumpDirection.x * jumpPower;
  player.vy = jumpDirection.y * jumpPower;
  player.grounded = false;
  jumpCharging = false;
  jumpPower = 0;
  player.jumpCooldown = 0; // Azzera il cooldown invece di impostarlo
}

function mousePressed() {
  if (gameState === "PLAYING" && player.grounded) {
    // Inizia a caricare il salto
    jumpCharging = true;
    jumpPower = 0;
    
    // Calcola la direzione del salto in base alla posizione del mouse
    let dx = mouseX - player.x - player.width / 2;
    let dy = (mouseY - cameraPosY) - player.y - player.height / 2;
    let angle = atan2(dy, dx);
    
    jumpDirection.x = cos(angle);
    jumpDirection.y = sin(angle);
    
    // Aggiorna la direzione del giocatore
    if (jumpDirection.x > 0) {
      player.direction = 1;
    } else {
      player.direction = -1;
    }
  }
}

function mouseReleased() {
  // Esegui il callback dell'ultimo pulsante cliccato
  if (lastClickedButton) {
    lastClickedButton();
    resetLastClickedButton();
  }
  
  // Esegui il salto quando il mouse viene rilasciato (se stiamo caricando)
  if (jumpCharging && player.grounded && gameState === "PLAYING") {
    executeJump();
  }
}

// Esportiamo funzioni e variabili
export {
  startGame,
  prepareGame,
  gameState,
  score,
  highScore,
  cameraPosY
};