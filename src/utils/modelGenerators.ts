/**
 * Procedural 3D Models for Drive-Thru Vigilante 3D (드라이빙스루 무법자 3D).
 * Features:
 * - Diverse robber appearances (Balaclava, Mohawk Punk, Paper Bag, Clown, Mafia Boss)
 * - Diverse friendly employees (Visor clerk, Chef, Drive-thru headset trainee)
 * - Exact driver eye-level alignment (head at y = 1.15)
 * - Robber shooting recoil motion and randomized attack timing
 * - Spectacular shotgun action elements
 */
import * as THREE from 'three';
import { createMenuBoardTexture, createSpeedometerTexture } from './proceduralTextures';

export interface CockpitGroup extends THREE.Group {
  steeringWheel: THREE.Group;
  gaugeNeedle: THREE.Mesh;
}

export interface ShotgunGroup extends THREE.Group {
  muzzle: THREE.Object3D;
  muzzleFlash: THREE.Group;
  muzzleLight: THREE.PointLight;
  ejectionPort: THREE.Object3D;
}

export interface NpcGroup extends THREE.Group {
  npcType: 'EMPLOYEE' | 'ROBBER';
  variantName: string;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  propGroup: THREE.Group;
  robberGun?: THREE.Group;
  robberFlash?: THREE.Mesh;
  billboardMesh: THREE.Mesh;
  hitbox: THREE.Mesh;
  isKnockedOut: boolean;
  knockProgress: number;
  shootAnimProgress: number;
  triggerGunRecoil: () => void;
}

/**
 * Creates 3D overhead name badge billboard for the NPC
 */
function createNpcBillboard(type: 'EMPLOYEE' | 'ROBBER', subtitle: string): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = type === 'ROBBER' ? 'rgba(220, 38, 38, 0.95)' : 'rgba(16, 185, 129, 0.95)';
  ctx.roundRect(10, 10, 492, 108, 24);
  ctx.fill();

  ctx.lineWidth = 6;
  ctx.strokeStyle = '#ffffff';
  ctx.roundRect(10, 10, 492, 108, 24);
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
  texture.colorSpace = THREE.SRGBColorSpace;

  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const geo = new THREE.PlaneGeometry(1.6, 0.4);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 1.55, 0); // Positioned nicely above eye level
  return mesh;
}

/**
 * Creates the 1st person muscle car cockpit interior.
 */
export function createCockpit(): CockpitGroup {
  const cockpit = new THREE.Group() as CockpitGroup;

  const dashMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.85,
    metalness: 0.1,
  });
  const dashTrimMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.35,
    metalness: 0.75,
  });

  // Dashboard Base
  const dashGeo = new THREE.BoxGeometry(2.4, 0.36, 0.8);
  const dashMesh = new THREE.Mesh(dashGeo, dashMat);
  dashMesh.position.set(-0.1, -0.46, -0.6);
  cockpit.add(dashMesh);

  // Speedometer Gauge
  const speedoTex = createSpeedometerTexture();
  const speedoMat = new THREE.MeshBasicMaterial({ map: speedoTex });
  const speedoGeo = new THREE.PlaneGeometry(0.2, 0.2);
  const speedoMesh = new THREE.Mesh(speedoGeo, speedoMat);
  speedoMesh.position.set(-0.25, -0.32, -0.48);
  speedoMesh.rotation.x = -Math.PI / 10;
  cockpit.add(speedoMesh);

  const needleGeo = new THREE.BoxGeometry(0.01, 0.07, 0.005);
  const needleMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const needleMesh = new THREE.Mesh(needleGeo, needleMat);
  needleMesh.position.set(-0.25, -0.32, -0.47);
  cockpit.add(needleMesh);
  cockpit.gaugeNeedle = needleMesh;

  // Steering Wheel
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(-0.25, -0.36, -0.38);
  wheelGroup.rotation.x = 0.25;

  const rimGeo = new THREE.TorusGeometry(0.16, 0.02, 12, 32);
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x09090b,
    roughness: 0.6,
    metalness: 0.2,
  });
  const rimMesh = new THREE.Mesh(rimGeo, wheelMat);
  wheelGroup.add(rimMesh);

  const hubGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16);
  const hubMesh = new THREE.Mesh(hubGeo, dashTrimMat);
  hubMesh.rotation.x = Math.PI / 2;
  wheelGroup.add(hubMesh);

  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
    const spokeGeo = new THREE.BoxGeometry(0.11, 0.018, 0.015);
    const spokeMesh = new THREE.Mesh(spokeGeo, dashTrimMat);
    spokeMesh.position.set(Math.cos(angle) * 0.065, Math.sin(angle) * 0.065, 0);
    spokeMesh.rotation.z = angle;
    wheelGroup.add(spokeMesh);
  }

  cockpit.add(wheelGroup);
  cockpit.steeringWheel = wheelGroup;

  // Driver door armrest (tucked low)
  const doorPanelGeo = new THREE.BoxGeometry(0.2, 0.5, 1.4);
  const doorPanel = new THREE.Mesh(doorPanelGeo, dashMat);
  doorPanel.position.set(-0.85, -0.64, 0.0);
  cockpit.add(doorPanel);

  // Car hood extending forward
  const hoodGeo = new THREE.BoxGeometry(1.9, 0.1, 2.0);
  const hoodMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.35,
    metalness: 0.4,
  });
  const hoodMesh = new THREE.Mesh(hoodGeo, hoodMat);
  hoodMesh.position.set(-0.05, -0.38, -1.7);
  cockpit.add(hoodMesh);

  return cockpit;
}

