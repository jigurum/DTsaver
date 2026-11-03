/**
 * DriveThruCanvas.tsx
 * Pure lightgun/FPS mouse aiming with ZERO pointer lock:
 * - No pointer lock / No ESC key required
 * - Always-visible free mouse tracking: mouse moves left -> cursor & camera move left
 * - Direct cursor-based raycasting (shoots exactly where cursor points on screen)
 * - Generous target locking on Drive-Thru NPC
 * - Spectacular shotgun firing action with multi-layer flash, sparks, and shell ejection
 */
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createCockpit,
  createShotgun,
  createDriveThruBooth,
  createNpc,
  CockpitGroup,
  ShotgunGroup,
  NpcGroup,
} from '../utils/modelGenerators';
import { createRoadTexture } from '../utils/proceduralTextures';
import { soundManager } from '../utils/audio';
import { GameOverReason, NpcType } from '../types/game';

interface DriveThruCanvasProps {
  isPlaying: boolean;
  isDucking: boolean;
  isAiming: boolean;
  isGunEquipped: boolean;
  ammo: number;
  isReloading: boolean;
  onFire: (hitNpc: NpcType | null) => void;
  onDodgeBullet: () => void;
  onOrderSuccess: () => void;
  onGameOver: (reason: GameOverReason) => void;
  onNpcUpdate: (type: NpcType, timeLeft: number) => void;
  onTargetLockChange?: (isLocked: boolean) => void;
  onCursorMove?: (x: number, y: number) => void;
  registerOrderAction: (orderFn: () => void) => void;
}

