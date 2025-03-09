// towers.js - Definisce le torri difensive e le loro proprietà

export class Tower {
    constructor(x, y, type, game) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.game = game;
        this.target = null;
        this.lastShot = 0;
        this.level = 1;
        this.kills = 0;
        
        // Proprietà di base in base al tipo
        this.setTowerProperties();
    }
    
    setTowerProperties() {
        switch (this.type) {
            case 'base':
                this.name = 'Torre Base';
                this.damage = 10;
                this.range = 120;
                this.fireRate = 1000; // ms
                this.cost = 20;
                this.color = '#888888';
                this.projectileColor = '#dddddd';
                this.projectileSpeed = 6;
                this.projectileSize = 4;
                this.effect = null;
                break;
            case 'fire':
                this.name = 'Torre di Fuoco';
                this.damage = 5;
                this.range = 100;
                this.fireRate = 1200;
                this.cost = 40;
                this.color = '#cc3300';
                this.projectileColor = '#ff6600';
                this.projectileSpeed = 5;
                this.projectileSize = 5;
                this.effect = {
                    type: 'dot',
                    damage: 2,
                    duration: 3000,
                    interval: 500
                };
                this.areaEffect = true;
                this.areaRadius = 30;
                break;
            case 'ice':
                this.name = 'Torre di Ghiaccio';
                this.damage = 7;
                this.range = 110;
                this.fireRate = 1500;
                this.cost = 35;
                this.color = '#66ccff';
                this.projectileColor = '#99eeff';
                this.projectileSpeed = 4;
                this.projectileSize = 5;
                this.effect = {
                    type: 'slow',
                    slowFactor: 0.5,
                    duration: 2000
                };
                break;
            case 'electric':
                this.name = 'Torre Elettrica';
                this.damage = 8;
                this.range = 90;
                this.fireRate = 1800;
                this.cost = 45;
                this.color = '#ffcc00';
                this.projectileColor = '#ffff00';
                this.projectileSpeed = 8;
                this.projectileSize = 3;
                this.chainTargets = 3;
                this.chainRange = 60;
                this.chainDamageFactor = 0.7;
                break;
            case 'sniper':
                this.name = 'Torre Cecchino';
                this.damage = 25;
                this.range = 200;
                this.fireRate = 2000;
                this.cost = 50;
                this.color = '#336699';
                this.projectileColor = '#3399ff';
                this.projectileSpeed = 12;
                this.projectileSize = 3;
                break;
        }
        
        // Crea un'array di proiettili
        this.projectiles = [];
    }
    
    // Calcola il costo di upgrade
    getUpgradeCost() {
        return Math.floor(this.cost * 0.8 * this.level);
    }
    
    // Potenzia la torre
    upgrade() {
        this.level++;
        this.damage = Math.floor(this.damage * 1.3);
        this.range += 10;
        this.fireRate = Math.max(this.fireRate * 0.9, 300);
        
        // Effetti speciali migliorati per tipo
        switch (this.type) {
            case 'fire':
                if (this.effect) {
                    this.effect.damage += 1;
                    this.effect.duration += 500;
                }
                this.areaRadius += 5;
                break;
            case 'ice':
                if (this.effect) {
                    this.effect.slowFactor = Math.max(this.effect.slowFactor - 0.1, 0.2);
                    this.effect.duration += 500;
                }
                break;
            case 'electric':
                this.chainTargets += 1;
                this.chainRange += 10;
                break;
        }
    }
    
    // Trova il nemico più avanzato nel range
    findTarget(enemies) {
        this.target = null;
        
        // Trova il nemico più avanzato nel percorso che è nel range
        let highestProgress = -1;
        
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            
            // Calcola la distanza
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Se il nemico è nel range e ha un progresso maggiore nel percorso
            if (distance <= this.range && enemy.pathIndex > highestProgress) {
                this.target = enemy;
                highestProgress = enemy.pathIndex;
            }
        }
        
        return this.target;
    }
    
    // Spara un proiettile
    shoot() {
        const currentTime = Date.now();
        
        // Controlla se può sparare
        if (currentTime - this.lastShot < this.fireRate || !this.target) {
            return;
        }
        
        // Registra il tempo dell'ultimo sparo
        this.lastShot = currentTime;
        
        // Crea un nuovo proiettile
        const projectile = {
            x: this.x,
            y: this.y,
            targetEnemy: this.target,
            speed: this.projectileSpeed,
            damage: this.damage,
            color: this.projectileColor,
            size: this.projectileSize,
            effect: this.effect ? {...this.effect} : null,
            type: this.type,
            hit: false
        };
        
        // Se è una torre elettrica, aggiungi informazioni per la catena
        if (this.type === 'electric') {
            projectile.chainTargets = this.chainTargets;
            projectile.chainRange = this.chainRange;
            projectile.chainDamageFactor = this.chainDamageFactor;
            projectile.hitEnemies = [];
        }
        
        // Se è una torre di fuoco, aggiungi informazioni per l'area
        if (this.type === 'fire' && this.areaEffect) {
            projectile.areaRadius = this.areaRadius;
        }
        
        this.projectiles.push(projectile);
    }
    
    // Aggiorna la posizione dei proiettili e gestisce gli impatti
    updateProjectiles(enemies) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            
            // Se il nemico target è morto, rimuovi il proiettile
            if (!p.targetEnemy.active) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            // Calcola direzione verso il target
            const dx = p.targetEnemy.x - p.x;
            const dy = p.targetEnemy.y - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Normalizza e moltiplica per velocità
            if (distance > 0) {
                p.x += (dx / distance) * p.speed;
                p.y += (dy / distance) * p.speed;
            }
            
            // Controlla collisione con il target
            if (distance < p.targetEnemy.size + p.size && !p.hit) {
                p.hit = true;
                
                // Applica danno
                const killed = p.targetEnemy.takeDamage(p.damage);
                if (killed) {
                    this.kills++;
                    this.game.score += 10 * this.game.difficultyMultiplier;
                }
                
                // Applica effetto
                if (p.effect) {
                    p.targetEnemy.applyEffect(p.effect);
                }
                
                // Gestisci effetti speciali
                if (p.type === 'fire' && p.areaRadius) {
                    // Danno ad area per la torre di fuoco
                    this.applyAreaDamage(p.targetEnemy.x, p.targetEnemy.y, p.areaRadius, p.damage / 2, p.effect, enemies);
                } else if (p.type === 'electric' && p.chainTargets > 0) {
                    // Attacco a catena per la torre elettrica
                    this.applyChainDamage(p.targetEnemy, p.damage * p.chainDamageFactor, p.chainRange, p.chainTargets, [p.targetEnemy], p.effect, enemies);
                }
                
                // Rimuovi il proiettile
                this.projectiles.splice(i, 1);
            }
            
            // Rimuovi proiettili fuori portata
            if (distance > this.range * 2) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    // Applica danno ad area
    applyAreaDamage(centerX, centerY, radius, damage, effect, enemies) {
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            
            // Calcola distanza
            const dx = enemy.x - centerX;
            const dy = enemy.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Se il nemico è nell'area di effetto
            if (distance <= radius) {
                const killed = enemy.takeDamage(damage);
                if (killed) {
                    this.kills++;
                    this.game.score += 5 * this.game.difficultyMultiplier;
                }
                
                // Applica effetto
                if (effect) {
                    enemy.applyEffect({...effect});
                }
            }
        }
    }
    
    // Applica danno a catena
    applyChainDamage(sourceEnemy, damage, range, remainingTargets, hitEnemies, effect, enemies) {
        if (remainingTargets <= 0) return;
        
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        // Trova il nemico più vicino che non è già stato colpito
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            
            // Salta se è lo stesso nemico o è già stato colpito
            if (enemy === sourceEnemy || hitEnemies.includes(enemy)) {
                continue;
            }
            
            // Calcola distanza
            const dx = enemy.x - sourceEnemy.x;
            const dy = enemy.y - sourceEnemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Se il nemico è nel range e più vicino di quelli trovati finora
            if (distance <= range && distance < closestDistance) {
                closestEnemy = enemy;
                closestDistance = distance;
            }
        }
        
        // Se abbiamo trovato un nemico, applica danno e continua la catena
        if (closestEnemy) {
            const killed = closestEnemy.takeDamage(damage);
            if (killed) {
                this.kills++;
                this.game.score += 3 * this.game.difficultyMultiplier;
            }
            
            // Applica effetto
            if (effect) {
                closestEnemy.applyEffect({...effect});
            }
            
            // Aggiunge questo nemico alla lista dei nemici colpiti
            hitEnemies.push(closestEnemy);
            
            // Continua la catena con il danno ridotto
            this.applyChainDamage(closestEnemy, damage * 0.7, range, remainingTargets - 1, hitEnemies, effect, enemies);
        }
    }
    
    // Disegna la torre
    draw(ctx, uiCtx) {
        // Disegna base della torre
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Disegna contorno
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
        ctx.stroke();
        
        // Disegna cannone che punta verso il target
        let angle = 0;
        if (this.target) {
            angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        }
        
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(angle) * 20, this.y + Math.sin(angle) * 20);
        ctx.stroke();
        
        // Disegna indicatore di livello
        if (this.level > 1) {
            ctx.fillStyle = '#ffff00';
            for (let i = 0; i < this.level - 1; i++) {
                const starSize = 6;
                const starX = this.x - 10 + (i * 10);
                const starY = this.y - 20;
                
                ctx.beginPath();
                ctx.moveTo(starX, starY - starSize);
                for (let j = 0; j < 5; j++) {
                    const angle = j * Math.PI * 2 / 5 - Math.PI / 2;
                    const radius = (j % 2 === 0) ? starSize : starSize / 2;
                    ctx.lineTo(
                        starX + radius * Math.cos(angle),
                        starY + radius * Math.sin(angle)
                    );
                }
                ctx.closePath();
                ctx.fill();
            }
        }
        
        // Disegna proiettili
        for (let i = 0; i < this.projectiles.length; i++) {
            const p = this.projectiles[i];
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Disegna il raggio d'azione
    drawRange(uiCtx) {
        uiCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        uiCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        uiCtx.lineWidth = 1;
        uiCtx.beginPath();
        uiCtx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        uiCtx.fill();
        uiCtx.stroke();
    }
    
    // Aggiorna lo stato della torre
    update(enemies) {
        // Trova un target
        this.findTarget(enemies);
        
        // Spara se ha un target
        if (this.target) {
            this.shoot();
        }
        
        // Aggiorna i proiettili
        this.updateProjectiles(enemies);
    }
}