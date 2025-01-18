import * as THREE from "three";
export const DEFAULT_MARKERS = [
  {
    position: new THREE.Vector3(-0.65, 0.62, 0.3),
    id: "marker1",
    label: "View 1",
    description:
      "These candles are melting. Hover over the lit ones. Click green button to see more.",
    buttons: {
      primary: {
        label: "Back",
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
        position: () => new THREE.Vector3(0, 13.9, 7.9),
        target: () => new THREE.Vector3(-2.4, 9.7, 3),
        fov: 21,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(-0.77, 10.59, 16.76),
        target: () => new THREE.Vector3(-1.2, 10, 14.6),
        fov: 20,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(0, 13.9, 7.9),
        target: () => new THREE.Vector3(-2.4, 9.7, 3),
        fov: 21,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(-0.77, 10.59, 16.76),
        target: () => new THREE.Vector3(-1.2, 10, 14.6),
        fov: 20,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(0, 13.9, 7.9),
        target: () => new THREE.Vector3(-2.4, 9.7, 3),
        fov: 21,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(-0.77, 10.59, 16.76),
        target: () => new THREE.Vector3(-1.2, 10, 14.6),
        fov: 20,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(0, 13.9, 7.9),
        target: () => new THREE.Vector3(-2.4, 9.7, 3),
        fov: 21,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(0, 13.9, 7.9),
        target: () => new THREE.Vector3(-2.4, 9.7, 3),
        fov: 21,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(0, 13.9, 7.9),
        target: () => new THREE.Vector3(-2.4, 9.7, 3),
        fov: 21,
      },
    },
    annotationPosition: {
      // phone: { xPercent: 35, yPercent: 70 },
      "tablet-small-landscape": { xPercent: 20, yPercent: 60 },
      "tablet-small-portrait": { xPercent: 40, yPercent: 60 },
      "tablet-medium-landscape": { xPercent: 30, yPercent: 60 },
      "tablet-medium-portrait": { xPercent: 40, yPercent: 60 },
      "tablet-large-landscape": { xPercent: 30, yPercent: 69 },
      "tablet-large-portrait": { xPercent: 40, yPercent: 60 },
      "desktop-small": { xPercent: 25, yPercent: 65 },
      "desktop-medium": { xPercent: 25, yPercent: 65 },
      "desktop-large": { xPercent: 25, yPercent: 65 },
    },
  },

  {
    position: new THREE.Vector3(0.58, 1.15, -0.2),
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
        position: () => new THREE.Vector3(0.32, 2.64, 4.93),
        target: () => new THREE.Vector3(1.8, 3, 1.8),
        fov: 37.2,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(-0.51, 8, 4.1),
        target: () => new THREE.Vector3(0.5, 8, 2.4),
        fov: 32,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(1.8, 6.7, 2.4),
        target: () => new THREE.Vector3(5.4, 13.3, -15.3),
        fov: 37.2,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(-0.51, 8, 4.1),
        target: () => new THREE.Vector3(0.5, 8, 2.4),
        fov: 32,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(1.8, 6.7, 2.4),
        target: () => new THREE.Vector3(5.4, 13.3, -15.3),
        fov: 37.2,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(-0.51, 8, 4.1),
        target: () => new THREE.Vector3(0.5, 8, 2.4),
        fov: 32,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(1.8, 6.7, 2.4),
        target: () => new THREE.Vector3(5.4, 13.3, -15.3),
        fov: 37.2,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(1.8, 6.7, 2.4),
        target: () => new THREE.Vector3(5.4, 13.3, -15.3),
        fov: 37.2,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(1.8, 6.7, 2.4),
        target: () => new THREE.Vector3(5.4, 13.3, -15.3),
        fov: 37.2,
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
    position: new THREE.Vector3(0.65, 0.12, 0.27),
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
        position: () => new THREE.Vector3(0.32, 2.64, 4.93),
        target: () => new THREE.Vector3(1.8, 3, 1.8),
        fov: 36.3,
      },
      "tablet-small-portrait": {
        position: () => new THREE.Vector3(8.04, 3.8, 3.8),
        target: () => new THREE.Vector3(-2.7, 0.8, -10.9),
        fov: 60,
      },
      "tablet-medium-landscape": {
        position: () => new THREE.Vector3(0.32, 2.64, 4.93),
        target: () => new THREE.Vector3(1.8, 3, 1.8),
        fov: 36.3,
      },
      "tablet-medium-portrait": {
        position: () => new THREE.Vector3(8.04, 3.8, 3.8),
        target: () => new THREE.Vector3(-2.7, 0.8, -10.9),
        fov: 60,
      },
      "tablet-large-landscape": {
        position: () => new THREE.Vector3(0.32, 2.64, 4.93),
        target: () => new THREE.Vector3(1.8, 3, 1.8),
        fov: 36.3,
      },
      "tablet-large-portrait": {
        position: () => new THREE.Vector3(8.04, 3.8, 3.8),
        target: () => new THREE.Vector3(-2.7, 0.8, -10.9),
        fov: 60,
      },
      "desktop-small": {
        position: () => new THREE.Vector3(0.32, 2.64, 4.93),
        target: () => new THREE.Vector3(1.8, 3, 1.8),
        fov: 36.3,
      },
      "desktop-medium": {
        position: () => new THREE.Vector3(0.32, 2.64, 4.93),
        target: () => new THREE.Vector3(1.8, 3, 1.8),
        fov: 36.3,
      },
      "desktop-large": {
        position: () => new THREE.Vector3(0.32, 2.64, 4.93),
        target: () => new THREE.Vector3(1.8, 3, 1.8),
        fov: 36.3,
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
];
