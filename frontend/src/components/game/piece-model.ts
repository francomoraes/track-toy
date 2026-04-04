import type { buildPhase01SceneModel } from './scene-model';

type SceneModel = ReturnType<typeof buildPhase01SceneModel>;
type Vec3 = [number, number, number];

export function buildPhase01PieceModel(scene: SceneModel) {
  const lowerTrackSupports: Vec3[] = [
    [scene.lowerTrack.center[0] - scene.lowerTrack.length * 0.22, scene.lowerTrack.center[1] - 0.7, 0],
    [scene.lowerTrack.center[0] + scene.lowerTrack.length * 0.22, scene.lowerTrack.center[1] - 0.7, 0],
  ];

  const upperTrackSupports: Vec3[] = [
    [scene.upperTrack.start[0] + 0.6, scene.upperTrack.start[1] - 2.2, 0],
    [scene.upperTrack.center[0], scene.upperTrack.center[1] - 1.35, 0],
    [scene.upperTrack.end[0] - 0.6, scene.upperTrack.end[1] - 1.4, 0],
  ];

  return {
    car: {
      bodySize: [0.92, 0.36, 0.58] as const,
      cabinOffset: [-0.05, 0.3, 0] as Vec3,
      noseOffset: [0.36, 0.02, 0] as Vec3,
      wheels: [
        [-0.2, 0, 0.24],
        [-0.2, 0, -0.24],
        [0.2, -0.24, 0.24],
        [0.2, -0.24, -0.24],
      ] as Vec3[],
    },
    elevator: {
      platformSize: [2.3, 0.32, 1.5] as const,
      guardRails: [
        [0, 0.24, 0.55],
        [0, 0.24, -0.55],
      ] as Vec3[],
      mastSize: [0.55, 5.2, 0.9] as const,
      baseSize: [3.2, 0.3, 1.6] as const,
    },
    lowerTrack: {
      deckHeight: 0.22,
      railOffsetZ: 0.42,
      supports: lowerTrackSupports,
    },
    upperTrack: {
      deckHeight: 0.28,
      railOffsetZ: 0.5,
      supports: upperTrackSupports,
    },
  };
}
