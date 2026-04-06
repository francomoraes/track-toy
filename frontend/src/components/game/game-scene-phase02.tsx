'use client';

import { Environment, OrbitControls, PerspectiveCamera, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';

import { usePhase02Store } from '@/store/game-store-phase02';

import { advanceTickAccumulator } from './frame-ticker';
import { buildPhase02SceneModel } from './scene-model-phase02';

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
        <div className="absolute bottom-2 left-1/2 top-1 w-2 -translate-x-1/2 rounded-full bg-zinc-800" />
        <div
          className="absolute bottom-3 left-1/2 rounded-full"
          style={{
            width: 8,
            height: 58,
            backgroundColor: color,
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${held ? -22 : 20}deg)`,
            transition: 'transform 0.12s ease-out',
            boxShadow: held ? `0 0 14px ${color}` : `0 0 0px ${color}00`,
          }}
        >
          <div
            className="absolute -top-1 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border border-white/20"
            style={{
              backgroundColor: color,
              filter: 'brightness(1.5)',
              boxShadow: held ? `0 0 8px ${color}` : 'none',
            }}
          />
        </div>
      </div>
      <span
        className="text-[9px] font-bold uppercase tracking-[0.15em]"
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        {label}
      </span>
    </div>
  );
}

function SceneTicker02() {
  const tick = usePhase02Store((state) => state.tick);
  const accumulatorRef = useRef(0);

  useFrame((_, delta) => {
    const result = advanceTickAccumulator({ accumulator: accumulatorRef.current, deltaSeconds: delta, tickSeconds: TICK_SECONDS });
    accumulatorRef.current = result.accumulator;
    for (let i = 0; i < result.ticksToRun; i++) tick();
  });

  return null;
}

function Phase02SceneContent() {
  const phase = usePhase02Store((state) => state.phase);
  const scene = useMemo(() => buildPhase02SceneModel(phase), [phase]);

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
      <SceneTicker02 />

      <PerspectiveCamera makeDefault position={[2, 5, 14]} fov={44} />
      <OrbitControls enablePan={false} maxDistance={20} maxPolarAngle={Math.PI / 2.05} minDistance={9} />

      <group position={[0, -2, 0]}>
        {/* Ground */}
        <mesh position={[0, -0.6, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[28, 16]} />
          <meshStandardMaterial color="#d9cdb8" roughness={0.95} metalness={0} />
        </mesh>

        {/* Lower approach track */}
        <mesh position={scene.lowerTrack.center} rotation={scene.lowerTrack.rotation} castShadow receiveShadow>
          <boxGeometry args={[scene.lowerTrack.length, 0.22, 1.2]} />
          <meshStandardMaterial color="#8b7248" roughness={0.88} metalness={0} />
        </mesh>

        {/* Elevator A mast */}
        <mesh position={[scene.elevatorA.position[0], 2, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 5.2, 0.9]} />
          <meshStandardMaterial color="#6b5e52" roughness={0.8} metalness={0.1} />
        </mesh>
        <mesh position={[scene.elevatorA.position[0], -0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.3, 1.6]} />
          <meshStandardMaterial color="#b08e68" roughness={0.85} metalness={0} />
        </mesh>

        {/* Elevator A platform */}
        <RoundedBox args={[2.3, 0.32, 1.5]} radius={0.06} smoothness={3} position={scene.elevatorA.position} rotation={scene.elevatorA.rotation} castShadow receiveShadow>
          <meshStandardMaterial color="#3d8fc2" roughness={0.35} metalness={0.2} emissive="#3d8fc2" emissiveIntensity={0.12} />
        </RoundedBox>

        {/* Track 1 */}
        <mesh position={scene.track1.center} rotation={scene.track1.rotation} castShadow receiveShadow>
          <boxGeometry args={[scene.track1.length, 0.28, 1.4]} />
          <meshStandardMaterial color="#a08060" roughness={0.88} metalness={0} />
        </mesh>
        <mesh position={[scene.track1.center[0], scene.track1.center[1] + 0.1, 0.5]} rotation={scene.track1.rotation} castShadow>
          <boxGeometry args={[scene.track1.length, 0.08, 0.08]} />
          <meshStandardMaterial color="#374151" roughness={0.45} metalness={0.7} />
        </mesh>
        <mesh position={[scene.track1.center[0], scene.track1.center[1] + 0.1, -0.5]} rotation={scene.track1.rotation} castShadow>
          <boxGeometry args={[scene.track1.length, 0.08, 0.08]} />
          <meshStandardMaterial color="#374151" roughness={0.45} metalness={0.7} />
        </mesh>

        {/* Elevator B mast */}
        <mesh position={[scene.elevatorB.position[0], 1.5, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 4.5, 0.9]} />
          <meshStandardMaterial color="#6b5e52" roughness={0.8} metalness={0.1} />
        </mesh>
        <mesh position={[scene.elevatorB.position[0], -0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.3, 1.6]} />
          <meshStandardMaterial color="#b08e68" roughness={0.85} metalness={0} />
        </mesh>

        {/* Elevator B platform */}
        <RoundedBox args={[2.3, 0.32, 1.5]} radius={0.06} smoothness={3} position={scene.elevatorB.position} rotation={scene.elevatorB.rotation} castShadow receiveShadow>
          <meshStandardMaterial color="#7c3aed" roughness={0.35} metalness={0.2} emissive="#7c3aed" emissiveIntensity={0.14} />
        </RoundedBox>

        {/* Track 2 */}
        <mesh position={scene.track2.center} rotation={scene.track2.rotation} castShadow receiveShadow>
          <boxGeometry args={[scene.track2.length, 0.28, 1.4]} />
          <meshStandardMaterial color="#a08060" roughness={0.88} metalness={0} />
        </mesh>
        <mesh position={[scene.track2.center[0], scene.track2.center[1] + 0.1, 0.5]} rotation={scene.track2.rotation} castShadow>
          <boxGeometry args={[scene.track2.length, 0.08, 0.08]} />
          <meshStandardMaterial color="#374151" roughness={0.45} metalness={0.7} />
        </mesh>
        <mesh position={[scene.track2.center[0], scene.track2.center[1] + 0.1, -0.5]} rotation={scene.track2.rotation} castShadow>
          <boxGeometry args={[scene.track2.length, 0.08, 0.08]} />
          <meshStandardMaterial color="#374151" roughness={0.45} metalness={0.7} />
        </mesh>

        {/* Car */}
        <RoundedBox args={[0.92, 0.36, 0.58]} radius={0.04} smoothness={3} position={scene.car.position} rotation={scene.car.rotation} castShadow receiveShadow>
          <meshStandardMaterial color={scene.car.isCoupledToElevator ? '#e06010' : '#c01820'} roughness={0.35} metalness={0.25} emissive={scene.car.isCoupledToElevator ? '#e06010' : '#c01820'} emissiveIntensity={0.18} />
        </RoundedBox>
        <RoundedBox
          args={[0.42, 0.28, 0.52]}
          radius={0.04}
          smoothness={3}
          position={[scene.car.position[0] - 0.05, scene.car.position[1] + 0.26, scene.car.position[2]]}
          rotation={scene.car.rotation}
          castShadow
        >
          <meshStandardMaterial color="#fbbf24" roughness={0.4} metalness={0.1} emissive="#fbbf24" emissiveIntensity={0.12} />
        </RoundedBox>

      </group>
    </>
  );
}

type GameScenePhase02Props = {
  onReset: () => void;
  onGoToMap: () => void;
};

export function GameScenePhase02({ onReset, onGoToMap }: GameScenePhase02Props) {
  const status = usePhase02Store((state) => state.phase.status);
  const setHeldAction = usePhase02Store((state) => state.setHeldAction);
  const overlay = status !== 'running' ? status : null;

  return (
    <div className="relative grid h-[420px] grid-rows-[1fr_84px] overflow-hidden rounded-[28px] border border-stone-300/70 shadow-[0_24px_80px_rgba(68,64,60,0.12)] md:h-[560px] md:grid-rows-[1fr_112px]">
      {/* 3D scene — 80% */}
      <div className="relative overflow-hidden bg-[#efe6d3]">
        <Canvas shadows style={{ position: 'absolute', inset: 0 }}>
          <Phase02SceneContent />
        </Canvas>
        {/* CSS vignette */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 42%, rgba(8,6,4,0.52) 100%)' }} />
      </div>

      {/* Control panel — 20% */}
      <div
        className="relative flex items-center justify-center gap-16 px-8"
        style={{ background: 'linear-gradient(to bottom, #252018, #0e0c0a)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
      >
        <div className="pointer-events-none absolute left-3 top-2.5 h-[5px] w-[5px] rounded-full bg-zinc-600/70" />
        <div className="pointer-events-none absolute right-3 top-2.5 h-[5px] w-[5px] rounded-full bg-zinc-600/70" />
        <div className="pointer-events-none absolute bottom-2.5 left-3 h-[5px] w-[5px] rounded-full bg-zinc-600/70" />
        <div className="pointer-events-none absolute bottom-2.5 right-3 h-[5px] w-[5px] rounded-full bg-zinc-600/70" />
        <LeverButton
          label="Elevar A"
          color="#3b82f6"
          onHold={() => setHeldAction('raise_a')}
          onRelease={() => setHeldAction('none')}
        />
        <LeverButton
          label="Elevar B"
          color="#a855f7"
          onHold={() => setHeldAction('raise_b')}
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
                <p className="mt-2 text-sm text-stone-500">Você coordenou os dois elevadores no momento certo.</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-3xl">✕</div>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Falhou</p>
                <h2 className="mt-1 font-serif text-2xl text-stone-900">Tente de novo</h2>
                <p className="mt-2 text-sm text-stone-500">Suba os elevadores no momento certo para fazer o carrinho chegar.</p>
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
