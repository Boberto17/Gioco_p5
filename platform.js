// Tipi di piattaforme
const platformTypes = {
    NORMAL: 0,
    TEMPORARY: 1,
    SLIPPERY: 2
  };
  
  class Platform {
    constructor(x, y, width, height, type) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.type = type;
      this.visible = true;
      this.disappearTimer = 0;
      this.reappearTimer = 0;
    }
    
    update() {
      // Per le piattaforme temporanee
      if (this.type === platformTypes.TEMPORARY) {
        if (this.disappearTimer > 0) {
          this.disappearTimer--;
          if (this.disappearTimer === 0) {
            this.visible = false;
            this.reappearTimer = 120; // Riappare dopo 2 secondi
          }
        }
        
        if (this.reappearTimer > 0) {
          this.reappearTimer--;
          if (this.reappearTimer === 0) {
            this.visible = true;
          }
        }
      }
    }
    
    startDisappearing() {
      if (this.type === platformTypes.TEMPORARY && this.disappearTimer === 0 && this.reappearTimer === 0) {
        this.disappearTimer = 30; // Scompare dopo mezzo secondo
      }
    }
    
    show() {
      if (!this.visible) return;
      
      switch (this.type) {
        case platformTypes.NORMAL:
          fill(100, 200, 100);
          break;
        case platformTypes.TEMPORARY:
          // Lampeggia se sta per scomparire
          if (this.disappearTimer > 0) {
            let alpha = map(this.disappearTimer, 0, 30, 50, 255);
            fill(200, 200, 100, alpha);
          } else {
            fill(200, 200, 100);
          }
          break;
        case platformTypes.SLIPPERY:
          fill(100, 200, 255);
          break;
      }
      
      rect(this.x, this.y, this.width, this.height);
    }
  }
  
  // Funzione per generare piattaforme
  function generatePlatform(y, screenWidth, platforms, platformTypes) {
    let platformWidth = random(80, 200);
    let platformX = random(0, screenWidth - platformWidth);
    
    // Aumenta la difficoltà in base all'altezza
    let difficulty = constrain(-y / 1000, 0, 1);
    
    // Scegli il tipo di piattaforma in base alla difficoltà
    let type;
    let r = random();
    
    if (r < 0.2 + difficulty * 0.3) {
      type = platformTypes.TEMPORARY;
    } else if (r < 0.4 + difficulty * 0.4) {
      type = platformTypes.SLIPPERY;
    } else {
      type = platformTypes.NORMAL;
    }
    
    platforms.push(new Platform(platformX, y, platformWidth, 20, type));
  }
  
  export { Platform, platformTypes, generatePlatform };