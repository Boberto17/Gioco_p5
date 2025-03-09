// Gestione degli input dell'utente
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
      
      // Esegui il salto quando il tasto spazio viene rilasciato (se stiamo caricando)
      if (jumpCharging && player.grounded && gameState === "PLAYING") {
        executeJump();
      }
    }
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
      lastClickedButton = null;
    }
    
    // Esegui il salto quando il mouse viene rilasciato (se stiamo caricando)
    if (jumpCharging && player.grounded && gameState === "PLAYING") {
      executeJump();
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