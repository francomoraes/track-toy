'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Phase02Hud } from '@/components/game/phase02-hud';
import { usePhase02Store } from '@/store/game-store-phase02';
import { useProgressStore } from '@/store/progress-store';

const GameScenePhase02 = dynamic(
  () => import('@/components/game/game-scene-phase02').then((m) => m.GameScenePhase02),
  { ssr: false }
);

export default function Phase02Page() {
  const router = useRouter();
  const { phase, setHeldAction, reset } = usePhase02Store();
  const completePhase = useProgressStore((s) => s.completePhase);

  useEffect(() => {
    if (phase.status === 'success') {
      completePhase('phase02');
    }
  }, [phase.status, completePhase]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-stone-100 p-8 md:flex-row md:items-start md:gap-12">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl shadow-xl">
        <GameScenePhase02 />
      </div>

      <div className="w-full max-w-sm">
        <Phase02Hud
          phase={phase}
          onHoldA={() => setHeldAction('raise_a')}
          onHoldB={() => setHeldAction('raise_b')}
          onRelease={() => setHeldAction('none')}
          onReset={reset}
          onGoToMap={() => router.push('/')}
        />
      </div>
    </main>
  );
}
