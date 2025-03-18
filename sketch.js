// Variabili globali per il gioco
let player; // Oggetto giocatore
let platforms = []; // Array per memorizzare le piattaforme
let gravity = 0.5; // Gravità applicata al giocatore
let gameOver = false; // Stato di fine gioco
let score = 0; // Punteggio corrente
let highScore = 0; // Miglior punteggio
let cameraPosY = 0; // Posizione della camera lungo l'asse Y
let gameState = "MENU"; // Stato corrente del gioco: MENU, PLAYING, RULES, GAME_OVER
let lastClickedButton = null; // Ultimo pulsante cliccato
let slimeIdle, slimeWalk, slimeJump; // Immagini per le animazioni del giocatore
let currentLevel = 0; // Livello corrente
let lastPlatformY = 0; // Ultima posizione Y della piattaforma generata
let platformsJumped = 0; // Numero di piattaforme saltate
let targetScore = 300; // Punteggio obiettivo per passare al livello successivo
let gameWon = false; // Stato di vittoria del gioco
let menuBackgroundIndex = 0; // Indice per lo sfondo del menu
let lastBackgroundChange = 0; // Tempo dell'ultimo cambio di sfondo
let Font; // Font per il testo
let lastPlatformHorizontalPosition = "center"; // Ultima posizione orizzontale della piattaforma
let trophyImage; // Immagine del trofeo
let trophy = null; // Oggetto trofeo
let previousGameState = null; // Stato precedente del gioco
let missedTrophy = false; // Flag per indicare se il trofeo è stato mancato
let trophyRegenerationDistance = 1000; // Distanza dopo la quale rigenerare il trofeo

// Oggetto per memorizzare lo stato dei tasti
let keys = {
  left: false,
  right: false,
  up: false,
  down: false,
  space: false
};

let moveSpeed = 5; // Velocità di movimento del giocatore

// Variabili per il salto
let jumpCharging = false; // Stato di caricamento del salto
let jumpPower = 0; // Potenza del salto
let maxJumpPower = 20; // Potenza massima del salto
let jumpChargeRate = 0.25; // Tasso di caricamento del salto
let jumpDirection = { x: 0, y: -1 }; // Direzione del salto

// Tipi di piattaforme
let platformTypes = {
  NORMAL: 0,
  TEMPORARY: 1,
  SLIPPERY: 2,
  TELEPORT: 3
};

// Livelli del gioco
let levels = [
  { name: "Foresta", background: null, platformTypes: [platformTypes.NORMAL] },
  { name: "Ghiaccio", background: null, platformTypes: [platformTypes.NORMAL, platformTypes.SLIPPERY] },
  { name: "Caverna", background: null, platformTypes: [platformTypes.NORMAL, platformTypes.SLIPPERY, platformTypes.TEMPORARY] },
  { name: "Cielo", background: null, platformTypes: [platformTypes.NORMAL, platformTypes.SLIPPERY, platformTypes.TEMPORARY, platformTypes.TELEPORT] }
];

// Precaricamento delle risorse
function preload() {
  slimeIdle = loadImage('assets/slimeCamminata.gif');
  slimeWalk = loadImage('assets/slimeCamminata.gif');
  slimeJump = loadImage('assets/slimeSalto.gif');
  platformNormal = loadImage('assets/piattaforme0.png');
  platformSlippery = loadImage('assets/piattaforme1.png');
  platformTeleport = loadImage('assets/piattaforme2.png');
  platformTemporary = loadImage('assets/piattaforme3.png');
  levels[0].background = loadImage('assets/mappaForesta.png');
  levels[1].background = loadImage('assets/mappaGhiaccio.png');
  levels[2].background = loadImage('assets/mappaCaverna.png');
  levels[3].background = loadImage('assets/mappaCielo.png');
  Font = loadFont('assets/KnightWarrior.otf');
  trophyImage = loadImage('assets/trophy.png');
}

// Funzione di setup per inizializzare il gioco
function setup() {
  createCanvas(1200, 800); 
  textFont('Arial');
  lastBackgroundChange = millis();
  prepareGame();
}