/**
 * Creates the spectacular 1st person tactical shotgun
 */
export function createShotgun(): ShotgunGroup {
  const shotgun = new THREE.Group() as ShotgunGroup;

  const gunMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.2,
    metalness: 0.9,
  });

  const gunWoodMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.6,
    metalness: 0.1,
  });

  // Twin Barrels
  const barrelGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.68, 16);
  const barrelMesh = new THREE.Mesh(barrelGeo, gunMetalMat);
  barrelMesh.rotation.x = Math.PI / 2;
  barrelMesh.position.set(0, 0.02, -0.3);
  shotgun.add(barrelMesh);

  const barrel2Mesh = new THREE.Mesh(barrelGeo, gunMetalMat);
  barrel2Mesh.rotation.x = Math.PI / 2;
  barrel2Mesh.position.set(0, -0.02, -0.3);
  shotgun.add(barrel2Mesh);

  // Front Sight Bead
  const sightGeo = new THREE.SphereGeometry(0.008, 8, 8);
  const sightMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const sightMesh = new THREE.Mesh(sightGeo, sightMat);
  sightMesh.position.set(0, 0.056, -0.62);
  shotgun.add(sightMesh);

  // Receiver
  const recGeo = new THREE.BoxGeometry(0.068, 0.095, 0.24);
  const recMesh = new THREE.Mesh(recGeo, gunMetalMat);
  recMesh.position.set(0, 0, 0.08);
  shotgun.add(recMesh);

  // Pump grip
  const pumpGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.24, 12);
  const pumpMesh = new THREE.Mesh(pumpGeo, gunWoodMat);
  pumpMesh.rotation.x = Math.PI / 2;
  pumpMesh.position.set(0, -0.01, -0.22);
  shotgun.add(pumpMesh);

  // Stock
  const stockGeo = new THREE.BoxGeometry(0.055, 0.12, 0.38);
  const stockMesh = new THREE.Mesh(stockGeo, gunWoodMat);
  stockMesh.position.set(0, -0.1, 0.42);
  shotgun.add(stockMesh);

  // Muzzle Anchor
  const muzzleAnchor = new THREE.Object3D();
  muzzleAnchor.position.set(0, 0.02, -0.66);
  shotgun.add(muzzleAnchor);
  shotgun.muzzle = muzzleAnchor;

  // Ejection port
  const ejectionPort = new THREE.Object3D();
  ejectionPort.position.set(0.04, 0.02, 0.06);
  shotgun.add(ejectionPort);
  shotgun.ejectionPort = ejectionPort;

  // Multi-Layer Muzzle Flash Group
  const muzzleFlashGroup = new THREE.Group();
  muzzleFlashGroup.position.set(0, 0.02, -0.76);

  const coreGeo = new THREE.OctahedronGeometry(0.12, 0);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  muzzleFlashGroup.add(coreMesh);

  const outerGeo = new THREE.OctahedronGeometry(0.24, 0);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0xff7700,
    transparent: true,
    opacity: 0,
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  muzzleFlashGroup.add(outerMesh);

  const planeGeo = new THREE.PlaneGeometry(0.45, 0.45);
  const planeMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const plane1 = new THREE.Mesh(planeGeo, planeMat);
  const plane2 = new THREE.Mesh(planeGeo, planeMat);
  plane2.rotation.z = Math.PI / 4;
  muzzleFlashGroup.add(plane1);
  muzzleFlashGroup.add(plane2);

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

