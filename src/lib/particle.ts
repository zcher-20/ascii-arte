const CHARS = "0123456789@#$%&*+=?!ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.:;~^";

function randomChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

export class CharCell {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  baseChar: string;
  currentChar: string;
  opacity: number;
  targetOpacity: number;
  mutationCounter = 0;
  idleOffset: number;

  constructor(homeX: number, homeY: number) {
    this.homeX = homeX;
    this.homeY = homeY;
    this.x = homeX;
    this.y = homeY;
    this.baseChar = randomChar();
    this.currentChar = this.baseChar;
    this.idleOffset = Math.random() * 1000;
    this.opacity = 1.0;
    this.targetOpacity = 1.0;
  }

  update(
    mouseX: number,
    mouseY: number,
    mouseActive: boolean,
    dragging: boolean,
    exploded: boolean,
    time: number,
  ) {
    const restingOpacity = 1.0;
    const interactionRadius = 55;
    const rippleRadius = 90;
    const displaced = Math.abs(this.x - this.homeX) + Math.abs(this.y - this.homeY);
    const spring = exploded ? 0.1 : displaced > 20 ? 0.025 : 0.07;
    const friction = exploded ? 0.78 : 0.85;
    const charMutationInterval = 4;

    if (mouseActive) {
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dragging) {
        // drag = distort: stretch characters away with strong force
        if (dist < interactionRadius * 1.5 && dist > 0) {
          const force = 1200 / (dist * dist);
          const nx = dx / dist;
          const ny = dy / dist;
          this.vx += nx * force;
          this.vy += ny * force;

          // heavy mutation while dragging
          this.mutationCounter++;
          if (this.mutationCounter % 2 === 0) {
            this.currentChar = randomChar();
          }
        }
        this.targetOpacity = restingOpacity;
      } else if (dist < interactionRadius && dist > 0) {
        const force = 1800 / (dist * dist);
        const nx = dx / dist;
        const ny = dy / dist;
        this.vx += nx * force;
        this.vy += ny * force;

        this.vx += nx * 1.5;
        this.vy += ny * 1.5;

        this.targetOpacity = 1.0 - (dist / interactionRadius) * 0.5;

        this.mutationCounter++;
        if (this.mutationCounter % charMutationInterval === 0) {
          this.currentChar = randomChar();
        }

        if (dist < interactionRadius * 0.5) {
          this.vx += (Math.random() - 0.5) * 5;
          this.vy += (Math.random() - 0.5) * 5;
        }
      } else if (dist < rippleRadius) {
        const ripplePhase = Math.sin(dist * 0.05 - time * 0.004);
        const rippleForce = ripplePhase * 0.8 * (1 - dist / rippleRadius);
        const nx = dx / dist;
        const ny = dy / dist;
        this.vx += nx * rippleForce;
        this.vy += ny * rippleForce;

        this.targetOpacity =
          restingOpacity + (1 - dist / rippleRadius) * 0.3;
      } else {
        this.targetOpacity = restingOpacity;
      }
    } else {
      this.targetOpacity = restingOpacity;
    }

    if (Math.sin(time * 0.003 + this.idleOffset * 6.28) > 0.92) {
      this.currentChar = randomChar();
    }

    // spring back to home (slower when exploded for dramatic reform)
    this.vx += (this.homeX - this.x) * spring;
    this.vy += (this.homeY - this.y) * spring;
    this.vx *= friction;
    this.vy *= friction;
    this.x += this.vx;
    this.y += this.vy;

    this.opacity += (this.targetOpacity - this.opacity) * 0.1;
  }

  explode(centerX: number, centerY: number) {
    const dx = this.x - centerX;
    const dy = this.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const force = 6 + Math.random() * 8;
    this.vx += (dx / dist) * force + (Math.random() - 0.5) * 4;
    this.vy += (dy / dist) * force + (Math.random() - 0.5) * 4;
    this.currentChar = randomChar();
  }
}

export function sampleTextToGrid(
  text: string,
  canvasWidth: number,
  canvasHeight: number,
  gap: number,
): CharCell[] {
  const offscreen = document.createElement("canvas");
  offscreen.width = canvasWidth;
  offscreen.height = canvasHeight;
  const ctx = offscreen.getContext("2d", { willReadFrequently: true })!;

  const fontSize = Math.min(canvasWidth / (text.length * 0.55), canvasHeight * 0.45);
  const fontFamily = '"Archivo Black", Impact, sans-serif';
  ctx.fillStyle = "white";
  ctx.textBaseline = "middle";

  const spaceIdx = text.indexOf(" ");
  const normalPart = spaceIdx >= 0 ? text.slice(0, spaceIdx + 1) : text;
  const italicPart = spaceIdx >= 0 ? text.slice(spaceIdx + 1) : "";

  ctx.font = `900 ${fontSize}px ${fontFamily}`;
  const normalWidth = ctx.measureText(normalPart).width;
  const italicFont = `italic 900 ${fontSize}px ${fontFamily}`;
  ctx.font = italicFont;
  const italicWidth = ctx.measureText(italicPart).width;
  const totalWidth = normalWidth + italicWidth;
  const startX = (canvasWidth - totalWidth) / 2;
  const centerY = canvasHeight / 2;

  ctx.font = `900 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.fillText(normalPart, startX, centerY);

  ctx.font = italicFont;
  ctx.fillText(italicPart, startX + normalWidth, centerY);

  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixels = imageData.data;
  const cells: CharCell[] = [];

  for (let y = 0; y < canvasHeight; y += gap) {
    for (let x = 0; x < canvasWidth; x += gap) {
      const i = (y * canvasWidth + x) * 4;
      if (pixels[i] > 128) {
        cells.push(new CharCell(x, y));
      }
    }
  }

  return cells;
}
