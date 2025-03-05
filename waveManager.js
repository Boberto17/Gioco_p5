import { Enemy } from './enemy.js';

export function startWave(waves, currentWave, enemies, path) {
  if (currentWave < waves.length) {
    let wave = waves[currentWave];
    console.log(`Inizio ondata ${currentWave + 1} con ${wave.enemies.length} gruppi di nemici`);
    for (let enemyGroup of wave.enemies) {
      for (let i = 0; i < enemyGroup.count; i++) {
        setTimeout(() => {
          enemies.push(new Enemy(path[0].x, path[0].y, enemyGroup.type));
          console.log(`Nemico generato: ${enemyGroup.type}`);
        }, i * 2000); // Genera un nemico ogni 2 secondi (puoi regolare questo valore)
      }
    }
  }
}

export function nextLevel(currentLevel, levels, startGame, gameState) {
  currentLevel++;
  if (currentLevel < levels.length) {
    startGame();
  } else {
    gameState = 'gameover';
  }
}