import * as THREE from "three";

export const DEFAULT_CAMERA = {
  // iPad Mini and similar
  "tablet-small-landscape": {
    position: [-2.8, 6.21, 36.9],
    target: [-0.5, 10.5, 0.6],
    fov: 29.3,
  },
  "tablet-small-portrait": {
    position: [-0.42, 6.82, 25.4],
    target: [-0.6, 8, 14.5],
    fov: 40.3,
  },
  // iPad Air/Pro 11"
  "tablet-medium-landscape": {
    position: [-2.8, 6.21, 36.9],
    target: [-0.5, 10.5, 0.6],
    fov: 29.3,
  },
  "tablet-medium-portrait": {
    position: [-0.42, 6.82, 25.4],
    target: [-0.6, 8, 14.5],
    fov: 40.3,
  },
  // iPad Pro 12.9"
  "tablet-large-landscape": {
    position: [-2.8, 6.21, 36.9],
    target: [-0.5, 10.5, 0.6],
    fov: 29.3,
  },
  "tablet-large-portrait": {
    position: [-0.42, 6.82, 25.4],
    target: [-0.6, 8, 14.5],
    fov: 40.3,
  },
  // Desktop sizes
  "desktop-small": {
    position: [-2.8, 6.21, 36.9],
    target: [-0.5, 10.5, 0.6],
    fov: 29.3,
  },
  "desktop-medium": {
    position: [-2.8, 6.21, 36.9],
    target: [-0.5, 10.5, 0.6],
    fov: 29.3,
  },
  "desktop-large": {
    position: [-2.8, 6.21, 36.9],
    target: [-0.5, 10.5, 0.6],
    fov: 29.3,
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
