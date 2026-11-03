/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DriveThruCanvas } from './components/DriveThruCanvas';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { soundManager } from './utils/audio';
import { GamePhase, GameOverReason, GameStats, NpcType, ScorePopup } from './types/game';

const HIGH_SCORE_KEY = 'drivethru_vigilante_highscore';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('START');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [robbersDefeated, setRobbersDefeated] = useState<number>(0);
  const [ordersCompleted, setOrdersCompleted] = useState<number>(0);
  const [shotsFired, setShotsFired] = useState<number>(0);
  const [shotsHit, setShotsHit] = useState<number>(0);
  const [gameOverReason, setGameOverReason] = useState<GameOverReason>('TIME_OUT');
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);

  // Player Stance & Weapon State
  const [ammo, setAmmo] = useState<number>(2);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [isDucking, setIsDucking] = useState<boolean>(false);
  const [isAiming, setIsAiming] = useState<boolean>(false);
  const [isGunEquipped, setIsGunEquipped] = useState<boolean>(true);

  // Active NPC in window
  const [activeNpc, setActiveNpc] = useState<NpcType>('NONE');
  const [npcTimeLeft, setNpcTimeLeft] = useState<number>(0);

  // Visual feedback
  const [showBloodFlash, setShowBloodFlash] = useState<boolean>(false);
  const [isRecoiling, setIsRecoiling] = useState<boolean>(false);
  const [isTargetLocked, setIsTargetLocked] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Order action callback registered from 3D Canvas
  const orderActionRef = useRef<() => void>(() => {});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      if (saved) {
        setHighScore(parseInt(saved, 10) || 0);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // 60-Second Round Countdown
  useEffect(() => {
    if (phase !== 'PLAYING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameOver('TIME_OUT');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  const handleGameOver = useCallback(
    (reason: GameOverReason) => {
      setPhase('GAMEOVER');
      setGameOverReason(reason);

      if (reason !== 'TIME_OUT') {
        setShowBloodFlash(true);
        setTimeout(() => setShowBloodFlash(false), 800);
      }

      setScore((currentScore) => {
        if (currentScore > highScore) {
          setHighScore(currentScore);
          setIsNewHigh(true);
          try {
            localStorage.setItem(HIGH_SCORE_KEY, currentScore.toString());
          } catch {
            // ignore
          }
        } else {
          setIsNewHigh(false);
        }
        return currentScore;
      });
    },
    [highScore]
  );

  const handleStartGame = () => {
    setScore(0);
    setTimeLeft(60);
    setAmmo(2);
    setIsReloading(false);
    setIsDucking(false);
    setIsAiming(false);
    setIsGunEquipped(true);
    setRobbersDefeated(0);
    setOrdersCompleted(0);
    setShotsFired(0);
    setShotsHit(0);
    setActiveNpc('NONE');
    setScorePopups([]);
    setIsNewHigh(false);
    setPhase('PLAYING');
  };

  const addScorePopup = (text: string, points: number, type: 'robber' | 'order' | 'penalty') => {
    const id = Date.now() + Math.random();
    setScorePopups((prev) => [...prev, { id, text, points, type, createdAt: Date.now() }]);
    setTimeout(() => {
      setScorePopups((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  };

  const handleReload = useCallback(() => {
    if (isReloading || ammo >= 2) return;
    setIsReloading(true);
    soundManager.playReload();

    setTimeout(() => {
      setAmmo(2);
      setIsReloading(false);
    }, 600);
  }, [isReloading, ammo]);

  const handleFire = useCallback(
    (hitTarget: NpcType | null) => {
      if (ammo <= 0 || isReloading) {
        soundManager.playEmptyClick();
        return;
      }

      setAmmo((prev) => prev - 1);
      setShotsFired((prev) => prev + 1);

      setIsRecoiling(true);
      setTimeout(() => setIsRecoiling(false), 180);

      if (hitTarget === 'ROBBER') {
        setScore((prev) => prev + 100);
        setRobbersDefeated((prev) => prev + 1);
        setShotsHit((prev) => prev + 1);
        addScorePopup('+100 💀 강도 제압!', 100, 'robber');
        setActiveNpc('NONE');
      } else if (hitTarget === 'EMPLOYEE') {
        handleGameOver('SHOT_INNOCENT');
      }
    },
    [ammo, isReloading, handleGameOver]
  );

  const handleDodgeBullet = useCallback(() => {
    addScorePopup('💨 총알 회피 성공!', 0, 'robber');
  }, []);

  const handleOrderSuccess = useCallback(() => {
    setScore((prev) => prev + 50);
    setOrdersCompleted((prev) => prev + 1);
    addScorePopup('+50 🍔 주문 성공!', 50, 'order');
    setActiveNpc('NONE');
  }, []);

  const handleNpcUpdate = useCallback((type: NpcType, remaining: number) => {
    setActiveNpc(type);
    setNpcTimeLeft(remaining);
  }, []);

  // Keyboard and Mouse Event listeners
  useEffect(() => {
    if (phase !== 'PLAYING') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      // Duck / Dodge (Shift)
      if (e.key === 'Shift') {
        setIsDucking(true);
        soundManager.playDodgeWhoosh();
      }

      // Reload (R)
      if (key === 'r') {
        handleReload();
      }

      // Order Burger (E)
      if (key === 'e') {
        orderActionRef.current();
      }

      // Fire weapon / Equip (Space)
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isGunEquipped) {
          setIsGunEquipped(true);
        } else {
          const canvasEl = document.querySelector('canvas');
          if (canvasEl) {
            canvasEl.dispatchEvent(new PointerEvent('pointerdown', { button: 0 }));
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsDucking(false);
      }
    };

    // Right-Click Hold ADS Zoom-in
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        setIsAiming(true);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        setIsAiming(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [phase, handleReload, isGunEquipped]);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const currentStats: GameStats = {
    score,
    highScore,
    robbersDefeated,
    ordersCompleted,
    shotsFired,
    shotsHit,
    reason: gameOverReason,
  };

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none ${
        isRecoiling ? 'animate-recoil' : ''
      }`}
    >
      {/* 3D WebGL Simulation */}
      <DriveThruCanvas
        isPlaying={phase === 'PLAYING'}
        isDucking={isDucking}
        isAiming={isAiming}
        isGunEquipped={isGunEquipped}
        ammo={ammo}
        isReloading={isReloading}
        onFire={handleFire}
        onDodgeBullet={handleDodgeBullet}
        onOrderSuccess={handleOrderSuccess}
        onGameOver={handleGameOver}
        onNpcUpdate={handleNpcUpdate}
        onTargetLockChange={(locked) => setIsTargetLocked(locked)}
        onCursorMove={(x, y) => setCursorPos({ x, y })}
        registerOrderAction={(fn) => {
          orderActionRef.current = fn;
        }}
      />

      {/* In-Game HUD overlay */}
      {phase === 'PLAYING' && (
        <HUD
          score={score}
          highScore={highScore}
          timeLeft={timeLeft}
          ammo={ammo}
          isReloading={isReloading}
          isDucking={isDucking}
          isAiming={isAiming}
          isGunEquipped={isGunEquipped}
          activeNpc={activeNpc}
          npcTimeLeft={npcTimeLeft}
          scorePopups={scorePopups}
          showBloodFlash={showBloodFlash}
          isMuted={isMuted}
          isTargetLocked={isTargetLocked}
          cursorPos={cursorPos}
          onToggleMute={handleToggleMute}
          onToggleDuck={() => {
            const next = !isDucking;
            setIsDucking(next);
            if (next) soundManager.playDodgeWhoosh();
          }}
          onToggleGun={() => setIsGunEquipped((prev) => !prev)}
          onToggleAim={() => setIsAiming((prev) => !prev)}
          onFire={() => {
            const canvasEl = document.querySelector('canvas');
            if (canvasEl) {
              canvasEl.dispatchEvent(new PointerEvent('pointerdown', { button: 0 }));
            }
          }}
          onReload={handleReload}
          onOrder={() => orderActionRef.current()}
        />
      )}

      {/* Start Screen */}
      {phase === 'START' && (
        <StartScreen highScore={highScore} onStart={handleStartGame} />
      )}

      {/* Game Over Modal */}
      {phase === 'GAMEOVER' && (
        <GameOverModal
          stats={currentStats}
          isNewHigh={isNewHigh}
          onRestart={handleStartGame}
        />
      )}
    </div>
  );
}
