import * as THREE from "three";
export const DEFAULT_MARKERS = [
  {
    position: new THREE.Vector3(-0.76, 0.52, 0.3),
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
        position: () => new THREE.Vector3(-1.2, 10.21, 6.1),
        target: () => new THREE.Vector3(-3, 6.1, 2.4),
        fov: 33.9,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(-2.2, 7.5, 3.5),
        target: () => new THREE.Vector3(-4.5, 1.1, -0.1),
        fov: 67.1,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(-1.2, 10.21, 6.1),
        target: () => new THREE.Vector3(-3, 6.1, 2.4),
        fov: 33.9,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(-2.2, 7.5, 3.5),
        target: () => new THREE.Vector3(-4.5, 1.1, -0.1),
        fov: 67.1,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(-1.2, 10.21, 6.1),
        target: () => new THREE.Vector3(-3, 6.1, 2.4),
        fov: 33.9,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(-2.2, 7.5, 3.5),
        target: () => new THREE.Vector3(-4.5, 1.1, -0.1),
        fov: 67.1,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(-1.2, 10.21, 6.1),
        target: () => new THREE.Vector3(-3, 6.1, 2.4),
        fov: 33.9,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(-1.2, 10.21, 6.1),
        target: () => new THREE.Vector3(-3, 6.1, 2.4),
        fov: 33.9,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(-1.2, 10.21, 6.1),
        target: () => new THREE.Vector3(-3, 6.1, 2.4),
        fov: 33.9,
      },
    },
    annotationPosition: {
      // phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 65, yPercent: 65 },
      "tablet-small-portrait": { xPercent: 40, yPercent: 75 },
      "tablet-medium-landscape": { xPercent: 60, yPercent: 65 },
      "tablet-medium-portrait": { xPercent: 40, yPercent: 75 },
      "tablet-large-landscape": { xPercent: 60, yPercent: 65 },
      "tablet-large-portrait": { xPercent: 40, yPercent: 75 },
      "desktop-small": { xPercent: 65, yPercent: 65 },
      "desktop-medium": { xPercent: 65, yPercent: 65 },
      "desktop-large": { xPercent: 65, yPercent: 65 },
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
        position: () => new THREE.Vector3(2.1, 6.35, 1.7),
        target: () => new THREE.Vector3(2.4, 6.9, -1.1),
        fov: 83,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(1.46, 5.4, 3.88),
        target: () => new THREE.Vector3(3.1, 6.9, -2.5),
        fov: 45.7,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(2.1, 6.35, 1.7),
        target: () => new THREE.Vector3(2.4, 6.9, -1.1),
        fov: 83,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(1.46, 5.4, 3.88),
        target: () => new THREE.Vector3(3.1, 6.9, -2.5),
        fov: 45.7,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(2.1, 6.35, 1.7),
        target: () => new THREE.Vector3(2.4, 6.9, -1.1),
        fov: 83,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(1.46, 5.4, 3.88),
        target: () => new THREE.Vector3(3.1, 6.9, -2.5),
        fov: 45.7,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(2.1, 6.35, 1.7),
        target: () => new THREE.Vector3(2.4, 6.9, -1.1),
        fov: 83,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(2.1, 6.35, 1.7),
        target: () => new THREE.Vector3(2.4, 6.9, -1.1),
        fov: 83,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(2.1, 6.35, 1.7),
        target: () => new THREE.Vector3(2.4, 6.9, -1.1),
        fov: 83,
      },
    },
    annotationPosition: {
      // phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 70, yPercent: 60 },
      "tablet-small-portrait": { xPercent: 65, yPercent: 55 },
      "tablet-medium-landscape": { xPercent: 70, yPercent: 60 },
      "tablet-medium-portrait": { xPercent: 65, yPercent: 55 },
      "tablet-large-landscape": { xPercent: 70, yPercent: 60 },
      "tablet-large-portrait": { xPercent: 65, yPercent: 55 },
      "desktop-small": { xPercent: 70, yPercent: 60 },
      "desktop-medium": { xPercent: 70, yPercent: 60 },
      "desktop-large": { xPercent: 70, yPercent: 60 },
    },
  },
  {
    position: new THREE.Vector3(0.2, 0.12, 0.26),
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
        position: () => new THREE.Vector3(-0.4, 1.8, 4.49),
        target: () => new THREE.Vector3(3.1, 1.5, -1.1),
        fov: 74,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(1.81, 3.22, 5.49),
        target: () => new THREE.Vector3(9.1, 1, -4.8),
        fov: 50.9,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(-0.4, 1.8, 4.49),
        target: () => new THREE.Vector3(3.1, 1.5, -1.1),
        fov: 74,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(1.81, 3.22, 5.49),
        target: () => new THREE.Vector3(9.1, 1, -4.8),
        fov: 50.9,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(-0.4, 1.8, 4.49),
        target: () => new THREE.Vector3(3.1, 1.5, -1.1),
        fov: 74,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(1.81, 3.22, 5.49),
        target: () => new THREE.Vector3(9.1, 1, -4.8),
        fov: 50.9,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(-0.4, 1.8, 4.49),
        target: () => new THREE.Vector3(3.1, 1.5, -1.1),
        fov: 74,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(-0.4, 1.8, 4.49),
        target: () => new THREE.Vector3(3.1, 1.5, -1.1),
        fov: 74,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(-0.4, 1.8, 4.49),
        target: () => new THREE.Vector3(3.1, 1.5, -1.1),
        fov: 74,
      },
    },
    annotationPosition: {
      phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 45, yPercent: 70 },
      "tablet-small-portrait": { xPercent: 50, yPercent: 50 },
      "tablet-medium-landscape": { xPercent: 45, yPercent: 70 },
      "tablet-medium-portrait": { xPercent: 50, yPercent: 50 },
      "tablet-large-landscape": { xPercent: 45, yPercent: 70 },
      "tablet-large-portrait": { xPercent: 50, yPercent: 50 },
      "desktop-small": { xPercent: 60, yPercent: 70 },
      "desktop-medium": { xPercent: 60, yPercent: 70 },
      "desktop-large": { xPercent: 60, yPercent: 70 },
    },
  },

  {
    position: new THREE.Vector3(-1.1, 1.3, -1.6),
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
        position: () => new THREE.Vector3(-5.31, 8.03, -5.21),
        target: () => new THREE.Vector3(-5.2, 8.1, -7.2),
        fov: 87,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(-5.84, 8.2, -7.4),
        target: () => new THREE.Vector3(-6.2, 8.8, -23.7),
        fov: 114.8,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(-5.31, 8.03, -5.21),
        target: () => new THREE.Vector3(-5.2, 8.1, -7.2),
        fov: 87,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(-5.84, 8.2, -7.4),
        target: () => new THREE.Vector3(-6.2, 8.8, -23.7),
        fov: 114.8,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(-5.31, 8.03, -5.21),
        target: () => new THREE.Vector3(-5.2, 8.1, -7.2),
        fov: 87,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(-5.84, 8.2, -7.4),
        target: () => new THREE.Vector3(-6.2, 8.8, -23.7),
        fov: 114.8,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(-5.31, 8.03, -5.21),
        target: () => new THREE.Vector3(-5.2, 8.1, -7.2),
        fov: 87,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(-5.31, 8.03, -5.21),
        target: () => new THREE.Vector3(-5.2, 8.1, -7.2),
        fov: 87,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(-5.31, 8.03, -5.21),
        target: () => new THREE.Vector3(-5.2, 8.1, -7.2),
        fov: 87,
      },
    },
    annotationPosition: {
      phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 50, yPercent: 50 },
      "tablet-small-portrait": { xPercent: 10, yPercent: 50 },
      "tablet-medium-landscape": { xPercent: 50, yPercent: 50 },
      "tablet-medium-portrait": { xPercent: 10, yPercent: 45 },
      "tablet-large-landscape": { xPercent: 50, yPercent: 50 },
      "tablet-large-portrait": { xPercent: 10, yPercent: 45 },
      "desktop-small": { xPercent: 50, yPercent: 50 },
      "desktop-medium": { xPercent: 50, yPercent: 50 },
      "desktop-large": { xPercent: 50, yPercent: 50 },
    },
  },
];
