'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPhase01Elevator, stepPhase01Elevator, type HoldAction } from '@/game-core';

const TICK_MS = 120;

export default function Home() {
  const initialState = useMemo(() => createPhase01Elevator({ maxHeight: 12, maxTicks: 180 }), []);
  const [phase, setPhase] = useState(initialState);
  const [heldAction, setHeldAction] = useState<HoldAction>('none');

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((current) => stepPhase01Elevator(current, heldAction));
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [heldAction]);

  useEffect(() => {
    if (phase.status !== 'running') {
      setHeldAction('none');
    }
  }, [phase.status]);

  const progressPct = Math.round((phase.carPosition / phase.goalPosition) * 100);
  const timeLeft = Math.max(0, phase.maxTicks - phase.tick);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-slate-100 p-6">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-300 bg-white/80 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Track Toy · Fase 1 (Elevador)</h1>
        <p className="mt-2 text-slate-600">
          Objetivo: segure <strong>Elevar</strong> para levar o carrinho at\u00e9 o topo antes do tempo acabar.
        </p>

        <div className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-3">
          <p>
            Status: <strong>{phase.status}</strong>
          </p>
          <p>
            Altura: <strong>{phase.elevator.position}</strong> / {phase.elevator.maxHeight}
          </p>
          <p>
            Tempo restante: <strong>{timeLeft}</strong> ticks
          </p>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-slate-700">Progresso do carrinho: {progressPct}%</p>
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-emerald-500 transition-all duration-100"
              style={{ width: `${Math.min(100, progressPct)}%` }}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={phase.status !== 'running'}
            onMouseDown={() => setHeldAction('raise')}
            onMouseUp={() => setHeldAction('none')}
            onMouseLeave={() => setHeldAction('none')}
            onTouchStart={() => setHeldAction('raise')}
            onTouchEnd={() => setHeldAction('none')}
          >
            Segurar para elevar
          </button>

          <button
            className="rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-800"
            onClick={() => {
              setHeldAction('none');
              setPhase(createPhase01Elevator({ maxHeight: 12, maxTicks: 180 }));
            }}
          >
            Reiniciar fase
          </button>
        </div>

        {phase.status === 'success' && (
          <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 font-medium text-emerald-700">
            Sucesso! O carrinho chegou ao topo.
          </p>
        )}

        {phase.status === 'failed' && (
          <p className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 font-medium text-rose-700">
            Falha por tempo. Tente manter o comando de elevar por mais tempo.
          </p>
        )}
      </section>
    </main>
  );
}
