import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { db } from "../../utilities/firebaseClient";
import * as THREE from "three";
import { getRandomShader } from "./shaders/shaderManager";

export const createMarkerFace = (index) => {
  const container = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.4),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    })
  );
  container.isMarker = true;
  container.markerIndex = index;
  container.scale.set(0.15, 0.15, 0.15);

  // Marker Circle
  const markerGeometry = new THREE.CircleGeometry(0.15, 32);
  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
  });
  const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
  markerMesh.position.z = 0.001;
  markerMesh.renderOrder = 1;
  container.add(markerMesh);

  // Marker Border (with emissive glow)
  const borderGeometry = new THREE.RingGeometry(0.16, 0.2, 32);
  const borderMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 1,
    side: THREE.DoubleSide,
  });
  const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
  borderMesh.position.z = 0;
  borderMesh.renderOrder = 0;
  container.add(borderMesh);

  // Number Texture
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  context.fillStyle = "white";
  context.font = "bold 40px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText((index + 1).toString(), 32, 32);

  const numberTexture = new THREE.CanvasTexture(canvas);
  const numberGeometry = new THREE.PlaneGeometry(0.2, 0.2);
  const numberMaterial = new THREE.MeshBasicMaterial({
    map: numberTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
  numberMesh.position.z = 0.01;
  container.add(numberMesh);

  // Add pulsing and glowing effect
  let pulseTime = 0;
  container.onBeforeRender = () => {
    pulseTime += 0.05;
    const scale = 1 + Math.sin(pulseTime) * 0.15;
    borderMesh.scale.set(scale, scale, scale);
    borderMaterial.emissiveIntensity = 0.8 + Math.sin(pulseTime) * 0.2;
  };

  return container;
};

export function setupVideoTextures(modelRef) {
  const videoMaterials = {};
  const overlayMaterials = {};
  let animationFrameId = null;
  let unsubscribeFirestore;
  let userNames = [];
  const overlayMeshes = {};
  let userDataInterval;

  // Array of video URLs - replace these with your actual MP4 URLs
  const videoUrls = [
    "/1.mp4",
    "/2.mp4",
    "/3.mp4",
    "/4.mp4",
    "/5.mp4",
    "/6.mp4",
    "/7.mp4",
    "/8.mp4",
    "/9.mp4",
  ];

  // Function to create video texture
  const createVideoTexture = (videoUrl) => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.play();

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;

    // Create a matrix to rotate 90 degrees and flip on Y-axis
    texture.matrix.setUvTransform(0, 0, -1, 1, Math.PI / 2, 0.5, 0.5);
    texture.matrixAutoUpdate = false;

    return { texture, video };
  };

  const fetchUserNames = async () => {
    try {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }

      const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
      unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
        const newUserNames = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            userName: data.userName || "Anonymous",
            burnedAmount: data.burnedAmount || 0,
            image: data.image || null,
          };
        });

        if (JSON.stringify(newUserNames) !== JSON.stringify(userNames)) {
          userNames = newUserNames;
          updateScreens();
        }
      });
    } catch (error) {
      console.error("Error in fetchUserNames:", error);
      userNames = [
        { userName: "Error loading data", burnedAmount: 0, image: null },
      ];
    }
  };

  const initializeScreens = () => {
    if (modelRef.current) {
      const screens = [];
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.name.startsWith("Screen")) {
          screens.push(child);
        }
      });

      // Distribute videos among screens
      screens.forEach((screen, index) => {
        const videoUrl = videoUrls[index % videoUrls.length];
        const { texture, video } = createVideoTexture(videoUrl);

        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });

        videoMaterials[screen.name] = { material, video };
        screen.material = material;
      });
    }
  };

  const createTextTexture = (textData) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext("2d");

      if (textData.image) {
        const img = new Image();
        img.onload = () => {
          context.save();
          context.scale(1, -1);
          context.rotate(-Math.PI / 2);

          const scale =
            Math.max(canvas.width / img.width, canvas.height / img.height) *
            1.1;
          const x = (canvas.width - img.width * scale) / 1.8;
          const y = (canvas.height - img.height * scale) / 2;

          context.drawImage(img, x, y, img.width * scale, img.height * scale);
          context.restore();

          // Draw text
          context.save();
          context.translate(canvas.width / 2 + 70, canvas.height / 2);
          context.scale(-1, 1);
          context.rotate(Math.PI / 2);

          context.fillStyle = "#ffffff";
          context.font = "bold 90px Oleo Script";
          context.textAlign = "center";
          context.textBaseline = "middle";

          const text = `${textData.userName}`;
          context.fillText(text, 0, 0);
          context.restore();

          const texture = new THREE.CanvasTexture(canvas);
          texture.needsUpdate = true;
          resolve(texture);
        };
        img.src = textData.image;
      }
    });
  };

  const addOverlays = () => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.name.startsWith("Screen")) {
          const overlayMesh = new THREE.Mesh(
            child.geometry.clone(),
            new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 1.0,
              depthTest: true,
            })
          );

          overlayMesh.position.copy(child.position);
          overlayMesh.rotation.copy(child.rotation);
          overlayMesh.scale.copy(child.scale);
          overlayMesh.position.z += 0.001;

          child.parent.add(overlayMesh);
          overlayMeshes[child.name] = overlayMesh;
        }
      });
    }
  };

  const updateScreens = async () => {
    await fetchUserNames();

    // Get all screen names and shuffle them
    const screenNames = Object.keys(overlayMeshes);
    const shuffledScreens = [...screenNames].sort(() => Math.random() - 0.5);

    // Reset all overlays to hide them initially
    Object.values(overlayMeshes).forEach((mesh) => {
      mesh.visible = false;
    });

    // If we have users to display
    if (userNames.length > 0) {
      // Select one random screen to show user data
      const selectedScreen = shuffledScreens[0];

      // Select one random user
      const selectedUser =
        userNames[Math.floor(Math.random() * userNames.length)];

      // Create and apply texture for the selected user
      const texture = await createTextTexture(selectedUser);
      if (overlayMeshes[selectedScreen]) {
        overlayMeshes[selectedScreen].material.map = texture;
        overlayMeshes[selectedScreen].visible = true;
        overlayMeshes[selectedScreen].material.needsUpdate = true;
      }
    }
  };

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    // No need to update uniforms for videos
  };

  userDataInterval = setInterval(updateScreens, 10000);

  const cleanup = () => {
    if (animationFrameId != null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (userDataInterval) {
      clearInterval(userDataInterval);
    }

    // Cleanup videos
    Object.values(videoMaterials).forEach(({ material, video }) => {
      video.pause();
      video.src = "";
      video.load();
      material.dispose();
    });

    // Cleanup overlays
    Object.values(overlayMeshes).forEach((mesh) => {
      if (mesh.material.map) {
        mesh.material.map.dispose();
      }
      mesh.material.dispose();
      mesh.removeFromParent();
    });
  };

  initializeScreens();
  addOverlays();
  animate();
  fetchUserNames();

  return cleanup;
}
// New function to handle candle visibility and tooltips
export const handleCandles = (
  model,
  results,
  setTooltipData,
  camera,
  size,
  shuffledCandleIndices
) => {
  const tempV = new THREE.Vector3();
  const tooltips = [];

  // Traverse model and update ZFlames visibility and tooltips
  model.traverse((child) => {
    if (child.name.startsWith("ZFlame")) {
      const index = parseInt(child.name.replace("ZFlame", ""), 10);
      const user = results[shuffledCandleIndices[index]] || null;

      if (user) {
        // Ensure the ZFlame is visible
        child.visible = true;

        // Generate tooltip data for hover interaction
        child.getWorldPosition(tempV);
        tempV.project(camera);

        const x = (0.5 + tempV.x / 2) * size.width;
        const y = (0.5 - tempV.y / 2) * size.height;

        tooltips.push({
          userName: user.userName,
          position: { x, y },
        });
      } else {
        // No user associated, hide ZFlame
        child.visible = false;
      }
    }
  });

  // Only update tooltips if there's a meaningful change
  if (tooltips.length > 0) {
    setTooltipData(tooltips);
  } else {
    setTooltipData([]); // Clear tooltips when no hover
  }
};

