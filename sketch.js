let skyBackground;
let player;
let platforms = [];
let gravity = 0.5;
let gameOver = false;
let score = 0;
let highScore = 0;
let cameraPosY = 0;
let gameState = "MENU"; // Stati possibili: MENU, PLAYING, RULES, GAME_OVER
let lastClickedButton = null; // Definita correttamente nel contesto globale
let slimeIdle;
let slimeWalk;
let slimeJump;

function preload() {
  slimeIdle = loadImage('assets/slimeCamminata.gif');
  slimeWalk = loadImage('assets/slimeCamminata.gif');
  slimeJump = loadImage('assets/slimeSalto.gif');
  skyBackground = loadImage('assets/sky_background.jpg');
}

// Aggiungi variabili per il controllo del movimento
let keys = {
  left: false,
  right: false,
  up: false,
  down: false,
  space: false // Aggiunti per tracciare il tasto spazio
};

let moveSpeed = 5; // Velocità di movimento del giocatore

// Variabili per l'indicatore di salto
let jumpCharging = false;
let jumpPower = 0;
let maxJumpPower = 20;
let jumpChargeRate = 0.25; // MODIFICATO: Ridotto il tasso di carica per un controllo più preciso
let jumpDirection = { x: 0, y: -1 }; // Direzione predefinita verso l'alto

let platformTypes = {
  NORMAL: 0,
  TEMPORARY: 1,
  SLIPPERY: 2
};

function setup() {
  createCanvas(800, 600);
  textFont('Arial');
  prepareGame(); // Prepara il gioco senza iniziare subito
}

function prepareGame() {
  player = new Player(width / 2, height - 100);
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
    generatePlatform(height - 150 - i * 150);
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
      drawMenu();
      break;
    case "PLAYING":
      drawGameplay();
      break;
    case "RULES":
      drawRules();
      break;
    case "GAME_OVER":
      drawGameOver();
      break;
  }
}

function drawMenu() {
  // Schermata di menu principale
  image(skyBackground, 0, 0, width, height);
  
  // Titolo
  fill(255);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("Slime adventure", width / 2, height / 4);
  
  // Pulsanti
  drawButton("GIOCA", width / 2, height / 2, function() {
    startGame();
  });
  
  drawButton("REGOLE", width / 2, height / 2 + 80, function() {
    gameState = "RULES";
  });
  
  drawButton("ESCI", width / 2, height / 2 + 160, function() {
    // In un browser, non possiamo veramente "uscire", ma possiamo mostrare un messaggio
    alert("Grazie per aver giocato! Chiudi questa finestra per uscire.");
  });
  
  textAlign(LEFT, BASELINE);
}

