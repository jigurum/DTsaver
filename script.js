/**
 * 드라이빙스루 무법자 3D (Drive-Thru Vigilante 3D)
 * Pure Vanilla JavaScript (ES6+) Game Engine.
 * Zero npm/build dependencies - runs directly in any browser and GitHub Pages.
 */

// Global THREE reference from CDN
const THREE = window.THREE;

/* ==========================================================================
   1. PROCEDURAL WEB AUDIO SYNTHESIZER (No external audio files)
   ========================================================================== */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // 12-Gauge Shotgun Blast
  playShotgun() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;

    // Noise burst
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.35);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);

    // Sub-bass thump
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(180, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.3);

    subGain.gain.setValueAtTime(0.9, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.35);
  }

  // Shell Reload Clack
  playReload() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1200, now);
    osc1.frequency.exponentialRampToValueAtTime(400, now + 0.08);

    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    const tRack = now + 0.22;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(320, tRack);
    osc2.frequency.exponentialRampToValueAtTime(750, tRack + 0.12);

    gain2.gain.setValueAtTime(0.5, tRack);
    gain2.gain.exponentialRampToValueAtTime(0.001, tRack + 0.15);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(tRack);
    osc2.stop(tRack + 0.15);
  }

  playEmptyClick() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playDodgeWhoosh() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + 0.12);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.25);
    filter.Q.value = 2.5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  playRobberWarning() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.setValueAtTime(780, now + 0.08);
    osc.frequency.setValueAtTime(650, now + 0.16);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  playRobberGunfire() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playOrderSuccess() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.3, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.25);
    });
  }

  playRobberDefeated() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'square';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.setValueAtTime(880, now + 0.08);
    osc2.frequency.setValueAtTime(220, now);
    osc2.frequency.setValueAtTime(440, now + 0.08);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);
  }

  playGameOver() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.65);
  }
}

const soundManager = new SoundManager();

/* ==========================================================================
   2. PROCEDURAL CANVAS TEXTURES
   ========================================================================== */
function createRoadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, 0, 512, 1024);

  // Road noise
  for (let i = 0; i < 30000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 1024;
    const v = Math.random() * 25;
    ctx.fillStyle = `rgb(${25 + v}, ${25 + v}, ${28 + v})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Yellow lane marking
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(250, 0, 12, 1024);

  // White curbs
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(20, 0, 8, 1024);
  ctx.fillRect(484, 0, 8, 1024);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createMenuBoardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(0, 0, 512, 80);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍔 OUTLAW BURGER 🍟', 256, 52);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('1. 머슬 버거 세트 ........ $8.50', 30, 140);
  ctx.fillText('2. 더블 베이컨 치즈 ....... $9.80', 30, 200);
  ctx.fillText('3. 비질란테 핫윙 ......... $6.20', 30, 260);
  ctx.fillText('4. 밀크쉐이크 & 프라이 ... $5.00', 30, 320);

  ctx.fillStyle = '#22c55e';
  ctx.fillRect(20, 390, 472, 80);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('👉 창구에서 E키로 즉시 주문! 👈', 256, 442);

  return new THREE.CanvasTexture(canvas);
}

function createSpeedometerTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(128, 128, 110, Math.PI * 0.75, Math.PI * 2.25);
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 38px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MPH', 128, 175);

  return new THREE.CanvasTexture(canvas);
}

function createNpcBillboard(type, subtitle) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = type === 'ROBBER' ? 'rgba(220, 38, 38, 0.95)' : 'rgba(16, 185, 129, 0.95)';
  ctx.beginPath();
  ctx.roundRect(10, 10, 492, 108, 24);
  ctx.fill();

  ctx.lineWidth = 6;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (type === 'ROBBER') {
    ctx.fillText(`💀 ${subtitle}! [Shift로 숙여 회피!]`, 256, 64);
  } else {
    ctx.fillText(`🍔 ${subtitle}! [E키로 주문]`, 256, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), mat);
  mesh.position.set(0, 1.55, 0);
  return mesh;
}

/* ==========================================================================
   3. PROCEDURAL 3D MODELS
   ========================================================================== */
function createCockpit() {
  const cockpit = new THREE.Group();

  const dashMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85, metalness: 0.1 });
  const dashTrimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.75 });

  const dashMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.36, 0.8), dashMat);
  dashMesh.position.set(-0.1, -0.46, -0.6);
  cockpit.add(dashMesh);

  // Speedometer
  const speedoTex = createSpeedometerTexture();
  const speedoMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: speedoTex }));
  speedoMesh.position.set(-0.25, -0.32, -0.48);
  speedoMesh.rotation.x = -Math.PI / 10;
  cockpit.add(speedoMesh);

  const needleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.07, 0.005), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  needleMesh.position.set(-0.25, -0.32, -0.47);
  cockpit.add(needleMesh);
  cockpit.gaugeNeedle = needleMesh;

  // Steering Wheel
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(-0.25, -0.36, -0.38);
  wheelGroup.rotation.x = 0.25;

  const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 12, 32), new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.6, metalness: 0.2 }));
  wheelGroup.add(rimMesh);

  const hubMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), dashTrimMat);
  hubMesh.rotation.x = Math.PI / 2;
  wheelGroup.add(hubMesh);

  cockpit.add(wheelGroup);
  cockpit.steeringWheel = wheelGroup;

  // Low door panel
  const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 1.4), dashMat);
  doorPanel.position.set(-0.85, -0.64, 0.0);
  cockpit.add(doorPanel);

  // Hood
  const hoodMesh = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 2.0), new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.35, metalness: 0.4 }));
  hoodMesh.position.set(-0.05, -0.38, -1.7);
  cockpit.add(hoodMesh);

  return cockpit;
}

function createShotgun() {
  const shotgun = new THREE.Group();

  const gunMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.9 });
  const gunWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6, metalness: 0.1 });

  const barrel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.68, 16), gunMetalMat);
  barrel1.rotation.x = Math.PI / 2;
  barrel1.position.set(0, 0.02, -0.3);
  shotgun.add(barrel1);

  const barrel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.68, 16), gunMetalMat);
  barrel2.rotation.x = Math.PI / 2;
  barrel2.position.set(0, -0.02, -0.3);
  shotgun.add(barrel2);

  const sightMesh = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
  sightMesh.position.set(0, 0.056, -0.62);
  shotgun.add(sightMesh);

  const recMesh = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.095, 0.24), gunMetalMat);
  recMesh.position.set(0, 0, 0.08);
  shotgun.add(recMesh);

  const pumpMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.24, 12), gunWoodMat);
  pumpMesh.rotation.x = Math.PI / 2;
  pumpMesh.position.set(0, -0.01, -0.22);
  shotgun.add(pumpMesh);

  const stockMesh = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.12, 0.38), gunWoodMat);
  stockMesh.position.set(0, -0.1, 0.42);
  shotgun.add(stockMesh);

  const muzzleAnchor = new THREE.Object3D();
  muzzleAnchor.position.set(0, 0.02, -0.66);
  shotgun.add(muzzleAnchor);
  shotgun.muzzle = muzzleAnchor;

  const ejectionPort = new THREE.Object3D();
  ejectionPort.position.set(0.04, 0.02, 0.06);
  shotgun.add(ejectionPort);
  shotgun.ejectionPort = ejectionPort;

  // Muzzle flash group
  const muzzleFlashGroup = new THREE.Group();
  muzzleFlashGroup.position.set(0, 0.02, -0.76);

  const coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
  muzzleFlashGroup.add(coreMesh);

  const outerMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), new THREE.MeshBasicMaterial({ color: 0xff7700, transparent: true, opacity: 0 }));
  muzzleFlashGroup.add(outerMesh);

  const plane1 = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0, side: THREE.DoubleSide }));
  muzzleFlashGroup.add(plane1);

  shotgun.add(muzzleFlashGroup);
  shotgun.muzzleFlash = muzzleFlashGroup;

  const flashLight = new THREE.PointLight(0xff7700, 0, 15);
  flashLight.position.set(0, 0.02, -0.76);
  shotgun.add(flashLight);
  shotgun.muzzleLight = flashLight;

  shotgun.position.set(0.18, -0.28, -0.52);
  shotgun.rotation.set(0.05, -0.05, 0.02);

  return shotgun;
}

function createDriveThruBooth() {
  const booth = new THREE.Group();

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.85, metalness: 0.05 });
  const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.5, 8.0), wallMat);
  wallMesh.position.set(-2.0, 2.2, 0);
  booth.add(wallMesh);

  const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.4, 3.6), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.85 }));
  frameMesh.position.set(-1.4, 1.45, 0);
  booth.add(frameMesh);

  const counterMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 3.8), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.9 }));
  counterMesh.position.set(-1.25, 0.65, 0);
  booth.add(counterMesh);

  const posMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.26), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
  posMesh.position.set(-1.3, 0.8, 0.85);
  booth.add(posMesh);

  const canopyMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 4.8), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }));
  canopyMesh.position.set(-1.7, 2.9, 0);
  booth.add(canopyMesh);

  const windowSpot = new THREE.SpotLight(0xfffbeb, 90, 12, Math.PI / 2.6, 0.2);
  windowSpot.position.set(-1.25, 2.8, 0);
  windowSpot.target.position.set(-1.25, 0.8, 0);
  booth.add(windowSpot);
  booth.add(windowSpot.target);

  const menuTex = createMenuBoardTexture();
  const menuMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({ map: menuTex }));
  menuMesh.position.set(-1.45, 1.6, -3.8);
  menuMesh.rotation.y = Math.PI / 2;
  booth.add(menuMesh);

  return booth;
}

function createNpc(type) {
  const npc = new THREE.Group();
  npc.npcType = type;
  npc.isKnockedOut = false;
  npc.knockProgress = 0;
  npc.shootAnimProgress = 0;

  const robberVariants = [
    { id: 'BALACLAVA', name: '복면 갱스터', skin: 0xfde047, clothes: 0x18181b },
    { id: 'PUNK', name: '모히칸 펑크 강도', skin: 0xfbcfe8, clothes: 0x581c87 },
    { id: 'PAPER_BAG', name: '종이봉투 괴도', skin: 0xd97706, clothes: 0xc2410c },
    { id: 'CLOWN', name: '광대 가면 강도', skin: 0xf8fafc, clothes: 0xca8a04 },
    { id: 'MAFIA', name: '선글라스 마피아', skin: 0xfcd34d, clothes: 0x0f172a },
  ];

  const employeeVariants = [
    { id: 'VISOR_CLERK', name: '버거 매장 직원', skin: 0xfde047, clothes: 0xdc2626 },
    { id: 'CHEF_BURGER', name: '주방장 요리사', skin: 0xfbcfe8, clothes: 0xe2e8f0 },
    { id: 'TRAINEE', name: '헤드셋 신입 알바', skin: 0xfde047, clothes: 0x2563eb },
  ];

  const variant = type === 'ROBBER'
    ? robberVariants[Math.floor(Math.random() * robberVariants.length)]
    : employeeVariants[Math.floor(Math.random() * employeeVariants.length)];

  npc.variantName = variant.name;

  const skinMat = new THREE.MeshStandardMaterial({ color: variant.skin, roughness: 0.55, metalness: 0.05 });
  const clothesMat = new THREE.MeshStandardMaterial({ color: variant.clothes, roughness: 0.5, metalness: 0.1 });

  // Large Hitbox
  const hitbox = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 1.2), new THREE.MeshBasicMaterial({ visible: false }));
  hitbox.position.set(0, 1.05, 0);
  hitbox.userData = { isNpc: true, npcType: type };
  npc.add(hitbox);
  npc.hitbox = hitbox;

  // Name Badge
  const billboard = createNpcBillboard(type, variant.name);
  npc.add(billboard);
  npc.billboardMesh = billboard;

  // Torso
  const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.65, 18), clothesMat);
  torsoMesh.position.set(0, 0.72, 0);
  torsoMesh.userData = { isNpc: true, npcType: type };
  npc.add(torsoMesh);

  if (type === 'EMPLOYEE') {
    const apronMat = new THREE.MeshStandardMaterial({ color: variant.id === 'CHEF_BURGER' ? 0xffffff : 0xfacc15, roughness: 0.6 });
    const apronMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.32), apronMat);
    apronMesh.position.set(0, 0.68, 0);
    npc.add(apronMesh);
  }

  // Neck
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.14, 12), skinMat);
  neckMesh.position.set(0, 1.05, 0);
  npc.add(neckMesh);

  // Head Group (Eye level at y = 1.15)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.18, 0);

  const headGeo = new THREE.SphereGeometry(0.22, 24, 20);
  headGeo.scale(0.85, 1.12, 0.95);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.userData = { isNpc: true, npcType: type };
  headGroup.add(headMesh);

  // Protruding 3D Nose
  const noseMesh = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.13, 12), skinMat);
  noseMesh.rotation.x = Math.PI / 2.2;
  noseMesh.position.set(0, 0.01, 0.24);
  headGroup.add(noseMesh);

  // Big Cartoon Eyes
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshBasicMaterial({ color: type === 'ROBBER' ? 0xff0000 : 0x09090b });

  const eyeL = new THREE.Group();
  eyeL.position.set(-0.08, 0.06, 0.18);
  eyeL.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), eyeWhiteMat));
  const pupilLMesh = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 12), pupilMat);
  pupilLMesh.position.set(0, 0, 0.04);
  eyeL.add(pupilLMesh);
  headGroup.add(eyeL);

  const eyeR = new THREE.Group();
  eyeR.position.set(0.08, 0.06, 0.18);
  eyeR.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), eyeWhiteMat));
  const pupilRMesh = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 12), pupilMat);
  pupilRMesh.position.set(0, 0, 0.04);
  eyeR.add(pupilRMesh);
  headGroup.add(eyeR);

  // Red mouth
  const mouthGeo = new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI * 0.8);
  const mouthMesh = new THREE.Mesh(mouthGeo, new THREE.MeshBasicMaterial({ color: type === 'ROBBER' ? 0x991b1b : 0xdc2626 }));
  mouthMesh.position.set(0, -0.1, 0.2);
  mouthMesh.rotation.z = Math.PI;
  headGroup.add(mouthMesh);

  // Headgear
  if (type === 'ROBBER') {
    if (variant.id === 'BALACLAVA') {
      const maskMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.3), new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 }));
      maskMesh.position.set(0, 0.18, 0);
      headGroup.add(maskMesh);
    } else if (variant.id === 'PUNK') {
      const mohawk = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.35), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
      mohawk.position.set(0, 0.24, 0);
      headGroup.add(mohawk);
    } else if (variant.id === 'PAPER_BAG') {
      const bag = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.38), new THREE.MeshStandardMaterial({ color: 0xb45309 }));
      bag.position.set(0, 0.04, 0);
      headGroup.add(bag);
    } else if (variant.id === 'MAFIA') {
      const fedoraCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.14, 16), new THREE.MeshStandardMaterial({ color: 0x09090b }));
      fedoraCrown.position.set(0, 0.22, 0);
      headGroup.add(fedoraCrown);
    }
  } else {
    if (variant.id === 'VISOR_CLERK') {
      const capMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 18), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
      capMesh.position.set(0, 0.18, 0);
      headGroup.add(capMesh);
    }
  }

  npc.add(headGroup);
  npc.head = headGroup;

  // Arms
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.28, 0.95, 0);
  leftArmGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.24, 12), clothesMat));
  npc.add(leftArmGroup);
  npc.leftArm = leftArmGroup;

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.28, 0.95, 0);
  rightArmGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.24, 12), clothesMat));
  npc.add(rightArmGroup);
  npc.rightArm = rightArmGroup;

  // Props
  const propGroup = new THREE.Group();
  npc.add(propGroup);
  npc.propGroup = propGroup;

  if (type === 'EMPLOYEE') {
    leftArmGroup.rotation.x = -Math.PI / 4;
    rightArmGroup.rotation.x = -Math.PI / 4;
    propGroup.position.set(0, 0.68, 0.38);

    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.35), new THREE.MeshStandardMaterial({ color: 0x78350f }));
    propGroup.add(tray);
    const burger = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    burger.position.set(-0.1, 0.04, 0);
    propGroup.add(burger);
    const fries = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.06), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    fries.position.set(0.08, 0.07, -0.05);
    propGroup.add(fries);
  } else {
    rightArmGroup.rotation.x = -Math.PI / 2.05;
    rightArmGroup.rotation.y = -0.12;

    const robberGun = new THREE.Group();
    robberGun.position.set(0.28, 0.72, 0.48);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    robberGun.add(new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.055, 0.22), gunMat));

    const robberFlash = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0 }));
    robberFlash.position.set(0, 0, 0.2);
    robberGun.add(robberFlash);

    npc.add(robberGun);
    npc.robberGun = robberGun;
    npc.robberFlash = robberFlash;
  }

  npc.triggerGunRecoil = () => {
    npc.shootAnimProgress = 1.0;
  };

  npc.position.set(-1.25, 0.05, 0);
  npc.rotation.y = Math.PI / 2;

  return npc;
}

/* ==========================================================================
   4. GAME CONTROLLER & SIMULATION
   ========================================================================== */
class Game {
  constructor() {
    this.highScoreKey = 'drivethru_vigilante_highscore';
    this.highScore = parseInt(localStorage.getItem(this.highScoreKey) || '0', 10);
    this.score = 0;
    this.timeLeft = 60;
    this.phase = 'START'; // 'START' | 'PLAYING' | 'GAMEOVER'
    this.ammo = 2;
    this.isReloading = false;
    this.isDucking = false;
    this.isAiming = false;
    this.isGunEquipped = true;
    this.robbersDefeated = 0;
    this.ordersCompleted = 0;
    this.gameOverReason = 'TIME_OUT';
    this.targetLocked = false;

    // DOM Elements
    this.canvasContainer = document.getElementById('canvas-container');
    this.scoreEl = document.getElementById('hud-score');
    this.highScoreEl = document.getElementById('hud-highscore');
    this.timerEl = document.getElementById('hud-timer');
    this.timerWrapper = document.getElementById('timer-wrapper');
    this.ammoIcons = [document.getElementById('shell-0'), document.getElementById('shell-1')];
    this.ammoText = document.getElementById('ammo-text');
    this.bannerWrapper = document.getElementById('banner-wrapper');
    this.duckIndicator = document.getElementById('duck-indicator');
    this.crosshair = document.getElementById('crosshair');
    this.crosshairRing = document.getElementById('crosshair-ring');
    this.crosshairBadge = document.getElementById('crosshair-badge');
    this.bloodFlash = document.getElementById('blood-flash');
    this.popupContainer = document.getElementById('popup-container');
    this.startScreen = document.getElementById('start-screen');
    this.gameOverModal = document.getElementById('gameover-modal');

    // 3D Engine objects
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.cockpit = null;
    this.shotgun = null;
    this.booth = null;
    this.currentNpc = null;
    this.npcType = 'NONE';
    this.npcTimer = 0;
    this.hasRobberFired = false;
    this.isAtWindow = false;
    this.isTransitioning = true;
    this.travelSpeed = 30;

    // Camera look
    this.BASE_YAW = 0.62;
    this.targetYaw = this.BASE_YAW;
    this.targetPitch = 0.0;
    this.currentYaw = this.BASE_YAW;
    this.currentPitch = 0.0;
    this.cursorNDC = new THREE.Vector2(0, 0);

    // FX
    this.sparks = [];
    this.shellMesh = null;
    this.shellState = { vel: new THREE.Vector3(), rotVel: new THREE.Vector3(), life: 0 };
    this.recoilOffset = 0;
    this.recoilPitch = 0;
    this.cameraKickZ = 0;
    this.cameraKickPitch = 0;

    this.init3D();
    this.bindEvents();
    this.updateHUD();
  }

  init3D() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.canvasContainer.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.035);

    this.camera = new THREE.PerspectiveCamera(72, width / height, 0.1, 100);
    this.camera.position.set(0, 1.15, 0);
    this.camera.rotation.order = 'YXZ';

    // Lighting
    const ambientLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.9);
    this.scene.add(ambientLight);
    const streetLight = new THREE.DirectionalLight(0xffedd5, 2.5);
    streetLight.position.set(4, 15, -3);
    this.scene.add(streetLight);

    // Road
    this.roadTexture = createRoadTexture();
    this.roadTexture.repeat.set(1, 24);
    const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 140), new THREE.MeshStandardMaterial({ map: this.roadTexture, roughness: 0.8 }));
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, -40);
    this.scene.add(roadMesh);

    // City Buildings
    const bldgMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    for (let i = 0; i < 16; i++) {
      const h = 8 + Math.random() * 15;
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(4 + Math.random() * 4, h, 6), bldgMat);
      bMesh.position.set(6.5 + Math.random() * 4, h / 2, -10 - i * 8);
      this.scene.add(bMesh);
    }

    // Cockpit & Shotgun
    this.cockpit = createCockpit();
    this.cockpit.position.set(0, 0.95, 0);
    this.scene.add(this.cockpit);

    this.shotgun = createShotgun();
    this.cockpit.add(this.shotgun);

    // Sparks Pool
    const sparkGeo = new THREE.SphereGeometry(0.02, 6, 6);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    for (let i = 0; i < 24; i++) {
      const sMesh = new THREE.Mesh(sparkGeo, sparkMat);
      sMesh.visible = false;
      this.scene.add(sMesh);
      this.sparks.push({ mesh: sMesh, vel: new THREE.Vector3(), life: 0 });
    }

    // Shell
    this.shellMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 8), new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 }));
    this.shellMesh.visible = false;
    this.scene.add(this.shellMesh);

    // Booth
    this.TARGET_STOP_Z = -1.6;
    this.booth = createDriveThruBooth();
    this.booth.position.set(0, 0, -28);
    this.scene.add(this.booth);

    this.raycaster = new THREE.Raycaster();

    this.spawnNewNpc();

    // Start render loop
    this.clock = new THREE.Clock();
    this.tick = this.tick.bind(this);
    requestAnimationFrame(this.tick);
  }

  spawnNewNpc() {
    if (this.currentNpc) {
      this.booth.remove(this.currentNpc);
      this.currentNpc = null;
    }

    this.npcType = Math.random() < 0.5 ? 'ROBBER' : 'EMPLOYEE';
    this.npcTimer = this.npcType === 'ROBBER' ? (0.8 + Math.random() * 1.5) : 2.4;
    this.hasRobberFired = false;

    this.currentNpc = createNpc(this.npcType);
    this.booth.add(this.currentNpc);

    if (this.npcType === 'ROBBER') {
      soundManager.playRobberWarning();
    }

    this.updateBanner();
  }

  departToNextWindow() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.isAtWindow = false;
    this.targetLocked = false;
    this.updateBanner();
    this.travelSpeed = 46;
  }

  fireShotgun() {
    if (this.phase !== 'PLAYING' || this.isReloading) return;

    if (this.ammo <= 0) {
      soundManager.playEmptyClick();
      return;
    }

    this.ammo--;
    this.updateHUD();
    soundManager.playShotgun();

    // Recoil
    this.recoilOffset = 0.28;
    this.recoilPitch = 0.3;
    this.cameraKickZ = 0.18;
    this.cameraKickPitch = 0.2;

    // Flash
    this.shotgun.muzzleFlash.children.forEach((c) => { c.material.opacity = 1.0; });
    this.shotgun.muzzleFlash.scale.set(1.7, 1.7, 1.7);
    this.shotgun.muzzleLight.intensity = 50;

    setTimeout(() => {
      this.shotgun.muzzleFlash.children.forEach((c) => { c.material.opacity = 0; });
      this.shotgun.muzzleLight.intensity = 0;
    }, 60);

    // Sparks
    const muzzlePos = new THREE.Vector3();
    this.shotgun.muzzle.getWorldPosition(muzzlePos);
    this.sparks.forEach((s) => {
      s.mesh.position.copy(muzzlePos);
      s.mesh.visible = true;
      s.life = 0.35 + Math.random() * 0.2;
      const dir = new THREE.Vector3(
        this.cursorNDC.x * 0.4 + (Math.random() - 0.5) * 0.2,
        this.cursorNDC.y * 0.3 + (Math.random() - 0.5) * 0.2,
        -1
      ).applyEuler(this.camera.rotation).normalize();
      s.vel.copy(dir).multiplyScalar(16 + Math.random() * 22);
    });

    // Shell
    const ejectPos = new THREE.Vector3();
    this.shotgun.ejectionPort.getWorldPosition(ejectPos);
    this.shellMesh.position.copy(ejectPos);
    this.shellMesh.visible = true;
    this.shellState.life = 0.7;
    this.shellState.vel.set(2.5 + Math.random() * 1.5, 3.2 + Math.random() * 1.5, (Math.random() - 0.5) * 2);
    this.shellState.rotVel.set(Math.random() * 20, Math.random() * 20, Math.random() * 20);

    // Raycast hit
    this.raycaster.setFromCamera(this.cursorNDC, this.camera);
    if (this.currentNpc && !this.currentNpc.isKnockedOut && this.isAtWindow) {
      const hits = this.raycaster.intersectObjects(this.currentNpc.children, true);
      if (hits.length > 0 || this.targetLocked) {
        if (this.npcType === 'ROBBER') {
          this.currentNpc.isKnockedOut = true;
          this.score += 100;
          this.robbersDefeated++;
          soundManager.playRobberDefeated();
          this.addPopup('+100 💀 강도 제압!', 'robber');
          this.updateHUD();
          setTimeout(() => this.departToNextWindow(), 200);
        } else if (this.npcType === 'EMPLOYEE') {
          soundManager.playGameOver();
          this.triggerGameOver('SHOT_INNOCENT');
        }
      }
    }
  }

  orderBurger() {
    if (this.phase !== 'PLAYING') return;
    if (this.isAtWindow && this.npcType === 'EMPLOYEE' && this.currentNpc && !this.currentNpc.isKnockedOut) {
      soundManager.playOrderSuccess();
      this.score += 50;
      this.ordersCompleted++;
      this.currentNpc.isKnockedOut = true;
      this.addPopup('+50 🍔 주문 성공!', 'order');
      this.updateHUD();
      setTimeout(() => this.departToNextWindow(), 180);
    }
  }

  reload() {
    if (this.isReloading || this.ammo >= 2) return;
    this.isReloading = true;
    soundManager.playReload();
    this.updateHUD();

    setTimeout(() => {
      this.ammo = 2;
      this.isReloading = false;
      this.updateHUD();
    }, 600);
  }

  toggleDuck() {
    this.isDucking = !this.isDucking;
    if (this.isDucking) soundManager.playDodgeWhoosh();
    this.updateHUD();
  }

  addPopup(text, type) {
    const el = document.createElement('div');
    el.className = `font-black text-2xl sm:text-3xl animate-bounce drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] ${
      type === 'robber' ? 'text-amber-400' : 'text-emerald-400'
    }`;
    el.innerText = text;
    this.popupContainer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  triggerGameOver(reason) {
    this.phase = 'GAMEOVER';
    this.gameOverReason = reason;

    if (reason !== 'TIME_OUT') {
      this.bloodFlash.classList.remove('hidden');
      setTimeout(() => this.bloodFlash.classList.add('hidden'), 800);
    }

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem(this.highScoreKey, this.score.toString());
      document.getElementById('new-record-badge').classList.remove('hidden');
    } else {
      document.getElementById('new-record-badge').classList.add('hidden');
    }

    // Modal texts
    const titleEl = document.getElementById('gameover-title');
    const descEl = document.getElementById('gameover-desc');

    if (reason === 'SHOT_BY_ROBBER') {
      titleEl.innerText = '강도의 총알에 피격당했습니다!';
      descEl.innerText = '강도가 총을 쏠 때는 Shift 키(🛡️)로 차문 아래로 숙여 피해야 합니다.';
    } else if (reason === 'SHOT_INNOCENT') {
      titleEl.innerText = '무고한 매장 직원을 사살했습니다!';
      descEl.innerText = '직원이 나올 때는 샷건 대신 E 키(🍔)로 버거를 주문해야 합니다.';
    } else {
      titleEl.innerText = '60초 제한 시간이 종료되었습니다!';
      descEl.innerText = '1분 동안 드라이빙스루 차선을 훌륭히 수호했습니다!';
    }

    document.getElementById('gameover-final-score').innerText = `${this.score}점`;
    document.getElementById('gameover-robbers').innerText = `${this.robbersDefeated}명 (+${this.robbersDefeated * 100}점)`;
    document.getElementById('gameover-orders').innerText = `${this.ordersCompleted}건 (+${this.ordersCompleted * 50}점)`;
    document.getElementById('gameover-highscore').innerText = `${this.highScore}점`;

    this.gameOverModal.classList.remove('hidden');
    this.updateHUD();
  }

  startGame() {
    this.score = 0;
    this.timeLeft = 60;
    this.ammo = 2;
    this.isReloading = false;
    this.isDucking = false;
    this.isAiming = false;
    this.robbersDefeated = 0;
    this.ordersCompleted = 0;
    this.phase = 'PLAYING';

    this.startScreen.classList.add('hidden');
    this.gameOverModal.classList.add('hidden');
    this.updateHUD();

    if (this.roundInterval) clearInterval(this.roundInterval);
    this.roundInterval = setInterval(() => {
      this.timeLeft--;
      this.updateHUD();
      if (this.timeLeft <= 0) {
        clearInterval(this.roundInterval);
        this.triggerGameOver('TIME_OUT');
      }
    }, 1000);
  }

  updateHUD() {
    this.scoreEl.innerText = this.score;
    this.highScoreEl.innerText = this.highScore;
    this.timerEl.innerText = `${this.timeLeft}s`;

    if (this.timeLeft <= 10) {
      this.timerWrapper.className = 'px-4 py-1.5 rounded-xl border font-mono font-black text-center shadow-lg bg-red-950/90 border-red-500 text-red-400 animate-bounce';
    } else {
      this.timerWrapper.className = 'px-4 py-1.5 rounded-xl border font-mono font-black text-center shadow-lg bg-stone-900/90 border-amber-500/60 text-amber-300';
    }

    // Ammo
    this.ammoIcons.forEach((el, idx) => {
      if (idx < this.ammo) {
        el.className = 'w-3.5 h-6 rounded-xs border bg-red-600 border-amber-300 shadow-[0_0_8px_rgba(239,68,68,0.7)]';
      } else {
        el.className = 'w-3.5 h-6 rounded-xs border bg-stone-800 border-stone-600 opacity-30';
      }
    });
    this.ammoText.innerText = this.isReloading ? '🔄' : `${this.ammo}/2`;

    // Duck
    if (this.isDucking) {
      this.duckIndicator.classList.remove('hidden');
      document.getElementById('btn-duck').className = 'flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl active:scale-95 border transition cursor-pointer bg-blue-600 border-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.8)] text-white';
    } else {
      this.duckIndicator.classList.add('hidden');
      document.getElementById('btn-duck').className = 'flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl active:scale-95 border transition cursor-pointer bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200';
    }

    // Aim Button
    if (this.isAiming) {
      document.getElementById('btn-aim').className = 'flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl active:scale-95 border transition cursor-pointer bg-red-600 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.8)] text-white';
    } else {
      document.getElementById('btn-aim').className = 'flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl active:scale-95 border transition cursor-pointer bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300';
    }
  }

  updateBanner() {
    if (this.isAtWindow && this.currentNpc && !this.currentNpc.isKnockedOut) {
      if (this.npcType === 'ROBBER') {
        this.bannerWrapper.innerHTML = `
          <div class="bg-red-950/95 border-2 border-red-500 rounded-2xl px-4 py-2 text-center shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse max-w-sm">
            <div class="text-red-300 font-black text-sm sm:text-base">⚠️ 무장 강도 출현! (${this.npcTimer.toFixed(1)}s)</div>
            <div class="text-xs text-red-200 font-bold mt-0.5">${this.isDucking ? '<span class="text-emerald-400 font-black">🛡️ 회피 성공 중! 샷건으로 제압하세요!</span>' : '<span class="text-amber-300">Shift 키(🛡️)로 즉시 숙여 총알을 피하세요!</span>'}</div>
          </div>
        `;
      } else {
        this.bannerWrapper.innerHTML = `
          <div class="bg-emerald-950/95 border-2 border-emerald-500 rounded-2xl px-4 py-2 text-center shadow-[0_0_20px_rgba(16,185,129,0.5)] max-w-sm">
            <div class="text-emerald-300 font-black text-sm sm:text-base">🍔 버거 매장 직원 (${this.npcTimer.toFixed(1)}s)</div>
            <div class="text-xs text-emerald-200 font-bold mt-0.5">E 키(🍔 버튼)를 눌러 버거를 주문하세요! (사격 금지!)</div>
          </div>
        `;
      }
    } else {
      this.bannerWrapper.innerHTML = `
        <div class="bg-stone-900/80 border border-stone-700/60 rounded-full px-3.5 py-1 text-stone-300 text-xs font-bold shadow-md">
          🚗 다음 창구로 자동 주행 중...
        </div>
      `;
    }
  }

  bindEvents() {
    // Window Resize
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    // Mouse Move (NO POINTER LOCK - Free lightgun aiming)
    window.addEventListener('mousemove', (e) => {
      this.cursorNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.cursorNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Position crosshair directly over mouse cursor
      this.crosshair.style.left = `${e.clientX}px`;
      this.crosshair.style.top = `${e.clientY}px`;

      // Camera smoothly pans with mouse
      this.targetYaw = this.BASE_YAW + (-this.cursorNDC.x) * 0.42;
      this.targetPitch = this.cursorNDC.y * 0.25;
    });

    // Mouse Down (Left click shoot, Right click zoom ADS)
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.fireShotgun();
      } else if (e.button === 2) {
        e.preventDefault();
        this.isAiming = true;
        this.updateHUD();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        e.preventDefault();
        this.isAiming = false;
        this.updateHUD();
      }
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (e.key === 'Shift') {
        this.isDucking = true;
        soundManager.playDodgeWhoosh();
        this.updateHUD();
      }
      if (key === 'r') this.reload();
      if (key === 'e') this.orderBurger();
      if (e.code === 'Space') {
        e.preventDefault();
        this.fireShotgun();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') {
        this.isDucking = false;
        this.updateHUD();
      }
    });

    // Touch button bindings
    document.getElementById('btn-duck').addEventListener('click', () => this.toggleDuck());
    document.getElementById('btn-gun').addEventListener('click', () => {
      this.isGunEquipped = !this.isGunEquipped;
    });
    document.getElementById('btn-aim').addEventListener('click', () => {
      this.isAiming = !this.isAiming;
      this.updateHUD();
    });
    document.getElementById('btn-fire').addEventListener('click', () => this.fireShotgun());
    document.getElementById('btn-reload').addEventListener('click', () => this.reload());
    document.getElementById('btn-order').addEventListener('click', () => this.orderBurger());

    document.getElementById('btn-mute').addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      document.getElementById('mute-icon').innerText = isMuted ? '🔇' : '🔊';
    });

    document.getElementById('btn-start').addEventListener('click', () => this.startGame());
    document.getElementById('btn-restart').addEventListener('click', () => this.startGame());
  }

  tick() {
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Camera Look
    this.currentYaw = THREE.MathUtils.damp(this.currentYaw, this.targetYaw, 18, delta);
    this.currentPitch = THREE.MathUtils.damp(this.currentPitch, this.targetPitch, 18, delta);
    this.cameraKickZ = THREE.MathUtils.damp(this.cameraKickZ, 0, 16, delta);
    this.cameraKickPitch = THREE.MathUtils.damp(this.cameraKickPitch, 0, 16, delta);

    let targetCamX = 0;
    let targetCamY = this.isDucking ? 0.58 : 1.15;
    let targetCamZ = this.cameraKickZ;

    if (this.isAiming && !this.isDucking) {
      targetCamX = -0.22;
      targetCamY = 1.16;
      targetCamZ = -0.15 + this.cameraKickZ;
    }

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 14, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 18, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 16, delta);

    this.camera.rotation.y = this.currentYaw + (this.isDucking ? -0.12 : 0);
    this.camera.rotation.x = this.currentPitch + (this.isDucking ? -0.18 : 0) + this.cameraKickPitch;

    // ADS Zoom
    const targetFov = this.isAiming ? 32 : 72;
    if (Math.abs(this.camera.fov - targetFov) > 0.1) {
      this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 16, delta);
      this.camera.updateProjectionMatrix();
    }

    // 2. Automatic Driving
    if (this.isTransitioning) {
      this.roadTexture.offset.y = (this.roadTexture.offset.y + delta * (this.travelSpeed * 0.06)) % 1;
      this.cockpit.gaugeNeedle.rotation.z = -Math.PI * 0.6 + (this.travelSpeed / 45) * Math.PI * 1.2;

      if (this.booth.position.z >= 12) {
        this.booth.position.z = -28;
        this.spawnNewNpc();
      } else if (this.booth.position.z < this.TARGET_STOP_Z) {
        this.booth.position.z += this.travelSpeed * delta;
        if (this.booth.position.z >= this.TARGET_STOP_Z) {
          this.booth.position.z = this.TARGET_STOP_Z;
          this.isTransitioning = false;
          this.isAtWindow = true;
          this.updateBanner();
        }
      } else {
        this.booth.position.z += this.travelSpeed * delta;
      }
    } else {
      this.cockpit.gaugeNeedle.rotation.z = -Math.PI * 0.6;
    }

    // 3. Target Lock Detection
    this.raycaster.setFromCamera(this.cursorNDC, this.camera);
    let isAimingAtNpc = false;

    if (this.currentNpc && !this.currentNpc.isKnockedOut && this.isAtWindow) {
      const hits = this.raycaster.intersectObjects(this.currentNpc.children, true);
      if (hits.length > 0) {
        isAimingAtNpc = true;
      } else {
        const npcPos = new THREE.Vector3();
        this.currentNpc.getWorldPosition(npcPos);
        npcPos.y += 1.0;
        const angle = this.raycaster.ray.direction.angleTo(npcPos.clone().sub(this.camera.position).normalize());
        if (angle < 0.32) isAimingAtNpc = true;
      }
    }

    if (isAimingAtNpc !== this.targetLocked) {
      this.targetLocked = isAimingAtNpc;
      if (this.targetLocked) {
        this.crosshairRing.className = 'w-11 h-11 border-2 rounded-full flex items-center justify-center transition-all border-red-500 bg-red-500/20 shadow-[0_0_18px_rgba(239,68,68,1)]';
        this.crosshairBadge.innerText = '🎯 조준 완료 (발사 가능!)';
        this.crosshairBadge.className = 'absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-red-200 uppercase tracking-widest font-black whitespace-nowrap bg-red-950/90 px-2 py-0.5 rounded border border-red-500 shadow-md animate-pulse';
      } else {
        this.crosshairRing.className = 'w-11 h-11 border-2 rounded-full flex items-center justify-center transition-all border-red-500/60';
        this.crosshairBadge.innerText = this.isAiming ? '🎯 줌인 조준 중' : '';
        this.crosshairBadge.className = this.isAiming
          ? 'absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-red-300 uppercase tracking-widest font-black whitespace-nowrap bg-stone-900/90 px-2 py-0.5 rounded border border-stone-700'
          : 'hidden';
      }
    }

    // 4. Update Sparks & Shells
    this.sparks.forEach((s) => {
      if (s.life > 0) {
        s.life -= delta;
        s.mesh.position.addScaledVector(s.vel, delta);
        s.vel.y -= 9.8 * delta;
        if (s.life <= 0) s.mesh.visible = false;
      }
    });

    if (this.shellState.life > 0) {
      this.shellState.life -= delta;
      this.shellMesh.position.addScaledVector(this.shellState.vel, delta);
      this.shellState.vel.y -= 12.0 * delta;
      this.shellMesh.rotation.x += this.shellState.rotVel.x * delta;
      this.shellMesh.rotation.y += this.shellState.rotVel.y * delta;
      if (this.shellState.life <= 0) this.shellMesh.visible = false;
    }

    // 5. NPC Reaction Logic
    if (this.phase === 'PLAYING' && this.isAtWindow && this.currentNpc && !this.currentNpc.isKnockedOut) {
      this.npcTimer -= delta;

      if (this.npcType === 'ROBBER') {
        this.currentNpc.rightArm.rotation.x = -Math.PI / 2.05 + Math.sin(this.clock.getElapsedTime() * 7) * 0.03;
        this.currentNpc.rightArm.rotation.y = -0.12 + Math.cos(this.clock.getElapsedTime() * 5) * 0.02;

        if (this.currentNpc.shootAnimProgress > 0.01) {
          this.currentNpc.shootAnimProgress = THREE.MathUtils.damp(this.currentNpc.shootAnimProgress, 0, 6, delta);
          this.currentNpc.rightArm.rotation.x += this.currentNpc.shootAnimProgress * 0.75;
          this.currentNpc.head.rotation.x = -this.currentNpc.shootAnimProgress * 0.35;
        }

        if (this.npcTimer <= 0 && !this.hasRobberFired) {
          this.hasRobberFired = true;
          soundManager.playRobberGunfire();
          this.currentNpc.triggerGunRecoil();

          if (this.currentNpc.robberFlash) {
            this.currentNpc.robberFlash.material.opacity = 1.0;
            setTimeout(() => {
              if (this.currentNpc && this.currentNpc.robberFlash) {
                this.currentNpc.robberFlash.material.opacity = 0;
              }
            }, 70);
          }

          if (this.isDucking) {
            soundManager.playDodgeWhoosh();
            this.addPopup('💨 총알 회피 성공!', 'robber');
          } else {
            soundManager.playGameOver();
            this.triggerGameOver('SHOT_BY_ROBBER');
          }
        }
      } else if (this.npcType === 'EMPLOYEE') {
        this.currentNpc.propGroup.position.y = 0.68 + Math.sin(this.clock.getElapsedTime() * 5) * 0.02;
        if (this.npcTimer <= 0) {
          this.currentNpc.isKnockedOut = true;
          setTimeout(() => this.departToNextWindow(), 300);
        }
      }
    }

    // Knockout animation
    if (this.currentNpc && this.currentNpc.isKnockedOut) {
      this.currentNpc.knockProgress = Math.min(1, this.currentNpc.knockProgress + delta * 4.5);
      this.currentNpc.position.z = -this.currentNpc.knockProgress * 1.5;
      this.currentNpc.position.y = 0.05 - this.currentNpc.knockProgress * 0.8;
      this.currentNpc.rotation.x = -this.currentNpc.knockProgress * 1.6;
      this.currentNpc.rotation.z = this.currentNpc.knockProgress * 0.5;
    }

    if (this.currentNpc && this.currentNpc.billboardMesh) {
      this.currentNpc.billboardMesh.lookAt(this.camera.position);
    }

    // Shotgun positioning
    this.recoilOffset = THREE.MathUtils.damp(this.recoilOffset, 0, 14, delta);
    this.recoilPitch = THREE.MathUtils.damp(this.recoilPitch, 0, 14, delta);

    let targetGunX = 0.16;
    let targetGunY = -0.28;
    let targetGunZ = -0.5;

    if (!this.isGunEquipped) {
      targetGunY = -0.55;
      targetGunZ = -0.42;
    } else if (this.isAiming) {
      targetGunX = -0.01;
      targetGunY = -0.14;
      targetGunZ = -0.38;
    }

    this.shotgun.position.x = THREE.MathUtils.damp(this.shotgun.position.x, targetGunX, 16, delta);
    this.shotgun.position.y = THREE.MathUtils.damp(this.shotgun.position.y, targetGunY + this.recoilPitch * 0.1, 18, delta);
    this.shotgun.position.z = THREE.MathUtils.damp(this.shotgun.position.z, targetGunZ + this.recoilOffset, 18, delta);
    this.shotgun.rotation.x = THREE.MathUtils.damp(this.shotgun.rotation.x, this.recoilPitch, 18, delta);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.tick);
  }
}

// Instantiate game on load
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
