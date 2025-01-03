import * as THREE from "three";

export const DEFAULT_MARKERS = [
  {
    position: new THREE.Vector3(-0.37, 0.48, 0.12),
    label: "View 1",
    description: "Hover over the lit candles to see who put them there.",
    cameraView: {
      phone: {
        // Use absolute coordinates
        position: () => new THREE.Vector3(-5.7, 10.5, 7.3),
        target: () => new THREE.Vector3(-3.3, 3.2, -0.1),
        fov: 32.1,
      },
      "tablet-landscape": {
        position: () => new THREE.Vector3(2.6, 9.1, 10.37),
        target: () => new THREE.Vector3(-7.7, -2.4, -0.55),
        fov: 29.2,
      },
      "tablet-portrait": {
        position: () => new THREE.Vector3(2.18, 9.5, 9.4),
        target: () => new THREE.Vector3(-7, -3.2, -0.55),
        fov: 41.7,
      },
      desktop: {
        // Use absolute coordinates
        position: () => new THREE.Vector3(0.6, 9.7, 9.7),
        target: () => new THREE.Vector3(-4.8, 0, 0),
        fov: 27.3,
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
        position: () => new THREE.Vector3(5, 10, 5), // Example position for the camera
        target: () => new THREE.Vector3(2.36, 7.03, 0.64), // Statue_Face world position
        fov: 20,
      },
      "tablet-landscape": {
        position: () => new THREE.Vector3(3.49, 5.09, 12.36), // Adjust for tablet
        target: () => new THREE.Vector3(5.9, 8.1, -0.55), // Same target
        fov: 25,
      },
      "tablet-portrait": {
        position: () => new THREE.Vector3(4.19, 5.48, 13.3),
        target: () => new THREE.Vector3(5.2, 7.7, -0.55),
        fov: 20,
      },
      desktop: {
        position: () => new THREE.Vector3(4.8, 6.99, 6.83), // Adjust for tablet
        target: () => new THREE.Vector3(4.8, 9.1, -2.4), // Same target
        fov: 71.1,
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
    description:
      "Our Lady glorifies the 3 top and 3 most recent stakers of Her token. Click on any screen for a closer view.",
    cameraView: {
      phone: {
        // Use absolute coordinates
        position: () => new THREE.Vector3(1.1, 1.8, 6.7),
        target: () => new THREE.Vector3(4.6, 2.3, 1.7),
        fov: 56.6,
      },
      "tablet-landscape": {
        position: () => new THREE.Vector3(5.1, 3, 12.6),
        target: () => new THREE.Vector3(6.1, 2.7, 2.5),
        fov: 33.7,
      },
      "tablet-portrait": {
        position: () => new THREE.Vector3(5.29, 2.4, 8.61),
        target: () => new THREE.Vector3(-1, 2.1, -0.55),
        fov: 85,
      },
      desktop: {
        position: () => new THREE.Vector3(5.34, 2.52, 9.8),
        target: () => new THREE.Vector3(5.3, 1.8, -0.55),
        fov: 77.5,
      },
    },
    annotationPosition: {
      // Move this outside cameraView
      phone: { xPercent: 30, yPercent: 70 },
      tablet: { xPercent: 50, yPercent: 70 },
      desktop: { xPercent: 40, yPercent: 60 },
    },
  },

  {
    position: new THREE.Vector3(1.6, 1, -0.3),
    label: "View 4",
    description: "Lasciate ogni speranza....",
    cameraView: {
      phone: {
        // Use absolute coordinates
        position: () => new THREE.Vector3(2.4, 5.1, 0.8),
        target: () => new THREE.Vector3(23.3, 5.3, 1.7),
        fov: 67.6,
      },
      "tablet-landscape": {
        position: () => new THREE.Vector3(7.9, 6.59, 4.62),
        target: () => new THREE.Vector3(15.7, 6.7, 4.2),
        fov: 85.7,
      },
      "tablet-portrait": {
        position: () => new THREE.Vector3(11.21, 4.77, 9.58),
        target: () => new THREE.Vector3(26.2, 6.4, -0.55),
        fov: 106.7,
      },
      desktop: {
        position: () => new THREE.Vector3(7, 5.36, 5.38),
        target: () => new THREE.Vector3(18.1, 6.7, 6.1),
        fov: 77.3,
      },
    },
    annotationPosition: {
      // Move this outside cameraView
      phone: { xPercent: 30, yPercent: 65 },
      tablet: { xPercent: 25, yPercent: 50 },
      desktop: { xPercent: 50, yPercent: 50 },
    },
    extraButton: {
      label: "Take me there!",
      url: "/rocket",
    },
  },
  {
    position: new THREE.Vector3(-1.3, 1, -1.6),
    label: "View5",
    description: "Redeem reward tokens for candles and trinkets.",
    cameraView: {
      phone: {
        // Use absolute coordinates
        position: () => new THREE.Vector3(-5.7, 10.5, 7.3),
        target: () => new THREE.Vector3(-3.3, 3.2, -0.1),
        fov: 32.1,
      },
      "tablet-landscape": {
        position: () => new THREE.Vector3(-10.8, 5.8, 6.1),
        target: () => new THREE.Vector3(-9.6, 5.4, -0.55),
        fov: 38.1,
      },
      "tablet-portrait": {
        position: () => new THREE.Vector3(-7.5, 6, 8.6),
        target: () => new THREE.Vector3(-8, 6, -0.55),
        fov: 45.2,
      },
      desktop: {
        // Use absolute coordinates
        position: () => new THREE.Vector3(-6.6, 5.4, 7.3),
        target: () => new THREE.Vector3(-7.2, 4.8, 0),
        fov: 35.7,
      },
    },
    annotationPosition: {
      // Move this outside cameraView
      phone: { xPercent: 35, yPercent: 70 },
      tablet: { xPercent: 40, yPercent: 70 },
      desktop: { xPercent: 55, yPercent: 65 },
    },
  },
];
