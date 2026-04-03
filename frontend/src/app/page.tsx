'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPhase01Elevator, stepPhase01Elevator, type HoldAction } from '@/game-core';

const TICK_MS = 120;

export default function Home() {
  const initialState = useMemo(
    () =>
      createPhase01Elevator({
        maxHeight: 12,
        inclinationDeg: 30,
        maxVelocity: 5,
        maxTicks: 200,
      }),
    [],
  );
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

  const elevatorPct = Math.round((phase.elevator.position / phase.elevator.maxHeight) * 100);
  const carProgressPct = Math.round((phase.car.position / 100) * 100);
  const carIsCoupled = phase.elevator.position < phase.elevator.maxHeight;
  const timeLeft = Math.max(0, phase.maxTicks - phase.tick);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-slate-100 p-6">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-300 bg-white/80 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Track Toy · Fase 1 (Elevador)</h1>
        <p className="mt-2 text-slate-600">
          Objetivo: segure <strong>Elevar</strong> para levar o carrinho até o final da pista antes do tempo acabar.
        </p>

        <div className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-4">
          <p>
            Status: <strong>{phase.status}</strong>
          </p>
          <p>
            Altura: <strong>{phase.elevator.position}</strong> / {phase.elevator.maxHeight}
          </p>
          <p>
            Posição carrinho: <strong>{phase.car.position.toFixed(1)}</strong> / 100
          </p>
          <p>
            Tempo restante: <strong>{timeLeft}</strong> ticks
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Elevador: {elevatorPct}%</p>
            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-sky-500 transition-all duration-100"
                style={{ width: `${Math.min(100, elevatorPct)}%` }}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Carrinho na pista: {carProgressPct}% {carIsCoupled ? '(acoplado ao elevador)' : '(rolando por gravidade)'}
            </p>
            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-emerald-500 transition-all duration-100"
                style={{ width: `${Math.min(100, carProgressPct)}%` }}
              />
            </div>
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
              setPhase(
                createPhase01Elevator({
                  maxHeight: 12,
                  inclinationDeg: 30,
                  maxVelocity: 5,
                  maxTicks: 200,
                }),
              );
            }}
          >
            Reiniciar fase
          </button>
        </div>

        {phase.status === 'success' && (
          <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 font-medium text-emerald-700">
            Sucesso! O carrinho completou a pista.
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
