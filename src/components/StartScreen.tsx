/**
 * StartScreen.tsx
 * Initial landing screen explaining rules in 10 seconds with updated auto-drive and free-look controls.
 */
import React from 'react';
import { Play, Trophy } from 'lucide-react';

interface StartScreenProps {
  highScore: number;
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ highScore, onStart }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-md overflow-y-auto">
      <div className="max-w-md w-full bg-stone-900 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-7 shadow-[0_0_40px_rgba(245,158,11,0.25)] text-center my-auto">
        {/* Title Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950 border border-red-500/80 text-red-400 text-xs font-black tracking-wider uppercase mb-2">
          🔥 60초 자동주행 아케이드 액션
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight leading-tight">
          드라이빙스루 무법자 3D
        </h1>
        <p className="text-stone-300 font-bold text-xs sm:text-sm mt-1">
          Drive-Thru Vigilante 3D
        </p>

        {/* 10-Second Quick Rules */}
        <div className="mt-4 p-3.5 bg-stone-950/80 border border-stone-800 rounded-2xl text-left space-y-2">
          <div className="text-xs font-black text-amber-300 border-b border-stone-800 pb-1 flex items-center gap-1">
            <span className="text-base">⚡</span> 10초 핵심 규칙
          </div>

          <div className="flex items-start gap-2.5 text-xs text-stone-300">
            <span className="text-base shrink-0">🍔</span>
            <div>
              <strong className="text-emerald-400">친절한 직원 등장:</strong> 1.5초 내 <span className="text-white font-mono bg-stone-800 px-1 rounded">E키</span> / <span className="text-white font-mono bg-stone-800 px-1 rounded">🍔버튼</span> 눌러 주문 완료! <span className="text-emerald-400 font-bold">(+50점)</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-stone-300">
            <span className="text-base shrink-0">💀</span>
            <div>
              <strong className="text-red-400">무장 강도 등장:</strong> 총 쏠 때 <span className="text-white font-mono bg-stone-800 px-1 rounded">Shift키</span> / <span className="text-white font-mono bg-stone-800 px-1 rounded">🛡️버튼</span>으로 숙여 피한 뒤 샷건으로 제압! <span className="text-amber-400 font-bold">(+100점)</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-stone-300">
            <span className="text-base shrink-0">🚗</span>
            <div>
              <strong className="text-sky-400">자동 주행 시스템:</strong> 처리 완료 시 차가 다음 창구로 <span className="text-sky-300 font-bold">자동 이동</span>하여 정차합니다. (운전 조작 불필요)
            </div>
          </div>
        </div>

        {/* Updated Control Cheat Sheet */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-left text-[11px] text-stone-400 bg-stone-800/40 p-2.5 rounded-xl border border-stone-800">
          <div>
            <span className="text-stone-300 font-bold">PC 조작:</span>
            <div className="mt-0.5 space-y-0.5">
              <div>• 마우스 이동: 자유 시점</div>
              <div>• 마우스 우클릭 유지: 줌인(조준)</div>
              <div>• 좌클릭 / Space: 샷건 발사</div>
              <div>• Shift: 숙여 회피</div>
              <div>• R: 장전 / E: 주문</div>
            </div>
          </div>
          <div>
            <span className="text-stone-300 font-bold">모바일 조작:</span>
            <div className="mt-0.5 space-y-0.5">
              <div>• 화면 아래 6개 버튼 터치</div>
              <div>• 🛡️ 숙이기 / 🔫 총들기</div>
              <div>• 🎯 줌인 / 💥 발사</div>
              <div>• 🔄 장전 / 🍔 주문</div>
              <div>• 화면 드래그: 시점 회전</div>
            </div>
          </div>
        </div>

        {/* High Score */}
        {highScore > 0 && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-stone-400 text-xs font-bold">
            <Trophy size={14} className="text-amber-400" />
            내 최고 기록: <span className="font-mono text-amber-400 text-sm">{highScore}점</span>
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={onStart}
          className="mt-5 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 active:scale-95 text-stone-950 font-black text-lg sm:text-xl shadow-[0_0_25px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Play fill="currentColor" size={20} />
          게임 시작하기 (60초)
        </button>
      </div>
    </div>
  );
};
