// index.js - File principale per il gioco Tower Defense

import { MapGenerator } from './mapGenerator.js';
import { Enemy, WaveManager } from './enemies.js';
import { Tower } from './towers.js';

// Inizializzazione del gioco
class Game {
    constructor() {
        // Setup del canvas
        this.canvas = document.getElementById('canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'canvas';
            this.canvas.width = 800;
            this.canvas.height = 600;
            document.body.appendChild(this.canvas);
        }

        this.ctx = this.canvas.getContext('2d');
        this.mapGenerator = new MapGenerator(this.canvas, this.ctx);

        // Inizializza il gestore delle ondate
        this.waveManager = new WaveManager(this);

        // Proprietà del gioco
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.money = 100;
        this.lives = 20;
        this.wave = 0;
        this.gameOver = false;
        this.selectedTower = null;
        this.towerCost = 50;
        this.score = 0;

        // Dati della mappa
        this.mapData = null;

        // Bind degli eventi
        this.bindEvents();

        // Inizia il gioco
        this.init();
    }

    // Inizializza il gioco
    init() {
        // Genera la mappa
        this.mapData = this.mapGenerator.generateMap();
        this.mapGenerator.drawMap();

        // Mostra interfaccia iniziale
        this.drawUI();

        // Inizia il ciclo di gioco
        this.gameLoop();
    }

    // Gestione eventi del mouse
    bindEvents() {
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Controlla se l'utente sta posizionando una torre
            if (this.money >= this.towerCost) {
                const gridPos = this.mapGenerator.pixelToGrid(x, y);

                if (this.mapGenerator.isBuildable(gridPos.x, gridPos.y)) {
                    // Posiziona una torre
                    const cellCenter = this.mapGenerator.getCellCenter(gridPos.x, gridPos.y);
                    this.placeTower(cellCenter.x, cellCenter.y);
                }
            }
        });

        // Pulsante per iniziare la prossima ondata
        document.getElementById('startWaveBtn')?.addEventListener('click', () => {
            if (!this.gameOver && this.enemies.length === 0) {
                this.startWave();
            }
        });
    }

    // Posiziona una torre nel punto specificato
    placeTower(x, y) {
        const tower = new Tower(x, y, 'base', this); // 'base' è il tipo di torre
        this.towers.push(tower);
        this.money -= this.towerCost;
        this.drawUI();
    }

    // Inizia una nuova ondata di nemici
    startWave() {
        this.wave++;
        this.waveManager.startWave();
    }

    // Ciclo principale del gioco
    gameLoop() {
        if (!this.gameOver) {
            this.update();
            this.render();
            requestAnimationFrame(() => this.gameLoop());
        } else {
            this.showGameOver();
        }
    }

    // Aggiornamento della logica di gioco
    update() {
        // Aggiorna i nemici
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update();

            // Se il nemico ha raggiunto la fine del percorso
            if (!enemy.active) {
                this.lives--;
                this.enemies.splice(i, 1);
                this.drawUI();
            }
        }

        // Aggiorna le torri
        for (const tower of this.towers) {
            tower.update(this.enemies);
        }

        // Controlla condizioni di fine gioco
        if (this.lives <= 0) {
            this.gameOver = true;
        }
    }

    // Rendering del gioco
    render() {
        // Ridisegna la mappa
        this.mapGenerator.drawMap();

        // Disegna i nemici
        for (const enemy of this.enemies) {
            enemy.draw(this.ctx);
        }

        // Disegna le torri
        for (const tower of this.towers) {
            tower.draw(this.ctx);
        }

        // Disegna i proiettili
        for (const projectile of this.projectiles) {
            projectile.draw(this.ctx);
        }

        // Aggiorna l'interfaccia utente
        this.drawUI();
    }

    // Disegna l'interfaccia utente
    drawUI() {
        // Sfondo per l'UI
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, 40);

        // Testo per denaro, vite e ondata
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Denaro: ${this.money}`, 10, 25);
        this.ctx.fillText(`Vite: ${this.lives}`, 150, 25);
        this.ctx.fillText(`Ondata: ${this.wave}`, 250, 25);
        this.ctx.fillText(`Punteggio: ${this.score}`, 350, 25);

        // Istruzioni
        if (this.wave === 0) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(this.canvas.width / 2 - 200, this.canvas.height / 2 - 100, 400, 200);

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Tower Defense', this.canvas.width / 2 - 80, this.canvas.height / 2 - 60);

            this.ctx.font = '16px Arial';
            this.ctx.fillText('Clicca sul terreno per posizionare le torri', this.canvas.width / 2 - 150, this.canvas.height / 2 - 20);
            this.ctx.fillText('Premi il pulsante "Inizia Ondata" per iniziare', this.canvas.width / 2 - 150, this.canvas.height / 2 + 10);
            this.ctx.fillText('Difendi la base dagli invasori!', this.canvas.width / 2 - 120, this.canvas.height / 2 + 40);
        }

        // Crea pulsante se non esiste
        if (!document.getElementById('startWaveBtn')) {
            const startBtn = document.createElement('button');
            startBtn.id = 'startWaveBtn';
            startBtn.innerText = 'Inizia Ondata';
            startBtn.style.position = 'absolute';
            startBtn.style.top = '50px';
            startBtn.style.left = '10px';
            document.body.appendChild(startBtn);
        }
    }

    // Mostra schermata di game over
    showGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '40px Arial';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2 - 120, this.canvas.height / 2 - 20);

        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Hai superato ${this.wave} ondate`, this.canvas.width / 2 - 100, this.canvas.height / 2 + 20);

        // Aggiungi pulsante per ricominciare
        const restartBtn = document.createElement('button');
        restartBtn.innerText = 'Ricomincia';
        restartBtn.style.position = 'absolute';
        restartBtn.style.top = this.canvas.height / 2 + 50 + 'px';
        restartBtn.style.left = this.canvas.width / 2 - 50 + 'px';
        restartBtn.addEventListener('click', () => {
            // Rimuovi i vecchi elementi
            document.getElementById('startWaveBtn')?.remove();
            restartBtn.remove();

            // Ricrea il gioco
            new Game();
        });
        document.body.appendChild(restartBtn);
    }
}

// Inizializza il gioco quando il documento è caricato
document.addEventListener('DOMContentLoaded', () => {
    // Aggiungi CSS base
    const style = document.createElement('style');
    style.textContent = `
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #222;
        }
        canvas {
            border: 2px solid #333;
        }
        button {
            padding: 8px 16px;
            background-color: #4a752c;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #5c8c36;
        }
    `;
    document.head.appendChild(style);

    // Inizia il gioco
    new Game();
});