// Funzione per preparare il gioco
function prepareGame() {
  player = new Player(width / 2, height - 100); // Crea il giocatore
  platforms = []; // Resetta le piattaforme
  gameOver = false; // Resetta lo stato di fine gioco
  score = 0; // Resetta il punteggio
  cameraPosY = 0; // Resetta la posizione della camera
  jumpCharging = false; // Resetta il caricamento del salto
  jumpPower = 0; // Resetta la potenza del salto
  currentLevel = 0; // Resetta il livello corrente
  platformsJumped = 0; // Resetta il numero di piattaforme saltate
  lastPlatformY = 0; // Resetta l'ultima posizione Y della piattaforma
  gameWon = false; // Resetta lo stato di vittoria
  previousGameState = null; // Resetta lo stato precedente del gioco
  trophy = null;
  missedTrophy = false;  // Resetta il trofeo

  // Piattaforma iniziale
  platforms.push(new Platform(width / 2 - 150, height - 30, 300, 30, platformTypes.NORMAL));
  lastPlatformY = height - 30;
  lastPlatformHorizontalPosition = "center";

  player.initialY = height - 100; // Imposta la posizione iniziale del giocatore
}

// Funzione per iniziare il gioco
function startGame() {
  gameState = "PLAYING"; // Imposta lo stato del gioco su "PLAYING"
  player.y = platforms[0].y - player.height; // Posiziona il giocatore sulla piattaforma iniziale
  player.grounded = true; // Imposta il giocatore come "grounded"
}

// Funzione principale di disegno
function draw() {
  background(100, 180, 255); // Sfondo blu

  // Gestione degli stati del gioco
  switch (gameState) {
    case "MENU":
      drawMenu(); // Disegna il menu
      break;
    case "PLAYING":
      drawGameplay(); // Disegna il gameplay
      break;
    case "PAUSED":
      drawPauseScreen(); // Disegna la schermata di pausa
      break;
    case "RULES":
      drawRules(); // Disegna le regole
      break;
    case "GAME_OVER":
      drawGameOver(); // Disegna la schermata di game over
      break;
  }
}

// Funzione per disegnare la schermata di pausa
function drawPauseScreen() {
  image(levels[currentLevel].background, 0, 0, width, height); // Disegna lo sfondo

  push();
  translate(0, cameraPosY);

  // Disegna le piattaforme
  for (let platform of platforms) {
    platform.show();
  }

  // Disegna il giocatore
  player.show();

  // Disegna il trofeo se esiste
  if (trophy) {
    image(trophyImage, trophy.x, trophy.y, trophy.width, trophy.height);
  }

  pop();

  // Overlay semi-trasparente
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);

  // Titolo "PAUSA"
  textFont(Font);
  fill(255);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("PAUSA", width / 2, height / 3);

  // Pulsanti
  drawButton("CONTINUA", width / 2, height / 2, function() {
    gameState = "PLAYING";
  });

  drawButton("MENU PRINCIPALE", width / 2, height / 2 + 80, function() {
    gameState = "MENU";
    previousGameState = "PLAYING";
  });

  drawButton("RIAVVIA", width / 2, height / 2 + 160, function() {
    prepareGame();
    startGame();
  });

  textAlign(LEFT, BASELINE);
}

// Funzione per disegnare il menu
function drawMenu() {
  if (millis() - lastBackgroundChange > 5000) {
    menuBackgroundIndex = (menuBackgroundIndex + 1) % levels.length;
    lastBackgroundChange = millis();
  }

  if (levels[menuBackgroundIndex].background) {
    image(levels[menuBackgroundIndex].background, 0, 0, width, height);
  }

  textFont(Font);

  textSize(128);
  textAlign(CENTER, CENTER);
  fill(0); // Bordo nero

  // Effetto bordo per il titolo
  text("Slime adventure", width / 2 - 3, height / 4);
  text("Slime adventure", width / 2 + 3, height / 4);
  text("Slime adventure", width / 2, height / 4 - 3);
  text("Slime adventure", width / 2, height / 4 + 3);

  fill(255, 215, 0); // Colore oro
  text("Slime adventure", width / 2, height / 4);

  // Pulsanti del menu
  if (previousGameState === "PLAYING") {
    drawButton("CONTINUA", width / 2, height / 2, function () {
      gameState = "PLAYING";
    });
  } else {
    drawButton("GIOCA", width / 2, height / 2, function () {
      startGame();
    });
  }

  drawButton("REGOLE", width / 2, height / 2 + 80, function () {
    gameState = "RULES";
  });

  drawButton("ESCI", width / 2, height / 2 + 160, function () {
    alert("Grazie per aver giocato! Chiudi questa finestra per uscire.");
  });

  textAlign(LEFT, BASELINE);
}