/**
 * Creates the Drive-Thru Building Booth.
 */
export function createDriveThruBooth(): THREE.Group {
  const booth = new THREE.Group();

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x9a3412,
    roughness: 0.85,
    metalness: 0.05,
  });
  const wallGeo = new THREE.BoxGeometry(1.2, 4.5, 8.0);
  const wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(-2.0, 2.2, 0);
  booth.add(wallMesh);

  // Wide Open Window Frame
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.25,
    metalness: 0.85,
  });
  const frameGeo = new THREE.BoxGeometry(0.3, 2.4, 3.6);
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.position.set(-1.4, 1.45, 0);
  booth.add(frameMesh);

  // Counter Shelf at y = 0.65
  const counterMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.2,
    metalness: 0.9,
  });
  const counterGeo = new THREE.BoxGeometry(0.7, 0.15, 3.8);
  const counterMesh = new THREE.Mesh(counterGeo, counterMat);
  counterMesh.position.set(-1.25, 0.65, 0);
  booth.add(counterMesh);

  // POS
  const posGeo = new THREE.BoxGeometry(0.26, 0.22, 0.26);
  const posMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  const posMesh = new THREE.Mesh(posGeo, posMat);
  posMesh.position.set(-1.3, 0.8, 0.85);
  booth.add(posMesh);

  // Canopy
  const canopyGeo = new THREE.BoxGeometry(2.2, 0.3, 4.8);
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
  const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
  canopyMesh.position.set(-1.7, 2.9, 0);
  booth.add(canopyMesh);

  // Drive-Thru Sign Banner
  const signBannerGeo = new THREE.BoxGeometry(0.1, 0.55, 3.8);
  const signBannerMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const signBanner = new THREE.Mesh(signBannerGeo, signBannerMat);
  signBanner.position.set(-0.95, 2.9, 0);
  booth.add(signBanner);

  // Floodlight on the counter
  const windowSpot = new THREE.SpotLight(0xfffbeb, 90, 12, Math.PI / 2.6, 0.2);
  windowSpot.position.set(-1.25, 2.8, 0);
  windowSpot.target.position.set(-1.25, 0.8, 0);
  booth.add(windowSpot);
  booth.add(windowSpot.target);

  // Menu board
  const menuGeo = new THREE.PlaneGeometry(1.8, 1.8);
  const menuTex = createMenuBoardTexture();
  const menuMat = new THREE.MeshBasicMaterial({ map: menuTex });
  const menuMesh = new THREE.Mesh(menuGeo, menuMat);
  menuMesh.position.set(-1.45, 1.6, -3.8);
  menuMesh.rotation.y = Math.PI / 2;
  booth.add(menuMesh);

  return booth;
}

/**
 * Creates stylized humanoid 3D NPC (Baldi-style 3D cartoon human).
 * Eyes are adjusted to driver eye level (y ~ 1.15) for natural, direct eye contact!
 * Includes multiple varied robber and employee archetypes.
 */