function drawRules() {
  // Schermata delle regole
  background(80, 150, 255);
  
  fill(255);
  textSize(40);
  textAlign(CENTER, TOP);
  text("REGOLE DEL GIOCO", width / 2, 50);
  
  textSize(20);
  textAlign(LEFT);
  
  let rulesX = width / 5;
  let rulesY = 120;
  
  text("Come giocare:", rulesX, rulesY);
  text("- Premi SPAZIO per saltare quando sei su una piattaforma", rulesX, rulesY + 40);
  text("- Tieni premuto SPAZIO per caricare un salto più potente", rulesX, rulesY + 70);
  text("- Muoviti con W, A, S, D o le FRECCE DIREZIONALI", rulesX, rulesY + 100);
  text("- Salta in direzioni diverse tenendo premuto un tasto direzionale", rulesX, rulesY + 130);
  text("- In alternativa, clicca e tieni premuto con il mouse per determinare", rulesX, rulesY + 160);
  text("  la direzione e la potenza del salto", rulesX, rulesY + 190);
  text("- Segui la freccia che indica direzione e potenza del salto", rulesX, rulesY + 220);
  text("- Sali il più in alto possibile senza cadere fuori dallo schermo", rulesX, rulesY + 250);
  
  text("Tipi di piattaforme:", rulesX, rulesY + 300);
  
  fill(100, 200, 100);
  rect(rulesX, rulesY + 330, 20, 20);
  fill(255);
  text("  Verde: Piattaforme normali", rulesX + 30, rulesY + 347);
  
  fill(200, 200, 100);
  rect(rulesX, rulesY + 360, 20, 20);
  fill(255);
  text("  Gialla: Piattaforme temporanee (scompaiono dopo che ci stai sopra)", rulesX + 30, rulesY + 377);
  
  fill(100, 200, 255);
  rect(rulesX, rulesY + 390, 20, 20);
  fill(255);
  text("  Azzurra: Piattaforme scivolose (minor attrito)", rulesX + 30, rulesY + 407);
  
  // Pulsante per tornare al menu
  drawButton("TORNA AL MENU", width / 2, height - 80, function() {
    gameState = "MENU";
  });
  
  textAlign(LEFT, BASELINE);
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
      generatePlatform(player.y - 300);
    }
    
    // MODIFICATO: Gestisci il caricamento del salto con spazio
    if (keys.space && player.grounded && !jumpCharging) {
      jumpCharging = true;
      jumpPower = 0;
    }
    
    // MODIFICATO: Aggiorna la potenza del salto se stiamo caricando
    if (jumpCharging && keys.space) {
      jumpPower = min(jumpPower + jumpChargeRate, maxJumpPower);
      
      // Aggiorna la direzione del salto in base ai tasti premuti
      updateJumpDirection();
    }
    
    // AGGIUNTO: Esegui il salto quando il tasto spazio viene rilasciato
    if (jumpCharging && !keys.space && player.grounded) {
      executeJump();
    }
    
    // Aggiorna e mostra il giocatore
    player.update();
    player.show();
    
    // Disegna l'indicatore di salto se stiamo caricando
    if (jumpCharging && player.grounded) {
      drawJumpIndicator();
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

function drawJumpIndicator() {
  // Calcola la lunghezza dell'indicatore in base alla potenza del salto
  let arrowLength = map(jumpPower, 0, maxJumpPower, 20, 80);
  
  // Punto di partenza dell'indicatore (al centro del giocatore)
  let startX = player.x + player.width / 2;
  let startY = player.y + player.height / 2;
  
  // Punto finale dell'indicatore (in base alla direzione e lunghezza)
  let endX = startX + jumpDirection.x * arrowLength;
  let endY = startY + jumpDirection.y * arrowLength;
  
  // Disegna l'asta della freccia
  strokeWeight(5);
  
  // Colore graduale da verde a rosso in base alla potenza
  let r = map(jumpPower, 0, maxJumpPower, 0, 255);
  let g = map(jumpPower, 0, maxJumpPower, 255, 0);
  stroke(r, g, 0);
  line(startX, startY, endX, endY);
  
  // Disegna la punta della freccia
  noStroke();
  fill(r, g, 0);
  push();
  translate(endX, endY);
  rotate(atan2(jumpDirection.y, jumpDirection.x));
  triangle(0, 0, -10, 5, -10, -5);
  pop();
  
  // Reimposta lo stile per il resto del disegno
  strokeWeight(1);
  stroke(0);
}

function drawGameOver() {
  // Schermata di Game Over
  background(0, 0, 0, 150);
  fill(255);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("GAME OVER", width / 2, height / 2 - 50);
  textSize(32);
  text("Score: " + score, width / 2, height / 2 + 20);
  text("High Score: " + highScore, width / 2, height / 2 + 60);
  
  drawButton("RIPROVA", width / 2, height / 2 + 130, function() {
    prepareGame();
    startGame();
  });
  
  drawButton("MENU PRINCIPALE", width / 2, height / 2 + 200, function() {
    gameState = "MENU";
  });
  
  textAlign(LEFT, BASELINE);
}

function drawButton(label, x, y, callback) {
  // Disegna un pulsante interattivo
  let buttonWidth = 250;
  let buttonHeight = 60;
  
  // Verifica se il mouse è sopra il pulsante
  let isHovering = mouseX > x - buttonWidth/2 && mouseX < x + buttonWidth/2 && 
                  mouseY > y - buttonHeight/2 && mouseY < y + buttonHeight/2;
  
  // Cambia il colore se il mouse è sopra
  if (isHovering) {
    fill(80, 130, 230);
    if (mouseIsPressed) {
      // Salva il callback per eseguirlo quando il mouse viene rilasciato
      lastClickedButton = callback;
    }
  } else {
    fill(60, 100, 200);
  }
  
  // Disegna il pulsante
  rect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 10);
  
  // Testo del pulsante
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text(label, x, y);
}

