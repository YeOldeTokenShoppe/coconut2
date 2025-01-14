import * as THREE from "three";

export const DEFAULT_CAMERA = {
  // iPad Mini and similar
  "tablet-small-landscape": {
    position: [5.03, 4.52, 9.01],
    target: [0.3, 5.6, -1.1],
    fov: 74,
  },
  "tablet-small-portrait": {
    position: [-5.3, 3.2, 8.9],
    target: [0.7, 5, -1.7],
    fov: 75.8,
  },
  // iPad Air/Pro 11"
  "tablet-medium-landscape": {
    position: [5.03, 4.52, 9.01],
    target: [0.3, 5.6, -1.1],
    fov: 74,
  },
  "tablet-medium-portrait": {
    position: [-5.3, 3.2, 8.9],
    target: [0.7, 5, -1.7],
    fov: 75.8,
  },
  // iPad Pro 12.9"
  "tablet-large-landscape": {
    position: [5.03, 4.52, 9.01],
    target: [0.3, 5.6, -1.1],
    fov: 74,
  },
  "tablet-large-portrait": {
    position: [-5.3, 3.2, 8.9],
    target: [0.7, 5, -1.7],
    fov: 75.8,
  },
  // Desktop sizes
  "desktop-small": {
    position: [5.03, 4.52, 9.01],
    target: [0.3, 5.6, -1.1],
    fov: 74,
  },
  "desktop-medium": {
    position: [5.03, 4.52, 9.01],
    target: [0.3, 5.6, -1.1],
    fov: 74,
  },
  "desktop-large": {
    position: [5.03, 4.52, 9.01],
    target: [0.3, 5.6, -1.1],
    fov: 74,
  },
  // Common settings for all screen sizes
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

// Helper function to get camera settings with fallbacks
export const getCameraSettings = (screenCategory) => {
  return {
    ...DEFAULT_CAMERA.common,
    ...(DEFAULT_CAMERA[screenCategory] || DEFAULT_CAMERA["desktop-medium"]),
  };
};