export function createNpc(type: 'EMPLOYEE' | 'ROBBER'): NpcGroup {
  const npc = new THREE.Group() as NpcGroup;
  npc.npcType = type;
  npc.isKnockedOut = false;
  npc.knockProgress = 0;
  npc.shootAnimProgress = 0;

  // Robber Variants
  const robberVariants = [
    { id: 'BALACLAVA', name: '복면 갱스터', skin: 0xfde047, clothes: 0x18181b },
    { id: 'PUNK', name: '모히칸 펑크 강도', skin: 0xfbcfe8, clothes: 0x581c87 },
    { id: 'PAPER_BAG', name: '종이봉투 괴도', skin: 0xd97706, clothes: 0xc2410c },
    { id: 'CLOWN', name: '광대 가면 강도', skin: 0xf8fafc, clothes: 0xca8a04 },
    { id: 'MAFIA', name: '선글라스 마피아', skin: 0xfcd34d, clothes: 0x0f172a },
  ];

  // Employee Variants
  const employeeVariants = [
    { id: 'VISOR_CLERK', name: '버거 매장 직원', skin: 0xfde047, clothes: 0xdc2626 },
    { id: 'CHEF_BURGER', name: '주방장 요리사', skin: 0xfbcfe8, clothes: 0xe2e8f0 },
    { id: 'TRAINEE', name: '헤드셋 신입 알바', skin: 0xfde047, clothes: 0x2563eb },
  ];

  const variant = type === 'ROBBER'
    ? robberVariants[Math.floor(Math.random() * robberVariants.length)]
    : employeeVariants[Math.floor(Math.random() * employeeVariants.length)];

  npc.variantName = variant.name;

  const skinMat = new THREE.MeshStandardMaterial({
    color: variant.skin,
    roughness: 0.55,
    metalness: 0.05,
  });

  const clothesMat = new THREE.MeshStandardMaterial({
    color: variant.clothes,
    roughness: 0.5,
    metalness: 0.1,
  });

  // Generous large hitbox centered at eye level
  const hitboxGeo = new THREE.BoxGeometry(1.4, 1.6, 1.2);
  const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
  hitbox.position.set(0, 1.05, 0);
  hitbox.userData = { isNpc: true, npcType: type };
  npc.add(hitbox);
  npc.hitbox = hitbox;

  // Overhead Billboard Badge
  const billboard = createNpcBillboard(type, variant.name);
  npc.add(billboard);
  npc.billboardMesh = billboard;

  // 1. Torso: Positioned so shoulders are at y ~ 0.95
  const torsoGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.65, 18);
  const torsoMesh = new THREE.Mesh(torsoGeo, clothesMat);
  torsoMesh.position.set(0, 0.72, 0);
  torsoMesh.userData = { isNpc: true, npcType: type };
  npc.add(torsoMesh);

  // Accessories on torso
  if (type === 'EMPLOYEE') {
    const apronMat = new THREE.MeshStandardMaterial({
      color: variant.id === 'CHEF_BURGER' ? 0xffffff : 0xfacc15,
      roughness: 0.6,
    });
    const apronGeo = new THREE.BoxGeometry(0.3, 0.45, 0.32);
    const apronMesh = new THREE.Mesh(apronGeo, apronMat);
    apronMesh.position.set(0, 0.68, 0);
    npc.add(apronMesh);
  } else if (variant.id === 'MAFIA') {
    // Red necktie
    const tieMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const tieGeo = new THREE.BoxGeometry(0.06, 0.35, 0.02);
    const tieMesh = new THREE.Mesh(tieGeo, tieMat);
    tieMesh.position.set(0, 0.72, 0.16);
    npc.add(tieMesh);
  } else {
    // Ammo belt
    const beltMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.7 });
    const beltGeo = new THREE.TorusGeometry(0.24, 0.03, 8, 16);
    const beltMesh = new THREE.Mesh(beltGeo, beltMat);
    beltMesh.position.set(0, 0.75, 0);
    beltMesh.rotation.x = Math.PI / 3;
    npc.add(beltMesh);
  }

  // 2. Neck
  const neckGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.14, 12);
  const neckMesh = new THREE.Mesh(neckGeo, skinMat);
  neckMesh.position.set(0, 1.05, 0);
  npc.add(neckMesh);

  // 3. Head Group (At driver eye level: y = 1.15)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.18, 0);

  const headGeo = new THREE.SphereGeometry(0.22, 24, 20);
  headGeo.scale(0.85, 1.12, 0.95);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.userData = { isNpc: true, npcType: type };
  headGroup.add(headMesh);

  // Prominent 3D Nose
  const noseGeo = new THREE.ConeGeometry(0.04, 0.13, 12);
  const noseMat = new THREE.MeshStandardMaterial({
    color: variant.id === 'CLOWN' ? 0xef4444 : variant.skin,
    roughness: 0.6,
  });
  const noseMesh = new THREE.Mesh(noseGeo, noseMat);
  noseMesh.rotation.x = Math.PI / 2.2;
  noseMesh.position.set(0, 0.01, 0.24);
  headGroup.add(noseMesh);

  // Eyes (White Sclera + Pupils)
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshBasicMaterial({
    color: type === 'ROBBER' ? 0xff0000 : 0x09090b,
  });

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

  // 3D Mouth
  const mouthGeo = new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI * 0.8);
  const mouthMat = new THREE.MeshBasicMaterial({
    color: type === 'ROBBER' ? 0x991b1b : 0xdc2626,
  });
  const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
  mouthMesh.position.set(0, -0.1, 0.2);
  mouthMesh.rotation.z = Math.PI;
  headGroup.add(mouthMesh);

  // Headgear / Hair / Mask customization based on variant
  if (type === 'ROBBER') {
    if (variant.id === 'BALACLAVA') {
      const maskGeo = new THREE.BoxGeometry(0.32, 0.16, 0.3);
      const maskMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
      const maskMesh = new THREE.Mesh(maskGeo, maskMat);
      maskMesh.position.set(0, 0.18, 0);
      headGroup.add(maskMesh);
    } else if (variant.id === 'PUNK') {
      // Spiky Neon Mohawk
      const mohawkGeo = new THREE.BoxGeometry(0.08, 0.22, 0.35);
      const mohawkMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 }); // Neon cyan
      const mohawkMesh = new THREE.Mesh(mohawkGeo, mohawkMat);
      mohawkMesh.position.set(0, 0.24, 0);
      headGroup.add(mohawkMesh);

      // Dark sunglasses
      const shadesMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const shadesMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.05), shadesMat);
      shadesMesh.position.set(0, 0.06, 0.21);
      headGroup.add(shadesMesh);
    } else if (variant.id === 'PAPER_BAG') {
      // Paper bag over head
      const bagGeo = new THREE.BoxGeometry(0.38, 0.42, 0.38);
      const bagMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });
      const bagMesh = new THREE.Mesh(bagGeo, bagMat);
      bagMesh.position.set(0, 0.04, 0);
      headGroup.add(bagMesh);
    } else if (variant.id === 'CLOWN') {
      // Crazy green afro puffs
      const hairGeo = new THREE.SphereGeometry(0.12, 10, 10);
      const hairMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      const puffL = new THREE.Mesh(hairGeo, hairMat);
      puffL.position.set(-0.24, 0.15, 0);
      const puffR = new THREE.Mesh(hairGeo, hairMat);
      puffR.position.set(0.24, 0.15, 0);
      headGroup.add(puffL);
      headGroup.add(puffR);
    } else if (variant.id === 'MAFIA') {
      // Black Fedora
      const fedoraCrown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.22, 0.14, 16),
        new THREE.MeshStandardMaterial({ color: 0x09090b })
      );
      fedoraCrown.position.set(0, 0.22, 0);
      const fedoraBrim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.02, 16),
        new THREE.MeshStandardMaterial({ color: 0x09090b })
      );
      fedoraBrim.position.set(0, 0.16, 0);
      headGroup.add(fedoraCrown);
      headGroup.add(fedoraBrim);

      // Sunglasses & Mustache
      const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.04), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      glasses.position.set(0, 0.06, 0.2);
      const stache = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.02), new THREE.MeshBasicMaterial({ color: 0x18181b }));
      stache.position.set(0, -0.05, 0.22);
      headGroup.add(glasses);
      headGroup.add(stache);
    }
  } else {
    // Employee Headgear
    if (variant.id === 'VISOR_CLERK') {
      const capMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 18), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
      capMesh.position.set(0, 0.18, 0);
      const brimMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.14), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
      brimMesh.position.set(0, 0.15, 0.18);
      brimMesh.rotation.x = 0.15;
      headGroup.add(capMesh);
      headGroup.add(brimMesh);
    } else if (variant.id === 'CHEF_BURGER') {
      // White Chef Toque
      const chefHat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.28, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      chefHat.position.set(0, 0.28, 0);
      headGroup.add(chefHat);
    } else {
      // Headset Trainee
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.015, 8, 16, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      band.position.set(0, 0.1, 0);
      band.rotation.x = Math.PI / 2;
      const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.18), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      mic.position.set(0.15, -0.02, 0.12);
      mic.rotation.z = Math.PI / 3;
      headGroup.add(band);
      headGroup.add(mic);
    }
  }

  npc.add(headGroup);
  npc.head = headGroup;

  // 4. Articulated Arms
  const armMat = clothesMat;

  // Left Arm Group
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.28, 0.95, 0);
  const upperArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.24, 12), armMat);
  upperArmL.position.set(0, -0.12, 0);
  leftArmGroup.add(upperArmL);
  const forearmL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.22, 12), armMat);
  forearmL.position.set(0, -0.32, 0.08);
  forearmL.rotation.x = Math.PI / 4;
  leftArmGroup.add(forearmL);
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), skinMat);
  handL.position.set(0, -0.42, 0.18);
  leftArmGroup.add(handL);
  npc.add(leftArmGroup);
  npc.leftArm = leftArmGroup;

  // Right Arm Group (Robber gun arm / Employee tray arm)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.28, 0.95, 0);
  const upperArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.24, 12), armMat);
  upperArmR.position.set(0, -0.12, 0);
  rightArmGroup.add(upperArmR);
  const forearmR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.22, 12), armMat);
  forearmR.position.set(0, -0.32, 0.1);
  forearmR.rotation.x = Math.PI / 3;
  rightArmGroup.add(forearmR);
  const handR = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), skinMat);
  handR.position.set(0, -0.42, 0.2);
  rightArmGroup.add(handR);
  npc.add(rightArmGroup);
  npc.rightArm = rightArmGroup;

  // Props Group
  const propGroup = new THREE.Group();
  npc.add(propGroup);
  npc.propGroup = propGroup;

  if (type === 'EMPLOYEE') {
    leftArmGroup.rotation.x = -Math.PI / 4;
    rightArmGroup.rotation.x = -Math.PI / 4;
    propGroup.position.set(0, 0.68, 0.38);

    // Burger Platter
    const trayGeo = new THREE.BoxGeometry(0.5, 0.025, 0.35);
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
    propGroup.add(new THREE.Mesh(trayGeo, trayMat));

    // Burger
    const bunGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.05, 16);
    const bunMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    const bunMesh = new THREE.Mesh(bunGeo, bunMat);
    bunMesh.position.set(-0.1, 0.04, 0);
    propGroup.add(bunMesh);

    // Fries
    const friesMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.06), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    friesMesh.position.set(0.08, 0.07, -0.05);
    propGroup.add(friesMesh);

    // Soda
    const cupMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.13, 14), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
    cupMesh.position.set(0.1, 0.08, 0.06);
    propGroup.add(cupMesh);
  } else {
    // Robber Gun: Pointed directly at player across the counter
    rightArmGroup.rotation.x = -Math.PI / 2.05;
    rightArmGroup.rotation.y = -0.12;

    const robberGun = new THREE.Group();
    robberGun.position.set(0.28, 0.72, 0.48);

    const gunMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    });

    const gunBarrel = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.055, 0.22), gunMat);
    robberGun.add(gunBarrel);

    const gunGrip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.05), gunMat);
    gunGrip.position.set(0, -0.06, -0.08);
    gunGrip.rotation.x = 0.3;
    robberGun.add(gunGrip);

    // Robber muzzle flash
    const flashGeo = new THREE.OctahedronGeometry(0.18, 0);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xff2200,
      transparent: true,
      opacity: 0,
    });
    const robberFlash = new THREE.Mesh(flashGeo, flashMat);
    robberFlash.position.set(0, 0, 0.2);
    robberGun.add(robberFlash);

    npc.add(robberGun);
    npc.robberGun = robberGun;
    npc.robberFlash = robberFlash;
  }

  // Helper function for robber gun recoil animation
  npc.triggerGunRecoil = () => {
    npc.shootAnimProgress = 1.0;
  };

  // Positioned flush at window counter so head is right at y = 1.15
  npc.position.set(-1.25, 0.05, 0);
  npc.rotation.y = Math.PI / 2;

  return npc;
}
