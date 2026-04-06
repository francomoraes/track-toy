'use client';

import { Environment, OrbitControls, PerspectiveCamera, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useGameStore } from '@/store/game-store';

import { advanceTickAccumulator } from './frame-ticker';
import { buildPhase01PieceModel } from './piece-model';
import { buildPhase01SceneModel } from './scene-model';

const TICK_SECONDS = 0.12;

type LeverButtonProps = {
  label: string;
  color: string;
  onHold: () => void;
  onRelease: () => void;
};

function LeverButton({ label, color, onHold, onRelease }: LeverButtonProps) {
  const [held, setHeld] = useState(false);
  const releaseRef = useRef(onRelease);
  useEffect(() => { releaseRef.current = onRelease; });

  useEffect(() => {
    if (!held) return;
    const up = () => { setHeld(false); releaseRef.current(); };
    window.addEventListener('pointerup', up, { once: true });
    return () => window.removeEventListener('pointerup', up);
  }, [held]);

  return (
    <div className="flex select-none flex-col items-center gap-2 touch-none">
      <div
        className="relative h-20 w-14 cursor-pointer"
        onPointerDown={(e) => { e.preventDefault(); setHeld(true); onHold(); }}
      >
        {/* Housing bracket */}
        <div
          className="absolute bottom-0 left-1/2 h-6 w-11 -translate-x-1/2 rounded-t"
          style={{ background: 'linear-gradient(to bottom, #3a3530, #1e1b17)', border: '1px solid rgba(255,255,255,0.07)' }}
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
      <span
        className="text-[9px] font-bold uppercase tracking-[0.15em]"
        style={{ color: held ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)' }}
      >
        {label}
      </span>
    </div>
  );
}

function SceneTicker() {
  const tick = useGameStore((state) => state.tick);
  const accumulatorRef = useRef(0);

  useFrame((_, delta) => {
    const result = advanceTickAccumulator({
      accumulator: accumulatorRef.current,
      deltaSeconds: delta,
      tickSeconds: TICK_SECONDS,
    });

    accumulatorRef.current = result.accumulator;

    for (let index = 0; index < result.ticksToRun; index += 1) {
      tick();
    }
  });

  return null;
}

function Phase01SceneContent() {
  const phase = useGameStore((state) => state.phase);
  const scene = useMemo(() => buildPhase01SceneModel(phase), [phase]);
  const pieces = useMemo(() => buildPhase01PieceModel(scene), [scene]);

  return (
    <>
      <color attach="background" args={['#f0e8d8']} />
      <ambientLight intensity={0.4} />
      <directionalLight
        intensity={1.8}
        position={[8, 12, 6]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={10}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />
      <Environment preset="apartment" />
      <SceneTicker />

      <PerspectiveCamera makeDefault position={[4.5, 5, 14]} fov={42} />
      <OrbitControls enablePan={false} maxDistance={18} maxPolarAngle={Math.PI / 2.05} minDistance={8} />

      <group position={[0, -2, 0]}>
        <mesh position={[0, -0.6, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[24, 16]} />
          <meshStandardMaterial color="#d9cdb8" roughness={0.95} metalness={0} />
        </mesh>

        <mesh position={[-3, 2, -0.2]} castShadow receiveShadow>
          <boxGeometry args={pieces.elevator.mastSize} />
          <meshStandardMaterial color="#6b5e52" roughness={0.8} metalness={0.1} />
        </mesh>

        <mesh position={[-3, 2.05, 0.42]} castShadow>
          <boxGeometry args={[0.16, 5.4, 0.12]} />
          <meshStandardMaterial color="#9a8470" roughness={0.8} metalness={0.1} />
        </mesh>

        <mesh position={[-3, 2.05, -0.42]} castShadow>
          <boxGeometry args={[0.16, 5.4, 0.12]} />
          <meshStandardMaterial color="#9a8470" roughness={0.8} metalness={0.1} />
        </mesh>

        <mesh position={[-3, -0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={pieces.elevator.baseSize} />
          <meshStandardMaterial color="#b08e68" roughness={0.85} metalness={0} />
        </mesh>

        <mesh position={scene.lowerTrack.center} rotation={scene.lowerTrack.rotation} castShadow receiveShadow>
          <boxGeometry args={[scene.lowerTrack.length, pieces.lowerTrack.deckHeight, 1.2]} />
          <meshStandardMaterial color="#8b7248" roughness={0.88} metalness={0} />
        </mesh>

        <mesh position={[scene.lowerTrack.center[0], scene.lowerTrack.center[1] + 0.08, pieces.lowerTrack.railOffsetZ]} rotation={scene.lowerTrack.rotation} castShadow>
          <boxGeometry args={[scene.lowerTrack.length, 0.08, 0.08]} />
          <meshStandardMaterial color="#374151" roughness={0.45} metalness={0.7} />
        </mesh>

        <mesh position={[scene.lowerTrack.center[0], scene.lowerTrack.center[1] + 0.08, -pieces.lowerTrack.railOffsetZ]} rotation={scene.lowerTrack.rotation} castShadow>
          <boxGeometry args={[scene.lowerTrack.length, 0.08, 0.08]} />
          <meshStandardMaterial color="#374151" roughness={0.45} metalness={0.7} />
        </mesh>

        {pieces.lowerTrack.supports.map((position, index) => (
          <mesh key={`lower-support-${index}`} position={position} castShadow receiveShadow>
            <boxGeometry args={[0.22, 1.2, 0.22]} />
            <meshStandardMaterial color="#7a6540" roughness={0.9} metalness={0} />
          </mesh>
        ))}

        {scene.upperTracks.map((upperTrack, trackIdx) => {
          const trackPiece = pieces.upperTracks[trackIdx];
          return (
            <group key={`upper-track-${trackIdx}`}>
              <mesh position={upperTrack.center} rotation={upperTrack.rotation} castShadow receiveShadow>
                <boxGeometry args={[upperTrack.length, trackPiece.deckHeight, 1.4]} />
                <meshStandardMaterial color="#a08060" roughness={0.88} metalness={0} />
              </mesh>

              <mesh position={[upperTrack.center[0], upperTrack.center[1] + 0.1, trackPiece.railOffsetZ]} rotation={upperTrack.rotation} castShadow>
                <boxGeometry args={[upperTrack.length, 0.08, 0.08]} />
                <meshStandardMaterial color="#374151" roughness={0.45} metalness={0.7} />
              </mesh>

              <mesh position={[upperTrack.center[0], upperTrack.center[1] + 0.1, -trackPiece.railOffsetZ]} rotation={upperTrack.rotation} castShadow>
                <boxGeometry args={[upperTrack.length, 0.08, 0.08]} />
                <meshStandardMaterial color="#374151" roughness={0.45} metalness={0.7} />
              </mesh>

              {trackPiece.supports.map((position, index) => (
                <mesh key={`upper-support-${trackIdx}-${index}`} position={position} castShadow receiveShadow>
                  <boxGeometry args={[0.24, 2.1, 0.24]} />
                  <meshStandardMaterial color="#7a6540" roughness={0.9} metalness={0} />
                </mesh>
              ))}
            </group>
          );
        })}

        <mesh position={[scene.elevator.exitPoint[0] - 0.45, scene.elevator.exitPoint[1] - 0.03, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.16, 1.36]} />
          <meshStandardMaterial color="#c2a878" roughness={0.85} metalness={0} />
        </mesh>

        <RoundedBox args={[...pieces.elevator.platformSize]} radius={0.06} smoothness={3} position={scene.elevator.position} rotation={scene.elevator.rotation} castShadow receiveShadow>
          <meshStandardMaterial color="#3d8fc2" roughness={0.35} metalness={0.2} emissive="#3d8fc2" emissiveIntensity={0.12} />
        </RoundedBox>

        {pieces.elevator.guardRails.map((offset, index) => (
          <mesh
            key={`elevator-guard-${index}`}
            position={[
              scene.elevator.position[0] + offset[0],
              scene.elevator.position[1] + offset[1],
              scene.elevator.position[2] + offset[2],
            ]}
            rotation={scene.elevator.rotation}
            castShadow
          >
            <boxGeometry args={[1.8, 0.12, 0.12]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.4} metalness={0.3} />
          </mesh>
        ))}

        <RoundedBox args={[...pieces.car.bodySize]} radius={0.04} smoothness={3} position={scene.car.position} rotation={scene.car.rotation} castShadow receiveShadow>
          <meshStandardMaterial color={scene.car.isCoupledToElevator ? '#e06010' : '#c01820'} roughness={0.35} metalness={0.25} emissive={scene.car.isCoupledToElevator ? '#e06010' : '#c01820'} emissiveIntensity={0.18} />
        </RoundedBox>

        <RoundedBox
          args={[0.42, 0.28, 0.52]}
          radius={0.04}
          smoothness={3}
          position={[
            scene.car.position[0] + pieces.car.cabinOffset[0],
            scene.car.position[1] + pieces.car.cabinOffset[1],
            scene.car.position[2] + pieces.car.cabinOffset[2],
          ]}
          rotation={scene.car.rotation}
          castShadow
        >
          <meshStandardMaterial color="#fbbf24" roughness={0.4} metalness={0.1} emissive="#fbbf24" emissiveIntensity={0.12} />
        </RoundedBox>

        <mesh
          position={[
            scene.car.position[0] + pieces.car.noseOffset[0],
            scene.car.position[1] + pieces.car.noseOffset[1],
            scene.car.position[2] + pieces.car.noseOffset[2],
          ]}
          rotation={scene.car.rotation}
          castShadow
        >
          <boxGeometry args={[0.18, 0.16, 0.44]} />
          <meshStandardMaterial color="#f87171" roughness={0.5} metalness={0.1} />
        </mesh>

        {pieces.car.wheels.map((offset, index) => (
          <mesh
            key={`car-wheel-${index}`}
            position={[
              scene.car.position[0] + offset[0],
              scene.car.position[1] + offset[1],
              scene.car.position[2] + offset[2],
            ]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.1, 0.1, 0.14, 18]} />
            <meshStandardMaterial color="#111827" roughness={0.6} metalness={0.4} />
          </mesh>
        ))}

      </group>
    </>
  );
}

type GameSceneProps = {
  onReset: () => void;
  onGoToMap: () => void;
};

export function GameScene({ onReset, onGoToMap }: GameSceneProps) {
  const status = useGameStore((state) => state.phase.status);
  const setHeldAction = useGameStore((state) => state.setHeldAction);
  const overlay = status !== 'running' ? status : null;

  return (
    <div className="relative grid h-[420px] grid-rows-[1fr_84px] overflow-hidden rounded-[28px] border border-stone-300/70 shadow-[0_24px_80px_rgba(68,64,60,0.12)] md:h-[560px] md:grid-rows-[1fr_112px]">
      {/* 3D scene — 80% */}
      <div className="relative overflow-hidden bg-[#efe6d3]">
        <Canvas shadows style={{ position: 'absolute', inset: 0 }}>
          <Phase01SceneContent />
        </Canvas>
        {/* CSS vignette — no postprocessing needed */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 42%, rgba(8,6,4,0.52) 100%)' }} />
      </div>

      {/* Control panel — 20% */}
      <div
        className="relative flex items-center justify-center gap-10 px-8"
        style={{ background: 'linear-gradient(to bottom, #252018, #0e0c0a)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
      >
        <div className="pointer-events-none absolute left-3 top-2.5 h-[5px] w-[5px] rounded-full bg-zinc-600/70" />
        <div className="pointer-events-none absolute right-3 top-2.5 h-[5px] w-[5px] rounded-full bg-zinc-600/70" />
        <div className="pointer-events-none absolute bottom-2.5 left-3 h-[5px] w-[5px] rounded-full bg-zinc-600/70" />
        <div className="pointer-events-none absolute bottom-2.5 right-3 h-[5px] w-[5px] rounded-full bg-zinc-600/70" />
        <LeverButton
          label="Elevar"
          color="#22c55e"
          onHold={() => setHeldAction('raise')}
          onRelease={() => setHeldAction('none')}
        />
      </div>

      {overlay && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 rounded-[28px] bg-white/90 p-8 backdrop-blur-sm">
          {overlay === 'success' ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Fase concluída</p>
                <h2 className="mt-1 font-serif text-2xl text-stone-900">O carrinho chegou!</h2>
                <p className="mt-2 text-sm text-stone-500">O elevador foi alinhado na hora certa.</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-3xl">✕</div>
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
          <button
            className="rounded-full border border-stone-300 bg-stone-100 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-200"
            onClick={onGoToMap}
          >
            ← Fases
          </button>
        </div>
      )}
    </div>
  );
}
