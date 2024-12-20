import * as THREE from "three";

export const DEFAULT_CAMERA = {
  phone: {
    scale: 7,
    position: [8.64, 9.3, 12.9],
    target: [-0.07, 5.6, -0.55],
    fov: 60,
  },
  tablet: {
    scale: 7,
    position: [-13.35, 8.25, 19.16],
    target: [-0.07, 5.6, -0.55],
    fov: 40,
  },
  desktop: {
    scale: 7,
    position: [-12.9, 5.5, 18.5],
    target: [0, 5.5, 0],
    fov: 40,
  },
  common: {
    near: 0.1,
    far: 200,
    gl: {
      antialias: true,
      toneMapping: THREE.ACESFilmicToneMapping,
      toneMappingExposure: 1,
    },
  },
};
