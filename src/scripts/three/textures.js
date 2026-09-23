import * as THREE from 'three';

export function makeShiplapTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const rows = 13;
  const rowH = canvas.height / rows;
  for (let i = 0; i < rows; i++) {
    const shade = 224 + Math.floor(((Math.sin(i * 12.9898) * 43758.5453) % 1) * 12);
    ctx.fillStyle = 'rgb(' + shade + ',' + (shade - 6) + ',' + (shade - 18) + ')';
    ctx.fillRect(0, i * rowH, canvas.width, rowH - 3);
    ctx.fillStyle = 'rgba(30,24,16,0.22)';
    ctx.fillRect(0, i * rowH + rowH - 3, canvas.width, 3);
  }
  return new THREE.CanvasTexture(canvas);
}

export function makeCinderblockTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#7d838a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const blockW = 64, blockH = 40;
  const rows = Math.ceil(canvas.height / blockH) + 1;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2 === 0) ? 0 : blockW / 2;
    for (let x = -blockW; x < canvas.width + blockW; x += blockW) {
      const bx = x + offset;
      const shade = 150 + Math.floor(((Math.sin((r * 7 + x) * 12.9898) * 43758.5453) % 1) * 16);
      ctx.fillStyle = 'rgb(' + shade + ',' + shade + ',' + (shade + 3) + ')';
      ctx.fillRect(bx + 3, r * blockH + 3, blockW - 6, blockH - 6);
    }
  }
  return new THREE.CanvasTexture(canvas);
}

function drawPine(ctx, x, baseY, h) {
  ctx.beginPath();
  ctx.moveTo(x, baseY - h);
  ctx.lineTo(x - h * 0.38, baseY);
  ctx.lineTo(x + h * 0.38, baseY);
  ctx.closePath();
  ctx.fill();
}

export function makeWindowSceneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#182a4a');
  grad.addColorStop(0.55, '#3c5b86');
  grad.addColorStop(1, '#cfe0f0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#eef4fa';
  ctx.beginPath();
  ctx.moveTo(0, 198);
  ctx.quadraticCurveTo(128, 178, 256, 206);
  ctx.lineTo(256, 256);
  ctx.lineTo(0, 256);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(60,85,78,0.5)';
  for (let i = 0; i < 9; i++) drawPine(ctx, 8 + i * 30 + (i % 3) * 6, 196, 16 + (i % 4) * 5);

  ctx.fillStyle = 'rgba(22,38,30,0.88)';
  for (let j = 0; j < 6; j++) drawPine(ctx, 18 + j * 44 + (j % 2) * 10, 214, 26 + (j % 3) * 8);

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(196, 44, 14, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

export function makeBrickTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#9a938c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const brickW = 42, brickH = 20;
  const rows = Math.ceil(canvas.height / brickH) + 1;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2 === 0) ? 0 : brickW / 2;
    for (let x = -brickW; x < canvas.width + brickW; x += brickW) {
      const bx = x + offset;
      const shadeSeed = ((Math.sin((r * 11 + x) * 12.9898) * 43758.5453) % 1);
      const red = 150 + Math.floor(shadeSeed * 40);
      ctx.fillStyle = 'rgb(' + red + ',' + Math.floor(red * 0.42) + ',' + Math.floor(red * 0.33) + ')';
      ctx.fillRect(bx + 2, r * brickH + 2, brickW - 4, brickH - 4);
    }
  }
  return new THREE.CanvasTexture(canvas);
}

export function makeHardwoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const planks = 9;
  const pw = canvas.width / planks;
  for (let i = 0; i < planks; i++) {
    const shadeSeed = ((Math.sin(i * 12.9898) * 43758.5453) % 1);
    const base = 132 + Math.floor(shadeSeed * 34);
    ctx.fillStyle = 'rgb(' + (base + 34) + ',' + (base + 8) + ',' + Math.max(0, base - 32) + ')';
    ctx.fillRect(i * pw, 0, pw - 2, canvas.height);
    ctx.strokeStyle = 'rgba(40,24,10,0.18)';
    ctx.lineWidth = 1;
    for (let g = 0; g < 7; g++) {
      const yy = (g / 7) * canvas.height + ((shadeSeed * 40) % 20);
      ctx.beginPath();
      ctx.moveTo(i * pw + 2, yy);
      ctx.lineTo(i * pw + pw - 4, yy + 6);
      ctx.stroke();
    }
  }
  for (let s = 0; s < 5; s++) {
    ctx.strokeStyle = 'rgba(20,12,6,0.35)';
    ctx.beginPath();
    const sy = (s / 5) * canvas.height + 12;
    ctx.moveTo(0, sy);
    ctx.lineTo(canvas.width, sy);
    ctx.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}

// Digital thermostat readout, drawn on a small canvas and reused as a live texture.
export function createThermostatDisplay() {
  const canvas = document.createElement('canvas');
  canvas.width = 160; canvas.height = 160;
  const ctx = canvas.getContext('2d');

  function draw(value) {
    ctx.clearRect(0, 0, 160, 160);
    ctx.fillStyle = '#0c0c0c';
    ctx.beginPath();
    ctx.arc(80, 80, 78, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#49c6f0';
    ctx.font = '700 54px Courier New, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#49c6f0';
    ctx.shadowBlur = 14;
    ctx.fillText(Math.round(value) + '°', 80, 84);
  }

  return { canvas, draw };
}

// Small analog gauge for the water heater: a tick scale with a green
// "efficient" zone around 120°F, an amber "wasteful" zone above it, a swept
// needle and a digital readout underneath.
export function createWaterDialDisplay() {
  const canvas = document.createElement('canvas');
  canvas.width = 160; canvas.height = 160;
  const ctx = canvas.getContext('2d');
  const cx = 80, cy = 78, r = 58;
  const minV = 100, maxV = 150;
  const startA = Math.PI * 0.75;
  const endA = Math.PI * 2.25;

  function angleFor(v) {
    const t = (v - minV) / (maxV - minV);
    return startA + t * (endA - startA);
  }

  function draw(value) {
    ctx.clearRect(0, 0, 160, 160);

    ctx.fillStyle = '#101820';
    ctx.beginPath();
    ctx.arc(cx, cy, r + 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineCap = 'butt';
    ctx.lineWidth = 9;
    ctx.strokeStyle = '#3a4552';
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, endA);
    ctx.stroke();

    ctx.strokeStyle = '#5fd07a';
    ctx.beginPath();
    ctx.arc(cx, cy, r, angleFor(116), angleFor(124));
    ctx.stroke();

    ctx.strokeStyle = '#e2984f';
    ctx.beginPath();
    ctx.arc(cx, cy, r, angleFor(132), angleFor(150));
    ctx.stroke();

    ctx.strokeStyle = '#cfe0f0';
    ctx.lineWidth = 2;
    for (let v = minV; v <= maxV; v += 10) {
      const a = angleFor(v);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (r - 13), cy + Math.sin(a) * (r - 13));
      ctx.lineTo(cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4));
      ctx.stroke();
    }

    const na = angleFor(Math.max(minV, Math.min(maxV, value)));
    ctx.strokeStyle = '#ff6a3d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(na) * (r - 15), cy + Math.sin(na) * (r - 15));
    ctx.stroke();
    ctx.fillStyle = '#ff6a3d';
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#eaf6ff';
    ctx.font = '700 19px Courier New, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(value) + '°', cx, cy + 30);
  }

  return { canvas, draw };
}
