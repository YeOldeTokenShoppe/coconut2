// constants.js
import * as THREE from "three";

// const MODEL_CENTER = {
//   x: 0,
//   y: 6.405741747673449,
//   z: 4.440892098500626e-16, // effectively 0
// };
// const center = new THREE.Vector3(
//   MODEL_CENTER.x,
//   MODEL_CENTER.y,
//   MODEL_CENTER.z
// );
export const DEFAULT_MARKERS = [
  {
    // For the marker position itself
    position: new THREE.Vector3(0, 5, -3),
    label: "View 1",
    description: "This area shows the front of the model with...",
    cameraView: {
      desktop: {
        position: (center) =>
          new THREE.Vector3(
            center.x + (-2.5 - MODEL_CENTER.x),
            center.y + (11.8 - MODEL_CENTER.y),
            center.z + (3.8 - MODEL_CENTER.z)
          ),
        target: (center) =>
          new THREE.Vector3(
            center.x + (-6.2 - MODEL_CENTER.x),
            center.y + (-13.3 - MODEL_CENTER.y),
            center.z + (-2.8 - MODEL_CENTER.z)
          ),
      },
      tablet: {
        position: (center) =>
          new THREE.Vector3(
            center.x + (1.5 - MODEL_CENTER.x),
            center.y + (13 - MODEL_CENTER.y),
            center.z + (8.4 - MODEL_CENTER.z)
          ),
        target: (center) =>
          new THREE.Vector3(
            center.x + (-6.4 - MODEL_CENTER.x),
            center.y + (-2.5 - MODEL_CENTER.y),
            center.z + (-1.9 - MODEL_CENTER.z)
          ),
      },
      phone: {
        position: (center) =>
          new THREE.Vector3(
            center.x + (4.7 - MODEL_CENTER.x),
            center.y + (20 - MODEL_CENTER.y),
            center.z + (9.2 - MODEL_CENTER.z)
          ),
        target: (center) =>
          new THREE.Vector3(
            center.x + (-5.5 - MODEL_CENTER.x),
            center.y + (-2.3 - MODEL_CENTER.y),
            center.z + (-0.1 - MODEL_CENTER.z)
          ),
      },
    },
    annotationPosition: {
      desktop: { xPercent: 35, yPercent: 15 },
      tablet: { xPercent: 50, yPercent: 70 },
      phone: { xPercent: 20, yPercent: 30 },
    },
  },

  {
    position: new THREE.Vector3(5.5, 10, 0),
    label: "View 2",
    description: "This perspective reveals...",
    cameraView: {
      desktop: {
        position: (center) =>
          new THREE.Vector3(
            center.x + (4 - MODEL_CENTER.x),
            center.y + (5.7 - MODEL_CENTER.y),
            center.z + (3 - MODEL_CENTER.z)
          ),
        target: (center) =>
          new THREE.Vector3(
            center.x + (4.4 - MODEL_CENTER.x),
            center.y + (6.8 - MODEL_CENTER.y),
            center.z + (-0.523 - MODEL_CENTER.z)
          ),
      },
      tablet: {
        position: (center) =>
          new THREE.Vector3(
            center.x + (1.9 - MODEL_CENTER.x),
            center.y + (6.3 - MODEL_CENTER.y),
            center.z + (3.5 - MODEL_CENTER.z)
          ),
        target: (center) =>
          new THREE.Vector3(
            center.x + (4.9 - MODEL_CENTER.x),
            center.y + (6.7 - MODEL_CENTER.y),
            center.z + (-1.1 - MODEL_CENTER.z)
          ),
      },
      phone: {
        position: (center) =>
          new THREE.Vector3(
            center.x + (3.4 - MODEL_CENTER.x),
            center.y + (5.5 - MODEL_CENTER.y),
            center.z + (5.1 - MODEL_CENTER.z)
          ),
        target: (center) =>
          new THREE.Vector3(
            center.x + (5.2 - MODEL_CENTER.x),
            center.y + (6.4 - MODEL_CENTER.y),
            center.z + (-8 - MODEL_CENTER.z)
          ),
      },
    },
    annotationPosition: {
      desktop: { xPercent: 60, yPercent: 40 },
      tablet: { xPercent: 70, yPercent: 50 },
      phone: { xPercent: 20, yPercent: 70 },
    },
  },
  {
    position: new THREE.Vector3(5.5, 4.8, 2),
    label: "View 3",
    description: "From this angle you can see blah blah blah...",
    cameraView: {
      desktop: {
        position: (center) =>
          new THREE.Vector3(
            center.x + (1.8 - MODEL_CENTER.x),
            center.y + (1.3 - MODEL_CENTER.y),
            center.z + (10.6 - MODEL_CENTER.z)
          ),
        target: (center) =>
          new THREE.Vector3(
            center.x + (5.7 - MODEL_CENTER.x),
            center.y + (-2.5 - MODEL_CENTER.y),
            center.z + (-2.8 - MODEL_CENTER.z)
          ),
      },
      tablet: {
        position: (center) =>
          new THREE.Vector3(
            center.x + (2.7 - MODEL_CENTER.x),
            center.y + (3.9 - MODEL_CENTER.y),
            center.z + (11.4 - MODEL_CENTER.z)
          ),
        target: (center) =>
          new THREE.Vector3(
            center.x + (4.6 - MODEL_CENTER.x),
            center.y + (-2.5 - MODEL_CENTER.y),
            center.z + (-1.9 - MODEL_CENTER.z)
          ),
      },
      phone: {
        position: (center) =>
          new THREE.Vector3(
            center.x + (2.8 - MODEL_CENTER.x),
            center.y + (2.9 - MODEL_CENTER.y),
            center.z + (10.9 - MODEL_CENTER.z)
          ),
        target: (center) =>
          new THREE.Vector3(
            center.x + (5.5 - MODEL_CENTER.x),
            center.y + (-2.4 - MODEL_CENTER.y),
            center.z + (-0.7 - MODEL_CENTER.z)
          ),
      },
    },
    annotationPosition: {
      desktop: { xPercent: 40, yPercent: 20 },
      tablet: { xPercent: 40, yPercent: 30 },
      phone: { xPercent: 20, yPercent: 20 },
    },
  },
];
