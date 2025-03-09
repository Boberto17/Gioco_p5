// Funzioni di utilità varie

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