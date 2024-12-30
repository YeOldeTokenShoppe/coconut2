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
            Math.max(canvas.width / img.width, canvas.height / img.height) * 1; // Adjust this multiplier
          const x = (canvas.width - img.width * scale) / 2;
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
    const avatarX = canvas.width * 0.5; // Or whatever your current value is

    const avatarY = canvas.height * 0.5;

    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.name.startsWith("Screen")) {
          const randomEffect = getRandomShader();
          console.log(
            "Creating shader for",
            child.name,
            "with effect:",
            randomEffect
          );

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

    // Calculate how many screens should show user data vs shaders
    const totalScreens = Object.keys(displayTextures).length; // Should be 6
    const totalUsers = userNames.length;

    // Determine number of user screens (max 4 and no more than available users)
    const userScreenCount = Math.min(4, totalUsers);
    const shaderScreenCount = totalScreens - userScreenCount;

    // Create array of screen names and shuffle it
    const screenNames = Object.keys(displayTextures);
    for (let i = screenNames.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [screenNames[i], screenNames[j]] = [screenNames[j], screenNames[i]];
    }

    // Shuffle users array to randomize selection
    const shuffledUsers = [...userNames];
    for (let i = shuffledUsers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledUsers[i], shuffledUsers[j]] = [
        shuffledUsers[j],
        shuffledUsers[i],
      ];
    }

    // First handle user data screens - take first N users from shuffled array
    for (let i = 0; i < userScreenCount; i++) {
      const screenName = screenNames[i];
      const user = shuffledUsers[i]; // Each user is guaranteed to be unique

      const texture = await createTextTexture(user);
      if (overlayMeshes[screenName]) {
        overlayMeshes[screenName].material.map = texture;
        overlayMeshes[screenName].visible = true;
        overlayMeshes[screenName].material.needsUpdate = true;
      }
    }

    // Then handle shader screens
    for (let i = userScreenCount; i < totalScreens; i++) {
      const screenName = screenNames[i];
      if (overlayMeshes[screenName]) {
        overlayMeshes[screenName].visible = false;
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