// Funzione per disegnare le regole
function drawRules() {
  background(80, 150, 255);

  fill(255);
  textSize(40);
  textAlign(CENTER, TOP);
  text("REGOLE DEL GIOCO", width / 2, 50);

  textSize(20);
  textAlign(LEFT);

  let rulesX = width / 5;
  let rulesY = 120;

  text("  Come giocare:", rulesX, rulesY);
  text("- Premi SPAZIO per saltare quando sei su una piattaforma", rulesX, rulesY + 40);
  text("- Tieni premuto SPAZIO per caricare un salto piu' potente", rulesX, rulesY + 70);
  text("- Muoviti con W, A, S, D o le FRECCE DIREZIONALI", rulesX, rulesY + 100);
  text("- Salta in direzioni diverse tenendo premuto un tasto direzionale", rulesX, rulesY + 130);
  text("- Sali il piu' in alto possibile senza cadere fuori dallo schermo", rulesX, rulesY + 250);

  text("Tipi di piattaforme:", rulesX, rulesY + 300);

  image(platformNormal, rulesX, rulesY + 330, 20, 20);
  fill(255);
  text("  Verde: Piattaforme normali", rulesX + 30, rulesY + 347);

  image(platformTemporary, rulesX, rulesY + 360, 20, 20);
  fill(255);
  text("  Gialla: Piattaforme temporanee (scompaiono dopo che ci stai sopra)", rulesX + 30, rulesY + 377);

  image(platformSlippery, rulesX, rulesY + 390, 20, 20);
  fill(255);
  text("  Azzurra: Piattaforme scivolose (minor attrito)", rulesX + 30, rulesY + 407);

  image(platformTeleport, rulesX, rulesY + 420, 20, 20);
  fill(255);
  text("  Marrone: Piattaforme di teletrasporto (ti teletrasportano alla piattaforma piu' vicina)", rulesX + 30, rulesY + 437);

  drawButton("TORNA AL MENU", width / 2, height - 80, function () {
    gameState = "MENU";
  });

  textAlign(LEFT, BASELINE);
}

