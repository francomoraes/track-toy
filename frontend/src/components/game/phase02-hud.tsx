'use client';

import type { Phase02State } from '@/game-core';

type Phase02HudProps = {
  phase: Phase02State;
  onHoldA: () => void;
  onHoldB: () => void;
  onRelease: () => void;
  onReset: () => void;
  onGoToMap: () => void;
};

export function Phase02Hud({ phase, onHoldA, onHoldB, onRelease, onReset, onGoToMap }: Phase02HudProps) {
  const elevAProgress = Math.min(1, phase.elevatorA.position / phase.elevatorA.maxHeight);
  const elevBProgress = Math.min(1, phase.elevatorB.position / phase.elevatorB.maxHeight);
  const carProgress = Math.min(1, phase.car.position / 100);
  const timeUrgency = Math.min(1, phase.tick / phase.maxTicks);
  const overlay = phase.status !== 'running' ? phase.status : null;

  return (
    <section className="relative rounded-[28px] border border-stone-300/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(68,64,60,0.12)] backdrop-blur">

      {overlay && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 rounded-[28px] bg-white/95 p-8 backdrop-blur-sm">
          {overlay === 'success' ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Fase concluída</p>
                <h2 className="mt-1 font-serif text-2xl text-stone-900">O carrinho chegou!</h2>
                <p className="mt-2 text-sm text-stone-500">Você coordenou os dois elevadores no momento certo.</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-3xl">✕</div>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Falhou</p>
                <h2 className="mt-1 font-serif text-2xl text-stone-900">Tente de novo</h2>
                <p className="mt-2 text-sm text-stone-500">Suba os dois elevadores e ajuste o desvio no momento certo.</p>
              </div>
            </>
          )}
          <button className="mt-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700" onClick={onReset}>
            Reiniciar fase
          </button>
          <button className="rounded-full border border-stone-300 bg-stone-100 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-200" onClick={onGoToMap}>
            ← Fases
          </button>
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Fase 2</p>
      <h1 className="mt-3 font-serif text-3xl text-stone-900">Dois elevadores em sequência</h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Suba o <strong>Elevador A</strong> para lançar o carrinho. Aguarde-o chegar no <strong>Elevador B</strong> — e só então suba o B para completar a entrega.
      </p>

      {/* Progress bars */}
      <div className="mt-6 space-y-4">
        {[
          { label: 'Elevador A', progress: elevAProgress, color: '#3b82f6' },
          { label: 'Elevador B', progress: elevBProgress, color: '#a855f7' },
          { label: 'Carrinho', progress: carProgress, color: '#22c55e' },
        ].map(({ label, progress, color }) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-stone-700">{label}</span>
              <span className="text-xs text-stone-400">{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
              <div className="h-full rounded-full transition-all duration-100" style={{ width: `${progress * 100}%`, backgroundColor: color }} />
            </div>
          </div>
        ))}

        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-stone-700">Tempo</span>
            {timeUrgency > 0.75 && <span className="text-xs font-semibold text-rose-500">corre!</span>}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
            <div className="h-full rounded-full transition-all duration-100" style={{ width: `${timeUrgency * 100}%`, backgroundColor: timeUrgency > 0.75 ? '#f43f5e' : timeUrgency > 0.5 ? '#f97316' : '#a8a29e' }} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          className="rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
          onMouseDown={onHoldA} onMouseUp={onRelease} onMouseLeave={onRelease}
          onTouchStart={onHoldA} onTouchEnd={onRelease} onTouchCancel={onRelease}
        >
          Elevar A
        </button>

        <button
          className="rounded-full bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 active:scale-95"
          onMouseDown={onHoldB} onMouseUp={onRelease} onMouseLeave={onRelease}
          onTouchStart={onHoldB} onTouchEnd={onRelease} onTouchCancel={onRelease}
        >
          Elevar B
        </button>

        <button className="rounded-full border border-stone-300 bg-stone-100 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-200" onClick={onReset}>
          Reiniciar
        </button>
        <button className="rounded-full border border-stone-300 bg-stone-100 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-200" onClick={onGoToMap}>
          ← Fases
        </button>
      </div>
    </section>
  );
}
