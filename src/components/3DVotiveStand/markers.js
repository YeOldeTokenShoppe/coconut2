import * as THREE from "three";
export const DEFAULT_MARKERS = [
  {
    position: new THREE.Vector3(-0.37, 0.48, 0.12),
    id: "marker1",
    label: "View 1",
    description: "Hover over the lit candles to see who put them there.",
    buttons: {
      primary: {
        label: "OK",
        action: "reset",
      },
      extra: {
        label: "Learn More",
        action: "external",
      },
    },
    cameraView: {
      // phone: {
      //   position: () => new THREE.Vector3(-5.7, 10.5, 7.3),
      //   target: () => new THREE.Vector3(-3.3, 3.2, -0.1),
      //   fov: 32.1,
      // },
      "tablet-small-landscape": {
        position: () => new THREE.Vector3(3.61, 7.6, 4.3),
        target: () => new THREE.Vector3(-11.5, -2.2, -5.6),
        fov: 32.1,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(-0.72, 5.28, 2.94),
        target: () => new THREE.Vector3(-7, -6.1, -9.8),
        fov: 99.5,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(-1.38, 9.7, 7.79),
        target: () => new THREE.Vector3(-1.7, 2.5, -0.55),
        fov: 20,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(-0.45, 5.86, 3.48),
        target: () => new THREE.Vector3(-7, -3.2, -9.8),
        fov: 79.9,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(1.1, 9.1, 5.73),
        target: () => new THREE.Vector3(-2.2, 2.6, 0),
        fov: 26.7,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(-1.7, 9.1, 5.73),
        target: () => new THREE.Vector3(-1.7, 2.6, 0),
        fov: 40.9,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(-1.7, 9.1, 5.73),
        target: () => new THREE.Vector3(-1.7, 2.6, 0),
        fov: 40.9,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(0.5, 9.1, 5.73),
        target: () => new THREE.Vector3(-2.4, 2.4, 0),
        fov: 29.7,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(1, 9.1, 5.73),
        target: () => new THREE.Vector3(-2.2, 3.4, 0),
        fov: 26.3,
      },
    },
    annotationPosition: {
      phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 20, yPercent: 70 },
      "tablet-small-portrait": { xPercent: 45, yPercent: 70 },
      "tablet-medium-landscape": { xPercent: 60, yPercent: 65 },
      "tablet-medium-portrait": { xPercent: 45, yPercent: 65 },
      "tablet-large-landscape": { xPercent: 50, yPercent: 75 },
      "tablet-large-portrait": { xPercent: 50, yPercent: 65 },
      "desktop-small": { xPercent: 45, yPercent: 70 },
      "desktop-medium": { xPercent: 45, yPercent: 65 },
      "desktop-large": { xPercent: 50, yPercent: 65 },
    },
  },

  {
    position: new THREE.Vector3(0.39, 0.88, 0),
    id: "marker2",
    label: "View 2",
    description: "This perspective reveals...",
    buttons: {
      primary: {
        label: "OK",
        action: "reset",
      },
      extra: {
        label: "Learn More",
        action: "external",
      },
    },

    cameraView: {
      // phone: {
      //   position: () => new THREE.Vector3(-5.7, 10.5, 7.3),
      //   target: () => new THREE.Vector3(-3.3, 3.2, -0.1),
      //   fov: 32.1,
      // },
      "tablet-small-landscape": {
        position: () => new THREE.Vector3(4.86, 4.46, 9.24),
        target: () => new THREE.Vector3(4.9, 5.4, 5.1),
        fov: 20,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(4.86, 4.46, 9.24),
        target: () => new THREE.Vector3(4.9, 5.4, 5.1),
        fov: 20,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(4.86, 4.46, 9.24),
        target: () => new THREE.Vector3(4.9, 5.4, 5.1),
        fov: 20,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(4.86, 4.46, 9.24),
        target: () => new THREE.Vector3(4.9, 5.4, 5.1),
        fov: 20,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(4.86, 4.46, 9.24),
        target: () => new THREE.Vector3(4.9, 5.4, 5.1),
        fov: 20,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(4.9, 6.6, 1.7),
        target: () => new THREE.Vector3(11.1, 6.5, 1.3),
        fov: 52.4,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(4.86, 4.46, 9.24),
        target: () => new THREE.Vector3(4.9, 5.4, 5.1),
        fov: 20,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(4.39, 5.96, 5.27),
        target: () => new THREE.Vector3(4.8, 6.4, 0),
        fov: 31.7,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(1, 9.1, 5.73),
        target: () => new THREE.Vector3(-2.2, 3.4, 0),
        fov: 26.3,
      },
    },
    annotationPosition: {
      phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 60, yPercent: 55 },
      "tablet-small-portrait": { xPercent: 65, yPercent: 50 },
      "tablet-medium-landscape": { xPercent: 60, yPercent: 45 },
      "tablet-medium-portrait": { xPercent: 45, yPercent: 65 },
      "tablet-large-landscape": { xPercent: 60, yPercent: 45 },
      "tablet-large-portrait": { xPercent: 60, yPercent: 45 },
      "desktop-small": { xPercent: 60, yPercent: 45 },
      "desktop-medium": { xPercent: 65, yPercent: 45 },
      "desktop-large": { xPercent: 60, yPercent: 45 },
    },
  },
  {
    position: new THREE.Vector3(0.2, 0.12, 0.23),
    id: "marker3",
    label: "View 3",
    description: "Glorified here are the 3 top and 3 most recent RL80 stakers.",
    buttons: {
      primary: {
        label: "OK",
        action: "reset",
      },
      extra: {
        label: "Learn More",
        action: "external",
      },
    },
    cameraView: {
      // phone: {
      //   position: () => new THREE.Vector3(-5.7, 10.5, 7.3),
      //   target: () => new THREE.Vector3(-3.3, 3.2, -0.1),
      //   fov: 32.1,
      // },
      "tablet-small-landscape": {
        position: () => new THREE.Vector3(4.85, 2.98, 10.01),
        target: () => new THREE.Vector3(4.9, 2.4, 5.1),
        fov: 34.6,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(3.12, 2.8, 7.74),
        target: () => new THREE.Vector3(5.7, 2.1, -2.1),
        fov: 63.6,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(4.7, 3.3, 6.2),
        target: () => new THREE.Vector3(4.9, 2.9, 5.1),
        fov: 58,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(4.49, 1.8, 5.03),
        target: () => new THREE.Vector3(7.1, 1.8, -14.8),
        fov: 76,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(3.08, 4.11, 13.89),
        target: () => new THREE.Vector3(6, 2.3, 0),
        fov: 20,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(-1.7, 9.1, 5.73),
        target: () => new THREE.Vector3(-1.7, 2.6, 0),
        fov: 40.9,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(3.08, 4.11, 13.89),
        target: () => new THREE.Vector3(6, 2.3, 0),
        fov: 20,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(2.59, 1.82, 4.92),
        target: () => new THREE.Vector3(5.6, 2.2, 0),
        fov: 71.2,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(2.59, 1.82, 4.92),
        target: () => new THREE.Vector3(5.6, 2.2, 0),
        fov: 71.2,
      },
    },
    annotationPosition: {
      phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 43, yPercent: 60 },
      "tablet-small-portrait": { xPercent: 45, yPercent: 70 },
      "tablet-medium-landscape": { xPercent: 35, yPercent: 65 },
      "tablet-medium-portrait": { xPercent: 70, yPercent: 65 },
      "tablet-large-landscape": { xPercent: 35, yPercent: 75 },
      "tablet-large-portrait": { xPercent: 50, yPercent: 65 },
      "desktop-small": { xPercent: 35, yPercent: 70 },
      "desktop-medium": { xPercent: 45, yPercent: 65 },
      "desktop-large": { xPercent: 50, yPercent: 65 },
    },
  },

  {
    position: new THREE.Vector3(1.6, 1, -0.3),
    id: "marker4",
    label: "View 4",
    description: "A portal to peril...or profit? Enter?",
    buttons: {
      primary: {
        label: "Maybe later",
        action: "reset",
      },
      extraButton: {
        label: "LFG!",
        url: "/rocket",
      },
    },
    cameraView: {
      // phone: {
      //   position: () => new THREE.Vector3(-5.7, 10.5, 7.3),
      //   target: () => new THREE.Vector3(-3.3, 3.2, -0.1),
      //   fov: 32.1,
      // },
      "tablet-small-landscape": {
        position: () => new THREE.Vector3(8.45, 6.53, 1.1),
        target: () => new THREE.Vector3(24.4, 7, 1.1),
        fov: 90,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(6.3, 5.7, 1.1),
        target: () => new THREE.Vector3(11.6, 6.4, 1),
        fov: 70.6,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(8.45, 6.53, 1.1),
        target: () => new THREE.Vector3(24.4, 7, 1.1),
        fov: 90,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(8.13, 6.4, 0.8),
        target: () => new THREE.Vector3(20.3, 6.4, 1.7),
        fov: 92.3,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(4.9, 6.6, 1.7),
        target: () => new THREE.Vector3(11.2, 6.5, 1.6),
        fov: 57.4,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(-1.7, 9.1, 5.73),
        target: () => new THREE.Vector3(-1.7, 2.6, 0),
        fov: 40.9,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(4.9, 6.6, 1.7),
        target: () => new THREE.Vector3(11.2, 6.5, 1.6),
        fov: 52.4,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(9.05, 6.5, 1.69),
        target: () => new THREE.Vector3(28.4, 7.2, 1.8),
        fov: 92,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(8.9, 6.7, 1.78),
        target: () => new THREE.Vector3(28.4, 8.6, 2.1),
        fov: 92,
      },
    },
    annotationPosition: {
      phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 20, yPercent: 70 },
      "tablet-small-portrait": { xPercent: 15, yPercent: 50 },
      "tablet-medium-landscape": { xPercent: 20, yPercent: 55 },
      "tablet-medium-portrait": { xPercent: 15, yPercent: 45 },
      "tablet-large-landscape": { xPercent: 50, yPercent: 75 },
      "tablet-large-portrait": { xPercent: 20, yPercent: 45 },
      "desktop-small": { xPercent: 60, yPercent: 55 },
      "desktop-medium": { xPercent: 60, yPercent: 55 },
      "desktop-large": { xPercent: 60, yPercent: 50 },
    },
  },
  {
    position: new THREE.Vector3(-1.3, 1, -1.6),
    id: "marker5",
    label: "View5",
    description: "Redeem reward tokens for candles and trinkets.",
    buttons: {
      primary: {
        label: "Continue Journey",
        action: "reset",
      },
      extra: {
        label: "Learn More",
        action: "external",
      },
    },
    cameraView: {
      // phone: {
      //   position: () => new THREE.Vector3(-5.7, 10.5, 7.3),
      //   target: () => new THREE.Vector3(-3.3, 3.2, -0.1),
      //   fov: 32.1,
      // },
      "tablet-small-landscape": {
        position: () => new THREE.Vector3(-8.23, 7.92, 15.22),
        target: () => new THREE.Vector3(-8.3, 5.6, -4.4),
        fov: 20.4,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(-11.8, 3.46, 0.6),
        target: () => new THREE.Vector3(-6.1, 6.3, -17.9),
        fov: 52.7,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(-8.5, 5.3, -1.2),
        target: () => new THREE.Vector3(-8.5, 5.3, -5.9),
        fov: 50,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(-8.75, 6.5, -2.26),
        target: () => new THREE.Vector3(-8.3, 5.2, -13.2),
        fov: 51,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(-13.42, 6.4, 11.07),
        target: () => new THREE.Vector3(-8.9, 5.7, -7.6),
        fov: 23.3,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(-1.7, 9.1, 5.73),
        target: () => new THREE.Vector3(-1.7, 2.6, 0),
        fov: 40.9,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(-13.42, 6.4, 11.07),
        target: () => new THREE.Vector3(-8.9, 5.7, -7.6),
        fov: 23.3,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(-8.93, 4.52, 5.47),
        target: () => new THREE.Vector3(-7.4, 4.9, -13.6),
        fov: 31.4,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(-7.1, 5.24, 5.28),
        target: () => new THREE.Vector3(-7.9, 5.2, -12.7),
        fov: 30,
      },
    },
    annotationPosition: {
      phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 65, yPercent: 35 },
      "tablet-small-portrait": { xPercent: 75, yPercent: 40 },
      "tablet-medium-landscape": { xPercent: 60, yPercent: 55 },
      "tablet-medium-portrait": { xPercent: 70, yPercent: 50 },
      "tablet-large-landscape": { xPercent: 50, yPercent: 75 },
      "tablet-large-portrait": { xPercent: 50, yPercent: 65 },
      "desktop-small": { xPercent: 65, yPercent: 55 },
      "desktop-medium": { xPercent: 65, yPercent: 35 },
      "desktop-large": { xPercent: 60, yPercent: 45 },
    },
  },
];
