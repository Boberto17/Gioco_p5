// mapGenerator.js - Gestisce la generazione della mappa di gioco

export class MapGenerator {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.tileSize = 40;
        this.grid = [];
        this.path = [];
        this.buildableAreas = [];
    }

    // Genera una mappa con un percorso per i nemici
    generateMap() {
        const width = Math.floor(this.canvas.width / this.tileSize);
        const height = Math.floor(this.canvas.height / this.tileSize);
        
        // Inizializza la griglia
        this.grid = [];
        for (let y = 0; y < height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < width; x++) {
                this.grid[y][x] = 0; // 0 = terreno edificabile
            }
        }
        
        // Crea un percorso semplice per i nemici
        this.path = this.createPath();
        
        // Segna il percorso sulla griglia
        for (let i = 0; i < this.path.length; i++) {
            const { x, y } = this.path[i];
            if (y >= 0 && y < height && x >= 0 && x < width) {
                this.grid[y][x] = 1; // 1 = percorso
            }
        }
        
        // Determina le aree edificabili (tutte le celle che non sono path)
        this.buildableAreas = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (this.grid[y][x] === 0) {
                    this.buildableAreas.push({ x, y });
                }
            }
        }
        
        return {
            grid: this.grid,
            path: this.path,
            buildableAreas: this.buildableAreas,
            startPoint: this.path[0],
            endPoint: this.path[this.path.length - 1]
        };
    }
    
    // Crea un percorso semplice per i nemici (forma a S)
    createPath() {
        const path = [];
        const width = Math.floor(this.canvas.width / this.tileSize);
        const height = Math.floor(this.canvas.height / this.tileSize);
        
        // Punto di partenza a sinistra
        const startX = 0;
        const startY = Math.floor(height / 2);
        
        // Aggiungi punto di partenza
        path.push({ x: startX, y: startY });
        
        // Primo tratto orizzontale
        for (let x = startX + 1; x < Math.floor(width * 0.3); x++) {
            path.push({ x, y: startY });
        }
        
        // Tratto curvo verso il basso
        const curveX1 = Math.floor(width * 0.3);
        for (let y = startY + 1; y < Math.floor(height * 0.7); y++) {
            path.push({ x: curveX1, y });
        }
        
        // Secondo tratto orizzontale (da sinistra a destra)
        const curveY1 = Math.floor(height * 0.7);
        for (let x = curveX1 + 1; x < Math.floor(width * 0.7); x++) {
            path.push({ x, y: curveY1 });
        }
        
        // Tratto curvo verso l'alto
        const curveX2 = Math.floor(width * 0.7);
        for (let y = curveY1 - 1; y >= Math.floor(height * 0.3); y--) {
            path.push({ x: curveX2, y });
        }
        
        // Terzo tratto orizzontale (fino alla fine)
        const curveY2 = Math.floor(height * 0.3);
        for (let x = curveX2 + 1; x < width; x++) {
            path.push({ x, y: curveY2 });
        }
        
        return path;
    }

    // Disegna la mappa su canvas
    drawMap() {
        const width = Math.floor(this.canvas.width / this.tileSize);
        const height = Math.floor(this.canvas.height / this.tileSize);
        
        // Disegna l'erba di sfondo
        this.ctx.fillStyle = '#4a752c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Disegna il percorso dei nemici
        this.ctx.fillStyle = '#a97d46'; // Colore del sentiero
        for (let i = 0; i < this.path.length; i++) {
            const { x, y } = this.path[i];
            this.ctx.fillRect(
                x * this.tileSize,
                y * this.tileSize,
                this.tileSize,
                this.tileSize
            );
        }
        
        // Disegna bordi del percorso
        this.ctx.strokeStyle = '#7d5c34';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < this.path.length; i++) {
            const { x, y } = this.path[i];
            this.ctx.strokeRect(
                x * this.tileSize,
                y * this.tileSize,
                this.tileSize,
                this.tileSize
            );
        }
        
        // Disegna punto di inizio e fine
        if (this.path.length > 0) {
            // Punto di inizio (freccia verde)
            const start = this.path[0];
            this.ctx.fillStyle = '#00aa00';
            this.ctx.beginPath();
            this.ctx.moveTo(start.x * this.tileSize, start.y * this.tileSize);
            this.ctx.lineTo(start.x * this.tileSize + this.tileSize, start.y * this.tileSize + this.tileSize / 2);
            this.ctx.lineTo(start.x * this.tileSize, start.y * this.tileSize + this.tileSize);
            this.ctx.fill();
            
            // Punto di fine (bandiera rossa)
            const end = this.path[this.path.length - 1];
            this.ctx.fillStyle = '#aa0000';
            this.ctx.fillRect(
                end.x * this.tileSize + this.tileSize / 2,
                end.y * this.tileSize,
                this.tileSize / 6,
                this.tileSize
            );
            this.ctx.fillStyle = '#ff0000';
            this.ctx.beginPath();
            this.ctx.moveTo(end.x * this.tileSize + this.tileSize / 2, end.y * this.tileSize);
            this.ctx.lineTo(end.x * this.tileSize + this.tileSize, end.y * this.tileSize + this.tileSize / 3);
            this.ctx.lineTo(end.x * this.tileSize + this.tileSize / 2, end.y * this.tileSize + this.tileSize / 2);
            this.ctx.fill();
        }
    }
    
    // Converte coordinate pixel in coordinate griglia
    pixelToGrid(x, y) {
        return {
            x: Math.floor(x / this.tileSize),
            y: Math.floor(y / this.tileSize)
        };
    }
    
    // Controlla se una posizione è edificabile
    isBuildable(x, y) {
        // Converti coordinate pixel in coordinate griglia se necessario
        if (x > this.tileSize || y > this.tileSize) {
            const pos = this.pixelToGrid(x, y);
            x = pos.x;
            y = pos.y;
        }
        
        // Controlla che le coordinate siano valide
        if (y < 0 || y >= this.grid.length || x < 0 || x >= this.grid[0].length) {
            return false;
        }
        
        return this.grid[y][x] === 0;
    }
    
    // Restituisce le coordinate del centro di una cella
    getCellCenter(x, y) {
        return {
            x: x * this.tileSize + this.tileSize / 2,
            y: y * this.tileSize + this.tileSize / 2
        };
    }
}