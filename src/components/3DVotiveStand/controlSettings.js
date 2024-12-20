import { OrbitControls } from "@react-three/drei";

export const CONTROL_SETTINGS = {
  default: {
    enableRotate: true,
    rotateSpeed: 0.5,
    enableDamping: true,
    dampingFactor: 0.03,
    minDistance: 5,
    maxDistance: 100,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI / 1.75, // Limit to not go below model
    enablePan: true,
    enableZoom: true,
    zoomSpeed: 0.5,
    maxDistance: 20,
    minDistance: 0,
  },
  guiMode: {
    enableDamping: false, // More precise control when using GUI
    minDistance: 0,
    maxDistance: Infinity,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
    enablePan: true,
    enableZoom: true,
    zoomSpeed: 0.5,
    maxDistance: 20,
    minDistance: 0,
  },
};
