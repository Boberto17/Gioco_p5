// Funzione per disegnare lo stato di menu
function drawMenu(skyBackground, width, height, drawButton, startGameCallback) {
    // Schermata di menu principale
    image(skyBackground, 0, 0, width, height);
    
    // Titolo
    fill(255);
    textSize(64);
    textAlign(CENTER, CENTER);
    text("Slime adventure", width / 2, height / 4);
    
    // Pulsanti
    drawButton("GIOCA", width / 2, height / 2, function() {
      startGameCallback();
    });
    
    drawButton("REGOLE", width / 2, height / 2 + 80, function() {
      changeGameState("RULES");
    });
    
    drawButton("ESCI", width / 2, height / 2 + 160, function() {
      // In un browser, non possiamo veramente "uscire", ma possiamo mostrare un messaggio
      alert("Grazie per aver giocato! Chiudi questa finestra per uscire.");
    });
    
    textAlign(LEFT, BASELINE);
  }
  
  // Funzione per disegnare lo stato delle regole
  function drawRules(width, height, drawButton) {
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
      changeGameState("MENU");
    });
    
    textAlign(LEFT, BASELINE);
  }
  
  // Funzione per disegnare lo stato di game over
  function drawGameOver(width, height, score, highScore, drawButton, prepareGameCallback, startGameCallback) {
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
      prepareGameCallback();
      startGameCallback();
    });
    
    drawButton("MENU PRINCIPALE", width / 2, height / 2 + 200, function() {
      changeGameState("MENU");
    });
    
    textAlign(LEFT, BASELINE);
  }
  
  // Funzione per cambiare lo stato del gioco
  function changeGameState(newState) {
    window.gameState = newState;
  }
  
  export { drawMenu, drawRules, drawGameOver, changeGameState };