// Funzione per disegnare il gameplay
function drawGameplay() {
  if (!gameOver && !gameWon) {
    // Aggiorna la posizione della camera
    let targetCameraY = -player.y + height * 0.7;
    cameraPosY = lerp(cameraPosY, targetCameraY, 0.1);

    image(levels[currentLevel].background, 0, 0, width, height);

    let highestPlatformY = Infinity;
    for (let platform of platforms) {
      if (platform.y < highestPlatformY) {
        highestPlatformY = platform.y;
      }
    }

    push();
    translate(0, cameraPosY);

    if (player.initialY) {
      score = Math.floor((player.initialY - player.y) / 10);
    }

    if (score > highScore) highScore = score;

    manageNewPlatforms();

    if (trophy) {
      updateTrophy();
    }

    if (player.y < highestPlatformY + 600) {
      let platformsNeeded = 8;
      let nextPlatformY = highestPlatformY - 120;

      for (let i = 0; i < platformsNeeded; i++) {
        generatePlatform(nextPlatformY);
        nextPlatformY -= random(100, 200);
      }
    }

    for (let i = platforms.length - 1; i >= 0; i--) {
      if (platforms[i].y > player.y + 1000) {
        platforms.splice(i, 1);
      }
    }
  }

  // Gestione del caricamento del salto
  if (keys.space && player.grounded && !jumpCharging) {
    jumpCharging = true;
    jumpPower = 0;
  }

  if (jumpCharging && keys.space) {
    jumpPower = min(jumpPower + jumpChargeRate, maxJumpPower);
    updateJumpDirection();
  }

  if (jumpCharging && !keys.space && player.grounded) {
    executeJump();
  }

  player.update();
  player.show();

  if (jumpCharging && player.grounded) {
    drawJumpIndicator();
  }

  for (let i = platforms.length - 1; i >= 0; i--) {
    platforms[i].update();
    platforms[i].show();
  }

  if (player.y > -cameraPosY + height + 50) {
    gameState = "GAME_OVER";
  }

  pop();

  fill(255);
  textSize(24);
  text("Punteggio: " + score, 20, 30);
  text("High Score: " + highScore, 20, 60);

  fill(0, 0, 0, 80);
  rect(width - 140, 15, 120, 40, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  text("PAUSA", width - 80, 35);
  textAlign(LEFT, BASELINE);

  if (mouseIsPressed &&
      mouseX > width - 140 && mouseX < width - 20 &&
      mouseY > 15 && mouseY < 55) {
    lastClickedButton = function() {
      gameState = "PAUSED";
    };
  }

  if (currentLevel === levels.length - 1 && trophy) {
    // Disegna un'indicazione visiva per il trofeo
    let indicatorY = 90;
    
    fill(255, 215, 0); 
    textAlign(CENTER);
    textSize(24);
    
    if (player.y < trophy.y) {
      text("Hai saltato il trofeo! Continua a salire per trovarne un altro!", width / 2, indicatorY);
    } else {
      text("Raccogli il trofeo per vincere!", width / 2, indicatorY);
    }
    
    textAlign(LEFT);
  }

  if (gameWon) {
    drawGameWon();
  }
}

// Funzione per gestire la generazione di nuove piattaforme
function manageNewPlatforms() {
  let highestPlatformY = Infinity;
  for (let platform of platforms) {
    if (platform.y < highestPlatformY) {
      highestPlatformY = platform.y;
    }
  }

  if (currentLevel === levels.length - 1 && score > targetScore - 100 && trophy === null) {
    trophy = {
      x: width / 2 - 40,
      y: highestPlatformY - 250,
      width: 80,
      height: 80,
      floatOffset: 0,
      floatSpeed: 0.05
    };
  }
}

// Funzione per aggiornare il trofeo
function updateTrophy() {
  if (trophy) {
    trophy.floatOffset += trophy.floatSpeed;
    trophy.y = trophy.y + Math.sin(trophy.floatOffset) * 0.5;

    image(trophyImage, trophy.x, trophy.y, trophy.width, trophy.height);

    if (playerCollidesWithTrophy()) {
      gameWon = true;
    }
    
    // Controlla se il giocatore ha saltato il trofeo
    if (player.y < trophy.y - 300 && !missedTrophy) {
      missedTrophy = true;
      console.log("Trofeo mancato! Verrà rigenerato più avanti.");
    }
  }
  
  // Rigenera il trofeo se è stato mancato e il giocatore è salito abbastanza in alto
  if (missedTrophy && trophy) {
    // Se il giocatore è salito abbastanza in alto rispetto all'ultimo trofeo
    if (player.y < trophy.y - trophyRegenerationDistance) {
      console.log("Rigenerazione del trofeo...");
      
      // Trova la piattaforma più alta attualmente visibile
      let highestPlatformY = Infinity;
      for (let platform of platforms) {
        if (platform.y < highestPlatformY) {
          highestPlatformY = platform.y;
        }
      }
      
      // Posiziona il nuovo trofeo sopra la piattaforma più alta
      trophy = {
        x: width / 2 - 40,
        y: highestPlatformY - 250,
        width: 80,
        height: 80,
        floatOffset: 0,
        floatSpeed: 0.05
      };
      
      // Resetta il flag per permettere futuri controlli
      missedTrophy = false;
    }
  }
}

// Funzione per controllare la collisione con il trofeo
function playerCollidesWithTrophy() {
  if (!trophy) return false;

  return (
    player.x + player.width > trophy.x &&
    player.x < trophy.x + trophy.width &&
    player.y + player.height > trophy.y &&
    player.y < trophy.y + trophy.height
  );
}

// Funzione per disegnare la schermata di vittoria
function drawGameWon() {
  background(0, 150, 0, 150);
  fill(255);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("CONGRATULAZIONI!", width / 2, height / 2 - 50);
  textSize(32);
  text("Hai completato tutti i livelli!", width / 2, height / 2 + 20);
  text("Score finale: " + score, width / 2, height / 2 + 60);

  drawButton("RICOMINCIA", width / 2, height / 2 + 130, function () {
    prepareGame();
    startGame();
  });

  drawButton("MENU PRINCIPALE", width / 2, height / 2 + 200, function () {
    gameState = "MENU";
  });

  textAlign(LEFT, BASELINE);
}

// Funzione per aggiornare la direzione del salto
function updateJumpDirection() {
  jumpDirection = { x: 0, y: -1 };

  if (keys.left) {
    jumpDirection.x = -0.7;
    jumpDirection.y = -0.7;
    player.direction = -1;
  } else if (keys.right) {
    jumpDirection.x = 0.7;
    jumpDirection.y = -0.7;
    player.direction = 1;
  }

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

  let magnitude = Math.sqrt(jumpDirection.x * jumpDirection.x + jumpDirection.y * jumpDirection.y);
  jumpDirection.x /= magnitude;
  jumpDirection.y /= magnitude;
}

// Funzione per disegnare l'indicatore di salto
function drawJumpIndicator() {
  let arrowLength = map(jumpPower, 0, maxJumpPower, 20, 80);

  let startX = player.x + player.width / 2;
  let startY = player.y + player.height / 2;

  let endX = startX + jumpDirection.x * arrowLength;
  let endY = startY + jumpDirection.y * arrowLength;

  strokeWeight(5);

  let r = map(jumpPower, 0, maxJumpPower, 0, 255);
  let g = map(jumpPower, 0, maxJumpPower, 255, 0);
  stroke(r, g, 0);
  line(startX, startY, endX, endY);

  noStroke();
  fill(r, g, 0);
  push();
  translate(endX, endY);
  rotate(atan2(jumpDirection.y, jumpDirection.x));
  triangle(0, 0, -10, 5, -10, -5);
  pop();

  strokeWeight(1);
  stroke(0);
}

// Funzione per disegnare la schermata di game over
function drawGameOver() {
  background(255, 0, 0, 150);
  fill(255);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("GAME OVER", width / 2, height / 2 - 50);
  textSize(32);
  text("Score: " + score, width / 2, height / 2 + 20);
  text("High Score: " + highScore, width / 2, height / 2 + 60);

  drawButton("RIPROVA", width / 2, height / 2 + 130, function () {
    prepareGame();
    startGame();
  });

  drawButton("MENU PRINCIPALE", width / 2, height / 2 + 200, function () {
    gameState = "MENU";
  });

  textAlign(LEFT, BASELINE);
}

// Funzione per disegnare un pulsante
function drawButton(label, x, y, callback) {
  let buttonWidth = 250;
  let buttonHeight = 60;

  let isHovering = mouseX > x - buttonWidth / 2 && mouseX < x + buttonWidth / 2 &&
    mouseY > y - buttonHeight / 2 && mouseY < y + buttonHeight / 2;

  if (isHovering) {
    fill(80, 130, 230);
    if (mouseIsPressed) {
      lastClickedButton = callback;
    }
  } else {
    fill(60, 100, 200);
  }

  rect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 10);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text(label, x, y);
}

