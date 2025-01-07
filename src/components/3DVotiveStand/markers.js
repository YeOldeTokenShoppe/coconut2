import * as THREE from "three";
export const DEFAULT_MARKERS = [
  {
    position: new THREE.Vector3(-0.67, 0.72, -0.15),
    id: "marker1",
    label: "View 1",
    description: "Hover over the lit candles to see who dedicated them.",
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
        position: () => new THREE.Vector3(-0.1, 8.4, 8.2),
        target: () => new THREE.Vector3(-1.3, 5.6, 6),
        fov: 38.4,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(-0.34, 7, 7.94),
        target: () => new THREE.Vector3(-4.6, -1.3, 0),
        fov: 69.1,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(-0.1, 8.4, 8.2),
        target: () => new THREE.Vector3(-1.3, 5.6, 6),
        fov: 38.4,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(-0.34, 7, 7.94),
        target: () => new THREE.Vector3(-4.6, -1.3, 0),
        fov: 69.1,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(-0.1, 8.4, 8.2),
        target: () => new THREE.Vector3(-1.3, 5.6, 6),
        fov: 38.4,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(-0.34, 7, 7.94),
        target: () => new THREE.Vector3(-4.6, -1.3, 0),
        fov: 69.1,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(-0.1, 8.4, 8.2),
        target: () => new THREE.Vector3(-1.3, 5.6, 6),
        fov: 38.4,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(-0.1, 8.4, 8.2),
        target: () => new THREE.Vector3(-1.3, 5.6, 6),
        fov: 38.4,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(-0.1, 8.4, 8.2),
        target: () => new THREE.Vector3(-1.3, 5.6, 6),
        fov: 38.4,
      },
    },
    annotationPosition: {
      // phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 20, yPercent: 5 },
      "tablet-small-portrait": { xPercent: 40, yPercent: 70 },
      "tablet-medium-landscape": { xPercent: 30, yPercent: 5 },
      "tablet-medium-portrait": { xPercent: 40, yPercent: 70 },
      "tablet-large-landscape": { xPercent: 30, yPercent: 5 },
      "tablet-large-portrait": { xPercent: 40, yPercent: 70 },
      "desktop-small": { xPercent: 25, yPercent: 5 },
      "desktop-medium": { xPercent: 25, yPercent: 5 },
      "desktop-large": { xPercent: 25, yPercent: 5 },
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
        position: () => new THREE.Vector3(4.82, 6.38, 7.2),
        target: () => new THREE.Vector3(4.9, 6.7, 5.1),
        fov: 73.5,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(4.5, 4.86, 8.13),
        target: () => new THREE.Vector3(6, 9.4, -7.4),
        fov: 53.1,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(4.82, 6.38, 7.2),
        target: () => new THREE.Vector3(4.9, 6.7, 5.1),
        fov: 73.5,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(4.5, 4.86, 8.13),
        target: () => new THREE.Vector3(6, 9.4, -7.4),
        fov: 53.1,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(4.82, 6.38, 7.2),
        target: () => new THREE.Vector3(4.9, 6.7, 5.1),
        fov: 73.5,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(4.5, 4.86, 8.13),
        target: () => new THREE.Vector3(6, 9.4, -7.4),
        fov: 53.1,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(4.82, 6.38, 7.2),
        target: () => new THREE.Vector3(4.9, 6.7, 5.1),
        fov: 73.5,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(4.82, 6.38, 7.2),
        target: () => new THREE.Vector3(4.9, 6.7, 5.1),
        fov: 73.5,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(4.82, 6.38, 7.2),
        target: () => new THREE.Vector3(4.9, 6.7, 5.1),
        fov: 73.5,
      },
    },
    annotationPosition: {
      phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 60, yPercent: 60 },
      "tablet-small-portrait": { xPercent: 65, yPercent: 55 },
      "tablet-medium-landscape": { xPercent: 60, yPercent: 60 },
      "tablet-medium-portrait": { xPercent: 65, yPercent: 55 },
      "tablet-large-landscape": { xPercent: 60, yPercent: 60 },
      "tablet-large-portrait": { xPercent: 65, yPercent: 55 },
      "desktop-small": { xPercent: 60, yPercent: 60 },
      "desktop-medium": { xPercent: 65, yPercent: 60 },
      "desktop-large": { xPercent: 60, yPercent: 60 },
    },
  },
  {
    position: new THREE.Vector3(0.2, 0.12, 0.23),
    id: "marker3",
    label: "View 3",
    description: "She glorifies the 3 top and 3 most recent RL80 stakers.",
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
        position: () => new THREE.Vector3(4.49, 2.8, 9.5),
        target: () => new THREE.Vector3(4.9, 3.2, 5.1),
        fov: 77,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(5.7, 2.79, 8.41),
        target: () => new THREE.Vector3(-1.9, 2.1, -2.1),
        fov: 103,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(4.49, 2.8, 9.5),
        target: () => new THREE.Vector3(4.9, 3.2, 5.1),
        fov: 77,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(5.7, 2.79, 8.41),
        target: () => new THREE.Vector3(-1.9, 2.1, -2.1),
        fov: 103,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(4.49, 2.8, 9.5),
        target: () => new THREE.Vector3(4.9, 3.2, 5.1),
        fov: 77,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(5.7, 2.79, 8.41),
        target: () => new THREE.Vector3(-1.9, 2.1, -2.1),
        fov: 103,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(5.7, 2.79, 8.41),
        target: () => new THREE.Vector3(-1.9, 2.1, -2.1),
        fov: 103,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(5.7, 2.79, 8.41),
        target: () => new THREE.Vector3(-1.9, 2.1, -2.1),
        fov: 103,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(5.7, 2.79, 8.41),
        target: () => new THREE.Vector3(-1.9, 2.1, -2.1),
        fov: 103,
      },
    },
    annotationPosition: {
      phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 45, yPercent: 65 },
      "tablet-small-portrait": { xPercent: 50, yPercent: 60 },
      "tablet-medium-landscape": { xPercent: 45, yPercent: 65 },
      "tablet-medium-portrait": { xPercent: 50, yPercent: 60 },
      "tablet-large-landscape": { xPercent: 45, yPercent: 65 },
      "tablet-large-portrait": { xPercent: 50, yPercent: 60 },
      "desktop-small": { xPercent: 60, yPercent: 60 },
      "desktop-medium": { xPercent: 60, yPercent: 60 },
      "desktop-large": { xPercent: 60, yPercent: 60 },
    },
  },

  {
    position: new THREE.Vector3(1.6, 1, -0.3),
    id: "marker4",
    label: "View 4",
    description: "A portal to profit or peril? Enter?",
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
        position: () => new THREE.Vector3(10, 5.22, 0.5),
        target: () => new THREE.Vector3(24.4, 7.4, 0.7),
        fov: 109,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(10.6, 3.9, 1.1),
        target: () => new THREE.Vector3(24.8, 7.7, 1.3),
        fov: 115,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(10, 5.22, 0.5),
        target: () => new THREE.Vector3(24.4, 7.4, 0.7),
        fov: 109,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(10.6, 3.9, 1.1),
        target: () => new THREE.Vector3(24.8, 7.7, 1.3),
        fov: 115,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(10, 5.22, 0.5),
        target: () => new THREE.Vector3(24.4, 7.4, 0.7),
        fov: 109,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(10.6, 3.9, 1.1),
        target: () => new THREE.Vector3(24.8, 7.7, 1.3),
        fov: 115,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(10, 5.22, 0.5),
        target: () => new THREE.Vector3(24.4, 7.4, 0.7),
        fov: 109,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(10, 5.22, 0.5),
        target: () => new THREE.Vector3(24.4, 7.4, 0.7),
        fov: 109,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(10, 5.22, 0.5),
        target: () => new THREE.Vector3(24.4, 7.4, 0.7),
        fov: 109,
      },
    },
    annotationPosition: {
      phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 20, yPercent: 70 },
      "tablet-small-portrait": { xPercent: 15, yPercent: 50 },
      "tablet-medium-landscape": { xPercent: 20, yPercent: 70 },
      "tablet-medium-portrait": { xPercent: 15, yPercent: 45 },
      "tablet-large-landscape": { xPercent: 20, yPercent: 70 },
      "tablet-large-portrait": { xPercent: 20, yPercent: 45 },
      "desktop-small": { xPercent: 20, yPercent: 70 },
      "desktop-medium": { xPercent: 20, yPercent: 70 },
      "desktop-large": { xPercent: 20, yPercent: 70 },
    },
  },
  {
    position: new THREE.Vector3(-1.3, 1, -1.6),
    id: "marker5",
    label: "View5",
    description: "Redeem reward tokens for candles and trinkets.",
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
        position: () => new THREE.Vector3(-7.81, 5.4, 0.3),
        target: () => new THREE.Vector3(-7.5, 5.4, -16.2),
        fov: 67.3,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(-7.38, 4.95, 0.27),
        target: () => new THREE.Vector3(-6.6, 5.1, -14.4),
        fov: 68,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(-7.81, 5.4, 0.3),
        target: () => new THREE.Vector3(-7.5, 5.4, -16.2),
        fov: 67.3,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(-7.38, 4.95, 0.27),
        target: () => new THREE.Vector3(-6.6, 5.1, -14.4),
        fov: 68,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(-7.81, 5.4, 0.3),
        target: () => new THREE.Vector3(-7.5, 5.4, -16.2),
        fov: 67.3,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(-7.38, 4.95, 0.27),
        target: () => new THREE.Vector3(-6.6, 5.1, -14.4),
        fov: 68,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(-7.81, 5.4, 0.3),
        target: () => new THREE.Vector3(-7.5, 5.4, -16.2),
        fov: 67.3,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(-7.81, 5.4, 0.3),
        target: () => new THREE.Vector3(-7.5, 5.4, -16.2),
        fov: 67.3,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(-7.81, 5.4, 0.3),
        target: () => new THREE.Vector3(-7.5, 5.4, -16.2),
        fov: 67.3,
      },
    },
    annotationPosition: {
      phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 65, yPercent: 35 },
      "tablet-small-portrait": { xPercent: 60, yPercent: 35 },
      "tablet-medium-landscape": { xPercent: 65, yPercent: 35 },
      "tablet-medium-portrait": { xPercent: 60, yPercent: 35 },
      "tablet-large-landscape": { xPercent: 65, yPercent: 35 },
      "tablet-large-portrait": { xPercent: 60, yPercent: 35 },
      "desktop-small": { xPercent: 62, yPercent: 35 },
      "desktop-medium": { xPercent: 62, yPercent: 35 },
      "desktop-large": { xPercent: 62, yPercent: 35 },
    },
  },
];
