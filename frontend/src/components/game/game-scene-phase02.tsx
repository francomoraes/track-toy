'use client';

import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';

import { usePhase02Store } from '@/store/game-store-phase02';

import { advanceTickAccumulator } from './frame-ticker';
import { buildPhase02SceneModel } from './scene-model-phase02';

const TICK_SECONDS = 0.12;

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
      <color attach="background" args={['#efe6d3']} />
      <ambientLight intensity={0.9} />
      <directionalLight intensity={1.4} position={[8, 10, 6]} />
      <SceneTicker02 />

      <PerspectiveCamera makeDefault position={[2, 5, 14]} fov={44} />
      <OrbitControls enablePan={false} maxDistance={20} maxPolarAngle={Math.PI / 2.05} minDistance={9} />

      <group position={[0, -2, 0]}>
        {/* Ground */}
        <mesh position={[0, -0.6, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[28, 16]} />
          <meshStandardMaterial color="#ddd6c5" />
        </mesh>
        <gridHelper args={[28, 28, '#c4b79f', '#d9d1c4']} position={[0, -0.55, 0]} />

        {/* Lower approach track */}
        <mesh position={scene.lowerTrack.center} rotation={scene.lowerTrack.rotation}>
          <boxGeometry args={[scene.lowerTrack.length, 0.22, 1.2]} />
          <meshStandardMaterial color="#947a56" />
        </mesh>

        {/* Elevator A mast */}
        <mesh position={[scene.elevatorA.position[0], 2, -0.2]}>
          <boxGeometry args={[0.55, 5.2, 0.9]} />
          <meshStandardMaterial color="#7c6f64" />
        </mesh>
        <mesh position={[scene.elevatorA.position[0], -0.15, 0]}>
          <boxGeometry args={[3.2, 0.3, 1.6]} />
          <meshStandardMaterial color="#b89f7a" />
        </mesh>

        {/* Elevator A platform */}
        <mesh position={scene.elevatorA.position} rotation={scene.elevatorA.rotation}>
          <boxGeometry args={[2.3, 0.32, 1.5]} />
          <meshStandardMaterial color="#5ca8d8" />
        </mesh>

        {/* Track 1 */}
        <mesh position={scene.track1.center} rotation={scene.track1.rotation}>
          <boxGeometry args={[scene.track1.length, 0.28, 1.4]} />
          <meshStandardMaterial color="#a98f68" />
        </mesh>
        <mesh position={[scene.track1.center[0], scene.track1.center[1] + 0.1, 0.5]} rotation={scene.track1.rotation}>
          <boxGeometry args={[scene.track1.length, 0.08, 0.08]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
        <mesh position={[scene.track1.center[0], scene.track1.center[1] + 0.1, -0.5]} rotation={scene.track1.rotation}>
          <boxGeometry args={[scene.track1.length, 0.08, 0.08]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>

        {/* Elevator B mast */}
        <mesh position={[scene.elevatorB.position[0], 1.5, -0.2]}>
          <boxGeometry args={[0.55, 4.5, 0.9]} />
          <meshStandardMaterial color="#7c6f64" />
        </mesh>
        <mesh position={[scene.elevatorB.position[0], -0.15, 0]}>
          <boxGeometry args={[3.2, 0.3, 1.6]} />
          <meshStandardMaterial color="#b89f7a" />
        </mesh>

        {/* Elevator B platform */}
        <mesh position={scene.elevatorB.position} rotation={scene.elevatorB.rotation}>
          <boxGeometry args={[2.3, 0.32, 1.5]} />
          <meshStandardMaterial color="#a855f7" />
        </mesh>

        {/* Track 2 */}
        <mesh position={scene.track2.center} rotation={scene.track2.rotation}>
          <boxGeometry args={[scene.track2.length, 0.28, 1.4]} />
          <meshStandardMaterial color="#a98f68" />
        </mesh>
        <mesh position={[scene.track2.center[0], scene.track2.center[1] + 0.1, 0.5]} rotation={scene.track2.rotation}>
          <boxGeometry args={[scene.track2.length, 0.08, 0.08]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
        <mesh position={[scene.track2.center[0], scene.track2.center[1] + 0.1, -0.5]} rotation={scene.track2.rotation}>
          <boxGeometry args={[scene.track2.length, 0.08, 0.08]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>

        {/* Car */}
        <mesh position={scene.car.position} rotation={scene.car.rotation}>
          <boxGeometry args={[0.92, 0.36, 0.58]} />
          <meshStandardMaterial color={scene.car.isCoupledToElevator ? '#f97316' : '#dc2626'} />
        </mesh>
        <mesh
          position={[scene.car.position[0] - 0.05, scene.car.position[1] + 0.26, scene.car.position[2]]}
          rotation={scene.car.rotation}
        >
          <boxGeometry args={[0.42, 0.28, 0.52]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>
      </group>
    </>
  );
}

export function GameScenePhase02() {
  return (
    <div className="h-[420px] overflow-hidden rounded-[28px] border border-stone-300/70 bg-[#efe6d3] shadow-[0_24px_80px_rgba(68,64,60,0.12)] md:h-[560px]">
      <Canvas shadows>
        <Phase02SceneContent />
      </Canvas>
    </div>
  );
}
