export class Tower {
  constructor(x, y, range, damage, fireRate, cost) {
    this.x = x;
    this.y = y;
    this.range = range;
    this.damage = damage;
    this.fireRate = fireRate;
    this.lastShot = 0;
    this.cost = cost;
  }

  update(enemies) {
    const targetEnemy = enemies.find(enemy => 
      dist(this.x, this.y, enemy.x, enemy.y) < this.range &&
      Date.now() - this.lastShot > this.fireRate
    );

    if (targetEnemy) {
      this.shoot(targetEnemy);
      this.lastShot = Date.now();
    }
  }

  shoot(enemy) {
    enemy.takeDamage(this.damage);
  }

  display() {
    fill(100);
    ellipse(this.x, this.y, 20, 20);
  }
}

export class FireTower extends Tower {
  constructor(x, y) {
    super(x, y, 80, 15, 1500, 50);
  }

  display() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, 20, 20);
  }
}

export class IceTower extends Tower {
  constructor(x, y) {
    super(x, y, 100, 5, 2000, 60);
  }

  display() {
    fill(0, 0, 255);
    ellipse(this.x, this.y, 20, 20);
  }

  shoot(enemy) {
    super.shoot(enemy);
    enemy.slow(0.5);
  }
}

export class SniperTower extends Tower {
  constructor(x, y) {
    super(x, y, 200, 50, 3000, 100);
  }

  display() {
    fill(0, 255, 0);
    ellipse(this.x, this.y, 20, 20);
  }
}

export class ElectricTower extends Tower {
  constructor(x, y) {
    super(x, y, 120, 10, 2000, 75);
    this.areaOfEffect = 50;
  }

  display() {
    fill(255, 255, 0);
    ellipse(this.x, this.y, 20, 20);
  }

  shoot(targetEnemy, enemies) {
    // Colpisce il nemico principale e quelli nelle vicinanze
    targetEnemy.takeDamage(this.damage);

    const nearbyEnemies = enemies.filter(enemy => 
      dist(this.x, this.y, enemy.x, enemy.y) < this.range &&
      dist(targetEnemy.x, targetEnemy.y, enemy.x, enemy.y) < this.areaOfEffect
    );

    nearbyEnemies.forEach(enemy => {
      if (enemy !== targetEnemy) {
        enemy.takeDamage(this.damage / 2);
      }
    });
  }

  update(enemies) {
    const targetEnemy = enemies.find(enemy => 
      dist(this.x, this.y, enemy.x, enemy.y) < this.range &&
      Date.now() - this.lastShot > this.fireRate
    );

    if (targetEnemy) {
      this.shoot(targetEnemy, enemies);
      this.lastShot = Date.now();
    }
  }
}