'use client';

import { useEffect, useRef, useState } from 'react';

export type LeverButtonProps = {
  label: string;
  color: string;
  keyBinding?: string; // KeyboardEvent.code, e.g. 'Space', 'KeyA', 'KeyL'
  onHold: () => void;
  onRelease: () => void;
};

function keyLabel(code: string): string {
  if (code === 'Space') return 'SPC';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  return code;
}

/**
 * Lever that activates while held (pointer OR keyboard).
 * Uses a source-count (acquire/release) so pointer and key can coexist
 * without one accidentally cancelling the other.
 */
export function LeverButton({ label, color, keyBinding, onHold, onRelease }: LeverButtonProps) {
  const [held, setHeld] = useState(false);

  // Keep callbacks current without re-running effects
  const state = useRef({ sources: 0, onHold, onRelease });
  state.current.onHold = onHold;
  state.current.onRelease = onRelease;

  // Stable acquire/release — safe to use in event listeners and pointerdown handler
  const acquire = useRef(() => {
    state.current.sources += 1;
    if (state.current.sources === 1) {
      setHeld(true);
      state.current.onHold();
    }
  }).current;

  const release = useRef(() => {
    state.current.sources = Math.max(0, state.current.sources - 1);
    if (state.current.sources === 0) {
      setHeld(false);
      state.current.onRelease();
    }
  }).current;

  // Keyboard bindings
  useEffect(() => {
    if (!keyBinding) return;
    const down = (e: KeyboardEvent) => {
      if (e.code !== keyBinding || e.repeat) return;
      acquire();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== keyBinding) return;
      release();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [keyBinding, acquire, release]);

  return (
    <div className="flex select-none flex-col items-center gap-1.5 touch-none">
      <div
        className="relative h-20 w-14 cursor-pointer"
        onPointerDown={(e) => {
          e.preventDefault();
          acquire();
          window.addEventListener('pointerup', release, { once: true });
        }}
      >
        {/* Housing bracket */}
        <div
          className="absolute bottom-0 left-1/2 h-6 w-11 -translate-x-1/2 rounded-t"
          style={{
            background: 'linear-gradient(to bottom, #3a3530, #1e1b17)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        />
        {/* Slot groove */}
        <div
          className="absolute bottom-4 left-1/2 top-0 w-1.5 -translate-x-1/2 rounded-full"
          style={{ background: 'rgba(0,0,0,0.55)', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.9)' }}
        />
        {/* Lever arm */}
        <div
          className="absolute bottom-4 left-1/2 rounded-full"
          style={{
            width: 7,
            height: 52,
            background: `linear-gradient(to right, ${color}bb, ${color}, ${color}bb)`,
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${held ? -22 : 20}deg)`,
            transition: 'transform 0.12s ease-out',
            boxShadow: held ? `0 0 12px ${color}, 0 0 24px ${color}55` : `0 0 4px ${color}44`,
          }}
        >
          {/* Knob */}
          <div
            className="absolute -top-2 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full"
            style={{
              background: `radial-gradient(circle at 35% 35%, white, ${color})`,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: held ? `0 0 10px ${color}, 0 0 22px ${color}55` : `0 0 6px ${color}66`,
            }}
          />
        </div>
      </div>

      {/* Label */}
      <span
        className="text-[9px] font-bold uppercase tracking-[0.15em]"
        style={{ color: held ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)' }}
      >
        {label}
      </span>

      {/* Key hint */}
      {keyBinding && (
        <div
          className="rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide transition-colors"
          style={{
            background: held ? `${color}33` : 'rgba(255,255,255,0.06)',
            color: held ? color : 'rgba(255,255,255,0.3)',
            border: `1px solid ${held ? color + '55' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {keyLabel(keyBinding)}
        </div>
      )}
    </div>
  );
}
