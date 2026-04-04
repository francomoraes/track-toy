'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { PhaseHud } from '@/components/game/phase-hud';
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
  const setHeldAction = useGameStore((state) => state.setHeldAction);
  const reset = useGameStore((state) => state.reset);
  const completePhase = useProgressStore((state) => state.completePhase);

  // When the phase is won, record it in the progress store
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
      <div className="mx-auto mb-4 max-w-7xl">
        <button
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-stone-500 transition hover:bg-stone-200/60 hover:text-stone-800"
          onClick={handleGoToMap}
        >
          ← Fases
        </button>
      </div>

      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.9fr)] lg:items-start">
        <GameScene />

        <PhaseHud
          phase={phase}
          onRaiseStart={() => setHeldAction('raise')}
          onRaiseEnd={() => setHeldAction('none')}
          onReset={handleReset}
          onGoToMap={handleGoToMap}
        />
      </section>
    </main>
  );
}