function mouseReleased() {
  // Esegui il callback dell'ultimo pulsante cliccato
  if (lastClickedButton) {
    lastClickedButton();
    lastClickedButton = null;
  }
  
  // MODIFICATO: Esegui il salto quando il mouse viene rilasciato (se stiamo caricando)
  if (jumpCharging && player.grounded && gameState === "PLAYING") {
    executeJump();
  }
}

function keyPressed() {
  // Gestisci i tasti direzionali e WASD
  if (keyCode === 65 || keyCode === LEFT_ARROW) { // A o freccia sinistra
    keys.left = true;
  } else if (keyCode === 68 || keyCode === RIGHT_ARROW) { // D o freccia destra
    keys.right = true;
  } else if (keyCode === 87 || keyCode === UP_ARROW) { // W o freccia su
    keys.up = true;
  } else if (keyCode === 83 || keyCode === DOWN_ARROW) { // S o freccia giù
    keys.down = true;
  } else if (keyCode === 32) { // Spazio
    keys.space = true;
    
    if (gameState === "MENU") {
      startGame();
    } else if (gameState === "GAME_OVER") {
      prepareGame();
      startGame();
    }
  } else if (keyCode === 27) { // ESC
    if (gameState === "PLAYING") {
      gameState = "MENU";
    }
  }
}

