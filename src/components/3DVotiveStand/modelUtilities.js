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
  const shaderMaterials = {};
  const overlayMaterials = {}; // Separate storage for overlays
  let animationFrameId = null;
  let unsubscribeFirestore;
  let userNames = [];
  const overlayMeshes = {};
  let userDataInterval;

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

        // Only update if there are actual changes
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
  const createTextTexture = (textData) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext("2d");

      if (textData.image) {
        const img = new Image();
        img.onload = () => {
          // Fill entire canvas with image
          context.save();
          context.scale(1, -1); // Your existing flip
          context.rotate(-Math.PI / 2); // Your existing rotation

          // Draw image to fill canvas while maintaining aspect ratio
          const scale =
            Math.max(canvas.width / img.width, canvas.height / img.height) *
            1.1; // Increased from 1.0 to 1.2
          // Adjust position to ensure image is centered and covers left edge
          const x = (canvas.width - img.width * scale) / 1.8; // Adjusted divisor from 2 to 1.8
          const y = (canvas.height - img.height * scale) / 2;

          context.drawImage(img, x, y, img.width * scale, img.height * scale);
          context.restore();

          // Draw text over image
          context.save();
          // Add semi-transparent dark overlay for text readability
          context.fillStyle = "rgba(0, 0, 0, 0.7)";
          context.fillRect(0, 0, canvas.width, canvas.height);

          // Position and rotate text
          context.translate(canvas.width / 2 + 70, canvas.height / 2);
          context.scale(-1, 1); // Flip on y-axis
          context.rotate(Math.PI / 2); // Rotate 90 degrees

          // Text settings
          context.fillStyle = "#ffffff";
          context.font = "bold 90px Oleo Script";
          context.textAlign = "center";
          context.textBaseline = "middle";

          // Wrap text
          const wrapText = (text, maxWidth) => {
            const words = text.split(" ");
            const lines = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
              const width = context.measureText(
                currentLine + " " + words[i]
              ).width;
              if (width < maxWidth) {
                currentLine += " " + words[i];
              } else {
                lines.push(currentLine);
                currentLine = words[i];
              }
            }
            lines.push(currentLine);
            return lines;
          };

          // const text = `${textData.userName} staked ${textData.burnedAmount}`;
          const text = `${textData.userName}`;
          const maxWidth = 450;
          const lines = wrapText(text, maxWidth);
          const lineHeight = 100; // Adjust for your large font size

          lines.forEach((line, i) => {
            const yPos = (i - (lines.length - 1) / 2) * lineHeight;
            context.fillText(line, 0, yPos);
          });

          context.restore();

          const texture = new THREE.CanvasTexture(canvas);
          texture.needsUpdate = true;
          resolve(texture);
        };
        img.src = textData.image;
      }
    });
  };
  const initializeScreens = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    const avatarX = canvas.width * 0.52; // Or whatever your current value is

    const avatarY = canvas.height * 0.5;

    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.name.startsWith("Screen")) {
          const randomEffect = getRandomShader();

          // Verify shader structure
          if (randomEffect && randomEffect.shader) {
            const material = new THREE.ShaderMaterial({
              uniforms: {
                time: { value: 0 },
                ...randomEffect.shader.uniforms,
              },
              vertexShader: randomEffect.shader.vertexShader,
              fragmentShader: randomEffect.shader.fragmentShader,
            });
            shaderMaterials[child.name] = material;
            child.material = material;
          }
        }
      });
    }
  };
  let displayTextures = {}; // Make sure this is defined

  // Modify addOverlays to store initial textures
  const addOverlays = () => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.name.startsWith("Screen")) {
          const overlayMesh = new THREE.Mesh(
            child.geometry.clone(),
            new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 1.0, // Make it fully visible now
              depthTest: true,
            })
          );

          overlayMesh.position.copy(child.position);
          overlayMesh.rotation.copy(child.rotation);
          overlayMesh.scale.copy(child.scale);
          overlayMesh.position.z += 0.001;

          child.parent.add(overlayMesh);
          overlayMeshes[child.name] = overlayMesh;
          displayTextures[child.name] = null; // Initialize texture slot
        }
      });
    }
  };
  // Update the updateScreens function to handle overlays
  // Modified updateScreens function to ensure unique user display
  const updateScreens = async () => {
    await fetchUserNames();

    // Track which users have been displayed
    const usedUsers = new Set();

    // Calculate how many screens should show user data vs shaders
    const totalScreens = Object.keys(displayTextures).length;
    const availableUsers = userNames.filter(
      (user) => !usedUsers.has(user.userName)
    );
    const userScreenCount = Math.min(4, availableUsers.length);

    // Reset all screen content
    Object.keys(screenStateManager.screenContent).forEach((key) => {
      screenStateManager.clearContent(key);
    });

    // Create array of screen names and shuffle it
    const screenNames = Object.keys(displayTextures);
    const shuffledScreens = [...screenNames].sort(() => Math.random() - 0.5);

    // Create a copy of userNames and shuffle it
    const shuffledUsers = [...userNames].sort(() => Math.random() - 0.5);

    // First handle user data screens
    for (let i = 0; i < userScreenCount; i++) {
      const screenName = shuffledScreens[i];
      const user = shuffledUsers[i];

      // Skip if we've already used this user
      if (usedUsers.has(user.userName)) continue;

      const texture = await createTextTexture(user);
      if (overlayMeshes[screenName]) {
        overlayMeshes[screenName].material.map = texture;
        overlayMeshes[screenName].visible = true;
        overlayMeshes[screenName].material.needsUpdate = true;

        screenStateManager.updateContent(screenName, user);
        usedUsers.add(user.userName);
      }
    }

    // Then handle remaining screens with shaders
    for (let i = userScreenCount; i < totalScreens; i++) {
      const screenName = shuffledScreens[i];
      if (overlayMeshes[screenName]) {
        overlayMeshes[screenName].visible = false;
        screenStateManager.clearContent(screenName);
      }
    }
  };
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    const currentTime = performance.now() * 0.001;

    for (let screenName in shaderMaterials) {
      const material = shaderMaterials[screenName];
      if (material && material.uniforms && material.uniforms.time) {
        material.uniforms.time.value = currentTime;
      }
    }
  };
  // Update user data every 10 seconds
  userDataInterval = setInterval(updateScreens, 10000);

  const shaderInterval = setInterval(() => {
    // Add safety check for modelRef.current
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.name.startsWith("Screen")) {
          if (!overlayMeshes[child.name].visible) {
            // Only update if showing shader
            const randomEffect = getRandomShader();
            const material = shaderMaterials[child.name];
            material.uniforms = {
              time: { value: material.uniforms.time.value },
              ...randomEffect.shader.uniforms,
            };
            material.fragmentShader = randomEffect.shader.fragmentShader;
            material.vertexShader = randomEffect.shader.vertexShader;
            material.needsUpdate = true;
          }
        }
      });
    }
  }, 5000);

  const cleanup = () => {
    if (animationFrameId != null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (userDataInterval) {
      clearInterval(userDataInterval);
    }
    if (shaderInterval) {
      // Add this
      clearInterval(shaderInterval);
    }
    // Clear all screen content on cleanup
    Object.keys(screenStateManager.screenContent).forEach((key) => {
      screenStateManager.clearContent(key);
    });
    Object.values(shaderMaterials).forEach((material) => material.dispose());
    Object.values(overlayMeshes).forEach((mesh) => {
      mesh.material.dispose();
      mesh.removeFromParent();
    });
  };

  // Just initialize screens for now
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
        position: () => ({ x: 5.99, y: 2.98, z: 6.18 }),
        target: () => ({ x: 4.5, y: 2.5, z: 4.9 }),
        fov: 20,
      },
      "tablet-small-portrait": {
        position: () => ({ x: 5.78, y: 2.4, z: 4.19 }),
        target: () => ({ x: -6.5, y: 0.6, z: 0.1 }),
        fov: 31.5,
      },
      "tablet-medium-landscape": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 50.9,
      },
      "tablet-medium-portrait": {
        position: () => ({ x: 3.34, y: 3.9, z: 14.31 }),
        target: () => ({ x: 2.4, y: 6.3, z: -0.55 }),
        fov: 78,
      },
      "tablet-large-landscape": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "tablet-large-portrait": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "desktop-small": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "desktop-medium": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "desktop-large": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
    },
    getDescription: () => {
      const content = screenStateManager.screenContent.Screen1;
      return content ? content.userName : null;
    },

    annotationPosition: {
      desktop: {
        xPercent: 50,
        yPercent: 50,
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
      desktop: {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "tablet-small-landscape": {
        position: () => ({ x: 7.9, y: 4.18, z: 4.5 }),
        target: () => ({ x: 5.5, y: 3.9, z: 3 }),
        fov: 20,
      },
      "tablet-small-portrait": {
        position: () => ({ x: 9.8, y: 2.8, z: 7.2 }),
        target: () => ({ x: -2.7, y: 4.7, z: -3.5 }),
        fov: 15,
      },
      "tablet-medium-landscape": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "tablet-medium-portrait": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "tablet-large-landscape": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "tablet-large-portrait": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "desktop-small": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "desktop-medium": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "desktop-large": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
    },
    getDescription: () => {
      const content = screenStateManager.screenContent.Screen2;
      return content ? content.userName : null;
    },
    annotationPosition: {
      desktop: {
        xPercent: 50,
        yPercent: 50,
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
      desktop: {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "tablet-small-landscape": {
        position: () => ({ x: 4.79, y: 2.8, z: 2.06 }),
        target: () => ({ x: 4.9, y: 2.9, z: -5 }),
        fov: 68,
      },
      "tablet-small-portrait": {
        position: () => ({ x: 4.1, y: 2.8, z: 5.1 }),
        target: () => ({ x: 5.7, y: 2.5, z: -2.1 }),
        fov: 31,
      },
      "tablet-medium-landscape": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "tablet-medium-portrait": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "tablet-large-landscape": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "tablet-large-portrait": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "desktop-small": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "desktop-medium": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "desktop-large": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
    },
    getDescription: () => {
      const content = screenStateManager.screenContent.Screen3;
      return content ? content.userName : null;
    },
    annotationPosition: {
      desktop: {
        xPercent: 50,
        yPercent: 50,
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
        position: () => ({ x: 6.15, y: 3.37, z: 2.9 }),
        target: () => ({ x: 8.2, y: 3.6, z: -3 }),
        fov: 34.6,
      },
      "tablet-small-portrait": {
        position: () => ({ x: 3.74, y: 4.47, z: 5.23 }),
        target: () => ({ x: 12.6, y: 1, z: -7.5 }),
        fov: 20,
      },
      "tablet-medium-landscape": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "tablet-medium-portrait": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "tablet-large-landscape": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "tablet-large-portrait": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "desktop-small": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "desktop-medium": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "desktop-large": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
    },
    getDescription: () => {
      const content = screenStateManager.screenContent.Screen4;
      return content ? content.userName : null;
    },
    annotationPosition: {
      desktop: {
        xPercent: 50,
        yPercent: 50,
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
        position: () => ({ x: 6.4, y: 2.99, z: 4.04 }),
        target: () => ({ x: 8.4, y: 3.5, z: 2.6 }),
        fov: 50,
      },
      "tablet-small-portrait": {
        position: () => ({ x: 6.15, y: 3.37, z: 2.9 }),
        target: () => ({ x: 8.2, y: 3.6, z: -3 }),
        fov: 34.6,
      },
      "tablet-medium-landscape": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "tablet-medium-portrait": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "tablet-large-landscape": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "tablet-large-portrait": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "desktop-small": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "desktop-medium": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "desktop-large": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
    },
    getDescription: () => {
      const content = screenStateManager.screenContent.Screen5;
      return content ? content.userName : null;
    },
    annotationPosition: {
      desktop: {
        xPercent: 50,
        yPercent: 50,
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
      desktop: {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "tablet-small-landscape": {
        position: () => ({ x: 5.4, y: 2.5, z: 5.7 }),
        target: () => ({ x: 7.4, y: 1.1, z: -2.1 }),
        fov: 20,
      },
      "tablet-small-portrait": {
        position: () => ({ x: 3.6, y: 1.5, z: 6.6 }),
        target: () => ({ x: 6.9, y: 1.7, z: 0.7 }),
        fov: 20,
      },
      "tablet-medium-landscape": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "tablet-medium-portrait": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "tablet-large-landscape": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "tablet-large-portrait": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "desktop-small": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
      "desktop-medium": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 48.4,
      },
      "desktop-large": {
        position: () => ({ x: 3.33, y: 1.75, z: 3.73 }),
        target: () => ({ x: -13.4, y: 5.4, z: -6.6 }),
        fov: 78,
      },
    },
    getDescription: () => {
      const content = screenStateManager.screenContent.Screen6;
      return content ? content.userName : null;
    },
    annotationPosition: {
      desktop: {
        xPercent: 50,
        yPercent: 50,
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

export const BUTTON_MESSAGES = {
  Button1: {
    title: "Button 1",
    message: "You've pressed the first button. This one controls X feature.",
    // You can add more properties like:
    action: "feature1",
    description: "Longer description if needed",
    position: { x: 0, y: 0, z: 0 }, // If you need position data
  },
  Button2: {
    title: "Button 2",
    message: "Second button pressed! This controls Y feature.",
    action: "feature2",
    description: "Another description",
  },
  // Add entries for all your buttons
  Button3: {
    title: "Button 3",
    message: "Third button activated. This one manages Z feature.",
  },
  // You can add a default message for any unrecognized buttons
  default: {
    title: "Button Pressed",
    message: "You've activated a button",
  },
};