// Funzione chiamata quando il mouse viene rilasciato
function mouseReleased() {
  if (lastClickedButton) {
    lastClickedButton();
    lastClickedButton = null;
  }

  if (jumpCharging && player.grounded && gameState === "PLAYING") {
    executeJump();
  }
}

// Funzione chiamata quando un tasto viene premuto
function keyPressed() {
  if (keyCode === 65 || keyCode === LEFT_ARROW) {
    keys.left = true;
  } else if (keyCode === 68 || keyCode === RIGHT_ARROW) {
    keys.right = true;
  } else if (keyCode === 87 || keyCode === UP_ARROW) {
    keys.up = true;
  } else if (keyCode === 83 || keyCode === DOWN_ARROW) {
    keys.down = true;
  } else if (keyCode === 32) {
    keys.space = true;

    if (gameState === "MENU") {
      startGame();
    } else if (gameState === "GAME_OVER") {
      prepareGame();
      startGame();
    }
  } else if (keyCode === 27) {
    if (gameState === "PLAYING") {
      gameState = "MENU";
    }
  }
}

// Funzione chiamata quando un tasto viene rilasciato
function keyReleased() {
  if (keyCode === 65 || keyCode === LEFT_ARROW) {
    keys.left = false;
  } else if (keyCode === 68 || keyCode === RIGHT_ARROW) {
    keys.right = false;
  } else if (keyCode === 87 || keyCode === UP_ARROW) {
    keys.up = false;
  } else if (keyCode === 83 || keyCode === DOWN_ARROW) {
    keys.down = false;
  } else if (keyCode === 32) {
    keys.space = false;

    if (jumpCharging && player.grounded && gameState === "PLAYING") {
      executeJump();
    }
  }
}

