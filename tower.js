export class Tower {
  constructor(x, y, range, damage, fireRate, cost) {
    this.x = x;
    this.y = y;
    this.range = range;
    this.damage = damage;
    this.fireRate = fireRate;
    this.lastShot = 0;
    this.cost = cost;
    this.level = 1;
    this.isTemporary = false; // Torre temporanea
  }

  display() {
    fill(100);
    ellipse(this.x, this.y, 20, 20);
  }

  update(enemies) {
    for (let enemy of enemies) {
      if (dist(this.x, this.y, enemy.x, enemy.y) < this.range) {
        if (millis() - this.lastShot > this.fireRate) {
          this.shoot(enemy);
          this.lastShot = millis();
        }
      }
    }
  }

  shoot(enemy) {
    enemy.takeDamage(this.damage);
  }

  upgrade() {
    this.level++;
    this.damage *= 1.5; // Aumenta il danno del 50%
    this.range *= 1.2; // Aumenta il raggio del 20%
    this.fireRate *= 0.9; // Riduce il tempo tra gli attacchi del 10%
  }

  showRange() {
    noFill();
    stroke(255, 0, 0);
    ellipse(this.x, this.y, this.range * 2, this.range * 2);
  }

  isMouseOver() {
    return dist(mouseX, mouseY, this.x, this.y) < 20; // Controlla se il mouse è sopra la torre
  }

  move(newX, newY) {
    if (this.isTemporary) {
      this.x = newX;
      this.y = newY;
    }
  }
}

// Tipi di torri specializzate
export class FireTower extends Tower {
  constructor(x, y) {
    super(x, y, 80, 15, 1500, 50); // Raggio, danno, velocità di attacco, costo
  }

  display() {
    fill(255, 0, 0); // Colore rosso per la torre di fuoco
    ellipse(this.x, this.y, 20, 20);
  }
}

export class IceTower extends Tower {
  constructor(x, y) {
    super(x, y, 100, 5, 2000, 60); // Raggio, danno, velocità di attacco, costo
  }

  display() {
    fill(0, 0, 255); // Colore blu per la torre di ghiaccio
    ellipse(this.x, this.y, 20, 20);
  }

  shoot(enemy) {
    super.shoot(enemy);
    enemy.slow(0.5); // Rallenta il nemico del 50%
  }
}

export class SniperTower extends Tower {
  constructor(x, y) {
    super(x, y, 200, 50, 3000, 100); // Raggio, danno, velocità di attacco, costo
  }

  display() {
    fill(0, 255, 0); // Colore verde per la torre cecchino
    ellipse(this.x, this.y, 20, 20);
  }
}