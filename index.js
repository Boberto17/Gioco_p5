import { Tower, FireTower, IceTower, SniperTower } from './Tower.js';
import { Enemy } from './Enemy.js';
import { generateRandomPath } from './path.js';

let map;
let towers = [];
let enemies = [];
let levels = [
  {
    waves: [
      { enemies: [{ type: 'base', count: 10 }] },
      { enemies: [{ type: 'base', count: 15 }, { type: 'fast', count: 5 }] },
      { enemies: [{ type: 'base', count: 20 }, { type: 'armored', count: 3 }] },
      { enemies: [{ type: 'base', count: 25 }, { type: 'flying', count: 5 }] },
    ],
    difficulty: 'easy'
  },
  {
    waves: [
      { enemies: [{ type: 'base', count: 15 }, { type: 'fast', count: 10 }] },
      { enemies: [{ type: 'base', count: 20 }, { type: 'armored', count: 5 }] },
      { enemies: [{ type: 'base', count: 25 }, { type: 'flying', count: 10 }] },
    ],
    difficulty: 'medium'
  },
  {
    waves: [
      { enemies: [{ type: 'base', count: 20 }, { type: 'fast', count: 15 }] },
      { enemies: [{ type: 'base', count: 25 }, { type: 'armored', count: 10 }] },
      { enemies: [{ type: 'base', count: 30 }, { type: 'flying', count: 15 }] },
    ],
    difficulty: 'hard'
  }
];

let currentLevel = 0;
let gold = 100;
let lives = 20;
let currentWave = 0;
let waveTimer = 0;
let waveInterval = 3000; // 3 secondi tra le ondate
let selectedTowerType = null; // Tipo di torre selezionata
let tileSize = 40; // Dimensione di ogni cella della mappa
let gameState = 'menu'; // Possibili stati: 'menu', 'playing', 'pause', 'gameover', 'rules', 'controls'
let score = 0;

// Percorso dei nemici (generato casualmente)
let path = generateRandomPath(tileSize);

function setup() {
  createCanvas(800, 600);
  map = createMap();
}

function draw() {
  background(220);

  if (gameState === 'menu') {
    drawMenuScreen();
  } else if (gameState === 'playing') {
    drawGameScreen();
  } else if (gameState === 'pause') {
    drawPauseScreen();
  } else if (gameState === 'gameover') {
    drawGameOverScreen();
  } else if (gameState === 'rules') {
    drawRulesScreen();
  } else if (gameState === 'controls') {
    drawControlsScreen();
  }
}

function drawMenuScreen() {
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Tower Defense Game", width / 2, height / 2 - 100);

  // Pulsante Gioca
  drawButton(width / 2 - 75, height / 2 - 50, 150, 50, "Gioca", () => {
    gameState = 'playing';
    startGame();
  });

  // Pulsante Seleziona Livello
  drawButton(width / 2 - 75, height / 2 + 20, 150, 50, "Livelli", () => {
    selectLevel();
  });

  // Pulsante Regole
  drawButton(width / 2 - 75, height / 2 + 90, 150, 50, "Regole", () => {
    gameState = 'rules';
  });

  // Pulsante Comandi
  drawButton(width / 2 - 75, height / 2 + 160, 150, 50, "Comandi", () => {
    gameState = 'controls';
  });

  // Pulsante Esci
  drawButton(width / 2 - 75, height / 2 + 230, 150, 50, "Esci", () => {
    window.close(); // Chiudi la finestra (funziona solo in alcuni ambienti)
  });
}

let buttonClicked = false;

function drawButton(x, y, w, h, label, onClick) {
  if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
    fill(150); // Cambia colore quando il mouse è sopra il pulsante
    cursor(HAND);
    if (mouseIsPressed) {
      fill(100); // Cambia colore quando il pulsante viene cliccato
      buttonClicked = true;
      onClick();
    }
  } else {
    fill(200); // Colore normale del pulsante
    cursor(ARROW);
  }
  rect(x, y, w, h, 10);
  fill(0);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);

  if (buttonClicked) {
    setTimeout(() => {
      buttonClicked = false;
    }, 100); // Resetta lo stato del pulsante dopo 100ms
  }
}

