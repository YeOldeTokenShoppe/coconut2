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
    position: [4.3, 3.88, 8.06],
    target: [0.7, 5.3, -0.55],
    fov: 67.8,
  },
  desktop: {
    scale: 7,
    position: [-8.4, 5.5, 16.01],
    target: [1.2, 5.5, 0],
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
