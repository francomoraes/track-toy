'use client';

import Link from 'next/link';

import { useProgressStore } from '@/store/progress-store';

export default function Home() {
  const phaseMap = useProgressStore((state) => state.phaseMap);
  const entries = phaseMap();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8f0dd,transparent_35%),linear-gradient(180deg,#f7f1e3_0%,#e7dfcf_100%)] p-6 md:p-8">
      <div className="mx-auto max-w-xl">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">Track Toy</p>
          <h1 className="mt-3 font-serif text-4xl text-stone-900">Selecione uma fase</h1>
        </header>

        <ol className="space-y-4">
          {entries.map((entry, index) => {
            const isLocked = entry.status === 'locked';
            const isCompleted = entry.status === 'completed';

            const card = (
              <div
                className={[
                  'flex items-center gap-5 rounded-[20px] border p-5 transition',
                  isLocked
                    ? 'cursor-not-allowed border-stone-200 bg-stone-100/60 opacity-50'
                    : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50'
                      : 'border-stone-300/70 bg-white/85 shadow-[0_8px_32px_rgba(68,64,60,0.08)] hover:shadow-[0_12px_40px_rgba(68,64,60,0.12)]',
                ].join(' ')}
              >
                <div
                  className={[
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    isLocked
                      ? 'bg-stone-200 text-stone-400'
                      : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-stone-900 text-white',
                  ].join(' ')}
                >
                  {isCompleted ? '✓' : isLocked ? '🔒' : index + 1}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-stone-800">{entry.label}</p>
                  <p className="text-xs text-stone-400 capitalize">{entry.status === 'available' ? 'disponível' : entry.status === 'completed' ? 'concluída' : 'bloqueada'}</p>
                </div>
              </div>
            );

            return (
              <li key={entry.id}>
                {isLocked ? card : <Link href={entry.route}>{card}</Link>}
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}