// Funzione per eseguire il salto
function executeJump() {
  player.vx = jumpDirection.x * jumpPower;
  player.vy = jumpDirection.y * jumpPower;
  player.grounded = false;
  jumpCharging = false;
  jumpPower = 0;
  player.jumpCooldown = 0;

  platformsJumped++;
  
  // Controlla se è ora di passare al livello successivo
  if (score >= targetScore && currentLevel < levels.length - 1) {
    currentLevel++;
    targetScore += 300;
  }
}

// Funzione per generare una nuova piattaforma
function generatePlatform(y) {
  const jumpPowerFactor = 0.75; 
  const maxJumpPower = 20;
  const effectiveJumpPower = maxJumpPower * jumpPowerFactor;
  
  const minPlatformWidth = 100;
  const maxPlatformWidth = 200;
  
  if (platforms.length === 0) {
    let platformWidth = random(minPlatformWidth, maxPlatformWidth);
    let platformX = width / 2 - platformWidth / 2;
    platforms.push(new Platform(platformX, y, platformWidth, 30, platformTypes.NORMAL));
    lastPlatformY = y;
    lastPlatformHorizontalPosition = "center";
    return;
  }
  
  let referencePlatform = null;
  let minVerticalDistance = Infinity;
  
  for (let platform of platforms) {
    let verticalDistance = Math.abs(platform.y - lastPlatformY);
    if (verticalDistance < minVerticalDistance) {
      minVerticalDistance = verticalDistance;
      referencePlatform = platform;
    }
  }
  
  let verticalDistance = referencePlatform.y - y;
  
  let jumpVerticalVelocity = effectiveJumpPower * 0.8;
  let jumpHorizontalVelocity = effectiveJumpPower * 0.6;
  
  let maxHorizontalDistance = (jumpHorizontalVelocity * verticalDistance) / jumpVerticalVelocity;
  
  maxHorizontalDistance = constrain(maxHorizontalDistance, width * 0.2, width * 0.8);
  
  let platformWidth = random(minPlatformWidth, maxPlatformWidth);
  
  let zoneWidth = width / 3;
  
  let zone;
  if (lastPlatformHorizontalPosition === "left") {
    zone = random() < 0.5 ? "center" : "right";
  } else if (lastPlatformHorizontalPosition === "right") {
    zone = random() < 0.5 ? "center" : "left";
  } else {
    zone = random() < 0.5 ? "left" : "right";
  }
  
  let platformX;
  let refCenterX = referencePlatform.x + referencePlatform.width / 2;
  
  if (zone === "left") {
    platformX = random(50, zoneWidth - platformWidth - 50);
    lastPlatformHorizontalPosition = "left";
  } else if (zone === "right") {
    platformX = random(width - zoneWidth + 50, width - platformWidth - 50);
    lastPlatformHorizontalPosition = "right";
  } else {
    platformX = random(zoneWidth + 50, 2 * zoneWidth - platformWidth - 50);
    lastPlatformHorizontalPosition = "center";
  }
  
  let horizontalDistance = Math.abs(platformX + platformWidth/2 - refCenterX);
  
  if (horizontalDistance > maxHorizontalDistance) {
    let direction = platformX > refCenterX ? 1 : -1;
    let maxReachX = refCenterX + direction * maxHorizontalDistance;
    
    if (direction > 0) {
      platformX = maxReachX - platformWidth/2;
    } else {
      platformX = maxReachX - platformWidth/2;
    }
  }
  
  platformX = constrain(platformX, 50, width - platformWidth - 50);
  
  let availableTypes = levels[currentLevel].platformTypes;
  let type = availableTypes[floor(random(availableTypes.length))];
  
  if (type === platformTypes.TELEPORT) {
    let hasTeleportNearby = false;
    for (let platform of platforms) {
      if (platform.type === platformTypes.TELEPORT) {
        let distanceToOtherTeleport = Math.abs(y - platform.y);
        if (distanceToOtherTeleport < 400) {
          hasTeleportNearby = true;
          break;
        }
      }
    }
    
    if (hasTeleportNearby) {
      type = platformTypes.NORMAL;
    }
  }
  
  platforms.push(new Platform(platformX, y, platformWidth, 30, type));
  lastPlatformY = y;
}

