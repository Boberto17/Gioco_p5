export function generateRandomPath(tileSize) {
  const path = [];
  const start = { x: 0, y: 7 * tileSize }; 
  path.push(start);

  let lastPoint = start;
  while (lastPoint.x < 20 * tileSize) {
    const nextX = lastPoint.x + Math.floor(Math.random() * 5) * tileSize;
    const nextY = Math.floor(Math.random() * 15) * tileSize;

    if (nextX > 20 * tileSize) break;
    if (nextY < 0 || nextY > 14 * tileSize) continue;

    const nextPoint = { x: nextX, y: nextY };
    path.push(nextPoint);
    lastPoint = nextPoint;
  }

  path.push({ x: 20 * tileSize, y: 7 * tileSize });

  return path;
}

export function drawPathTexture(path) {
  fill(150, 150, 150); // Colore grigio per il percorso
  for (let i = 0; i < path.length - 1; i++) {
    let start = path[i];
    let end = path[i + 1];
    
    let pathWidth = 40;
    
    push();
    translate(start.x, start.y);
    rotate(atan2(end.y - start.y, end.x - start.x));
    
    rect(0, -pathWidth/2, dist(start.x, start.y, end.x, end.y), pathWidth);
    
    pop();
  }
}