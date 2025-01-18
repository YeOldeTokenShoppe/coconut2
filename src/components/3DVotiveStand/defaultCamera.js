import * as THREE from "three";

export const DEFAULT_CAMERA = {
  // iPad Mini and similar
  "tablet-small-landscape": {
    position: [0, 3.4, 23.8],
    target: [0.9, 6, 2.8],
    fov: 31,
  },
  "tablet-small-portrait": {
    position: [-0.64, 8.34, 23.7],
    target: [-0.6, 8, 14.5],
    fov: 40.3,
  },
  // iPad Air/Pro 11"
  "tablet-medium-landscape": {
    position: [0, 3.4, 23.8],
    target: [0.9, 6, 2.8],
    fov: 31,
  },
  "tablet-medium-portrait": {
    position: [-0.64, 8.34, 23.7],
    target: [-0.6, 8, 14.5],
    fov: 40.3,
  },
  // iPad Pro 12.9"
  "tablet-large-landscape": {
    position: [0, 3.4, 23.8],
    target: [0.9, 6, 2.8],
    fov: 31,
  },
  "tablet-large-portrait": {
    position: [-0.64, 8.34, 23.7],
    target: [-0.6, 8, 14.5],
    fov: 40.3,
  },
  // Desktop sizes
  "desktop-small": {
    position: [0, 3.4, 23.8],
    target: [0.9, 6, 2.8],
    fov: 31,
  },
  "desktop-medium": {
    position: [0, 3.4, 23.8],
    target: [0.9, 6, 2.8],
    fov: 31,
  },
  "desktop-large": {
    position: [0, 3.4, 23.8],
    target: [0.9, 6, 2.8],
    fov: 31,
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