function selectLevel() {
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Seleziona Livello", width / 2, height / 2 - 100);

  // Pulsante Livello Facile
  drawButton(width / 2 - 75, height / 2 - 50, 150, 50, "Facile", () => {
    currentLevel = 0;
    gameState = 'playing';
    startGame();
  });

  // Pulsante Livello Medio
  drawButton(width / 2 - 75, height / 2 + 20, 150, 50, "Medio", () => {
    currentLevel = 1;
    gameState = 'playing';
    startGame();
  });

  // Pulsante Livello Difficile
  drawButton(width / 2 - 75, height / 2 + 90, 150, 50, "Difficile", () => {
    currentLevel = 2;
    gameState = 'playing';
    startGame();
  });

  // Pulsante Torna al Menu
  drawButton(width / 2 - 75, height / 2 + 160, 150, 50, "Torna al Menu", () => {
    gameState = 'menu';
  });
}

function drawRulesScreen() {
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Regole del Gioco", width / 2, height / 2 - 150);

  textSize(16);
  text("Difendi la tua base costruendo torri e sconfiggendo i nemici!", width / 2, height / 2 - 100);
  text("Ogni nemico sconfitto ti dà oro per costruire nuove torri.", width / 2, height / 2 - 70);
  text("Se i nemici raggiungono la fine del percorso, perdi una vita.", width / 2, height / 2 - 40);
  text("Perdi tutte le vite e il gioco finisce.", width / 2, height / 2 - 10);
  text("Ci sono diversi tipi di nemici: base, veloci, corazzati e volanti.", width / 2, height / 2 + 20);
  text("Ci sono anche diversi tipi di torri: fuoco, ghiaccio e cecchino.", width / 2, height / 2 + 50);

  // Pulsante Torna al Menu
  drawButton(width / 2 - 75, height / 2 + 100, 150, 50, "Torna al Menu", () => {
    gameState = 'menu';
  });
}

function drawControlsScreen() {
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Comandi del Gioco", width / 2, height / 2 - 150);

  textSize(16);
  text("Clicca sui pulsanti per costruire torri.", width / 2, height / 2 - 100);
  text("Usa il mouse per selezionare e posizionare le torri.", width / 2, height / 2 - 70);
  text("Premi 'P' per mettere in pausa il gioco.", width / 2, height / 2 - 40);
  text("Premi 'R' per ricominciare dopo il Game Over.", width / 2, height / 2 - 10);
  text("Ogni torre ha un costo in oro.", width / 2, height / 2 + 20);
  text("Sconfiggi i nemici per guadagnare oro e punti.", width / 2, height / 2 + 50);

  // Pulsante Torna al Menu
  drawButton(width / 2 - 75, height / 2 + 100, 150, 50, "Torna al Menu", () => {
    gameState = 'menu';
  });
}

function drawPauseScreen() {
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Gioco in Pausa", width / 2, height / 2 - 50);
  textSize(24);
  text("Premi P per continuare", width / 2, height / 2);

  // Pulsante Riprendi
  drawButton(width / 2 - 75, height / 2 + 50, 150, 50, "Riprendi", () => {
    gameState = 'playing';
  });

  // Pulsante Torna al Menu
  drawButton(width / 2 - 75, height / 2 + 120, 150, 50, "Torna al Menu", () => {
    gameState = 'menu';
  });
}

function drawGameOverScreen() {
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2 - 50);
  textSize(24);
  text(`Punteggio: ${score}`, width / 2, height / 2);
  text("Premi R per ricominciare", width / 2, height / 2 + 50);

  // Pulsante Torna al Menu
  drawButton(width / 2 - 75, height / 2 + 100, 150, 50, "Torna al Menu", () => {
    gameState = 'menu';
  });
}

function keyPressed() {
  if (gameState === 'playing' && key === 'p') {
    gameState = 'pause';
  } else if (gameState === 'pause' && key === 'p') {
    gameState = 'playing';
  } else if (gameState === 'gameover' && key === 'r') {
    gameState = 'menu';
    resetGame();
  }
}

function startGame() {
  currentWave = 0;
  waveTimer = 0;
  gold = 100;
  lives = 20;
  score = 0;
  towers = [];
  enemies = [];
  waves = levels[currentLevel].waves;
  startWave();
}

function resetGame() {
  currentWave = 0;
  waveTimer = 0;
  gold = 100;
  lives = 20;
  score = 0;
  towers = [];
  enemies = [];
}

