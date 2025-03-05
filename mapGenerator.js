export class MapGenerator {
    constructor(width, height, difficulty = 1, tileSize = 40) {
      this.tileSize = tileSize;
      this.gridWidth = Math.floor((width * 0.6) / tileSize);
      this.gridHeight = Math.floor((height * 0.6) / tileSize);
      this.offsetX = (width - (this.gridWidth * tileSize)) / 2;
      this.offsetY = (height - (this.gridHeight * tileSize)) / 2;
      this.width = width;
      this.height = height;
      this.difficulty = difficulty;
      this.grid = [];
      this.enemyPath = [];
      this.buildableAreas = [];
    }

    generatePath() {
      // Initialize grid with all cells as obstacles
      this.grid = Array.from({ length: this.gridHeight }, () => 
        Array.from({ length: this.gridWidth }, () => ({ 
          type: 'obstacle', 
          occupant: null 
        }))
      );

      // Start path from the middle left with a single-tile path
      let currentX = 0;
      let currentY = Math.floor(this.gridHeight / 2);
      let pathCells = [{ x: currentX, y: currentY }];

      // Create continuous single-tile path across the grid
      while (currentX < this.gridWidth - 1) {
        // Mark current cell as path
        this.grid[currentY][currentX].type = 'path';

        // Slight vertical variation with constraints
        const verticalChange = Math.random() < 0.3 ? 
          (Math.random() < 0.5 ? -1 : 1) : 0;
        
        const newY = currentY + verticalChange;
        
        // Ensure new Y is within grid bounds
        if (newY >= 0 && newY < this.gridHeight) {
          currentY = newY;
        }

        currentX++;
        pathCells.push({ x: currentX, y: currentY });
      }

      // Mark last cell as path
      this.grid[currentY][currentX].type = 'path';

      // Smooth out diagonal connections
      this.smoothDiagonalConnections(pathCells);

      // Generate buildable areas
      return this.generateBuildableAreas();
    }

    smoothDiagonalConnections(pathCells) {
      for (let i = 0; i < pathCells.length - 1; i++) {
        const current = pathCells[i];
        const next = pathCells[i + 1];

        // Check for diagonal connection
        const deltaX = Math.abs(current.x - next.x);
        const deltaY = Math.abs(current.y - next.y);

        if (deltaX === 1 && deltaY === 1) {
          // Diagonal connection detected
          // Find the shared adjacent cell
          const sharedCells = [
            { x: current.x, y: next.y },
            { x: next.x, y: current.y }
          ];

          // Choose the first valid shared cell
          for (const cell of sharedCells) {
            if (
              cell.x >= 0 && 
              cell.x < this.gridWidth && 
              cell.y >= 0 && 
              cell.y < this.gridHeight && 
              this.grid[cell.y][cell.x].type === 'obstacle'
            ) {
              // Add a new path cell to connect diagonally separated cells
              this.grid[cell.y][cell.x].type = 'path';
              pathCells.splice(i + 1, 0, { x: cell.x, y: cell.y });
              break;
            }
          }
        }
      }
    }

    generateBuildableAreas() {
      // Reset buildable areas
      this.buildableAreas = [];
      const pathCoordinates = [];

      // Calculate max buildable areas based on difficulty
      const buildableAreaMultiplier = 6 - this.difficulty; 

      // Find potential buildable areas and path coordinates
      const potentialBuildableAreas = [];
      for (let y = 0; y < this.gridHeight; y++) {
        for (let x = 0; x < this.gridWidth; x++) {
          // Calculate path coordinates
          if (this.grid[y][x].type === 'path') {
            pathCoordinates.push({
              x: this.offsetX + x * this.tileSize + this.tileSize / 2,
              y: this.offsetY + y * this.tileSize + this.tileSize / 2
            });
          }

          // Find potential buildable areas
          if (this.grid[y][x].type === 'path') {
            // Check adjacent cells
            const adjacentCells = [
              { x: x - 1, y: y },
              { x: x + 1, y: y },
              { x: x, y: y - 1 },
              { x: x, y: y + 1 }
            ];

            for (const cell of adjacentCells) {
              if (
                cell.x >= 0 && 
                cell.x < this.gridWidth && 
                cell.y >= 0 && 
                cell.y < this.gridHeight && 
                this.grid[cell.y][cell.x].type === 'obstacle'
              ) {
                potentialBuildableAreas.push({ x: cell.x, y: cell.y });
              }
            }
          }
        }
      }

      // Randomly select a subset of buildable areas based on difficulty
      const maxBuildableAreas = Math.floor(potentialBuildableAreas.length * (buildableAreaMultiplier / 5));
      
      // Shuffle and select
      for (let i = 0; i < maxBuildableAreas; i++) {
        if (potentialBuildableAreas.length > 0) {
          const randomIndex = Math.floor(Math.random() * potentialBuildableAreas.length);
          const selectedArea = potentialBuildableAreas.splice(randomIndex, 1)[0];
          
          // Mark as buildable and store
          this.grid[selectedArea.y][selectedArea.x].type = 'buildable';
          this.buildableAreas.push(selectedArea);
        }
      }

      return pathCoordinates;
    }

    generateObstacles() {
      return this.grid;
    }

    isBuildableCell(x, y) {
      const gridX = Math.floor((x - this.offsetX) / this.tileSize);
      const gridY = Math.floor((y - this.offsetY) / this.tileSize);
      
      return gridX >= 0 && gridX < this.gridWidth &&
             gridY >= 0 && gridY < this.gridHeight &&
             this.grid[gridY][gridX].type === 'buildable';
    }

    drawMapElements() {
      for (let y = 0; y < this.gridHeight; y++) {
        for (let x = 0; x < this.gridWidth; x++) {
          const cell = this.grid[y][x];
          const cellX = this.offsetX + x * this.tileSize;
          const cellY = this.offsetY + y * this.tileSize;

          switch (cell.type) {
            case 'path':
              // Dark green for enemy path
              fill(0, 100, 0);  // Dark green
              rect(cellX, cellY, this.tileSize, this.tileSize);
              break;
            case 'buildable':
              fill(150, 220, 150);  // Light green for buildable cells
              rect(cellX, cellY, this.tileSize, this.tileSize);
              break;
            case 'obstacle':
              fill(80, 80, 80);  // Dark gray for obstacles
              rect(cellX, cellY, this.tileSize, this.tileSize);
              break;
          }
        }
      }
    }
}