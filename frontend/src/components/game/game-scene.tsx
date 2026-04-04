'use client';

import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';

import { useGameStore } from '@/store/game-store';

import { advanceTickAccumulator } from './frame-ticker';
import { buildPhase01PieceModel } from './piece-model';
import { buildPhase01SceneModel } from './scene-model';

const TICK_SECONDS = 0.12;

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
      <color attach="background" args={['#efe6d3']} />
      <ambientLight intensity={0.9} />
      <directionalLight intensity={1.4} position={[8, 10, 6]} />
      <SceneTicker />

      <PerspectiveCamera makeDefault position={[4.5, 6, 10]} fov={42} />
      <OrbitControls enablePan={false} maxDistance={14} maxPolarAngle={Math.PI / 2.05} minDistance={8} />

      <group position={[0, -2, 0]}>
        <mesh position={[0, -0.6, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[24, 16]} />
          <meshStandardMaterial color="#ddd6c5" />
        </mesh>

        <gridHelper args={[24, 24, '#c4b79f', '#d9d1c4']} position={[0, -0.55, 0]} />

        <mesh position={[-3, 2, -0.2]}>
          <boxGeometry args={pieces.elevator.mastSize} />
          <meshStandardMaterial color="#7c6f64" />
        </mesh>

        <mesh position={[-3, 2.05, 0.42]}>
          <boxGeometry args={[0.16, 5.4, 0.12]} />
          <meshStandardMaterial color="#a18e77" />
        </mesh>

        <mesh position={[-3, 2.05, -0.42]}>
          <boxGeometry args={[0.16, 5.4, 0.12]} />
          <meshStandardMaterial color="#a18e77" />
        </mesh>

        <mesh position={[-3, -0.15, 0]}>
          <boxGeometry args={pieces.elevator.baseSize} />
          <meshStandardMaterial color="#b89f7a" />
        </mesh>

        <mesh position={scene.lowerTrack.center} rotation={scene.lowerTrack.rotation}>
          <boxGeometry args={[scene.lowerTrack.length, pieces.lowerTrack.deckHeight, 1.2]} />
          <meshStandardMaterial color="#947a56" />
        </mesh>

        <mesh position={[scene.lowerTrack.center[0], scene.lowerTrack.center[1] + 0.08, pieces.lowerTrack.railOffsetZ]} rotation={scene.lowerTrack.rotation}>
          <boxGeometry args={[scene.lowerTrack.length, 0.08, 0.08]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>

        <mesh position={[scene.lowerTrack.center[0], scene.lowerTrack.center[1] + 0.08, -pieces.lowerTrack.railOffsetZ]} rotation={scene.lowerTrack.rotation}>
          <boxGeometry args={[scene.lowerTrack.length, 0.08, 0.08]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>

        {pieces.lowerTrack.supports.map((position, index) => (
          <mesh key={`lower-support-${index}`} position={position}>
            <boxGeometry args={[0.22, 1.2, 0.22]} />
            <meshStandardMaterial color="#8b7355" />
          </mesh>
        ))}

        <mesh position={scene.upperTrack.center} rotation={scene.upperTrack.rotation}>
          <boxGeometry args={[scene.upperTrack.length, pieces.upperTrack.deckHeight, 1.4]} />
          <meshStandardMaterial color="#a98f68" />
        </mesh>

        <mesh position={[scene.upperTrack.center[0], scene.upperTrack.center[1] + 0.1, pieces.upperTrack.railOffsetZ]} rotation={scene.upperTrack.rotation}>
          <boxGeometry args={[scene.upperTrack.length, 0.08, 0.08]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>

        <mesh position={[scene.upperTrack.center[0], scene.upperTrack.center[1] + 0.1, -pieces.upperTrack.railOffsetZ]} rotation={scene.upperTrack.rotation}>
          <boxGeometry args={[scene.upperTrack.length, 0.08, 0.08]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>

        {pieces.upperTrack.supports.map((position, index) => (
          <mesh key={`upper-support-${index}`} position={position}>
            <boxGeometry args={[0.24, 2.1, 0.24]} />
            <meshStandardMaterial color="#8b7355" />
          </mesh>
        ))}

        <mesh position={[scene.elevator.exitPoint[0] - 0.45, scene.elevator.exitPoint[1] - 0.03, 0]}>
          <boxGeometry args={[0.9, 0.16, 1.36]} />
          <meshStandardMaterial color="#c7b08a" />
        </mesh>

        <mesh position={scene.elevator.position} rotation={scene.elevator.rotation}>
          <boxGeometry args={pieces.elevator.platformSize} />
          <meshStandardMaterial color="#5ca8d8" />
        </mesh>

        {pieces.elevator.guardRails.map((offset, index) => (
          <mesh
            key={`elevator-guard-${index}`}
            position={[
              scene.elevator.position[0] + offset[0],
              scene.elevator.position[1] + offset[1],
              scene.elevator.position[2] + offset[2],
            ]}
            rotation={scene.elevator.rotation}
          >
            <boxGeometry args={[1.8, 0.12, 0.12]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>
        ))}

        <mesh position={scene.car.position} rotation={scene.car.rotation}>
          <boxGeometry args={pieces.car.bodySize} />
          <meshStandardMaterial color={scene.car.isCoupledToElevator ? '#f97316' : '#dc2626'} />
        </mesh>

        <mesh
          position={[
            scene.car.position[0] + pieces.car.cabinOffset[0],
            scene.car.position[1] + pieces.car.cabinOffset[1],
            scene.car.position[2] + pieces.car.cabinOffset[2],
          ]}
          rotation={scene.car.rotation}
        >
          <boxGeometry args={[0.42, 0.28, 0.52]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>

        <mesh
          position={[
            scene.car.position[0] + pieces.car.noseOffset[0],
            scene.car.position[1] + pieces.car.noseOffset[1],
            scene.car.position[2] + pieces.car.noseOffset[2],
          ]}
          rotation={scene.car.rotation}
        >
          <boxGeometry args={[0.18, 0.16, 0.44]} />
          <meshStandardMaterial color="#fca5a5" />
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
          >
            <cylinderGeometry args={[0.1, 0.1, 0.14, 18]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        ))}
      </group>
    </>
  );
}

export function GameScene() {
  return (
    <div className="h-[420px] overflow-hidden rounded-[28px] border border-stone-300/70 bg-[#efe6d3] shadow-[0_24px_80px_rgba(68,64,60,0.12)] md:h-[560px]">
      <Canvas shadows>
        <Phase01SceneContent />
      </Canvas>
    </div>
  );
}
