import { setup, draw, keyPressed, mousePressed } from './gameManager.js';

window.dist = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
window.fill = (r, g, b) => window.drawingContext.fillStyle = `rgb(${r},${g},${b})`;
window.stroke = (r, g, b) => window.drawingContext.strokeStyle = `rgb(${r},${g},${b})`;
window.strokeWeight = (weight) => window.drawingContext.lineWidth = weight;
window.noFill = () => window.drawingContext.fillStyle = 'transparent';
window.noStroke = () => window.drawingContext.strokeStyle = 'transparent';
window.rect = (x, y, w, h) => window.drawingContext.fillRect(x, y, w, h);
window.ellipse = (x, y, w, h) => {
  window.drawingContext.beginPath();
  window.drawingContext.ellipse(x, y, w/2, h/2, 0, 0, 2 * Math.PI);
  window.drawingContext.fill();
};
window.text = (str, x, y) => {
  window.drawingContext.fillStyle = 'black';
  window.drawingContext.fillText(str, x, y);
};
window.textSize = (size) => window.drawingContext.font = `${size}px Arial`;
window.textAlign = () => {}; 
window.cursor = () => {}; 
window.beginShape = () => window.drawingContext.beginPath();
window.vertex = (x, y) => window.drawingContext.lineTo(x, y);
window.endShape = () => window.drawingContext.stroke();
window.push = () => window.drawingContext.save();
window.pop = () => window.drawingContext.restore();
window.translate = (x, y) => window.drawingContext.translate(x, y);
window.rotate = (angle) => window.drawingContext.rotate(angle);

window.width = 800;
window.height = 600;
window.mouseX = 0;
window.mouseY = 0;

window.addEventListener('mousemove', (e) => {
  window.mouseX = e.offsetX;
  window.mouseY = e.offsetY;
});

window.mouseIsPressed = false;
window.addEventListener('mousedown', () => window.mouseIsPressed = true);
window.addEventListener('mouseup', () => window.mouseIsPressed = false);

window.millis = () => Date.now();
window.sqrt = Math.sqrt;
window.atan2 = Math.atan2;

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.mousePressed = mousePressed;