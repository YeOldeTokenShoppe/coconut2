import * as THREE from "three";

export const DEFAULT_MARKERS = [
  {
    position: new THREE.Vector3(-0.37, 0.48, 0.12),
    label: "View 1",
    description: "Hover over the lit candles to see who lit them.",
    cameraView: {
      phone: {
        // Use absolute coordinates
        position: () => new THREE.Vector3(-5.7, 10.5, 7.3),
        target: () => new THREE.Vector3(-3.3, 3.2, -0.1),
        fov: 32.1,
      },
      tablet: {
        position: () => new THREE.Vector3(-1.11, 10.68, 4.52),
        target: () => new THREE.Vector3(-5.2, 2, -0.55),
        fov: 38.6,
      },
      desktop: {
        // Use absolute coordinates
        position: () => new THREE.Vector3(-5.7, 11.5, 7.3),
        target: () => new THREE.Vector3(-3.6, 3.6, -0.1),
        fov: 23.1,
      },
    },
    annotationPosition: {
      // Move this outside cameraView
      phone: { xPercent: 35, yPercent: 70 },
      tablet: { xPercent: 40, yPercent: 70 },
      desktop: { xPercent: 55, yPercent: 65 },
    },
  },

  {
    position: new THREE.Vector3(0.39, 0.88, 0),
    label: "View 2",
    description: "This perspective reveals...",
    cameraView: {
      phone: {
        position: () => new THREE.Vector3(1.3, 5, 7.3),
        target: () => new THREE.Vector3(2.4, 6.4, -0.1),
        fov: 20,
      },
      tablet: {
        position: () => new THREE.Vector3(1.38, 2.9, 4.41),
        target: () => new THREE.Vector3(2.7, 8.3, -0.55),
        fov: 20,
      },
      desktop: {
        position: () => new THREE.Vector3(1.8, 4.2, 4.37),
        target: () => new THREE.Vector3(2.4, 6.7, 0),
        fov: 23.7,
      },
    },
    annotationPosition: {
      // Move this outside cameraView
      phone: { xPercent: 30, yPercent: 65 },
      tablet: { xPercent: 50, yPercent: 70 },
      desktop: { xPercent: 55, yPercent: 50 },
    },
  },
  {
    position: new THREE.Vector3(0.2, 0.12, 0.23),
    label: "View 3",
    description: "From this angle you can see blah blah blah...",
    cameraView: {
      phone: {
        // Use absolute coordinates
        position: () => new THREE.Vector3(1.1, 1.8, 6.7),
        target: () => new THREE.Vector3(4.6, 2.3, 1.7),
        fov: 56.6,
      },
      tablet: {
        position: () => new THREE.Vector3(0.6, 3.7, 14.4),
        target: () => new THREE.Vector3(4.8, 2.2, -0.55),
        fov: 20,
      },
      desktop: {
        position: () => new THREE.Vector3(2.8, 4.5, 10.4),
        target: () => new THREE.Vector3(2.4, 2.4, 0),
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
    position: new THREE.Vector3(1.6, 1, 0.4),
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
        position: () => new THREE.Vector3(6.54, 6.1, 1.8),
        target: () => new THREE.Vector3(22.3, 6.1, 0.6),
        fov: 97.7,
      },
    },
    annotationPosition: {
      // Move this outside cameraView
      phone: { xPercent: 30, yPercent: 65 },
      tablet: { xPercent: 60, yPercent: 50 },
      desktop: { xPercent: 60, yPercent: 50 },
    },
    extraButton: {
      label: "Take me there!",
      url: "/rocket",
    },
  },
];
