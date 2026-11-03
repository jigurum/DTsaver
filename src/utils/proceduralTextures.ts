/**
 * Procedural Canvas Texture Generators for Drive-Thru Vigilante 3D.
 * Zero external image dependencies.
 */
import * as THREE from 'three';

export function createRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark asphalt base
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, 0, 512, 1024);

  // Noise / grain
  for (let i = 0; i < 40000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 1024;
    const v = Math.random() * 25;
    ctx.fillStyle = `rgb(${25 + v}, ${25 + v}, ${28 + v})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Yellow drive-thru guide lines
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(250, 0, 12, 1024);

  // White curb boundary lines
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(20, 0, 8, 1024);
  ctx.fillRect(484, 0, 8, 1024);

  // Red/white hazard striped curb marking near drive-thru window
  for (let y = 0; y < 1024; y += 40) {
    ctx.fillStyle = (y / 40) % 2 === 0 ? '#dc2626' : '#ffffff';
    ctx.fillRect(10, y, 10, 20);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createMenuBoardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark retro restaurant menu board
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, 512, 512);

  // Top Neon Banner
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(0, 0, 512, 80);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Black Han Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍔 OUTLAW BURGER 🍟', 256, 52);

  // Menu items
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('1. 머슬 버거 세트 ........ $8.50', 30, 140);
  ctx.fillText('2. 더블 베이컨 치즈 ....... $9.80', 30, 200);
  ctx.fillText('3. 비질란테 핫윙 ......... $6.20', 30, 260);
  ctx.fillText('4. 밀크쉐이크 & 프라이 ... $5.00', 30, 320);

  // Bottom prompt
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(20, 390, 472, 80);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('👉 창구에서 E키로 즉시 주문! 👈', 256, 442);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createSpeedometerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(128, 128, 110, Math.PI * 0.75, Math.PI * 2.25);
  ctx.stroke();

  // Tick marks
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  for (let i = 0; i <= 8; i++) {
    const angle = Math.PI * 0.75 + (i / 8) * (Math.PI * 1.5);
    const x1 = 128 + Math.cos(angle) * 105;
    const y1 = 128 + Math.sin(angle) * 105;
    const x2 = 128 + Math.cos(angle) * 85;
    const y2 = 128 + Math.sin(angle) * 85;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Digital readout
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 40px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MPH', 128, 175);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createTargetCrosshairTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 128, 128);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;

  // Ring
  ctx.beginPath();
  ctx.arc(64, 64, 40, 0, Math.PI * 2);
  ctx.stroke();

  // Center cross lines
  ctx.beginPath();
  ctx.moveTo(64, 14);
  ctx.lineTo(64, 44);
  ctx.moveTo(64, 84);
  ctx.lineTo(64, 114);
  ctx.moveTo(14, 64);
  ctx.lineTo(44, 64);
  ctx.moveTo(84, 64);
  ctx.lineTo(114, 64);
  ctx.stroke();

  // Red dot
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(64, 64, 4, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
