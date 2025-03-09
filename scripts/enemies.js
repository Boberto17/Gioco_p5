// enemies.js - Definisce i nemici e il loro comportamento

export class Enemy {
    constructor(type, path, gameState) {
        this.type = type;
        this.path = path;
        this.pathIndex = 0;
        this.progress = 0; // Progresso tra due punti del percorso (0-1)
        this.active = true;
        this.effects = [];
        this.gameState = gameState;
        
        // Imposta la posizione iniziale
        const startPoint = path[0];
        this.x = startPoint.x * gameState.map.tileSize + gameState.map.tileSize / 2;
        this.y = startPoint.y * gameState.map.tileSize + gameState.map.tileSize / 2;
        
        // Imposta le proprietà in base al tipo
        this.setEnemyProperties();
    }
    
    setEnemyProperties() {
        switch (this.type) {
            case 'basic':
                this.name = 'Nemico Base';
                this.maxHealth = 100;
                this.health = this.maxHealth;
                this.speed = 1;
                this.reward = 10;
                this.size = 12;
                this.color = '#aa3333';
                break;
            case 'fast':
                this.name = 'Nemico Veloce';
                this.maxHealth = 60;
                this.health = this.maxHealth;
                this.speed = 2;
                this.reward = 15;
                this.size = 8;
                this.color = '#33aa33';
                break;
            case 'armored':
                this.name = 'Nemico Corazzato';
                this.maxHealth = 250;
                this.health = this.maxHealth;
                this.speed = 0.6;
                this.reward = 25;
                this.size = 15;
                this.color = '#666666';
                break;
            case 'flying':
                this.name = 'Nemico Volante';
                this.maxHealth = 80;
                this.health = this.maxHealth;
                this.speed = 1.2;
                this.reward = 20;
                this.size = 10;
                this.color = '#aaaaff';
                this.flying = true;
                break;
            case 'boss':
                this.name = 'Boss';
                this.maxHealth = 800;
                this.health = this.maxHealth;
                this.speed = 0.5;
                this.reward = 100;
                this.size = 20;
                this.color = '#990000';
                break;
        }
    }
    
    // Applica danno al nemico
    takeDamage(amount) {
        this.health -= amount;
        
        // Controlla se il nemico è morto
        if (this.health <= 0) {
            this.health = 0;
            this.die();
            return true;
        }
        
        return false;
    }
    
    // Gestisce la morte del nemico
    die() {
        if (!this.active) return;
        
        this.active = false;
        this.gameState.gold += this.reward;
        this.gameState.enemiesKilled++;
    }
    
    // Applica un effetto al nemico
    applyEffect(effect) {
        // Per effetti che non si sovrappongono, rimuovi gli stessi tipi esistenti
        if (effect.type === 'slow') {
            this.effects = this.effects.filter(e => e.type !== 'slow');
        }
        
        // Aggiungi un nuovo effetto con timestamp
        const newEffect = {
            ...effect,
            startTime: Date.now(),
            lastTick: Date.now()
        };
        
        this.effects.push(newEffect);
    }
    
    // Aggiorna gli effetti applicati
    updateEffects() {
        const currentTime = Date.now();
        let speedModifier = 1;
        
        // Controlla tutti gli effetti e applica-li
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            
            // Rimuovi effetti scaduti
            if (currentTime - effect.startTime > effect.duration) {
                this.effects.splice(i, 1);
                continue;
            }
            
            // Applica gli effetti in base al tipo
            switch (effect.type) {
                case 'dot': // Danno nel tempo
                    if (currentTime - effect.lastTick >= effect.interval) {
                        this.takeDamage(effect.damage);
                        effect.lastTick = currentTime;
                    }
                    break;
                case 'slow': // Rallentamento
                    speedModifier *= effect.slowFactor;
                    break;
            }
        }
        
