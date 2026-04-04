'use client';

import type { Phase01ElevatorState } from '@/game-core';

import { buildHudModel } from './hud-model';

type PhaseHudProps = {
  phase: Phase01ElevatorState;
  onRaiseStart: () => void;
  onRaiseEnd: () => void;
  onReset: () => void;
};

export function PhaseHud({ phase, onRaiseStart, onRaiseEnd, onReset }: PhaseHudProps) {
  const hud = buildHudModel(phase);

  return (
    <section className="relative rounded-[28px] border border-stone-300/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(68,64,60,0.12)] backdrop-blur">

      {/* Overlay de fim de fase */}
      {hud.overlay && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 rounded-[28px] bg-white/95 p-8 backdrop-blur-sm">
          {hud.overlay === 'success' ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
                ✓
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Fase concluída</p>
                <h2 className="mt-1 font-serif text-2xl text-stone-900">O carrinho chegou!</h2>
                <p className="mt-2 text-sm text-stone-500">O elevador foi alinhado na hora certa.</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-3xl">
                ✕
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Tempo esgotado</p>
                <h2 className="mt-1 font-serif text-2xl text-stone-900">Tente de novo</h2>
                <p className="mt-2 text-sm text-stone-500">Suba o elevador até o topo enquanto o tempo permite.</p>
              </div>
            </>
          )}
          <button
            className="mt-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
            onClick={onReset}
          >
            Reiniciar fase
          </button>
        </div>
      )}

      {/* Cabeçalho */}
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Fase 1</p>
      <h1 className="mt-3 font-serif text-3xl text-stone-900">Elevador e pista inclinada</h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Segure <strong>Elevar</strong> para alinhar o elevador com a pista superior. Depois disso, o carrinho segue sozinho pela gravidade.
      </p>

      {/* Barras de progresso */}
      <div className="mt-6 space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-stone-700">Elevador</span>
            <span className="text-xs text-stone-400">
              {hud.elevatorProgress >= 1 ? 'no topo' : `${Math.round(hud.elevatorProgress * 100)}%`}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-100"
              style={{ width: `${hud.elevatorProgress * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-stone-700">
              Carrinho
              {hud.carState === 'coupled' && (
                <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                  acoplado
                </span>
              )}
              {hud.carState === 'rolling' && (
                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  rolando
                </span>
              )}
            </span>
            <span className="text-xs text-stone-400">{Math.round(hud.carProgress * 100)}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-100"
              style={{ width: `${hud.carProgress * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-stone-700">Tempo</span>
            {hud.timeUrgency > 0.75 && (
              <span className="text-xs font-semibold text-rose-500">corre!</span>
            )}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${hud.timeUrgency * 100}%`,
                backgroundColor: hud.timeUrgency > 0.75 ? '#f43f5e' : hud.timeUrgency > 0.5 ? '#f97316' : '#a8a29e',
              }}
            />
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
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
          Reiniciar
        </button>
      </div>
    </section>
  );
}
