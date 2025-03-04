export function generateRandomPath(tileSize) {
  const path = [];
  const start = { x: 0, y: 7 * tileSize }; // Punto di partenza fisso
  path.push(start);

  // Aggiungi punti casuali al percorso
  let lastPoint = start;
  while (lastPoint.x < 20 * tileSize) {
    const nextX = lastPoint.x + Math.floor(Math.random() * 5) * tileSize;
    const nextY = Math.floor(Math.random() * 15) * tileSize;

    // Assicurati che il percorso non esca dai limiti della mappa
    if (nextX > 20 * tileSize) break;
    if (nextY < 0 || nextY > 14 * tileSize) continue;

    const nextPoint = { x: nextX, y: nextY };
    path.push(nextPoint);
    lastPoint = nextPoint;
  }

  // Aggiungi un punto finale fisso
  path.push({ x: 20 * tileSize, y: 7 * tileSize });

  return path;
}