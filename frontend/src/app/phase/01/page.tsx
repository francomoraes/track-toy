'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useGameStore } from '@/store/game-store';
import { useProgressStore } from '@/store/progress-store';

const GameScene = dynamic(() => import('@/components/game/game-scene').then((mod) => mod.GameScene), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] rounded-[28px] border border-stone-300/70 bg-stone-200/70 shadow-[0_24px_80px_rgba(68,64,60,0.12)] md:h-[560px]" />
  ),
});

export default function Phase01Page() {
  const router = useRouter();

  const phase = useGameStore((state) => state.phase);
  const reset = useGameStore((state) => state.reset);
  const completePhase = useProgressStore((state) => state.completePhase);

  useEffect(() => {
    if (phase.status === 'success') {
      completePhase('phase01');
    }
  }, [phase.status, completePhase]);

  function handleReset() {
    reset();
  }

  function handleGoToMap() {
    reset();
    router.push('/');
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8f0dd,transparent_35%),linear-gradient(180deg,#f7f1e3_0%,#e7dfcf_100%)] p-6 md:p-8">
      <div className="mx-auto mb-4 max-w-5xl">
        <button
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-stone-500 transition hover:bg-stone-200/60 hover:text-stone-800"
          onClick={handleGoToMap}
        >
          ← Fases
        </button>
      </div>

      <div className="mx-auto max-w-5xl">
        <GameScene onReset={handleReset} onGoToMap={handleGoToMap} />
      </div>
    </main>
  );
}
