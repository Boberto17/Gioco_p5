import { drawMenuScreen, drawUI, drawButton } from './uiManager.js';
import { startWave } from './waveManager.js';
import { Tower, FireTower, IceTower, SniperTower, ElectricTower } from './tower.js';
import { MapGenerator } from './mapGenerator.js';
import { Enemy } from './enemy.js';

window.gameState = 'menu';

let towers = [];
let enemies = [];
let waves = [
    {
        enemies: [
            { type: 'base', count: 5 },
            { type: 'fast', count: 3 }
        ]
    },
    {
        enemies: [
            { type: 'base', count: 7 },
            { type: 'armored', count: 2 }
        ]
    }
];
let currentLevel = 0;
let gold = 100;
let lives = 20;
let currentWave = 0;
let waveTimer = 0;
let tileSize = 40;
let score = 0;
let path;
let lastTime = 0;
let mapGenerator;
let isWaveActive = false;

export function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    
    mapGenerator = new MapGenerator(width, height);
    path = mapGenerator.generatePath();
    mapGenerator.generateObstacles();
    mapGenerator.generateBuildableAreas();
    
    lastTime = millis();
}

export function draw() {
    let currentTime = millis();
    let deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    background(220);

    if (window.gameState === 'menu') {
        drawMenuScreen(startGame, selectLevel);
    } else if (window.gameState === 'playing') {
        if (mapGenerator) {
            mapGenerator.drawMapElements();
        }
        
        drawGameScreen(deltaTime);
    } else if (window.gameState === 'pause') {
        drawPauseScreen();
    } else if (window.gameState === 'gameover') {
        drawGameOverScreen();
    } else if (window.gameState === 'rules') {
        drawRulesScreen();
    } else if (window.gameState === 'controls') {
        drawControlsScreen();
    }
}

const selectedTowerTypeManager = {
    current: null,
    setSelectedTower(towerType) {
        this.current = towerType;
    },
    getSelectedTower() {
        return this.current;
    }
};

export const selectedTowerType = selectedTowerTypeManager;

export function mousePressed() {
    if (window.gameState === 'playing') {
        if (mouseX > width - 100 && mouseX < width - 20) {
            if (mouseY > 10 && mouseY < 40) {
                selectedTowerTypeManager.setSelectedTower(FireTower);
            } else if (mouseY > 50 && mouseY < 80) {
                selectedTowerTypeManager.setSelectedTower(IceTower);
            } else if (mouseY > 90 && mouseY < 120) {
                selectedTowerTypeManager.setSelectedTower(SniperTower);
            } else if (mouseY > 130 && mouseY < 160) {
                selectedTowerTypeManager.setSelectedTower(ElectricTower);
            } else {
                handleTowerPlacement();
            }
        } else {
            handleTowerPlacement();
        }
    }
}

function handleTowerPlacement() {
    if (selectedTowerType.current && gold >= selectedTowerType.current.prototype.cost) {
        let newTower;
        switch(selectedTowerType.current) {
            case FireTower:
                newTower = new FireTower(mouseX, mouseY);
                break;
            case IceTower:
                newTower = new IceTower(mouseX, mouseY);
                break;
            case SniperTower:
                newTower = new SniperTower(mouseX, mouseY);
                break;
            case ElectricTower:
                newTower = new ElectricTower(mouseX, mouseY);
                break;
        }
        
        if (mapGenerator && mapGenerator.isBuildableCell(mouseX, mouseY)) {
            towers.push(newTower);
            gold -= newTower.cost;
        }
    }
}

export function keyPressed() {
    if (window.gameState === 'playing') {
        if (key === 'p' || key === 'P') {
            window.gameState = window.gameState === 'pause' ? 'playing' : 'pause';
        }
    }
}

function drawGameScreen(deltaTime) {
    for (let tower of towers) {
        tower.display();
        tower.update(enemies);
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        enemy.update(path);
        enemy.display();

        if (enemy.isDead()) {
            gold += enemy.reward;
            score += enemy.reward;
            enemies.splice(i, 1);
        }

        if (enemy.reachedEnd(path)) {
            lives--;
            enemies.splice(i, 1);
            
            if (lives <= 0) {
                window.gameState = 'gameover';
            }
        }
    }

    drawUI(gold, lives, currentWave, currentLevel, score);

    if (enemies.length === 0 && isWaveActive) {
        isWaveActive = false;
        drawButton(width / 2 - 75, height - 100, 150, 50, "Prossima Ondata", () => {
            isWaveActive = true;
            startWave(waves, currentWave, enemies, path);
            currentWave++;
            waveTimer = 0;
        });
    }
    
    if (!isWaveActive && enemies.length === 0) {
        waveTimer += deltaTime;
        if (waveTimer >= 3000) {
            isWaveActive = true;
            startWave(waves, currentWave, enemies, path);
            currentWave++;
            waveTimer = 0;
        }

        if (currentWave >= waves.length) {
            currentWave = 0;
            currentLevel++;
        }
    }
}

function drawPauseScreen() {
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("PAUSA", width / 2, height / 2);
}

function drawGameOverScreen() {
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);
    
    fill(255, 0, 0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 50);
    
    textSize(20);
    text(`Punteggio: ${score}`, width / 2, height / 2 + 50);
    
    drawButton(width / 2 - 75, height / 2 + 100, 150, 50, "Riprova", () => {
        window.gameState = 'playing';
        startGame();
    });
}

function drawRulesScreen() {
    background(220);
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Regole del Gioco", width/2, 50);
    
    textSize(18);
    textAlign(LEFT, TOP);
    let rulesText = [
        "1. Obiettivo: Difendi la base dai nemici",
        "2. Costruisci torri per fermare i nemici",
        "3. Ogni nemico sconfitto ti dà oro",
        "4. Quattro tipi di torri con caratteristiche diverse:",
        "   - Torre di Fuoco: Danno alto, attacco veloce",
        "   - Torre di Ghiaccio: Rallenta i nemici",
        "   - Torre Cecchino: Danno molto alto, attacco lento",
        "   - Torre Elettrica: Danno ad area",
        "5. Perdi una vita se un nemico raggiunge la fine",
        "6. Premi 'P' per mettere in pausa"
    ];
    
    for (let i = 0; i < rulesText.length; i++) {
        text(rulesText[i], 50, 100 + i * 35);
    }

    drawButton(width/2 - 75, height - 80, 150, 50, "Indietro", () => {
        window.gameState = 'menu';
    });
}

function drawControlsScreen() {
    background(220);
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Comandi", width/2, 50);
    
    textSize(18);
    textAlign(LEFT, TOP);
    let controlsText = [
        "Click sinistro: Posiziona torre",
        "Tasto 'P': Pausa / Riprendi",
        "Seleziona tipo di torre dal menu a destra",
        "Costruisci torri strategicamente per fermare i nemici"
    ];
    
    for (let i = 0; i < controlsText.length; i++) {
        text(controlsText[i], 50, 100 + i * 35);
    }

    drawButton(width/2 - 75, height - 80, 150, 50, "Indietro", () => {
        window.gameState = 'menu';
    });
}

function startGame() {
    towers = [];
    enemies = [];
    gold = 100;
    lives = 20;
    score = 0;
    currentWave = 0;
    path = mapGenerator.generatePath();
    mapGenerator.generateObstacles();
    mapGenerator.generateBuildableAreas();
}

function selectLevel() {
    window.gameState = 'playing';
    startGame();
}

export { 
    startGame, 
    selectLevel
};