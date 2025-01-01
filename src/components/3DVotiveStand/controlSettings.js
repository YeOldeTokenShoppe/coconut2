export const CONTROL_SETTINGS = {
  default: {
    // enableRotate: true,
    // rotateSpeed: 0.1,
    enableDamping: true,
    dampingFactor: 0.03,
    minDistance: 0, // Single definition
    maxDistance: 20, // Single definition
    minPolarAngle: 0,
    maxPolarAngle: Math.PI / 1.75,
    enablePan: true,
    enableZoom: true,
    zoomSpeed: 0.5,
    // Add touch-specific settings
    touchAngularSensitivity: 2,
    touchZoomSensitivity: 2,
    // enableTouchRotate: true,
    enableTouchZoom: true,
  },
  guiMode: {
    enableDamping: false,
    minDistance: 0,
    maxDistance: Infinity,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
    enablePan: true,
    enableZoom: true,
    zoomSpeed: 0.5,
    // Same touch settings for consistency
    touchAngularSensitivity: 2,
    touchZoomSensitivity: 2,
    // enableTouchRotate: true,
    enableTouchZoom: true,
  },
};
