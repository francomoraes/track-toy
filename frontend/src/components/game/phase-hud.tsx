'use client';

import type { Phase01ElevatorState } from '@/game-core';

type PhaseHudProps = {
  phase: Phase01ElevatorState;
  onRaiseStart: () => void;
  onRaiseEnd: () => void;
  onReset: () => void;
};

export function PhaseHud({ phase, onRaiseStart, onRaiseEnd, onReset }: PhaseHudProps) {
  const elevatorPct = Math.round((phase.elevator.position / phase.elevator.maxHeight) * 100);
  const carProgressPct = Math.round((phase.car.position / 100) * 100);
  const timeLeft = Math.max(0, phase.maxTicks - phase.tick);

  return (
    <section className="rounded-[28px] border border-stone-300/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(68,64,60,0.12)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Fase 1</p>
      <h1 className="mt-3 font-serif text-3xl text-stone-900">Elevador e pista inclinada</h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Segure <strong>Elevar</strong> para alinhar o elevador com a pista superior. Depois disso, o carrinho segue sozinho pela gravidade.
      </p>

      <div className="mt-6 grid gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700 sm:grid-cols-2">
        <p>
          Status: <strong>{phase.status}</strong>
        </p>
        <p>
          Tempo restante: <strong>{timeLeft}</strong> ticks
        </p>
        <p>
          Altura do elevador: <strong>{phase.elevator.position}</strong> / {phase.elevator.maxHeight}
        </p>
        <p>
          Posição do carrinho: <strong>{phase.car.position.toFixed(1)}</strong> / 100
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">Elevador: {elevatorPct}%</p>
          <div className="h-4 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full bg-sky-500 transition-all duration-100"
              style={{ width: `${Math.min(100, elevatorPct)}%` }}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">
            Carrinho: {carProgressPct}% {phase.car.isCoupledToElevator ? '(acoplado)' : '(rolando por gravidade)'}
          </p>
          <div className="h-4 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full bg-emerald-500 transition-all duration-100"
              style={{ width: `${Math.min(100, carProgressPct)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          disabled={phase.status !== 'running'}
          onMouseDown={onRaiseStart}
          onMouseUp={onRaiseEnd}
          onMouseLeave={onRaiseEnd}
          onTouchStart={onRaiseStart}
          onTouchEnd={onRaiseEnd}
          onTouchCancel={onRaiseEnd}
        >
          Segurar para elevar
        </button>

        <button
          className="rounded-full border border-stone-300 bg-stone-100 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-200"
          onClick={onReset}
        >
          Reiniciar fase
        </button>
      </div>

      {phase.status === 'success' && (
        <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          Sucesso! O carrinho completou a pista.
        </p>
      )}

      {phase.status === 'failed' && (
        <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          Falha por tempo. Tente manter o elevador alinhado tempo suficiente para liberar o carrinho.
        </p>
      )}
    </section>
  );
}
