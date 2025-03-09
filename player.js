import { keys } from './controls.js';

const moveSpeed = 5; // Velocità di movimento del giocatore

class Player {
  constructor(x, y, idleAnimation, walkAnimation, jumpAnimation) {
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
    
    // Animazioni
    this.animations = {
      idle: idleAnimation,
      walk: walkAnimation,
      jump: jumpAnimation
    };
  }
  
  update(platforms, gravity) {
    // Aggiorna il cooldown del salto
    if (this.jumpCooldown > 0) {
      this.jumpCooldown--;
    }
    
    // Aggiorna il timer dell'animazione
    this.animationTimer = max(0, this.animationTimer - 1);
    
    // Memorizza la posizione precedente per un rilevamento migliore delle collisioni
    let prevY = this.y;
    
    // Gestisci il movimento orizzontale quando il giocatore è a terra e non sta caricando un salto
    if (this.grounded && !this.isJumping) {
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
            if (platform.type === 2) { // SLIPPERY
              this.onSlippery = true;
            } else if (platform.type === 1) { // TEMPORARY
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
  
  // Metodo per gestire lo stato dell'animazione
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
        currentAnimation = this.animations.jump;
        break;
      case "walk":
        currentAnimation = this.animations.walk;
        break;
      case "idle":
      default:
        currentAnimation = this.animations.idle;
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

export { Player };