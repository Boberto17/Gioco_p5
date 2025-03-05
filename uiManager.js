import { selectedTowerType } from './gameManager.js';
import { FireTower, IceTower, SniperTower } from './tower.js';

export function drawUI(gold, lives, currentWave, currentLevel, score) {
  fill(0);
  textSize(16);
  text(`Oro: ${gold}`, 10, 20);
  text(`Vite: ${lives}`, 10, 40);
  text(`Ondata: ${currentWave + 1}`, 10, 60);
  text(`Livello: ${currentLevel + 1}`, 10, 80);
  text(`Punteggio: ${score}`, 10, 100);

  // Pulsanti per selezionare le torri
  const towerTypes = [
    { type: FireTower, color: [255, 0, 0], name: "Fuoco", y: 10 },
    { type: IceTower, color: [0, 0, 255], name: "Ghiaccio", y: 50 },
    { type: SniperTower, color: [0, 255, 0], name: "Cecchino", y: 90 }
  ];

  towerTypes.forEach((tower, index) => {
    if (selectedTowerType.current === tower.type) {
      fill(tower.color[0], tower.color[1], tower.color[2]);
    } else {
      fill(200);
    }
    rect(700, tower.y, 80, 30);
    fill(0);
    text(tower.name, 710, tower.y + 20);
  });
}

export function drawButton(x, y, w, h, label, onClick) {
  let isHovering = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;

  if (isHovering) {
    fill(150);
    document.body.style.cursor = 'pointer';
    
    if (mouseIsPressed) {
      fill(100);
      onClick();
    }
  } else {
    fill(200);
    document.body.style.cursor = 'default';
  }

  rect(x, y, w, h);
  
  fill(0);
  textSize(20);
  text(label, x + w / 2 - 30, y + h / 2 + 10);
}

export function drawMenuScreen(startGame, selectLevel) {
  background(220);
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Tower Defense Game", width / 2, height / 2 - 100);

  // Pulsante Gioca
  drawButton(width / 2 - 75, height / 2 - 50, 150, 50, "Gioca", () => {
    window.gameState = 'playing';
    startGame();
  });

  // Pulsante Livelli
  drawButton(width / 2 - 75, height / 2 + 20, 150, 50, "Livelli", () => {
    selectLevel();
  });

  // Pulsante Regole
  drawButton(width / 2 - 75, height / 2 + 90, 150, 50, "Regole", () => {
    window.gameState = 'rules';
  });

  // Pulsante Comandi
  drawButton(width / 2 - 75, height / 2 + 160, 150, 50, "Comandi", () => {
    window.gameState = 'controls';
  });

  // Pulsante Esci
  drawButton(width / 2 - 75, height / 2 + 230, 150, 50, "Esci", () => {
    if (confirm("Sei sicuro di voler uscire?")) {
      window.close();
    }
  });
}