// utility for clicking on screens for up-close view
// modelUtilities.js
export const SCREEN_VIEWS = {
  Screen1: {
    cameraView: {
      "tablet-small-landscape": {
        position: () => ({ x: 3.17, y: 1.8, z: 7.81 }),
        target: () => ({ x: -0.7, y: 1.8, z: 5.8 }),
        fov: 84.8,
      },
      "tablet-small-portrait": {
        position: () => ({ x: 4.8, y: 1.2, z: 9.21 }),
        target: () => ({ x: 0, y: 2.3, z: 5.9 }),
        fov: 42,
      },
      "tablet-medium-landscape": {
        position: () => ({ x: 3.17, y: 1.8, z: 7.81 }),
        target: () => ({ x: -0.7, y: 1.8, z: 5.8 }),
        fov: 84.8,
      },
      "tablet-medium-portrait": {
        position: () => ({ x: 4.8, y: 1.2, z: 9.21 }),
        target: () => ({ x: 0, y: 2.3, z: 5.9 }),
        fov: 42,
      },
      "tablet-large-landscape": {
        position: () => ({ x: 3.17, y: 1.8, z: 7.81 }),
        target: () => ({ x: -0.7, y: 1.8, z: 5.8 }),
        fov: 84.8,
      },
      "tablet-large-portrait": {
        position: () => ({ x: 4.8, y: 1.2, z: 9.21 }),
        target: () => ({ x: 0, y: 2.3, z: 5.9 }),
        fov: 42,
      },
      "desktop-small": {
        position: () => ({ x: 3.17, y: 1.8, z: 7.81 }),
        target: () => ({ x: -0.7, y: 1.8, z: 5.8 }),
        fov: 84.8,
      },
      "desktop-medium": {
        position: () => ({ x: 3.17, y: 1.8, z: 7.81 }),
        target: () => ({ x: -0.7, y: 1.8, z: 5.8 }),
        fov: 84.8,
      },
      "desktop-large": {
        position: () => ({ x: 3.17, y: 1.8, z: 7.81 }),
        target: () => ({ x: -0.7, y: 1.8, z: 5.8 }),
        fov: 84.8,
      },
    },
    getDescription: () => {
      const content = screenStateManager.screenContent.Screen1;
      return content ? content.userName : null;
    },

    annotationPosition: {
      "tablet-small-landscape": {
        xPercent: 50,
        yPercent: 70,
      },
      "tablet-small-portrait": {
        xPercent: 50,
        yPercent: 70,
      },
      "tablet-medium-landscape": {
        xPercent: 50,
        yPercent: 70,
      },
      "tablet-medium-portrait": {
        xPercent: 50,
        yPercent: 70,
      },
      "tablet-large-landscape": {
        xPercent: 50,
        yPercent: 70,
      },
      "tablet-large-portrait": {
        xPercent: 50,
        yPercent: 70,
      },
      "desktop-small": {
        xPercent: 50,
        yPercent: 70,
      },
      "desktop-medium": {
        xPercent: 50,
        yPercent: 70,
      },
      "desktop-large": {
        xPercent: 50,
        yPercent: 70,
      },
    },
    handleClick: (moveCamera, markers) => {
      if (markers && markers[2]) {
        // Index 2 for marker 3
        moveCamera(markers[2], 2);
      }
    },
  },
  Screen2: {
    cameraView: {
      "tablet-small-landscape": {
        position: () => ({ x: 5.15, y: 3.9, z: 6.94 }),
        target: () => ({ x: -12.8, y: 2.7, z: -1 }),
        fov: 42.4,
      },
      "tablet-small-portrait": {
        position: () => ({ x: 5.24, y: 3.36, z: 6.97 }),
        target: () => ({ x: -11.1, y: 5.9, z: -2.1 }),
        fov: 55.8,
      },
      "tablet-medium-landscape": {
        position: () => ({ x: 5.15, y: 3.9, z: 6.94 }),
        target: () => ({ x: -12.8, y: 2.7, z: -1 }),
        fov: 42.4,
      },
      "tablet-medium-portrait": {
        position: () => ({ x: 5.24, y: 3.36, z: 6.97 }),
        target: () => ({ x: -11.1, y: 5.9, z: -2.1 }),
        fov: 55.8,
      },
      "tablet-large-landscape": {
        position: () => ({ x: 5.15, y: 3.9, z: 6.94 }),
        target: () => ({ x: -12.8, y: 2.7, z: -1 }),
        fov: 42.4,
      },
      "tablet-large-portrait": {
        position: () => ({ x: 5.24, y: 3.36, z: 6.97 }),
        target: () => ({ x: -11.1, y: 5.9, z: -2.1 }),
        fov: 55.8,
      },
      "desktop-small": {
        position: () => ({ x: 5.15, y: 3.9, z: 6.94 }),
        target: () => ({ x: -12.8, y: 2.7, z: -1 }),
        fov: 42.4,
      },
      "desktop-medium": {
        position: () => ({ x: 5.15, y: 3.9, z: 6.94 }),
        target: () => ({ x: -12.8, y: 2.7, z: -1 }),
        fov: 42.4,
      },
      "desktop-large": {
        position: () => ({ x: 5.15, y: 3.9, z: 6.94 }),
        target: () => ({ x: -12.8, y: 2.7, z: -1 }),
        fov: 42.4,
      },
    },
    getDescription: () => {
      const content = screenStateManager.screenContent.Screen2;
      return content ? content.userName : null;
    },
    annotationPosition: {
      "tablet-small-landscape": {
        xPercent: 50,
        yPercent: 80,
      },
      "tablet-small-portrait": {
        xPercent: 40,
        yPercent: 70,
      },
      "tablet-medium-landscape": {
        xPercent: 50,
        yPercent: 80,
      },
      "tablet-medium-portrait": {
        xPercent: 40,
        yPercent: 70,
      },
      "tablet-large-landscape": {
        xPercent: 50,
        yPercent: 80,
      },
      "tablet-large-portrait": {
        xPercent: 40,
        yPercent: 70,
      },
      "desktop-small": {
        xPercent: 50,
        yPercent: 80,
      },
      "desktop-medium": {
        xPercent: 50,
        yPercent: 80,
      },
      "desktop-large": {
        xPercent: 50,
        yPercent: 80,
      },
    },
    handleClick: (moveCamera, markers) => {
      if (markers && markers[2]) {
        // Index 2 for marker 3
        moveCamera(markers[2], 2);
      }
    },
  },
  Screen3: {
    cameraView: {
      "tablet-small-landscape": {
        position: () => ({ x: 4.9, y: 2.88, z: 6.9 }),
        target: () => ({ x: 4.9, y: 2.8, z: 5.1 }),
        fov: 56.1,
      },
      "tablet-small-portrait": {
        position: () => ({ x: 4.9, y: 2.9, z: 7.26 }),
        target: () => ({ x: 4.4, y: 2.1, z: -2.1 }),
        fov: 57.6,
      },
      "tablet-medium-landscape": {
        position: () => ({ x: 4.9, y: 2.88, z: 6.9 }),
        target: () => ({ x: 4.9, y: 2.8, z: 5.1 }),
        fov: 56.1,
      },
      "tablet-medium-portrait": {
        position: () => ({ x: 4.9, y: 2.9, z: 7.26 }),
        target: () => ({ x: 4.4, y: 2.1, z: -2.1 }),
        fov: 57.6,
      },
      "tablet-large-landscape": {
        position: () => ({ x: 4.9, y: 2.88, z: 6.9 }),
        target: () => ({ x: 4.9, y: 2.8, z: 5.1 }),
        fov: 56.1,
      },
      "tablet-large-portrait": {
        position: () => ({ x: 4.9, y: 2.9, z: 7.26 }),
        target: () => ({ x: 4.4, y: 2.1, z: -2.1 }),
        fov: 57.6,
      },
      "desktop-small": {
        position: () => ({ x: 4.9, y: 2.88, z: 6.9 }),
        target: () => ({ x: 4.9, y: 2.8, z: 5.1 }),
        fov: 56.1,
      },
      "desktop-medium": {
        position: () => ({ x: 4.9, y: 2.88, z: 6.9 }),
        target: () => ({ x: 4.9, y: 2.8, z: 5.1 }),
        fov: 56.1,
      },
      "desktop-large": {
        position: () => ({ x: 4.9, y: 2.88, z: 6.9 }),
        target: () => ({ x: 4.9, y: 2.8, z: 5.1 }),
        fov: 56.1,
      },
    },
    getDescription: () => {
      const content = screenStateManager.screenContent.Screen3;
      return content ? content.userName : null;
    },
    annotationPosition: {
      "tablet-small-landscape": {
        xPercent: 50,
        yPercent: 80,
      },
      "tablet-small-portrait": {
        xPercent: 50,
        yPercent: 70,
      },
      "tablet-medium-landscape": {
        xPercent: 50,
        yPercent: 80,
      },
      "tablet-medium-portrait": {
        xPercent: 50,
        yPercent: 70,
      },
      "tablet-large-landscape": {
        xPercent: 50,
        yPercent: 80,
      },
      "tablet-large-portrait": {
        xPercent: 50,
        yPercent: 70,
      },
      "desktop-small": {
        xPercent: 50,
        yPercent: 80,
      },
      "desktop-medium": {
        xPercent: 50,
        yPercent: 80,
      },
      "desktop-large": {
        xPercent: 50,
        yPercent: 80,
      },
    },
    handleClick: (moveCamera, markers) => {
      if (markers && markers[2]) {
        // Index 2 for marker 3
        moveCamera(markers[2], 2);
      }
    },
  },
  Screen4: {
    cameraView: {
      "tablet-small-landscape": {
        position: () => ({ x: 6.6, y: 3.1, z: 6.2 }),
        target: () => ({ x: 9.3, y: 4.6, z: -2.1 }),
        fov: 75.3,
      },
      "tablet-small-portrait": {
        position: () => ({ x: 6.6, y: 3.1, z: 6.2 }),
        target: () => ({ x: 9.3, y: 4.6, z: -2.1 }),
        fov: 75.3,
      },
      "tablet-medium-landscape": {
        position: () => ({ x: 6.6, y: 3.1, z: 6.2 }),
        target: () => ({ x: 9.3, y: 4.6, z: -2.1 }),
        fov: 75.3,
      },
      "tablet-medium-portrait": {
        position: () => ({ x: 6.6, y: 3.1, z: 6.2 }),
        target: () => ({ x: 9.3, y: 4.6, z: -2.1 }),
        fov: 75.3,
      },
      "tablet-large-landscape": {
        position: () => ({ x: 6.6, y: 3.1, z: 6.2 }),
        target: () => ({ x: 9.3, y: 4.6, z: -2.1 }),
        fov: 75.3,
      },
      "tablet-large-portrait": {
        position: () => ({ x: 6.6, y: 3.1, z: 6.2 }),
        target: () => ({ x: 9.3, y: 4.6, z: -2.1 }),
        fov: 75.3,
      },
      "desktop-small": {
        position: () => ({ x: 6.6, y: 3.1, z: 6.2 }),
        target: () => ({ x: 9.3, y: 4.6, z: -2.1 }),
        fov: 75.3,
      },
      "desktop-medium": {
        position: () => ({ x: 6.6, y: 3.1, z: 6.2 }),
        target: () => ({ x: 9.3, y: 4.6, z: -2.1 }),
        fov: 75.3,
      },
      "desktop-large": {
        position: () => ({ x: 6.6, y: 3.1, z: 6.2 }),
        target: () => ({ x: 9.3, y: 4.6, z: -2.1 }),
        fov: 75.3,
      },
    },
    getDescription: () => {
      const content = screenStateManager.screenContent.Screen4;
      return content ? content.userName : null;
    },
    annotationPosition: {
      "tablet-small-landscape": {
        xPercent: 40,
        yPercent: 75,
      },
      "tablet-small-portrait": {
        xPercent: 50,
        yPercent: 80,
      },
      "tablet-medium-landscape": {
        xPercent: 40,
        yPercent: 75,
      },
      "tablet-medium-portrait": {
        xPercent: 50,
        yPercent: 80,
      },
      "tablet-large-landscape": {
        xPercent: 40,
        yPercent: 75,
      },
      "tablet-large-portrait": {
        xPercent: 50,
        yPercent: 80,
      },
      "desktop-small": {
        xPercent: 40,
        yPercent: 75,
      },
      "desktop-medium": {
        xPercent: 40,
        yPercent: 75,
      },
      "desktop-large": {
        xPercent: 40,
        yPercent: 75,
      },
    },
    handleClick: (moveCamera, markers) => {
      if (markers && markers[2]) {
        // Index 2 for marker 3
        moveCamera(markers[2], 2);
      }
    },
  },
  Screen5: {
    cameraView: {
      "tablet-small-landscape": {
        position: () => ({ x: 6.55, y: 3.2, z: 8.65 }),
        target: () => ({ x: 19.3, y: 4.5, z: -6.1 }),
        fov: 49.1,
      },
      "tablet-small-portrait": {
        position: () => ({ x: 6.89, y: 4, z: 8.1 }),
        target: () => ({ x: 17.7, y: 4.6, z: -2 }),
        fov: 97,
      },
      "tablet-medium-landscape": {
        position: () => ({ x: 6.55, y: 3.2, z: 8.65 }),
        target: () => ({ x: 19.3, y: 4.5, z: -6.1 }),
        fov: 49.1,
      },
      "tablet-medium-portrait": {
        position: () => ({ x: 6.89, y: 4, z: 8.1 }),
        target: () => ({ x: 17.7, y: 4.6, z: -2 }),
        fov: 97,
      },
      "tablet-large-landscape": {
        position: () => ({ x: 6.55, y: 3.2, z: 8.65 }),
        target: () => ({ x: 19.3, y: 4.5, z: -6.1 }),
        fov: 49.1,
      },
      "tablet-large-portrait": {
        position: () => ({ x: 6.89, y: 4, z: 8.1 }),
        target: () => ({ x: 17.7, y: 4.6, z: -2 }),
        fov: 97,
      },
      "desktop-small": {
        position: () => ({ x: 6.55, y: 3.2, z: 8.65 }),
        target: () => ({ x: 19.3, y: 4.5, z: -6.1 }),
        fov: 49.1,
      },
      "desktop-medium": {
        position: () => ({ x: 6.55, y: 3.2, z: 8.65 }),
        target: () => ({ x: 19.3, y: 4.5, z: -6.1 }),
        fov: 49.1,
      },
      "desktop-large": {
        position: () => ({ x: 6.55, y: 3.2, z: 8.65 }),
        target: () => ({ x: 19.3, y: 4.5, z: -6.1 }),
        fov: 49.1,
      },
    },
    getDescription: () => {
      const content = screenStateManager.screenContent.Screen5;
      return content ? content.userName : null;
    },
    annotationPosition: {
      "tablet-small-landscape": {
        xPercent: 50,
        yPercent: 80,
      },
      "tablet-small-portrait": {
        xPercent: 50,
        yPercent: 75,
      },
      "tablet-medium-landscape": {
        xPercent: 50,
        yPercent: 80,
      },
      "tablet-medium-portrait": {
        xPercent: 50,
        yPercent: 75,
      },
      "tablet-large-landscape": {
        xPercent: 50,
        yPercent: 80,
      },
      "tablet-large-portrait": {
        xPercent: 50,
        yPercent: 75,
      },
      "desktop-small": {
        xPercent: 50,
        yPercent: 80,
      },
      "desktop-medium": {
        xPercent: 50,
        yPercent: 80,
      },
      "desktop-large": {
        xPercent: 50,
        yPercent: 80,
      },
    },
    handleClick: (moveCamera, markers) => {
      if (markers && markers[2]) {
        // Index 2 for marker 3
        moveCamera(markers[2], 2);
      }
    },
  },
  Screen6: {
    cameraView: {
      "tablet-small-landscape": {
        position: () => ({ x: 5.8, y: 1.6, z: 8.8 }),
        target: () => ({ x: 8, y: 2.1, z: -2.4 }),
        fov: 39.1,
      },
      "tablet-small-portrait": {
        position: () => ({ x: 5.8, y: 2.01, z: 7.6 }),
        target: () => ({ x: 11.7, y: 2, z: -8.4 }),
        fov: 86.4,
      },
      "tablet-medium-landscape": {
        position: () => ({ x: 5.8, y: 1.6, z: 8.8 }),
        target: () => ({ x: 8, y: 2.1, z: -2.4 }),
        fov: 39.1,
      },
      "tablet-medium-portrait": {
        position: () => ({ x: 5.8, y: 2.01, z: 7.6 }),
        target: () => ({ x: 11.7, y: 2, z: -8.4 }),
        fov: 86.4,
      },
      "tablet-large-landscape": {
        position: () => ({ x: 5.8, y: 1.6, z: 8.8 }),
        target: () => ({ x: 8, y: 2.1, z: -2.4 }),
        fov: 39.1,
      },
      "tablet-large-portrait": {
        position: () => ({ x: 5.8, y: 2.01, z: 7.6 }),
        target: () => ({ x: 11.7, y: 2, z: -8.4 }),
        fov: 86.4,
      },
      "desktop-small": {
        position: () => ({ x: 5.8, y: 1.6, z: 8.8 }),
        target: () => ({ x: 8, y: 2.1, z: -2.4 }),
        fov: 39.1,
      },
    },
    "desktop-medium": {
      position: () => ({ x: 5.8, y: 1.6, z: 8.8 }),
      target: () => ({ x: 8, y: 2.1, z: -2.4 }),
      fov: 39.1,
    },

    "desktop-large": {
      position: () => ({ x: 5.8, y: 1.6, z: 8.8 }),
      target: () => ({ x: 8, y: 2.1, z: -2.4 }),
      fov: 39.1,
    },

    getDescription: () => {
      const content = screenStateManager.screenContent.Screen6;
      return content ? content.userName : null;
    },
    annotationPosition: {
      "tablet-small-landscape": {
        xPercent: 50,
        yPercent: 75,
      },
      "tablet-small-portrait": {
        xPercent: 50,
        yPercent: 70,
      },
      "tablet-medium-landscape": {
        xPercent: 50,
        yPercent: 75,
      },
      "tablet-medium-portrait": {
        xPercent: 50,
        yPercent: 70,
      },
      "tablet-large-landscape": {
        xPercent: 50,
        yPercent: 75,
      },
      "tablet-large-portrait": {
        xPercent: 50,
        yPercent: 70,
      },
      "desktop-small": {
        xPercent: 50,
        yPercent: 75,
      },
      "desktop-medium": {
        xPercent: 50,
        yPercent: 75,
      },
      "desktop-large": {
        xPercent: 50,
        yPercent: 75,
      },
    },
    handleClick: (moveCamera, markers) => {
      if (markers && markers[2]) {
        // Index 2 for marker 3
        moveCamera(markers[2], 2);
      }
    },
  },
};

export const screenStateManager = {
  listeners: new Set(),
  screenContent: {
    Screen1: null,
    Screen2: null,
    Screen3: null,
    Screen4: null,
    Screen5: null,
    Screen6: null,
  },

  // Method to update content and notify listeners
  updateContent(screenName, content) {
    this.screenContent[screenName] = content;
    this.notifyListeners();
  },

  // Method to clear content
  clearContent(screenName) {
    this.screenContent[screenName] = null;
    this.notifyListeners();
  },

  // Subscribe to changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  // Notify all listeners of changes
  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.screenContent));
  },
};
// screenStateManager.subscribe((content) => {
//   console.log("Screen content updated:", content);
// });
// For the candle machine buttons:
