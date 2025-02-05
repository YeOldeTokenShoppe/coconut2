// cameraConfig.js
import * as THREE from "three";

// Base camera views matching your defaultCamera.js settings
export const CAMERA_VIEWS = {
  desktop: {
    position: [29, 17.08, 43.6], // Moved closer and centered
    target: [0, 17, 0], // Looking at center of model
    fov: 41,
  },
  tablet: {
    position: [29, 17.08, 43.6],
    target: [0, 17, 0],
    fov: 41,
  },
};

// Screen breakpoints
export const SCREEN_BREAKPOINTS = {
  mobile: 576,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

// Camera settings per device type
export const CAMERA_SETTINGS = {
  // iPad Mini and similar
  "tablet-small-landscape": {
    ...CAMERA_VIEWS.desktop,
    maxDistance: 90,
    minDistance: 25,
  },
  "tablet-small-portrait": {
    ...CAMERA_VIEWS.tablet,
    maxDistance: 50,
    minDistance: 15,
  },
  // iPad Air/Pro 11"
  "tablet-medium-landscape": {
    ...CAMERA_VIEWS.desktop,
    maxDistance: 90,
    minDistance: 25,
  },
  "tablet-medium-portrait": {
    ...CAMERA_VIEWS.tablet,
    maxDistance: 50,
    minDistance: 15,
  },
  // iPad Pro 12.9"
  "tablet-large-landscape": {
    ...CAMERA_VIEWS.desktop,
    maxDistance: 90,
    minDistance: 25,
  },
  "tablet-large-portrait": {
    ...CAMERA_VIEWS.tablet,
    maxDistance: 50,
    minDistance: 15,
  },
  // Desktop sizes
  "desktop-small": {
    ...CAMERA_VIEWS.desktop,
    maxDistance: 100,
    minDistance: 30,
  },
  "desktop-medium": {
    ...CAMERA_VIEWS.desktop,
    maxDistance: 100,
    minDistance: 30,
  },
  "desktop-large": {
    ...CAMERA_VIEWS.desktop,
    maxDistance: 100,
    minDistance: 30,
  },
};

// Common settings
export const COMMON_SETTINGS = {
  near: 0.1,
  far: 500,
  minPolarAngle: 0,
  maxPolarAngle: Math.PI / 1.5,
  enableZoom: true,
  enablePan: false,
  enableDamping: true,
  dampingFactor: 0.05,
  gl: {
    antialias: true,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1,
  },
};

export const getScreenCategory = () => {
  if (typeof window === "undefined") {
    return "desktop-medium";
  }

  const width = window.innerWidth;
  const isLandscape = width > window.innerHeight;

  if (width < SCREEN_BREAKPOINTS.mobile) {
    return isLandscape ? "tablet-small-landscape" : "tablet-small-portrait";
  } else if (width < SCREEN_BREAKPOINTS.tablet) {
    return isLandscape ? "tablet-medium-landscape" : "tablet-medium-portrait";
  } else if (width < SCREEN_BREAKPOINTS.desktop) {
    return "desktop-small";
  } else if (width < SCREEN_BREAKPOINTS.wide) {
    return "desktop-medium";
  }
  return "desktop-large";
};

export const getCameraConfig = () => {
  const category = getScreenCategory();
  const settings = CAMERA_SETTINGS[category];

  //   console.log("getCameraConfig:", {
  //     category,
  //     position: settings.position,
  //     target: settings.target,
  //   });

  return {
    ...COMMON_SETTINGS,
    ...settings,
  };
};

export const formatCameraPosition = (position, target, fov) => {
  return {
    position: [
      parseFloat(position.x.toFixed(2)),
      parseFloat(position.y.toFixed(2)),
      parseFloat(position.z.toFixed(2)),
    ],
    target: [
      parseFloat(target.x.toFixed(2)),
      parseFloat(target.y.toFixed(2)),
      parseFloat(target.z.toFixed(2)),
    ],
    fov: parseFloat(fov.toFixed(1)),
  };
};
