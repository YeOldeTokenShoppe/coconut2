import * as THREE from "three";

export const DEFAULT_MARKERS = [
  {
    position: new THREE.Vector3(-0.37, 0.48, 0.12),
    label: "View 1",
    description: "This area shows the front of the model with...",
    cameraView: {
      phone: {
        // Use absolute coordinates
        position: () => new THREE.Vector3(-5.7, 10.5, 7.3),
        target: () => new THREE.Vector3(-3.3, 3.2, -0.1),
        fov: 32.1,
      },
      tablet: {
        position: () => new THREE.Vector3(7.1, 18, 8.8),
        target: () => new THREE.Vector3(-4.5, 2, -0.55),
        fov: 20,
      },
      desktop: {
        // Use absolute coordinates
        position: () => new THREE.Vector3(-5.7, 10.5, 7.3),
        target: () => new THREE.Vector3(-3.3, 3.2, -0.1),
        fov: 32.1,
      },
    },
    annotationPosition: {
      // Move this outside cameraView
      phone: { xPercent: 35, yPercent: 70 },
      tablet: { xPercent: 50, yPercent: 70 },
      desktop: { xPercent: 60, yPercent: 65 },
    },
  },

  {
    position: new THREE.Vector3(0.39, 0.88, -0.1),
    label: "View 2",
    description: "This perspective reveals...",
    cameraView: {
      phone: {
        position: () => new THREE.Vector3(1.3, 2.8, 7.3),
        target: () => new THREE.Vector3(2.2, 5.9, -0.1),
        fov: 20,
      },
      tablet: {
        position: () => new THREE.Vector3(1.1, 1.8, 6.3),
        target: () => new THREE.Vector3(2.1, 5.9, -0.55),
        fov: 20,
      },
      desktop: {
        position: () => new THREE.Vector3(1.8, 3, 3),
        target: () => new THREE.Vector3(2.4, 6.1, -0.6),
        fov: 25.5,
      },
    },
    annotationPosition: {
      // Move this outside cameraView
      phone: { xPercent: 30, yPercent: 65 },
      tablet: { xPercent: 50, yPercent: 70 },
      desktop: { xPercent: 20, yPercent: 30 },
    },
  },
  {
    position: new THREE.Vector3(0.2, 0.12, 0.23),
    label: "View 3",
    description: "From this angle you can see blah blah blah...",
    cameraView: {
      phone: {
        // Use absolute coordinates
        position: () => new THREE.Vector3(3.9, 1.8, 6.7),
        target: () => new THREE.Vector3(1, 1, 1.7),
        fov: 54.3,
      },
      tablet: {
        position: () => new THREE.Vector3(0.6, 3.7, 9.5),
        target: () => new THREE.Vector3(1.6, 0.3, -0.55),
        fov: 30.8,
      },
      desktop: {
        position: () => new THREE.Vector3(2.8, 4.5, 10.4),
        target: () => new THREE.Vector3(1.7, 0.7, 0),
        fov: 23.5,
      },
    },
    annotationPosition: {
      // Move this outside cameraView
      phone: { xPercent: 30, yPercent: 70 },
      tablet: { xPercent: 50, yPercent: 70 },
      desktop: { xPercent: 48, yPercent: 60 },
    },
  },

  {
    position: new THREE.Vector3(1.7, 1.12, 0.6),
    label: "View 4",
    description: "Lasciate ogni speranza....",
    cameraView: {
      phone: {
        // Use absolute coordinates
        position: () => new THREE.Vector3(2.4, 5.1, 0.8),
        target: () => new THREE.Vector3(23.3, 5.3, 1.7),
        fov: 67.6,
      },
      tablet: {
        position: () => new THREE.Vector3(5.51, 5.6, 1.6),
        target: () => new THREE.Vector3(23, 5.6, -0.55),
        fov: 79.7,
      },
      desktop: {
        position: () => new THREE.Vector3(1.2, 7.3, 3),
        target: () => new THREE.Vector3(22.3, 7.3, 0.6),
        fov: 62.8,
      },
    },
    annotationPosition: {
      // Move this outside cameraView
      phone: { xPercent: 30, yPercent: 65 },
      tablet: { xPercent: 50, yPercent: 70 },
      desktop: { xPercent: 70, yPercent: 30 },
    },
  },
];