function drawGameScreen() {
  drawMap();

  // Gestione delle torri
  for (let tower of towers) {
    tower.display();
    tower.update(enemies);

    // Mostra il raggio d'azione se il mouse è sopra la torre
    if (tower.isMouseOver()) {
      tower.showRange();
    }
  }

  // Gestione dei nemici
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].display();
    enemies[i].update(path);

    if (enemies[i].isDead()) {
      gold += enemies[i].reward;
      score += enemies[i].reward;
      enemies.splice(i, 1);
    }

    if (enemies[i].reachedEnd(path)) {
      lives--;
      enemies.splice(i, 1);
    }
  }

  // Gestione delle ondate
  if (enemies.length === 0) {
    waveTimer += deltaTime;
    if (waveTimer > waveInterval) {
      currentWave++;
      if (currentWave < waves.length) {
        startWave();
      } else {
        nextLevel();
      }
      waveTimer = 0;
    }
  }

  // Controllo se il gioco è finito
  if (lives <= 0) {
    gameState = 'gameover';
  }

  // Interfaccia utente
  drawUI();
}

function createMap() {
  // Creiamo una mappa 20x15 (800x600 con tileSize 40)
  let map = [];
  for (let y = 0; y < 15; y++) {
    map[y] = [];
    for (let x = 0; x < 20; x++) {
      // Definisci il percorso e le aree edificabili
      if (y === 7 && x >= 2 && x <= 17) {
        map[y][x] = 1; // Percorso
      } else if (y >= 3 && y <= 11 && x >= 4 && x <= 15) {
        map[y][x] = 2; // Area edificabile
      } else {
        map[y][x] = 0; // Area non edificabile
      }
    }
  }
  return map;
}

function drawMap() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === 1) {
        fill(100); // Colore del percorso
      } else if (map[y][x] === 2) {
        fill(200); // Colore dell'area edificabile
      } else {
        fill(50); // Colore dell'area non edificabile
      }
      rect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

function drawUI() {
  fill(0);
  textSize(16);
  text(`Oro: ${gold}`, 10, 20);
  text(`Vite: ${lives}`, 10, 40);
  text(`Ondata: ${currentWave + 1}`, 10, 60);
  text(`Livello: ${currentLevel + 1}`, 10, 80);
  text(`Punteggio: ${score}`, 10, 100);

  // Pulsanti per selezionare le torri
  if (selectedTowerType === FireTower) {
    fill(255, 0, 0);
  } else {
    fill(200);
  }
  rect(700, 10, 80, 30);
  fill(0);
  text("Fuoco", 710, 30);

  if (selectedTowerType === IceTower) {
    fill(0, 0, 255);
  } else {
    fill(200);
  }
  rect(700, 50, 80, 30);
  fill(0);
  text("Ghiaccio", 710, 70);

  if (selectedTowerType === SniperTower) {
    fill(0, 255, 0);
  } else {
    fill(200);
  }
  rect(700, 90, 80, 30);
  fill(0);
  text("Cecchino", 710, 110);
}

function mousePressed() {
  // Posiziona una torre se è selezionata un tipo di torre
  if (selectedTowerType && gold >= selectedTowerType.cost) {
    let x = mouseX;
    let y = mouseY;
    if (isBuildable(x, y)) {
      let tower = new selectedTowerType(x, y);
      towers.push(tower);
      gold -= tower.cost;
      selectedTowerType = null; // Resetta la selezione
    }
  }
}

function isBuildable(x, y) {
  // Controlla se la posizione è edificabile
  let tileX = floor(x / tileSize);
  let tileY = floor(y / tileSize);
  return map[tileY][tileX] === 2; // 2 = area edificabile
}

function mouseClicked() {
  // Seleziona il tipo di torre
  if (mouseX > 700 && mouseX < 780) {
    if (mouseY > 10 && mouseY < 40) {
      selectedTowerType = FireTower;
    } else if (mouseY > 50 && mouseY < 80) {
      selectedTowerType = IceTower;
    } else if (mouseY > 90 && mouseY < 120) {
      selectedTowerType = SniperTower;
    }
  }
}

function startWave() {
  if (currentWave < waves.length) {
    let wave = waves[currentWave];
    for (let enemyGroup of wave.enemies) {
      for (let i = 0; i < enemyGroup.count; i++) {
        setTimeout(() => {
          enemies.push(new Enemy(path[0].x, path[0].y, enemyGroup.type));
        }, i * 1000); // Genera un nemico ogni secondo
      }
    }
  }
}

function nextLevel() {
  currentLevel++;
  if (currentLevel < levels.length) {
    startGame();
  } else {
    gameState = 'gameover';
  }
}