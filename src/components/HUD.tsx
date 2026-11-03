/**
 * HUD overlay component for Drive-Thru Vigilante 3D (드라이빙스루 무법자 3D).
 * Ultra-responsive down to 360px width, zero horizontal overflow.
 */
import React from 'react';
import { Volume2, VolumeX, Shield, AlertTriangle, ZoomIn } from 'lucide-react';
import { NpcType, ScorePopup } from '../types/game';

interface HUDProps {
  score: number;
  highScore: number;
  timeLeft: number;
  ammo: number;
  isReloading: boolean;
  isDucking: boolean;
  isAiming: boolean;
  isGunEquipped: boolean;
  activeNpc: NpcType;
  npcTimeLeft: number;
  scorePopups: ScorePopup[];
  showBloodFlash: boolean;
  isMuted: boolean;
  isTargetLocked?: boolean;
  cursorPos?: { x: number; y: number } | null;
  onToggleMute: () => void;
  // Controls
  onToggleDuck: () => void;
  onToggleGun: () => void;
  onToggleAim: () => void;
  onFire: () => void;
  onReload: () => void;
  onOrder: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  timeLeft,
  ammo,
  isReloading,
  isDucking,
  isAiming,
  isGunEquipped,
  activeNpc,
  npcTimeLeft,
  scorePopups,
  showBloodFlash,
  isMuted,
  isTargetLocked = false,
  cursorPos = null,
  onToggleMute,
  onToggleDuck,
  onToggleGun,
  onToggleAim,
  onFire,
  onReload,
  onOrder,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-2 sm:p-4 overflow-hidden">
      {/* Blood Splatter Flash on damage / failure */}
      {showBloodFlash && (
        <div className="absolute inset-0 blood-splatter z-50 animate-pulse pointer-events-none" />
      )}

      {/* Retro Arcade Vignette */}
      <div className="absolute inset-0 arcade-vignette pointer-events-none" />

      {/* TOP BAR: Score, Timer, Ammo, Sound */}
      <div className="relative z-20 flex items-center justify-between gap-2 max-w-4xl mx-auto w-full">
        {/* Left: Score & High Score */}
        <div className="bg-stone-900/90 border border-stone-700/80 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">점수 (SCORE)</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight leading-none">
              {score}
            </div>
          </div>
          <div className="h-6 w-px bg-stone-700 hidden xs:block" />
          <div className="hidden xs:block">
            <div className="text-[9px] uppercase text-stone-400 font-bold">최고기록</div>
            <div className="text-xs font-bold text-stone-300 font-mono leading-none">{highScore}</div>
          </div>
        </div>

        {/* Center: 60s Round Timer & Auto Drive Indicator */}
        <div className="flex flex-col items-center">
          <div className={`px-4 py-1.5 rounded-xl border font-mono font-black text-center shadow-lg transition-colors ${
            timeLeft <= 10
              ? 'bg-red-950/90 border-red-500 text-red-400 animate-bounce'
              : 'bg-stone-900/90 border-amber-500/60 text-amber-300'
          }`}>
            <div className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">남은 시간</div>
            <div className="text-2xl sm:text-3xl leading-none">{timeLeft}s</div>
          </div>
        </div>

