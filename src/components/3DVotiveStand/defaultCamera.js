import * as THREE from "three";

export const DEFAULT_CAMERA = {
  // Small phones (iPhone SE, etc.)
  // "phone-small": {
  //   position: [9.0, 9.5, 13.0],
  //   target: [-0.07, 5.6, -0.55],
  //   fov: 65,
  // },
  // // Medium phones (iPhone X/11/12/13)
  // "phone-medium": {
  //   position: [8.64, 9.3, 12.9],
  //   target: [-0.07, 5.6, -0.55],
  //   fov: 60,
  // },
  // // Large phones (iPhone Plus/Pro Max)
  // "phone-large": {
  //   position: [8.3, 9.1, 12.7],
  //   target: [-0.07, 5.6, -0.55],
  //   fov: 58,
  // },
  // iPad Mini and similar
  "tablet-small-landscape": {
    position: [4.5, 5.1, 13.9],
    target: [4.9, 5.9, 5.1],
    fov: 71.7,
  },
  "tablet-small-portrait": {
    position: [8.89, 5.85, 17.22],
    target: [2.4, 6.3, -0.55],
    fov: 52,
  },
  // iPad Air/Pro 11"
  "tablet-medium-landscape": {
    position: [4.1, 4.7, 13.7],
    target: [4.9, 5.9, 5.1],
    fov: 70.3,
  },
  "tablet-medium-portrait": {
    position: [4.5, 5.2, 16.5],
    target: [4.8, 7.5, 0],
    fov: 68.3,
  },
  // iPad Pro 12.9"
  "tablet-large-landscape": {
    position: [4.1, 4.7, 13.7],
    target: [4.9, 5.9, 5.1],
    fov: 70.3,
  },
  "tablet-large-portrait": {
    position: [4.5, 5.2, 16.5],
    target: [4.8, 7.5, 0],
    fov: 68.3,
  },
  // Desktop sizes
  "desktop-small": {
    position: [-5.7, 5.2, 16.5],
    target: [4.8, 6.4, 0],
    fov: 45,
  },
  "desktop-medium": {
    position: [-5.95, 5.4, 16.86],
    target: [4.8, 6.4, 0],
    fov: 43.5,
  },
  "desktop-large": {
    position: [-6.2, 5.6, 17.2],
    target: [4.8, 6.4, 0],
    fov: 42,
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
