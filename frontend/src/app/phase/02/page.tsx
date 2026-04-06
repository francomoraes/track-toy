'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePhase02Store } from '@/store/game-store-phase02';
import { useProgressStore } from '@/store/progress-store';

const GameScenePhase02 = dynamic(
  () => import('@/components/game/game-scene-phase02').then((m) => m.GameScenePhase02),
  { ssr: false }
);

export default function Phase02Page() {
  const router = useRouter();
  const { phase, reset } = usePhase02Store();
  const completePhase = useProgressStore((s) => s.completePhase);

  useEffect(() => {
    if (phase.status === 'success') {
      completePhase('phase02');
    }
  }, [phase.status, completePhase]);

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
        <GameScenePhase02 onReset={reset} onGoToMap={handleGoToMap} />
      </div>
    </main>
  );
}