        {/* Right: Shotgun Ammo & Sound */}
        <div className="flex items-center gap-2">
          {/* Ammo display */}
          <div className="bg-stone-900/90 border border-stone-700/80 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2">
            <div>
              <div className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">탄약 (AMMO)</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {[0, 1].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-6 rounded-xs border transition-all ${
                      idx < ammo
                        ? 'bg-red-600 border-amber-300 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                        : 'bg-stone-800 border-stone-600 opacity-30'
                    }`}
                  >
                    <div className="w-full h-1.5 bg-amber-400 rounded-t-xs" />
                  </div>
                ))}
                <span className="font-mono text-sm font-bold text-stone-300 ml-1">
                  {isReloading ? '🔄' : `${ammo}/2`}
                </span>
              </div>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="pointer-events-auto bg-stone-900/90 hover:bg-stone-800 border border-stone-700 p-2 rounded-xl text-stone-300 active:scale-95 transition-transform"
            aria-label="음소거 토글"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* FLOATING TELEGRAPH NOTIFICATION BANNER */}
      {activeNpc !== 'NONE' ? (
        <div className="relative z-30 flex justify-center mt-2 pointer-events-none">
          {activeNpc === 'ROBBER' ? (
            <div className="bg-red-950/95 border-2 border-red-500 rounded-2xl px-4 py-2 text-center shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse max-w-sm">
              <div className="flex items-center justify-center gap-1.5 text-red-300 font-black text-sm sm:text-base">
                <AlertTriangle size={18} className="text-red-400 shrink-0" />
                ⚠️ 무장 강도 출현! ({npcTimeLeft.toFixed(1)}s)
              </div>
              <div className="text-xs text-red-200 font-bold mt-0.5">
                {isDucking ? (
                  <span className="text-emerald-400 font-black">🛡️ 회피 성공 중! 샷건(💥)으로 제압하세요!</span>
                ) : (
                  <span className="text-amber-300">Shift 키(🛡️)로 즉시 숙여 총알을 피하세요!</span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/95 border-2 border-emerald-500 rounded-2xl px-4 py-2 text-center shadow-[0_0_20px_rgba(16,185,129,0.5)] max-w-sm">
              <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-black text-sm sm:text-base">
                🍔 버거 매장 직원 ({npcTimeLeft.toFixed(1)}s)
              </div>
              <div className="text-xs text-emerald-200 font-bold mt-0.5">
                E 키(🍔 버튼)를 눌러 버거를 주문하세요! (사격 금지!)
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-30 flex justify-center mt-2 pointer-events-none">
          <div className="bg-stone-900/80 border border-stone-700/60 rounded-full px-3.5 py-1 text-stone-300 text-xs font-bold flex items-center gap-1.5 shadow-md">
            <span>🚗 다음 창구로 자동 주행 중...</span>
          </div>
        </div>
      )}

      {/* DUCKED STATUS INDICATOR */}
      {isDucking && (
        <div className="self-center bg-blue-900/80 border border-blue-400 px-3 py-1 rounded-full text-blue-200 text-xs font-bold flex items-center gap-1.5 shadow-md">
          <Shield size={14} className="text-blue-300" />
          차량 대시보드 뒤로 숙여 회피 중 (안전 상태)
        </div>
      )}

      {/* DYNAMIC CROSSHAIR / RETICLE (Follows mouse cursor freely across screen) */}
      <div
        className="pointer-events-none transition-transform duration-75"
        style={
          cursorPos
            ? {
                position: 'fixed',
                left: `${cursorPos.x}px`,
                top: `${cursorPos.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 40,
              }
            : {
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 40,
              }
        }
      >
        <div
          className={`relative transition-all duration-150 ${
            isAiming ? 'scale-125' : 'scale-100'
          }`}
        >
          <div
            className={`w-11 h-11 border-2 rounded-full flex items-center justify-center transition-all ${
              isTargetLocked
                ? 'border-red-500 bg-red-500/20 shadow-[0_0_18px_rgba(239,68,68,1)]'
                : isAiming
                ? 'border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                : 'border-red-500/60'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                isTargetLocked ? 'bg-red-400 scale-125' : 'bg-red-500'
              }`}
            />
            <div className="absolute top-0 w-0.5 h-2.5 bg-red-400" />
            <div className="absolute bottom-0 w-0.5 h-2.5 bg-red-400" />
            <div className="absolute left-0 w-2.5 h-0.5 bg-red-400" />
            <div className="absolute right-0 w-2.5 h-0.5 bg-red-400" />
          </div>

          {/* Target locked or ADS badge */}
          {isTargetLocked ? (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-red-200 uppercase tracking-widest font-black whitespace-nowrap bg-red-950/90 px-2 py-0.5 rounded border border-red-500 shadow-md animate-pulse">
              🎯 조준 완료 (발사 가능!)
            </div>
          ) : isAiming ? (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-red-300 uppercase tracking-widest font-black whitespace-nowrap bg-stone-900/90 px-2 py-0.5 rounded border border-stone-700">
              🎯 줌인 조준 중
            </div>
          ) : null}
        </div>
      </div>

      {/* SCORE POPUP ANIMATIONS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {scorePopups.map((popup) => (
          <div
            key={popup.id}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-12 font-black text-2xl sm:text-3xl animate-bounce drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] ${
              popup.type === 'robber' ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {popup.text}
          </div>
        ))}
      </div>

      {/* BOTTOM CONTROL DOCK (PC FPS Focused) */}
      <div className="relative z-30 max-w-md mx-auto w-full pointer-events-auto mt-auto pb-1">
        {/* PC FPS Keybind Bar */}
        <div className="text-center text-[10px] sm:text-xs text-stone-400 font-bold mb-1 drop-shadow-md bg-stone-950/70 py-0.5 px-2 rounded-full mx-auto w-fit border border-stone-800/80">
          🖱️ 마우스 이동: 시점 조준 | 좌클릭: 발사 | 우클릭: 줌인 | Shift: 숙이기 | R: 장전 | E: 주문
        </div>
        <div className="bg-stone-900/95 border border-stone-800 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md">
          {/* Action Button Grid - 6 Buttons, Perfect fit on 360px width */}
          <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
            {/* 1. 🛡️ 숙이기 (Duck / Dodge) */}
            <button
              onClick={onToggleDuck}
              className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl active:scale-95 border transition cursor-pointer ${
                isDucking
                  ? 'bg-blue-600 border-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.8)] text-white'
                  : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
              }`}
              title="총알 숙여 피하기 (Shift)"
            >
              <span className="text-lg sm:text-xl">🛡️</span>
              <span className="text-[10px] sm:text-xs font-black mt-0.5 leading-none">
                {isDucking ? '숙임중' : '숙이기'}
              </span>
              <span className="text-[8px] font-mono text-stone-400 hidden sm:inline">Shift</span>
            </button>

            {/* 2. 🔫 총 들기 (Equip Gun) */}
            <button
              onClick={onToggleGun}
              className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl active:scale-95 border transition cursor-pointer ${
                isGunEquipped
                  ? 'bg-amber-600 border-amber-400 shadow-[0_0_10px_rgba(217,119,6,0.6)] text-white'
                  : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300'
              }`}
              title="샷건 꺼내기 / 파지"
            >
              <span className="text-lg sm:text-xl">🔫</span>
              <span className="text-[10px] sm:text-xs font-black mt-0.5 leading-none">
                {isGunEquipped ? '총들기' : '총내림'}
              </span>
              <span className="text-[8px] font-mono text-stone-400 hidden sm:inline">Space</span>
            </button>

            {/* 3. 🎯 조준 (Zoom-in ADS) */}
            <button
              onClick={onToggleAim}
              className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl active:scale-95 border transition cursor-pointer ${
                isAiming
                  ? 'bg-red-600 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.8)] text-white'
                  : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300'
              }`}
              title="창구 확대 조준 (우클릭 유지)"
            >
              <span className="text-lg sm:text-xl">🎯</span>
              <span className="text-[10px] sm:text-xs font-black mt-0.5 leading-none">
                {isAiming ? '줌아웃' : '줌조준'}
              </span>
              <span className="text-[8px] font-mono text-stone-400 hidden sm:inline">우클릭</span>
            </button>

            {/* 4. 💥 발사 (Fire Shotgun) */}
            <button
              onClick={onFire}
              disabled={ammo <= 0 || isReloading}
              className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border active:scale-90 transition ${
                ammo > 0 && !isReloading
                  ? 'bg-red-700 hover:bg-red-600 border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.9)] text-white cursor-pointer'
                  : 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed opacity-60'
              }`}
              title="샷건 발사 (좌클릭)"
            >
              <span className="text-lg sm:text-xl">💥</span>
              <span className="text-[10px] sm:text-xs font-black mt-0.5 leading-none">발사</span>
              <span className="text-[8px] font-mono text-red-200 hidden sm:inline">좌클릭</span>
            </button>

            {/* 5. 🔄 장전 (Reload 2 shells) */}
            <button
              onClick={onReload}
              disabled={isReloading || ammo >= 2}
              className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border active:scale-95 transition cursor-pointer ${
                isReloading
                  ? 'bg-amber-900/60 border-amber-600 text-amber-300 animate-spin'
                  : ammo < 2
                  ? 'bg-amber-600/90 hover:bg-amber-500 border-amber-400 text-white'
                  : 'bg-stone-800 border-stone-700 text-stone-500'
              }`}
              title="샷건 2발 재장전 (R키)"
            >
              <span className="text-lg sm:text-xl">🔄</span>
              <span className="text-[10px] sm:text-xs font-black mt-0.5 leading-none">
                {isReloading ? '...' : '장전'}
              </span>
              <span className="text-[8px] font-mono text-stone-400 hidden sm:inline">R</span>
            </button>

            {/* 6. 🍔 주문 (Order Burger) */}
            <button
              onClick={onOrder}
              className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border active:scale-95 transition cursor-pointer ${
                activeNpc === 'EMPLOYEE'
                  ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-300 text-white shadow-[0_0_14px_rgba(16,185,129,0.9)] animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
              }`}
              title="버거 주문 (E키)"
            >
              <span className="text-lg sm:text-xl">🍔</span>
              <span className="text-[10px] sm:text-xs font-black mt-0.5 leading-none">주문</span>
              <span className="text-[8px] font-mono text-emerald-200 hidden sm:inline">E</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