export const DriveThruCanvas: React.FC<DriveThruCanvasProps> = ({
  isPlaying,
  isDucking,
  isAiming,
  isGunEquipped,
  ammo,
  isReloading,
  onFire,
  onDodgeBullet,
  onOrderSuccess,
  onGameOver,
  onNpcUpdate,
  onTargetLockChange,
  onCursorMove,
  registerOrderAction,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef({
    isPlaying,
    isDucking,
    isAiming,
    isGunEquipped,
    ammo,
    isReloading,
  });

  useEffect(() => {
    stateRef.current = {
      isPlaying,
      isDucking,
      isAiming,
      isGunEquipped,
      ammo,
      isReloading,
    };
  }, [isPlaying, isDucking, isAiming, isGunEquipped, ammo, isReloading]);

  const callbacksRef = useRef({
    onFire,
    onDodgeBullet,
    onOrderSuccess,
    onGameOver,
    onNpcUpdate,
    onTargetLockChange,
    onCursorMove,
  });

  useEffect(() => {
    callbacksRef.current = {
      onFire,
      onDodgeBullet,
      onOrderSuccess,
      onGameOver,
      onNpcUpdate,
      onTargetLockChange,
      onCursorMove,
    };
  }, [onFire, onDodgeBullet, onOrderSuccess, onGameOver, onNpcUpdate, onTargetLockChange, onCursorMove]);

  const orderBurgerActionRef = useRef<() => void>(() => {});

  useEffect(() => {
    registerOrderAction(() => {
      orderBurgerActionRef.current();
    });
  }, [registerOrderAction]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL Guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.035);

    const camera = new THREE.PerspectiveCamera(72, width / height, 0.1, 100);
    camera.position.set(0, 1.15, 0);
    camera.rotation.order = 'YXZ';

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Lighting Rig
    const ambientLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.9);
    scene.add(ambientLight);

    const streetLight = new THREE.DirectionalLight(0xffedd5, 2.5);
    streetLight.position.set(4, 15, -3);
    scene.add(streetLight);

    // 4. Road & Scenery
    const roadTexture = createRoadTexture();
    roadTexture.repeat.set(1, 24);
    const roadGeo = new THREE.PlaneGeometry(8, 140);
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.8,
      metalness: 0.1,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, -40);
    scene.add(roadMesh);

    const buildingsGroup = new THREE.Group();
    const bldgMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    for (let i = 0; i < 16; i++) {
      const h = 8 + Math.random() * 15;
      const bGeo = new THREE.BoxGeometry(4 + Math.random() * 4, h, 6);
      const bMesh = new THREE.Mesh(bGeo, bldgMat);
      bMesh.position.set(6.5 + Math.random() * 4, h / 2, -10 - i * 8);
      buildingsGroup.add(bMesh);
    }
    scene.add(buildingsGroup);

    // 5. Cockpit & Shotgun
    const cockpit = createCockpit();
    cockpit.position.set(0, 0.95, 0);
    scene.add(cockpit);

    const shotgun = createShotgun();
    cockpit.add(shotgun);

    // Sparks Pool
    const sparksCount = 24;
    const sparkGeo = new THREE.SphereGeometry(0.02, 6, 6);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const sparks: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];

    for (let i = 0; i < sparksCount; i++) {
      const sMesh = new THREE.Mesh(sparkGeo, sparkMat);
      sMesh.visible = false;
      scene.add(sMesh);
      sparks.push({ mesh: sMesh, vel: new THREE.Vector3(), life: 0 });
    }

    // Ejecting Shell
    const shellGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.05, 8);
    const shellMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.visible = false;
    scene.add(shellMesh);
    const shellState = { vel: new THREE.Vector3(), rotVel: new THREE.Vector3(), life: 0 };

    // 6. Drive-thru booth & NPC
    const TARGET_STOP_Z = -1.6;
    const booth = createDriveThruBooth();
    booth.position.set(0, 0, -28);
    scene.add(booth);

    let currentNpc: NpcGroup | null = null;
    let npcType: NpcType = 'NONE';
    let npcTimer = 0;
    let hasRobberFired = false;
    let isAtWindow = false;

    let travelSpeed = 30;
    let isTransitioning = true;

    // Direct Cursor Tracking & Raycaster
    const raycaster = new THREE.Raycaster();
    const cursorNDC = new THREE.Vector2(0, 0); // Normalized Device Coords (-1 to +1)
    let targetLocked = false;

    function spawnNewNpc() {
      if (currentNpc) {
        booth.remove(currentNpc);
        currentNpc = null;
      }

      const nextType: NpcType = Math.random() < 0.5 ? 'ROBBER' : 'EMPLOYEE';
      npcType = nextType;
      // Randomized attack timing between 0.8s and 2.3s
      npcTimer = nextType === 'ROBBER' ? (0.8 + Math.random() * 1.5) : 2.4;
      hasRobberFired = false;

      currentNpc = createNpc(nextType);
      booth.add(currentNpc);

      if (nextType === 'ROBBER') {
        soundManager.playRobberWarning();
      }

      callbacksRef.current.onNpcUpdate(nextType, npcTimer);
    }

    spawnNewNpc();

    // Recoil state
    let recoilOffset = 0;
    let recoilPitch = 0;
    let cameraKickZ = 0;
    let cameraKickPitch = 0;

    // Depart to next window (Fast Automatic Drive)
    function departToNextWindow() {
      if (isTransitioning) return;
      isTransitioning = true;
      isAtWindow = false;
      targetLocked = false;
      callbacksRef.current.onTargetLockChange?.(false);
      callbacksRef.current.onNpcUpdate('NONE', 0);
      travelSpeed = 46;
    }

    // Spectacular Shotgun Fire directly at cursor position
    function triggerSpectacularFire() {
      const { ammo: currentAmmo, isReloading: reloading, isPlaying: active } = stateRef.current;
      if (!active || reloading) return;

      if (currentAmmo <= 0) {
        soundManager.playEmptyClick();
        return;
      }

      soundManager.playShotgun();

      recoilOffset = 0.28;
      recoilPitch = 0.3;
      cameraKickZ = 0.18;
      cameraKickPitch = 0.2;

      shotgun.muzzleFlash.children.forEach((child) => {
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = 1.0;
      });
      shotgun.muzzleFlash.scale.set(1.7, 1.7, 1.7);
      shotgun.muzzleLight.intensity = 50;

      setTimeout(() => {
        shotgun.muzzleFlash.children.forEach((child) => {
          const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
          mat.opacity = 0;
        });
        shotgun.muzzleLight.intensity = 0;
      }, 60);

      // Sparks fly towards cursor
      const muzzleWorldPos = new THREE.Vector3();
      shotgun.muzzle.getWorldPosition(muzzleWorldPos);

      sparks.forEach((s) => {
        s.mesh.position.copy(muzzleWorldPos);
        s.mesh.visible = true;
        s.life = 0.35 + Math.random() * 0.2;
        const dir = new THREE.Vector3(
          cursorNDC.x * 0.4 + (Math.random() - 0.5) * 0.2,
          cursorNDC.y * 0.3 + (Math.random() - 0.5) * 0.2,
          -1
        ).applyEuler(camera.rotation).normalize();
        s.vel.copy(dir).multiplyScalar(16 + Math.random() * 22);
      });

      // Eject shell
      const ejectWorldPos = new THREE.Vector3();
      shotgun.ejectionPort.getWorldPosition(ejectWorldPos);
      shellMesh.position.copy(ejectWorldPos);
      shellMesh.visible = true;
      shellState.life = 0.7;
      shellState.vel.set(2.5 + Math.random() * 1.5, 3.2 + Math.random() * 1.5, (Math.random() - 0.5) * 2);
      shellState.rotVel.set(Math.random() * 20, Math.random() * 20, Math.random() * 20);

      // Raycast directly through cursor position on screen
      let hitTarget: NpcType | null = null;
      raycaster.setFromCamera(cursorNDC, camera);

      if (currentNpc && !currentNpc.isKnockedOut && isAtWindow) {
        const hits = raycaster.intersectObjects(currentNpc.children, true);
        const isHit = hits.length > 0 || targetLocked;

        if (isHit) {
          hitTarget = npcType;

          if (npcType === 'ROBBER') {
            currentNpc.isKnockedOut = true;
            soundManager.playRobberDefeated();
            setTimeout(() => {
              departToNextWindow();
            }, 200);
          } else if (npcType === 'EMPLOYEE') {
            soundManager.playGameOver();
            callbacksRef.current.onGameOver('SHOT_INNOCENT');
          }
        }
      }

      callbacksRef.current.onFire(hitTarget);
    }

    // Burger order action
    function orderBurger() {
      if (!stateRef.current.isPlaying) return;
      if (isAtWindow && npcType === 'EMPLOYEE' && currentNpc && !currentNpc.isKnockedOut) {
        soundManager.playOrderSuccess();
        callbacksRef.current.onOrderSuccess();
        currentNpc.isKnockedOut = true;
        setTimeout(() => {
          departToNextWindow();
        }, 180);
      }
    }

    orderBurgerActionRef.current = orderBurger;

    // --- PURE REAL-TIME CURSOR-DRIVEN VIEW (ZERO POINTER LOCK) ---
    // BASE_YAW: Centered directly on window booth at (-1.15, -1.6) -> 0.62 rad
    const BASE_YAW = 0.62;
    let targetYaw = BASE_YAW;
    let targetPitch = 0.0;
    let currentYaw = BASE_YAW;
    let currentPitch = 0.0;

    const handleMouseMove = (e: MouseEvent) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      // Update Normalized Device Coordinates (-1 to +1)
      cursorNDC.x = (clientX / window.innerWidth) * 2 - 1;
      cursorNDC.y = -(clientY / window.innerHeight) * 2 + 1;

      // Notify parent HUD of cursor pixel position
      callbacksRef.current.onCursorMove?.(clientX, clientY);

      // CAMERA FOLLOWS MOUSE:
      // Moving mouse LEFT (clientX < center -> cursorNDC.x < 0):
      // (-cursorNDC.x) is POSITIVE, so targetYaw INCREASES -> Camera rotates to the LEFT!
      // Moving mouse RIGHT (cursorNDC.x > 0): targetYaw DECREASES -> Camera rotates RIGHT!
      targetYaw = BASE_YAW + (-cursorNDC.x) * 0.42;

      // Moving mouse UP (cursorNDC.y > 0): targetPitch increases -> Camera looks UP!
      targetPitch = cursorNDC.y * 0.25;
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Primary click fires weapon immediately. NO POINTER LOCK REQUESTED!
      if (e.button === 0) {
        triggerSpectacularFire();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('contextmenu', handleContextMenu);

    const clock = new THREE.Clock();
    let frameId = 0;
    let lastNpcReportTime = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const {
        isPlaying: active,
        isDucking: ducking,
        isAiming: aiming,
        isGunEquipped: gunEquipped,
      } = stateRef.current;

      // Smooth camera yaw/pitch interpolation following cursor
      currentYaw = THREE.MathUtils.damp(currentYaw, targetYaw, 18, delta);
      currentPitch = THREE.MathUtils.damp(currentPitch, targetPitch, 18, delta);

      // Camera recoil recovery
      cameraKickZ = THREE.MathUtils.damp(cameraKickZ, 0, 16, delta);
      cameraKickPitch = THREE.MathUtils.damp(cameraKickPitch, 0, 16, delta);

      // Camera Positioning
      let targetCamX = 0;
      let targetCamY = ducking ? 0.58 : 1.15;
      let targetCamZ = cameraKickZ;

      if (aiming && !ducking) {
        targetCamX = -0.22;
        targetCamY = 1.16;
        targetCamZ = -0.15 + cameraKickZ;
      }

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 14, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 18, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 16, delta);

      camera.rotation.y = currentYaw + (ducking ? -0.12 : 0);
      camera.rotation.x = currentPitch + (ducking ? -0.18 : 0) + cameraKickPitch;

      // ADS Zoom FOV (72° -> 32°)
      const targetFov = aiming ? 32 : 72;
      if (Math.abs(camera.fov - targetFov) > 0.1) {
        camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 16, delta);
        camera.updateProjectionMatrix();
      }

      // Automatic Driving System
      if (isTransitioning) {
        roadTexture.offset.y = (roadTexture.offset.y + delta * (travelSpeed * 0.06)) % 1;
        cockpit.gaugeNeedle.rotation.z = -Math.PI * 0.6 + (travelSpeed / 45) * Math.PI * 1.2;

        if (booth.position.z >= 12) {
          booth.position.z = -28;
          spawnNewNpc();
        } else if (booth.position.z < TARGET_STOP_Z) {
          booth.position.z += travelSpeed * delta;
          if (booth.position.z >= TARGET_STOP_Z) {
            booth.position.z = TARGET_STOP_Z;
            isTransitioning = false;
            isAtWindow = true;
          }
        } else {
          booth.position.z += travelSpeed * delta;
        }
      } else {
        cockpit.gaugeNeedle.rotation.z = -Math.PI * 0.6;
      }

      // Target Lock Detection via Cursor Raycaster
      raycaster.setFromCamera(cursorNDC, camera);
      let isAimingAtNpc = false;

      if (currentNpc && !currentNpc.isKnockedOut && isAtWindow) {
        const hits = raycaster.intersectObjects(currentNpc.children, true);
        if (hits.length > 0) {
          isAimingAtNpc = true;
        } else {
          // Generous angular proximity test
          const npcWorldPos = new THREE.Vector3();
          currentNpc.getWorldPosition(npcWorldPos);
          npcWorldPos.y += 1.0;

          const rayDir = raycaster.ray.direction;
          const toNpc = npcWorldPos.clone().sub(camera.position).normalize();
          const angle = rayDir.angleTo(toNpc);

          if (angle < 0.32) {
            isAimingAtNpc = true;
          }
        }
      }

      if (isAimingAtNpc !== targetLocked) {
        targetLocked = isAimingAtNpc;
        callbacksRef.current.onTargetLockChange?.(targetLocked);
      }

      // Update Sparks & Shells
      sparks.forEach((s) => {
        if (s.life > 0) {
          s.life -= delta;
          s.mesh.position.addScaledVector(s.vel, delta);
          s.vel.y -= 9.8 * delta;
          if (s.life <= 0) s.mesh.visible = false;
        }
      });

      if (shellState.life > 0) {
        shellState.life -= delta;
        shellMesh.position.addScaledVector(shellState.vel, delta);
        shellState.vel.y -= 12.0 * delta;
        shellMesh.rotation.x += shellState.rotVel.x * delta;
        shellMesh.rotation.y += shellState.rotVel.y * delta;
        if (shellState.life <= 0) shellMesh.visible = false;
      }

      // NPC reaction logic at window
      if (active && isAtWindow && currentNpc && !currentNpc.isKnockedOut) {
        npcTimer -= delta;

        const nowSec = Math.floor(npcTimer * 10);
        if (nowSec !== lastNpcReportTime) {
          lastNpcReportTime = nowSec;
          callbacksRef.current.onNpcUpdate(npcType, Math.max(0, npcTimer));
        }

        if (npcType === 'ROBBER') {
          currentNpc.rightArm.rotation.x = -Math.PI / 2.05 + Math.sin(clock.getElapsedTime() * 7) * 0.03;
          currentNpc.rightArm.rotation.y = -0.12 + Math.cos(clock.getElapsedTime() * 5) * 0.02;

          if (currentNpc.shootAnimProgress > 0.01) {
            currentNpc.shootAnimProgress = THREE.MathUtils.damp(currentNpc.shootAnimProgress, 0, 6, delta);
            currentNpc.rightArm.rotation.x += currentNpc.shootAnimProgress * 0.75;
            currentNpc.head.rotation.x = -currentNpc.shootAnimProgress * 0.35;
          }

          if (npcTimer <= 0 && !hasRobberFired) {
            hasRobberFired = true;
            soundManager.playRobberGunfire();
            currentNpc.triggerGunRecoil();

            if (currentNpc.robberFlash) {
              const rFlashMat = currentNpc.robberFlash.material as THREE.MeshBasicMaterial;
              rFlashMat.opacity = 1.0;
              setTimeout(() => {
                if (currentNpc?.robberFlash) {
                  (currentNpc.robberFlash.material as THREE.MeshBasicMaterial).opacity = 0;
                }
              }, 70);
            }

            if (ducking) {
              soundManager.playDodgeWhoosh();
              callbacksRef.current.onDodgeBullet();
            } else {
              soundManager.playGameOver();
              callbacksRef.current.onGameOver('SHOT_BY_ROBBER');
            }
          }
        } else if (npcType === 'EMPLOYEE') {
          currentNpc.propGroup.position.y = 0.68 + Math.sin(clock.getElapsedTime() * 5) * 0.02;

          if (npcTimer <= 0) {
            currentNpc.isKnockedOut = true;
            setTimeout(() => {
              departToNextWindow();
            }, 300);
          }
        }
      }

      // Knockout Animation
      if (currentNpc && currentNpc.isKnockedOut) {
        currentNpc.knockProgress = Math.min(1, currentNpc.knockProgress + delta * 4.5);
        currentNpc.position.z = -currentNpc.knockProgress * 1.5;
        currentNpc.position.y = 0.05 - currentNpc.knockProgress * 0.8;
        currentNpc.rotation.x = -currentNpc.knockProgress * 1.6;
        currentNpc.rotation.z = currentNpc.knockProgress * 0.5;
      }

      if (currentNpc && currentNpc.billboardMesh) {
        currentNpc.billboardMesh.lookAt(camera.position);
      }

      // Shotgun positioning
      recoilOffset = THREE.MathUtils.damp(recoilOffset, 0, 14, delta);
      recoilPitch = THREE.MathUtils.damp(recoilPitch, 0, 14, delta);

      let targetGunX = 0.16;
      let targetGunY = -0.28;
      let targetGunZ = -0.5;

      if (!gunEquipped) {
        targetGunY = -0.55;
        targetGunZ = -0.42;
      } else if (aiming) {
        targetGunX = -0.01;
        targetGunY = -0.14;
        targetGunZ = -0.38;
      }

      shotgun.position.x = THREE.MathUtils.damp(shotgun.position.x, targetGunX, 16, delta);
      shotgun.position.y = THREE.MathUtils.damp(
        shotgun.position.y,
        targetGunY + recoilPitch * 0.1,
        18,
        delta
      );
      shotgun.position.z = THREE.MathUtils.damp(
        shotgun.position.z,
        targetGunZ + recoilOffset,
        18,
        delta
      );
      shotgun.rotation.x = THREE.MathUtils.damp(shotgun.rotation.x, recoilPitch, 18, delta);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      sparks.forEach((s) => scene.remove(s.mesh));
      scene.remove(shellMesh);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden cursor-crosshair bg-stone-950"
    />
  );
};