        return speedModifier;
    }
    
    // Aggiorna la posizione del nemico
    update() {
        if (!this.active) return;
        
        // Aggiorna gli effetti e ottieni il modificatore di velocità
        const speedModifier = this.updateEffects();
        
        // Muovi il nemico lungo il percorso
        const currentPoint = this.path[this.pathIndex];
        const nextPoint = this.path[this.pathIndex + 1];
        
        // Se abbiamo raggiunto la fine del percorso
        if (!nextPoint) {
            this.active = false;
            this.gameState.lives -= 1;
            return;
        }
        
        // Converti le coordinate della griglia in coordinate reali
        const currentX = currentPoint.x * this.gameState.map.tileSize + this.gameState.map.tileSize / 2;
        const currentY = currentPoint.y * this.gameState.map.tileSize + this.gameState.map.tileSize / 2;
        const nextX = nextPoint.x * this.gameState.map.tileSize + this.gameState.map.tileSize / 2;
        const nextY = nextPoint.y * this.gameState.map.tileSize + this.gameState.map.tileSize / 2;
        
        // Calcola la direzione e distanza
        const dx = nextX - currentX;
        const dy = nextY - currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Aumenta il progresso in base alla velocità
        this.progress += (this.speed * speedModifier) / distance;
        
        // Se abbiamo raggiunto il prossimo punto del percorso
        if (this.progress >= 1) {
            this.pathIndex++;
            this.progress = 0;
        } else {
            // Altrimenti, interpola la posizione tra i due punti
            this.x = currentX + dx * this.progress;
            this.y = currentY + dy * this.progress;
        }
    }
    
    // Disegna il nemico
    draw(ctx) {
        if (!this.active) return;
        
        // Disegna il corpo del nemico
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Disegna contorno
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.stroke();
        
        // Disegna la barra della vita
        this.drawHealthBar(ctx);
        
        // Disegna indicatori di effetti attivi
        this.drawEffects(ctx);
    }
    
    // Disegna la barra della vita
    drawHealthBar(ctx) {
        const barWidth = this.size * 2;
        const barHeight = 4;
        const healthPercentage = this.health / this.maxHealth;
        
        // Background della barra
        ctx.fillStyle = '#444444';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 10, barWidth, barHeight);
        
        // Parte attiva della barra (verde-giallo-rosso in base alla salute)
        let barColor;
        if (healthPercentage > 0.6) {
            barColor = '#00cc00';
        } else if (healthPercentage > 0.3) {
            barColor = '#cccc00';
        } else {
            barColor = '#cc0000';
        }
        
        ctx.fillStyle = barColor;
        ctx.fillRect(
            this.x - barWidth / 2,
            this.y - this.size - 10,
            barWidth * healthPercentage,
            barHeight
        );
    }
    
    // Disegna indicatori per gli effetti attivi
    drawEffects(ctx) {
        let iconOffset = 0;
        
        for (const effect of this.effects) {
            switch (effect.type) {
                case 'dot':
                    // Fiamma per danno nel tempo
                    ctx.fillStyle = '#ff6600';
                    ctx.beginPath();
                    ctx.arc(this.x + this.size + 5 + iconOffset, this.y - this.size, 4, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'slow':
                    // Fiocco di neve per rallentamento
                    ctx.fillStyle = '#99ccff';
                    ctx.beginPath();
                    ctx.arc(this.x + this.size + 5 + iconOffset, this.y - this.size, 4, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
            iconOffset += 8;
        }
    }
}

export class WaveManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentWave = 0;
        this.waveInProgress = false;
        this.enemiesSpawned = 0;
        this.enemiesTotal = 0;
        this.lastSpawnTime = 0;
        this.waveDelay = 10000; // 10 secondi di attesa tra le ondate
        this.spawnInterval = 1000; // Intervallo base di spawn dei nemici
        this.waveStartTime = 0;
        this.waveCompleteTime = 0;
        this.maxWaves = 10; // Numero totale di ondate
    }
    
    // Ottieni la composizione della prossima ondata
    getNextWaveComposition() {
        const wave = this.currentWave + 1;
        let composition = [];
        
        if (wave <= this.maxWaves) {
            // Definizione progressiva della difficoltà delle ondate
            switch (this.gameState.difficulty) {
                case 'easy':
                    composition = this.getEasyWaveComposition(wave);
                    break;
                case 'medium':
                    composition = this.getMediumWaveComposition(wave);
                    break;
                case 'hard':
                    composition = this.getHardWaveComposition(wave);
                    break;
            }
        }
        
        return composition;
    }
    
    // Composizione delle ondate per il livello facile
    getEasyWaveComposition(wave) {
        let composition = [];
        
        if (wave === 1) {
            // Prima ondata: solo nemici base
            composition = [
                { type: 'basic', count: 8 }
            ];
        } else if (wave === 2) {
            // Seconda ondata: nemici base e alcuni veloci
            composition = [
                { type: 'basic', count: 6 },
                { type: 'fast', count: 3 }
            ];
        } else if (wave === 3) {
            // Terza ondata: più nemici base e veloci
            composition = [
                { type: 'basic', count: 8 },
                { type: 'fast', count: 5 }
            ];
        } else if (wave === 4) {
            // Quarta ondata: introduce nemici corazzati
            composition = [
                { type: 'basic', count: 6 },
                { type: 'fast', count: 4 },
                { type: 'armored', count: 2 }
            ];
        } else if (wave === 5) {
            // Quinta ondata: introduce nemici volanti
            composition = [
                { type: 'basic', count: 5 },
                { type: 'fast', count: 5 },
                { type: 'armored', count: 3 },
                { type: 'flying', count: 3 }
            ];
        } else if (wave >= 6 && wave < 10) {
            // Ondate 6-9: mix di tutti i nemici con difficoltà crescente
            composition = [
                { type: 'basic', count: 4 + wave },
                { type: 'fast', count: 3 + Math.floor(wave/2) },
                { type: 'armored', count: 2 + Math.floor(wave/3) },
                { type: 'flying', count: 1 + Math.floor(wave/2) }
            ];
        } else if (wave === 10) {
            // Ondata finale: include un boss
            composition = [
                { type: 'basic', count: 6 },
                { type: 'fast', count: 5 },
                { type: 'armored', count: 4 },
                { type: 'flying', count: 4 },
                { type: 'boss', count: 1 }
            ];
        }
        
        return composition;
    }
    
    // Composizione delle ondate per il livello medio
    getMediumWaveComposition(wave) {
        let composition = [];
        
        if (wave === 1) {
            // Prima ondata: nemici base e qualche veloce
            composition = [
                { type: 'basic', count: 8 },
                { type: 'fast', count: 4 }
            ];
        } else if (wave === 2) {
            // Seconda ondata: mix di nemici base e veloci
            composition = [
                { type: 'basic', count: 6 },
                { type: 'fast', count: 6 }
            ];
        } else if (wave === 3) {
            // Terza ondata: introduce nemici corazzati
            composition = [
                { type: 'basic', count: 8 },
                { type: 'fast', count: 6 },
                { type: 'armored', count: 3 }
            ];
        } else if (wave === 4) {
            // Quarta ondata: mix di tutti i tipi
            composition = [
                { type: 'basic', count: 7 },
                { type: 'fast', count: 5 },
                { type: 'armored', count: 4 },
                { type: 'flying', count: 4 }
            ];
        } else if (wave === 5) {
            // Quinta ondata: maggiore difficoltà
            composition = [
                { type: 'basic', count: 10 },
                { type: 'fast', count: 8 },
                { type: 'armored', count: 6 },
                { type: 'flying', count: 5 }
            ];
        } else if (wave >= 6 && wave < 10) {
            // Ondate 6-9: difficoltà crescente
            composition = [
                { type: 'basic', count: 8 + wave },
                { type: 'fast', count: 6 + Math.floor(wave/2) },
                { type: 'armored', count: 4 + Math.floor(wave/2) },
                { type: 'flying', count: 3 + Math.floor(wave/2) }
            ];
        } else if (wave === 10) {
            // Ondata finale: due boss e molti nemici
            composition = [
                { type: 'basic', count: 10 },
                { type: 'fast', count: 8 },
                { type: 'armored', count: 6 },
                { type: 'flying', count: 6 },
                { type: 'boss', count: 2 }
            ];
        }
        
        return composition;
    }
    
    // Composizione delle ondate per il livello difficile
    getHardWaveComposition(wave) {
        let composition = [];
        
        if (wave === 1) {
            // Prima ondata: già più impegnativa
            composition = [
                { type: 'basic', count: 10 },
                { type: 'fast', count: 6 }
            ];
        } else if (wave === 2) {
            // Seconda ondata: introduce già i corazzati
            composition = [
                { type: 'basic', count: 8 },
                { type: 'fast', count: 8 },
                { type: 'armored', count: 3 }
            ];
        } else if (wave === 3) {
            // Terza ondata: tutti i tipi di nemici
            composition = [
                { type: 'basic', count: 10 },
                { type: 'fast', count: 8 },
                { type: 'armored', count: 5 },
                { type: 'flying', count: 5 }
            ];
        } else if (wave === 4) {
            // Quarta ondata: alta difficoltà
            composition = [
                { type: 'basic', count: 12 },
                { type: 'fast', count: 10 },
                { type: 'armored', count: 6 },
                { type: 'flying', count: 6 }
            ];
        } else if (wave === 5) {
            // Quinta ondata: mini-boss
            composition = [
                { type: 'basic', count: 8 },
                { type: 'fast', count: 8 },
                { type: 'armored', count: 5 },
                { type: 'flying', count: 5 },
                { type: 'boss', count: 1 }
            ];
        } else if (wave >= 6 && wave < 10) {
            // Ondate 6-9: difficoltà elevata e crescente
            composition = [
                { type: 'basic', count: 10 + wave },
                { type: 'fast', count: 8 + Math.floor(wave/2) },
                { type: 'armored', count: 6 + Math.floor(wave/2) },
                { type: 'flying', count: 5 + Math.floor(wave/2) }
            ];
            
            // Aggiungi un boss ogni due ondate
            if (wave % 2 === 0) {
                composition.push({ type: 'boss', count: 1 });
            }
        } else if (wave === 10) {
            // Ondata finale: tre boss e orda di nemici
            composition = [
                { type: 'basic', count: 15 },
                { type: 'fast', count: 12 },
                { type: 'armored', count: 10 },
                { type: 'flying', count: 10 },
                { type: 'boss', count: 3 }
            ];
        }
        
        return composition;
    }
    
    // Avvia una nuova ondata
    startWave() {
        if (this.waveInProgress) return false;
        
        this.currentWave++;
        const waveComposition = this.getNextWaveComposition();
        
        if (waveComposition.length === 0) {
            // Nessuna composizione disponibile, il gioco è stato completato
            this.gameState.gameCompleted = true;
            return false;
        }
        
        // Calcola il numero totale di nemici
        this.enemiesTotal = waveComposition.reduce((total, group) => total + group.count, 0);
        this.enemiesSpawned = 0;
        this.waveInProgress = true;
        this.waveStartTime = Date.now();
        
        // Aggiorna l'interfaccia con le informazioni sull'ondata
        this.gameState.waveInfo = {
            current: this.currentWave,
            max: this.maxWaves,
            composition: waveComposition,
            total: this.enemiesTotal
        };
        
        return true;
    }
    
    // Aggiorna lo stato delle ondate
    update() {
        const currentTime = Date.now();
        
        // Se non c'è un'ondata in corso e il tempo di attesa è trascorso, avvia una nuova ondata
        if (!this.waveInProgress && this.currentWave < this.maxWaves) {
            if (this.currentWave === 0 || currentTime - this.waveCompleteTime >= this.waveDelay) {
                this.startWave();
            }
        }
        
        // Se c'è un'ondata in corso, gestisci lo spawn dei nemici
        if (this.waveInProgress) {
            this.spawnEnemies(currentTime);
            
            // Controlla se l'ondata è completa
            this.checkWaveCompletion();
        }
    }
    
    // Genera i nemici durante un'ondata
    spawnEnemies(currentTime) {
        // Se abbiamo già spawned tutti i nemici, non fare nulla
        if (this.enemiesSpawned >= this.enemiesTotal) return;
        
        // Controlla se è il momento di spawnare un nuovo nemico
        if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
            // Ottieni la composizione dell'ondata corrente
            const waveComposition = this.getNextWaveComposition();
            
            // Determina il tipo di nemico da spawnare in base all'ordine relativo
            let enemyTypeToSpawn = null;
            let enemyCountRemaining = 0;
            
            // Calcola quanti nemici di ogni tipo devono ancora essere spawnati
            const remainingByType = {};
            let totalRemaining = this.enemiesTotal - this.enemiesSpawned;
            
            for (const group of waveComposition) {
                // Calcola quanti nemici di questo tipo sono già stati spawnati
                const alreadySpawned = this.gameState.enemies.filter(e => e.type === group.type).length;
                const remaining = Math.max(0, group.count - alreadySpawned);
                
                remainingByType[group.type] = remaining;
                
                // Se rimangono nemici di questo tipo e non abbiamo ancora scelto un tipo
                if (remaining > 0 && enemyTypeToSpawn === null) {
                    enemyTypeToSpawn = group.type;
                    enemyCountRemaining = remaining;
                }
            }
            
            // Se abbiamo trovato un tipo di nemico da spawnare
            if (enemyTypeToSpawn) {
                // Crea un nuovo nemico
                const newEnemy = new Enemy(
                    enemyTypeToSpawn, 
                    this.gameState.map.paths[0], // Usa il primo percorso disponibile
                    this.gameState
                );
                
                // Aggiungi il nemico all'array dei nemici
                this.gameState.enemies.push(newEnemy);
                
                // Aggiorna i contatori
                this.enemiesSpawned++;
                this.lastSpawnTime = currentTime;
                
                // Regola l'intervallo di spawn in base al progresso dell'ondata
                const progress = this.enemiesSpawned / this.enemiesTotal;
                
                // Aumenta la frequenza di spawn verso la fine dell'ondata
                if (progress > 0.7) {
                    this.spawnInterval = 800;
                } else if (progress > 0.4) {
                    this.spawnInterval = 900;
                } else {
                    this.spawnInterval = 1000;
                }
                
                // Boss spawnano più lentamente
                if (enemyTypeToSpawn === 'boss') {
                    this.spawnInterval = 3000;
                }
            }
        }
    }
    
    // Controlla se l'ondata corrente è completata
    checkWaveCompletion() {
        // Se tutti i nemici sono stati spawnati e nessuno è ancora attivo
        if (this.enemiesSpawned >= this.enemiesTotal && this.gameState.enemies.every(e => !e.active)) {
            this.waveInProgress = false;
            this.waveCompleteTime = Date.now();
            
            // Ricompensa per il completamento dell'ondata
            this.gameState.gold += 50 + (this.currentWave * 10);
            
            // Se era l'ultima ondata, imposta il gioco come completato
            if (this.currentWave >= this.maxWaves) {
                this.gameState.gameCompleted = true;
            }
            
            return true;
        }
        
        return false;
    }
    
    // Ottieni le informazioni sullo stato dell'ondata corrente
    getWaveStatus() {
        let timeUntilNextWave = 0;
        
        if (!this.waveInProgress && this.currentWave < this.maxWaves) {
            timeUntilNextWave = Math.max(0, this.waveDelay - (Date.now() - this.waveCompleteTime));
        }
        
        return {
            currentWave: this.currentWave,
            maxWaves: this.maxWaves,
            inProgress: this.waveInProgress,
            enemiesSpawned: this.enemiesSpawned,
            enemiesTotal: this.enemiesTotal,
            enemiesRemaining: this.gameState.enemies.filter(e => e.active).length,
            timeUntilNextWave: timeUntilNextWave
        };
    }
}