/**
 * GameOverModal.tsx
 * Results modal showing final score, stats breakdown, cause of game over, and replay button.
 */
import React from 'react';
import { RotateCcw, Trophy, Skull, Clock, AlertOctagon } from 'lucide-react';
import { GameOverReason, GameStats } from '../types/game';

interface GameOverModalProps {
  stats: GameStats;
  isNewHigh: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  isNewHigh,
  onRestart,
}) => {
  const getReasonInfo = (reason?: GameOverReason) => {
    switch (reason) {
      case 'SHOT_BY_ROBBER':
        return {
          title: '강도의 총알에 피격당했습니다!',
          desc: '강도가 총을 쏠 때는 Shift 키(🛡️)로 차문 아래로 숙여 피해야 합니다.',
          icon: <Skull className="text-red-500" size={32} />,
          badgeColor: 'bg-red-950 border-red-600 text-red-300',
        };
      case 'SHOT_INNOCENT':
        return {
          title: '무고한 매장 직원을 사살했습니다!',
          desc: '직원이 나올 때는 샷건 대신 E 키(🍔)로 버거를 주문해야 합니다.',
          icon: <AlertOctagon className="text-orange-500" size={32} />,
          badgeColor: 'bg-orange-950 border-orange-600 text-orange-300',
        };
      case 'TIME_OUT':
      default:
        return {
          title: '60초 제한 시간이 종료되었습니다!',
          desc: '1분 동안 드라이빙스루 차선을 훌륭히 수호했습니다!',
          icon: <Clock className="text-amber-500" size={32} />,
          badgeColor: 'bg-amber-950 border-amber-600 text-amber-300',
        };
    }
  };

  const reasonInfo = getReasonInfo(stats.reason);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-md overflow-y-auto">
      <div className="max-w-md w-full bg-stone-900 border-2 border-stone-700 rounded-3xl p-5 sm:p-7 shadow-2xl text-center my-auto">
        {/* Cause icon */}
        <div className="flex justify-center mb-2">{reasonInfo.icon}</div>

        {/* Reason Banner */}
        <div className={`inline-block px-3 py-1 rounded-full border text-xs font-black tracking-wide ${reasonInfo.badgeColor} mb-2`}>
          {reasonInfo.title}
        </div>

        <p className="text-stone-400 text-xs font-medium leading-relaxed max-w-xs mx-auto">
          {reasonInfo.desc}
        </p>

        {/* Final Score Section */}
        <div className="my-5 p-4 bg-stone-950 rounded-2xl border border-stone-800">
          <div className="text-xs uppercase font-bold text-stone-400 tracking-wider">
            최종 점수 (FINAL SCORE)
          </div>
          <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight my-1">
            {stats.score}점
          </div>

          {isNewHigh && (
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-black animate-pulse">
              🎉 최고 점수 경신!
            </div>
          )}

          {/* Detailed stats breakdown */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-stone-800 text-left">
            <div className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-800">
              <div className="text-[10px] text-stone-400 font-bold uppercase">강도 제압</div>
              <div className="text-lg font-black text-red-400 font-mono">
                {stats.robbersDefeated}명 <span className="text-xs text-stone-500 font-normal">(+{stats.robbersDefeated * 100}점)</span>
              </div>
            </div>

            <div className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-800">
              <div className="text-[10px] text-stone-400 font-bold uppercase">버거 주문</div>
              <div className="text-lg font-black text-emerald-400 font-mono">
                {stats.ordersCompleted}건 <span className="text-xs text-stone-500 font-normal">(+{stats.ordersCompleted * 50}점)</span>
              </div>
            </div>
          </div>
        </div>

        {/* High score info */}
        <div className="flex items-center justify-center gap-1.5 text-stone-400 text-xs font-bold mb-4">
          <Trophy size={14} className="text-amber-400" />
          내 최고 기록: <span className="font-mono text-stone-200">{stats.highScore}점</span>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 active:scale-95 text-stone-950 font-black text-lg shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <RotateCcw size={20} />
          다시 도전하기
        </button>
      </div>
    </div>
  );
};