function keyReleased() {
  // Resetta le variabili di movimento quando i tasti vengono rilasciati
  if (keyCode === 65 || keyCode === LEFT_ARROW) { // A o freccia sinistra
    keys.left = false;
  } else if (keyCode === 68 || keyCode === RIGHT_ARROW) { // D o freccia destra
    keys.right = false;
  } else if (keyCode === 87 || keyCode === UP_ARROW) { // W o freccia su
    keys.up = false;
  } else if (keyCode === 83 || keyCode === DOWN_ARROW) { // S o freccia giù
    keys.down = false;
  } else if (keyCode === 32) { // Spazio
    keys.space = false;
    
    // MODIFICATO: Esegui il salto quando il tasto spazio viene rilasciato (se stiamo caricando)
    if (jumpCharging && player.grounded && gameState === "PLAYING") {
      executeJump();
    }
  }
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

function generatePlatform(y) {
  let platformWidth = random(80, 200);
  let platformX = random(0, width - platformWidth);
  
  // Aumenta la difficoltà in base all'altezza
  let difficulty = constrain(-y / 1000, 0, 1);
  
  // Scegli il tipo di piattaforma in base alla difficoltà
  let type;
  let r = random();
  
  if (r < 0.2 + difficulty * 0.3) {
    type = platformTypes.TEMPORARY;
  } else if (r < 0.4 + difficulty * 0.4) {
    type = platformTypes.SLIPPERY;
  } else {
    type = platformTypes.NORMAL;
  }
  
  platforms.push(new Platform(platformX, y, platformWidth, 20, type));
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.minY = y; // Tiene traccia dell'altezza massima raggiunta
    this.width = 75;
    this.height = 100;
    this.vx = 0;
    this.vy = 0;
    this.isJumping = false;
    this.grounded = false;
    this.onSlippery = false;
    this.lastPlatform = null; // Memorizza l'ultima piattaforma con cui è entrato in contatto
    this.direction = 1; // 1 = destra, -1 = sinistra (per l'aspetto visivo)
    this.jumpCooldown = 0; // Aggiunto per evitare doppi salti accidentali
    this.currentState = "idle"; // Stato attuale dell'animazione
    this.animationTimer = 0; // Timer per prevenire cambi di animazione troppo frequenti
  }
  
  update() {
    // Aggiorna il cooldown del salto
    if (this.jumpCooldown > 0) {
      this.jumpCooldown--;
    }
    
    // Aggiorna il timer dell'animazione
    this.animationTimer = max(0, this.animationTimer - 1);
    
    // Memorizza la posizione precedente per un rilevamento migliore delle collisioni
    let prevY = this.y;
    
    // Gestisci il movimento orizzontale quando il giocatore è a terra e non sta caricando un salto
    if (this.grounded && !jumpCharging) {
      if (keys.left) {
        this.vx = -moveSpeed;
        this.direction = -1;
      } else if (keys.right) {
        this.vx = moveSpeed;
        this.direction = 1;
      }
    }
    
    // Aggiorna la posizione
    this.x += this.vx;
    this.y += this.vy;
    
    // Applica la gravità se non è a terra
    if (!this.grounded) {
      this.vy += gravity;
    } else {
      this.vy = 0;
    }
    
    // Attrito per le piattaforme normali
    if (this.grounded && !this.onSlippery) {
      this.vx *= 0.8;
    } 
    // Attrito ridotto per le piattaforme scivolose
    else if (this.grounded && this.onSlippery) {
      this.vx *= 0.98;
    }
    
    // Rimbalza dai bordi
    if (this.x < 0) {
      this.x = 0;
      this.vx *= -0.5;
    } else if (this.x > width - this.width) {
      this.x = width - this.width;
      this.vx *= -0.5;
    }
    
    // Resetta lo stato di grounded e onSlippery per ogni frame
    let wasGrounded = this.grounded;
    this.grounded = false;
    this.onSlippery = false;
    
    // Controlla le collisioni con le piattaforme
    for (let platform of platforms) {
      if (this.collidesWith(platform)) {
        // Verifica che stiamo cadendo sulla piattaforma (velocità verticale positiva)
        if (this.vy > 0) {
          // Controlla se il fondo del giocatore era sopra la piattaforma nel frame precedente
          if (prevY + this.height <= platform.y + 10) { // Aumentato margine di tolleranza
            this.y = platform.y - this.height;
            this.vy = 0; // Assicurati che la velocità verticale sia azzerata
            this.grounded = true;
            this.lastPlatform = platform;
            
            // Se siamo appena atterrati, cambia lo stato dell'animazione
            if (!wasGrounded) {
              this.updateAnimationState("idle");
            }
            
            // Gestisci i diversi tipi di piattaforma
            if (platform.type === platformTypes.SLIPPERY) {
              this.onSlippery = true;
            } else if (platform.type === platformTypes.TEMPORARY) {
              platform.startDisappearing();
            }
            
            break; // Esci dal ciclo dopo aver gestito la collisione
          }
        }
      }
    }
    
    // Mantieni il giocatore sulla piattaforma attuale se è a terra
    if (this.grounded && this.lastPlatform && this.lastPlatform.visible) {
      // Verifica che il giocatore sia effettivamente sopra la piattaforma
      if (this.x + this.width > this.lastPlatform.x && 
          this.x < this.lastPlatform.x + this.lastPlatform.width) {
        this.y = this.lastPlatform.y - this.height;
      } else {
        // Se il giocatore scivola fuori dalla piattaforma, rimuovi lo stato di grounded
        this.grounded = false;
      }
    }
    
    // Se la piattaforma scompare, il giocatore non è più a terra
    if (this.lastPlatform && !this.lastPlatform.visible) {
      this.grounded = false;
    }
    
    // Aggiorna l'altezza massima raggiunta
    if (this.y < this.minY) {
      this.minY = this.y;
    }
    
    // Aggiorna lo stato dell'animazione
    this.updateAnimationState();
  }
  
  // Nuovo metodo per gestire lo stato dell'animazione
  updateAnimationState(forcedState = null) {
    let newState = forcedState;
    
    if (!newState) {
      if (!this.grounded) {
        newState = "jump";
      } else if (abs(this.vx) > 1.0) { // Usa una soglia di velocità più alta
        newState = "walk";
      } else {
        newState = "idle";
      }
    }
    
    // Cambia stato solo se è diverso dall'attuale e il timer è a 0
    // Questo evita cambi troppo frequenti che causano sfarfallio
    if (newState !== this.currentState && this.animationTimer === 0) {
      this.currentState = newState;
      this.animationTimer = 5; // Aspetta 5 frame prima di consentire un altro cambio
    }
  }
  
  // Metodo per il salto semplice (mantenuto per retrocompatibilità)
  jump() {
    if (this.grounded && this.jumpCooldown === 0) {
      // Salto base
      let jumpVx = 0;
      let jumpVy = -15;
      
      // Modifica la direzione del salto in base ai tasti premuti
      if (keys.left) {
        jumpVx = -8;
        jumpVy = -13;
      } else if (keys.right) {
        jumpVx = 8;
        jumpVy = -13;
      }
      
      // Modifica l'altezza del salto in base ai tasti su/giù
      if (keys.up) {
        jumpVy = -18; // Salto più alto
      } else if (keys.down) {
        jumpVy = -10; // Salto più basso
      }
      
      // Salta in diagonale
      if ((keys.left || keys.right) && (keys.up || keys.down)) {
        // Normalizza la potenza del salto per diagonale
        let magnitude = Math.sqrt(jumpVx*jumpVx + jumpVy*jumpVy);
        let normalizedMag = 16; // Forza totale del salto
        jumpVx = (jumpVx / magnitude) * normalizedMag;
        jumpVy = (jumpVy / magnitude) * normalizedMag;
      }
      
      this.vx = jumpVx;
      this.vy = jumpVy;
      this.grounded = false;
      this.jumpCooldown = 10; // Aggiungi un cooldown per evitare doppi salti accidentali
      
      // Imposta lo stato dell'animazione a "jump"
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
    
    // Seleziona l'animazione in base allo stato corrente
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
    // Draw the slime image with proper orientation
    if (this.direction > 0) {
      // Looking right (default orientation)
      image(currentAnimation, this.x, this.y, this.width, this.height);
    } else {
      // Looking left (flip the image)
      push();
      translate(this.x + this.width, this.y);
      scale(-1, 1);
      image(currentAnimation, 0, 0, this.width, this.height);
      pop();
    }
    pop();
  }
}

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
    // Per le piattaforme temporanee
    if (this.type === platformTypes.TEMPORARY) {
      if (this.disappearTimer > 0) {
        this.disappearTimer--;
        if (this.disappearTimer === 0) {
          this.visible = false;
          this.reappearTimer = 120; // Riappare dopo 2 secondi
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
      this.disappearTimer = 30; // Scompare dopo mezzo secondo
    }
  }
  
  show() {
    if (!this.visible) return;
    
    switch (this.type) {
      case platformTypes.NORMAL:
        fill(100, 200, 100);
        break;
      case platformTypes.TEMPORARY:
        // Lampeggia se sta per scomparire
        if (this.disappearTimer > 0) {
          let alpha = map(this.disappearTimer, 0, 30, 50, 255);
          fill(200, 200, 100, alpha);
        } else {
          fill(200, 200, 100);
        }
        break;
      case platformTypes.SLIPPERY:
        fill(100, 200, 255);
        break;
    }
    
    rect(this.x, this.y, this.width, this.height);
  }
}