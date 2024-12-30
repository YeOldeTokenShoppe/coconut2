import * as THREE from "three";

export const DEFAULT_CAMERA = {
  phone: {
    scale: 7,
    position: [8.64, 9.3, 12.9],
    target: [-0.07, 5.6, -0.55],
    fov: 60,
  },
  "tablet-landscape": {
    scale: 7,
    position: [4.8, 4.94, 13.9],
    target: [4.9, 5.9, 5.1],
    fov: 79.6,
  },
  "tablet-portrait": {
    scale: 7,
    position: [4.87, 6, 18.95],
    target: [5, 6.4, -0.55],
    fov: 60,
  },
  desktop: {
    scale: 7,
    position: [-5.95, 5.4, 16.86],
    target: [4.8, 5.4, 0],
    fov: 43.5,
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
