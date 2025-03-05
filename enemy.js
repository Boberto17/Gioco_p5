export class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.speed = this.getSpeedByType(type);
    this.health = this.getHealthByType(type);
    this.reward = this.getRewardByType(type);
    this.pathIndex = 0;
    this.slowFactor = 1; // Fattore di rallentamento
    this.isFlying = type === 'flying'; // Nemici volanti ignorano alcuni ostacoli
  }

  getSpeedByType(type) {
    switch (type) {
      case 'base':
        return 1;
      case 'fast':
        return 2;
      case 'armored':
        return 0.5;
      case 'flying':
        return 1.5;
      case 'boss':
        return 0.8; // Boss più lenti ma resistenti
      default:
        return 1;
    }
  }

  getHealthByType(type) {
    switch (type) {
      case 'base':
        return 50;
      case 'fast':
        return 30;
      case 'armored':
        return 100;
      case 'flying':
        return 40;
      case 'boss':
        return 200; // Boss con molta vita
      default:
        return 50;
    }
  }

  getRewardByType(type) {
    switch (type) {
      case 'base':
        return 10;
      case 'fast':
        return 15;
      case 'armored':
        return 20;
      case 'flying':
        return 25;
      case 'boss':
        return 50; // Boss danno più ricompense
      default:
        return 10;
    }
  }

  display() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, 15, 15);
  }

  update(path) {
    if (this.pathIndex < path.length - 1) {
      let target = path[this.pathIndex + 1];
      let dx = target.x - this.x;
      let dy = target.y - this.y;
      let distance = sqrt(dx * dx + dy * dy);

      if (distance > 1) {
        this.x += (dx / distance) * this.speed * this.slowFactor;
        this.y += (dy / distance) * this.speed * this.slowFactor;
      } else {
        this.pathIndex++;
      }
    }
  }

  takeDamage(damage) {
    this.health -= damage;
  }

  isDead() {
    return this.health <= 0;
  }

  reachedEnd(path) {
    return this.pathIndex >= path.length - 1;
  }

  slow(factor) {
    this.slowFactor = factor; // Rallenta il nemico
  }
}