// Classe Player
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.initialY = y;
    this.minY = y;
    this.width = 75;
    this.height = 100;
    this.vx = 0;
    this.vy = 0;
    this.isJumping = false;
    this.grounded = false;
    this.onSlippery = false;
    this.lastPlatform = null;
    this.direction = 1;
    this.jumpCooldown = 0;
    this.currentState = "idle";
    this.animationTimer = 0;
    this.teleportCooldown = 3;
  }

  update() {
    if (this.jumpCooldown > 0) {
      this.jumpCooldown--;
    }
    
    if (this.teleportCooldown > 0) {
      this.teleportCooldown--;
    }

    this.animationTimer = max(0, this.animationTimer - 1);

    let prevY = this.y;

    // Gestione del movimento con i tasti direzionali
    if (this.grounded && !jumpCharging) {
      if (keys.left) {
        this.vx = -moveSpeed;
        this.direction = -1;
      } else if (keys.right) {
        this.vx = moveSpeed;
        this.direction = 1;
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    if (!this.grounded) {
      this.vy += gravity;
    } else {
      this.vy = 0;
    }

    // Controllo del movimento in aria
    if (!this.grounded && !jumpCharging) {
      if (keys.left) {
        this.vx -= 0.3;
        this.vx = max(this.vx, -moveSpeed * 0.8);
        this.direction = -1;
      } else if (keys.right) {
        this.vx += 0.3;
        this.vx = min(this.vx, moveSpeed * 0.8);
        this.direction = 1;
      }
      
      if (keys.up && this.vy > 0) {
        this.vy *= 0.98;
      } else if (keys.down && this.vy < 0) {
        this.vy *= 1.02;
      }
    }

    // Gestione dell'attrito in base al tipo di piattaforma
    if (this.grounded) {
      if (this.onSlippery) {
        if (keys.down) {
          this.vx *= 0.7;
        } else if (Math.abs(this.vx) > 0.5 && !keys.left && !keys.right) {
          this.vx *= 0.95;
        } else {
          if (keys.left && !jumpCharging) {
            this.vx = -moveSpeed * 1.3;
            this.direction = -1;
          } else if (keys.right && !jumpCharging) {
            this.vx = moveSpeed * 1.3;
            this.direction = 1;
          } else {
            this.vx *= 0.8;
          }
        }
      } else {
        this.vx *= 0.8;
      }
    }

    let wasGrounded = this.grounded;
    this.grounded = false;
    this.onSlippery = false;

    for (let platform of platforms) {
      if (this.collidesWith(platform)) {
        if (this.vy > 0) {
          if (prevY + this.height <= platform.y + 10) {
            this.y = platform.y - this.height;
            this.vy = 0;
            this.grounded = true;
            this.lastPlatform = platform;

            if (!wasGrounded) {
              this.updateAnimationState("idle");
            }

            if (platform.type === platformTypes.SLIPPERY) {
              this.onSlippery = true;
            } else if (platform.type === platformTypes.TEMPORARY) {
              platform.startDisappearing();
            } else if (platform.type === platformTypes.TELEPORT && this.teleportCooldown === 0) {
              this.teleportToNearestPlatform();
            }

            break;
          }
        }
      }
    }

    if (this.grounded && this.lastPlatform && this.lastPlatform.visible) {
      if (this.x + this.width > this.lastPlatform.x &&
        this.x < this.lastPlatform.x + this.lastPlatform.width) {
        this.y = this.lastPlatform.y - this.height;
      } else {
        this.grounded = false;
      }
    }

    if (this.lastPlatform && !this.lastPlatform.visible) {
      this.grounded = false;
    }

    if (this.y < this.minY) {
      this.minY = this.y;
    }

    this.updateAnimationState();

    if (this.lastPlatform && !this.grounded) {
      this.lastPlatformJumped = this.lastPlatform;
    }
  }

  updateAnimationState(forcedState = null) {
    let newState = forcedState;

    if (!newState) {
      if (!this.grounded) {
        newState = "jump";
      } else if (abs(this.vx) > 1.0) {
        newState = "walk";
      } else {
        newState = "idle";
      }
    }

    if (newState !== this.currentState && this.animationTimer === 0) {
      this.currentState = newState;
      this.animationTimer = 5;
    }
  }

  jump() {
    if (this.grounded && this.jumpCooldown === 0) {
      let jumpVx = 0;
      let jumpVy = -15;

      if (keys.left) {
        jumpVx = -8;
        jumpVy = -13;
      } else if (keys.right) {
        jumpVx = 8;
        jumpVy = -13;
      }

      if (keys.up) {
        jumpVy = -18;
      } else if (keys.down) {
        jumpVy = -10;
      }

      if ((keys.left || keys.right) && (keys.up || keys.down)) {
        let magnitude = Math.sqrt(jumpVx * jumpVx + jumpVy * jumpVy);
        let normalizedMag = 16;
        jumpVx = (jumpVx / magnitude) * normalizedMag;
        jumpVy = (jumpVy / magnitude) * normalizedMag;
      }

      this.vx = jumpVx;
      this.vy = jumpVy;
      this.grounded = false;
      this.jumpCooldown = 10;

      this.updateAnimationState("jump");
    }
  }

  collidesWith(platform) {
    return (
      this.x + this.width > platform.x &&
      this.x < platform.x + platform.width &&
      this.y + this.height > platform.y &&
      this.y < platform.y + platform.height &&
      platform.visible
    );
  }

  show() {
    let currentAnimation;

    switch (this.currentState) {
      case "jump":
        currentAnimation = slimeJump;
        break;
      case "walk":
        currentAnimation = slimeWalk;
        break;
      case "idle":
      default:
        currentAnimation = slimeIdle;
        break;
    }

    push();
    if (this.direction > 0) {
      image(currentAnimation, this.x, this.y, this.width, this.height);
    } else {
      push();
      translate(this.x + this.width, this.y);
      scale(-1, 1);
      image(currentAnimation, 0, 0, this.width, this.height);
      pop();
    }
    pop();
  }
  
  // Funzione per teletrasportarsi alla piattaforma più vicina
  teleportToNearestPlatform() {
    let targetPlatform = null;
    
    for (let platform of platforms) {
      if (platform !== this.lastPlatform && 
          platform.type === platformTypes.TELEPORT && 
          platform.visible &&
          platform.y < this.lastPlatform.y) {
        
        targetPlatform = platform;
        break;
      }
    }
    
    if (targetPlatform) {
      this.x = targetPlatform.x + (targetPlatform.width - this.width) / 2;
      this.y = targetPlatform.y - this.height;
      
      targetPlatform.type = platformTypes.NORMAL;
      
      this.teleportCooldown = 60;
      
      this.updateAnimationState("jump");
    }
  }
}

// Classe Platform
class Platform {
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.visible = true;
    this.disappearTimer = 0;
    this.reappearTimer = 0;
  }

  update() {
    if (this.type === platformTypes.TEMPORARY) {
      if (this.disappearTimer > 0) {
        this.disappearTimer--;
        if (this.disappearTimer === 0) {
          this.visible = false;
          this.reappearTimer = 120;
        }
      }

      if (this.reappearTimer > 0) {
        this.reappearTimer--;
        if (this.reappearTimer === 0) {
          this.visible = true;
        }
      }
    }
  }

  startDisappearing() {
    if (this.type === platformTypes.TEMPORARY && this.disappearTimer === 0 && this.reappearTimer === 0) {
      this.disappearTimer = 180;
    }
  }

  show() {
    if (!this.visible) return;
    
    let platformImage;
    
    switch (this.type) {
      case platformTypes.NORMAL:
        platformImage = platformNormal;
        break;
      case platformTypes.TEMPORARY:
        platformImage = platformTemporary;
        break;
      case platformTypes.SLIPPERY:
        platformImage = platformSlippery;
        break;
      case platformTypes.TELEPORT:
        platformImage = platformTeleport;
        break;
      case platformTypes.FINAL:
          platformImage = platformFinal;
        break;
    }
    
    if (this.type === platformTypes.TEMPORARY && this.disappearTimer > 0) {
      tint(255, map(this.disappearTimer, 0, 300, 50, 255));
    }

    image(platformImage, this.x, this.y, this.width, this.height);

    if (this.type === platformTypes.FINAL) {
      let trophySize = 80;
      image(trophyImage, 
            this.x + (this.width - trophySize) / 2, 
            this.y - trophySize - 10, 
            trophySize, 
            trophySize);
    }
  }
}