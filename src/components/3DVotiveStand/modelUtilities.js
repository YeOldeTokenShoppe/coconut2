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

  function createGradientTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");

    // Create gradient
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "#584827");
    gradient.addColorStop(0.37, "#c7a03c");
    gradient.addColorStop(0.3, "#f9de90");
    gradient.addColorStop(0.33, "#c7a03c");
    gradient.addColorStop(0.4, "#584827");
    gradient.addColorStop(0.5, "#584827");
    gradient.addColorStop(0.77, "#c7a03c");
    gradient.addColorStop(0.8, "#f9de90");
    gradient.addColorStop(0.83, "#c7a03c");
    gradient.addColorStop(1, "#584827");

    // Apply gradient to canvas
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }
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
    map: createGradientTexture(),

    emissive: 0xc7a03c,
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

// export function setupVideoTextures(modelRef) {
//   const videoMaterials = {};
//   const overlayMaterials = {};
//   let animationFrameId = null;
//   let unsubscribeFirestore;
//   let userNames = [];
//   const overlayMeshes = {};
//   let userDataInterval;

//   // Array of video URLs - replace these with your actual MP4 URLs
//   const videoUrls = [
//     "/1.mp4",
//     "/2.mp4",
//     "/3.mp4",
//     "/4.mp4",
//     "/5.mp4",
//     "/6.mp4",
//     "/7.mp4",
//     "/8.mp4",
//     "/9.mp4",
//   ];

//   // Function to create video texture
//   const createVideoTexture = (videoUrl) => {
//     const video = document.createElement("video");
//     video.src = videoUrl;
//     video.crossOrigin = "anonymous";
//     video.loop = true;
//     video.muted = true;
//     video.play();

//     const texture = new THREE.VideoTexture(video);
//     texture.minFilter = THREE.LinearFilter;
//     texture.magFilter = THREE.LinearFilter;
//     texture.format = THREE.RGBAFormat;

//     // Create a matrix to rotate 90 degrees and flip on Y-axis
//     texture.matrix.setUvTransform(0, 0, -1, 1, Math.PI / 2, 0.5, 0.5);
//     texture.matrixAutoUpdate = false;

//     return { texture, video };
//   };

//   const fetchUserNames = async () => {
//     try {
//       if (unsubscribeFirestore) {
//         unsubscribeFirestore();
//       }

//       const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
//       unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
//         const newUserNames = querySnapshot.docs.map((doc) => {
//           const data = doc.data();
//           return {
//             userName: data.userName || "Anonymous",
//             burnedAmount: data.burnedAmount || 0,
//             image: data.image || null,
//           };
//         });

//         if (JSON.stringify(newUserNames) !== JSON.stringify(userNames)) {
//           userNames = newUserNames;
//           updateScreens();
//         }
//       });
//     } catch (error) {
//       console.error("Error in fetchUserNames:", error);
//       userNames = [
//         { userName: "Error loading data", burnedAmount: 0, image: null },
//       ];
//     }
//   };

//   const initializeScreens = () => {
//     if (modelRef.current) {
//       const screens = [];
//       modelRef.current.traverse((child) => {
//         if (child.isMesh && child.name.startsWith("Screen")) {
//           screens.push(child);
//         }
//       });

//       // Distribute videos among screens
//       screens.forEach((screen, index) => {
//         const videoUrl = videoUrls[index % videoUrls.length];
//         const { texture, video } = createVideoTexture(videoUrl);

//         const material = new THREE.MeshBasicMaterial({
//           map: texture,
//           side: THREE.DoubleSide,
//         });

//         videoMaterials[screen.name] = { material, video };
//         screen.material = material;
//       });
//     }
//   };

//   const createTextTexture = (textData) => {
//     return new Promise((resolve) => {
//       const canvas = document.createElement("canvas");
//       canvas.width = 512;
//       canvas.height = 512;
//       const context = canvas.getContext("2d");

//       if (textData.image) {
//         const img = new Image();
//         img.onload = () => {
//           context.save();
//           context.scale(1, -1);
//           context.rotate(-Math.PI / 2);

//           const scale =
//             Math.max(canvas.width / img.width, canvas.height / img.height) *
//             1.1;
//           const x = (canvas.width - img.width * scale) / 1.8;
//           const y = (canvas.height - img.height * scale) / 2;

//           context.drawImage(img, x, y, img.width * scale, img.height * scale);
//           context.restore();

//           // Draw text
//           context.save();
//           context.translate(canvas.width / 2 + 70, canvas.height / 2);
//           context.scale(-1, 1);
//           context.rotate(Math.PI / 2);

//           context.fillStyle = "#ffffff";
//           context.font = "bold 90px Oleo Script";
//           context.textAlign = "center";
//           context.textBaseline = "middle";

//           const text = `${textData.userName}`;
//           context.fillText(text, 0, 0);
//           context.restore();

//           const texture = new THREE.CanvasTexture(canvas);
//           texture.needsUpdate = true;
//           resolve(texture);
//         };
//         img.src = textData.image;
//       }
//     });
//   };

//   const addOverlays = () => {
//     if (modelRef.current) {
//       modelRef.current.traverse((child) => {
//         if (child.isMesh && child.name.startsWith("Screen")) {
//           const overlayMesh = new THREE.Mesh(
//             child.geometry.clone(),
//             new THREE.MeshBasicMaterial({
//               transparent: true,
//               opacity: 1.0,
//               depthTest: true,
//             })
//           );

//           overlayMesh.position.copy(child.position);
//           overlayMesh.rotation.copy(child.rotation);
//           overlayMesh.scale.copy(child.scale);
//           overlayMesh.position.z += 0.001;

//           child.parent.add(overlayMesh);
//           overlayMeshes[child.name] = overlayMesh;
//         }
//       });
//     }
//   };

//   const updateScreens = async () => {
//     await fetchUserNames();

//     // Get all screen names and shuffle them
//     const screenNames = Object.keys(overlayMeshes);
//     const shuffledScreens = [...screenNames].sort(() => Math.random() - 0.5);

//     // Reset all overlays to hide them initially
//     Object.values(overlayMeshes).forEach((mesh) => {
//       mesh.visible = false;
//     });

//     // If we have users to display
//     if (userNames.length > 0) {
//       // Select one random screen to show user data
//       const selectedScreen = shuffledScreens[0];

//       // Select one random user
//       const selectedUser =
//         userNames[Math.floor(Math.random() * userNames.length)];

//       // Create and apply texture for the selected user
//       const texture = await createTextTexture(selectedUser);
//       if (overlayMeshes[selectedScreen]) {
//         overlayMeshes[selectedScreen].material.map = texture;
//         overlayMeshes[selectedScreen].visible = true;
//         overlayMeshes[selectedScreen].material.needsUpdate = true;
//       }
//     }
//   };

//   const animate = () => {
//     animationFrameId = requestAnimationFrame(animate);
//     // No need to update uniforms for videos
//   };

//   userDataInterval = setInterval(updateScreens, 10000);

//   const cleanup = () => {
//     if (animationFrameId != null) {
//       cancelAnimationFrame(animationFrameId);
//       animationFrameId = null;
//     }
//     if (userDataInterval) {
//       clearInterval(userDataInterval);
//     }

//     // Cleanup videos
//     Object.values(videoMaterials).forEach(({ material, video }) => {
//       video.pause();
//       video.src = "";
//       video.load();
//       material.dispose();
//     });

//     // Cleanup overlays
//     Object.values(overlayMeshes).forEach((mesh) => {
//       if (mesh.material.map) {
//         mesh.material.map.dispose();
//       }
//       mesh.material.dispose();
//       mesh.removeFromParent();
//     });
//   };

//   initializeScreens();
//   addOverlays();
//   animate();
//   fetchUserNames();

//   return cleanup;
// }
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

export const initializeScreenManagement = ({ modelRef, db }) => {
  if (!modelRef?.current) {
    console.error("modelRef or modelRef.current is undefined");
    return () => {};
  }

  let currentTopUsers = [];
  let currentNewestUsers = [];
  let displayInterval = null;
  let unsubscribeFirestore = null;
  let cycleCount = 0; // Moved outside the function
  const screenMeshes = {};

  const createRankScreenContent = (rank) => ({
    userName: rank <= 4 ? `#${rank} BURNER` : "NEW BURNER",
    burnedAmount: 0,
    image: null,
    isDefault: false,
    isRankScreen: true,
  });

  const fetchUserNames = async () => {
    try {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }

      const q = query(collection(db, "results"), orderBy("createdAt", "desc"));

      unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
        const allUsers = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            userName: data.userName || "Anonymous",
            burnedAmount: Number(data.burnedAmount) || 0,
            image: data.image || null,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });

        // Get top users by burnedAmount
        const newTopUsers = [...allUsers]
          .sort((a, b) => b.burnedAmount - a.burnedAmount)
          .slice(0, 4);

        // Sort newest users by createdAt timestamp
        const newNewestUsers = [...allUsers]
          .sort((a, b) => b.createdAt - a.createdAt) // Sort in descending order (newest first)
          .slice(0, 4);

        // Debug log to verify sorting
        console.log(
          "Newest users sorted by createdAt:",
          newNewestUsers.map((user) => ({
            userName: user.userName,
            createdAt: user.createdAt.toISOString(),
            burnedAmount: user.burnedAmount,
          }))
        );

        if (
          JSON.stringify(newTopUsers) !== JSON.stringify(currentTopUsers) ||
          JSON.stringify(newNewestUsers) !== JSON.stringify(currentNewestUsers)
        ) {
          currentTopUsers = newTopUsers;
          currentNewestUsers = newNewestUsers;
          updateScreens();
        }
      });
    } catch (error) {
      console.error("Error in fetchUserNames:", error);
    }
  };

  const initializeScreens = () => {
    modelRef.current.traverse((child) => {
      if (child.isMesh && child.name.startsWith("Screen")) {
        const material = new THREE.MeshBasicMaterial({
          side: THREE.DoubleSide,
          transparent: true,
          depthWrite: false,
          depthTest: true,
          color: 0xffffff,
        });

        // Create initial texture
        const defaultContent = createDefaultScreenContent();
        const texture = createTextTexture(defaultContent);

        // Set material mapping mode for better scaling
        material.map = texture;
        material.needsUpdate = true;

        child.material = material;
        screenMeshes[child.name] = child;
      }
    });
  };

  const createDefaultScreenContent = () => ({
    userName: "Screen Available",
    burnedAmount: 0,
    image: null,
    isDefault: true,
    subtitle: "Burn to join the leaderboard", // Added subtitle for default screens
  });

  const calculateContainScale = (
    contentWidth,
    contentHeight,
    containerWidth,
    containerHeight
  ) => {
    const contentRatio = contentWidth / contentHeight;
    const containerRatio = containerWidth / containerHeight;

    if (contentRatio > containerRatio) {
      // Content is wider - scale to fit width
      return containerWidth / contentWidth;
    } else {
      // Content is taller - scale to fit height
      return containerHeight / contentHeight;
    }
  };
  const wrapText = (context, text, maxWidth) => {
    // Simple chunking approach for very long words
    if (text.length > 12 && !text.includes(" ")) {
      const chunks = [];
      for (let i = 0; i < text.length; i += 8) {
        chunks.push(text.slice(i, i + 8));
      }
      return chunks;
    }

    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + " " + words[i];
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // If any single line is still too long, chunk it
    const finalLines = [];
    lines.forEach((line) => {
      if (context.measureText(line).width > maxWidth) {
        // Break into smaller chunks
        for (let i = 0; i < line.length; i += 8) {
          finalLines.push(line.slice(i, i + 8));
        }
      } else {
        finalLines.push(line);
      }
    });

    console.log("Wrapped text into lines:", finalLines);
    return finalLines;
  };
  const createFormattedTextTexture = (userData, screenIndex, isTopScreen) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = Math.round(512 / 1.146);
    const context = canvas.getContext("2d");

    // Clear canvas
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Save context state
    context.save();

    // Center and rotate
    context.translate(canvas.height / 2, canvas.width / 2);
    context.rotate(-Math.PI / 2);

    // Calculate font size adjustment based on username length
    const calculateFontSizeAdjustment = (username) => {
      const baseLength = 12;
      const maxLength = 20;

      if (username.length <= baseLength) {
        return 1;
      } else if (username.length >= maxLength) {
        return 0.7;
      } else {
        return (
          1 - (0.3 * (username.length - baseLength)) / (maxLength - baseLength)
        );
      }
    };

    const fontSizeAdjustment = calculateFontSizeAdjustment(userData.userName);
    console.log(
      `Username: ${userData.userName}, Length: ${userData.userName.length}, Adjustment: ${fontSizeAdjustment}`
    );

    // Set up font sizes with adjustment
    const titleSize = Math.floor((canvas.height / 30) * fontSizeAdjustment);
    const userNameSize = Math.floor((canvas.height / 25) * fontSizeAdjustment);
    const burnedTextSize = Math.floor(
      (canvas.height / 32) * fontSizeAdjustment
    );
    const emojiSize = Math.floor((canvas.height / 25) * fontSizeAdjustment);
    const maxWidth = canvas.height * 0.4;

    // Prepare texts
    const rankNumber = isTopScreen ? `#${screenIndex + 1}` : "";
    const rankText = isTopScreen ? "TOP BURNER" : "NEW BURNER";
    const userName = userData.userName;
    const burnedText = `Burned ${userData.burnedAmount.toLocaleString()}`;
    const emoji = isTopScreen ? "🔥" : "🎉";

    // Set up fonts for measurement
    context.font = `bold ${titleSize}px Arial`;
    const titleHeight = titleSize * 1.2;
    const titleSpacing = titleSize * 1.4;
    const usernamePadding = titleSize * 0.8;

    // Important: Set font before measuring text for wrapping
    context.font = `${userNameSize}px Arial`;
    const wrappedUsername = wrapText(context, userName, maxWidth);
    console.log("Wrapped username lines:", wrappedUsername);

    const usernameHeight = userNameSize * 1.2 * wrappedUsername.length;

    // Calculate total height
    const totalHeight =
      (isTopScreen ? titleHeight * 2 : titleHeight) +
      usernamePadding +
      usernameHeight +
      burnedTextSize * 1.4 +
      emojiSize * 1.5;

    const maxAllowedHeight = canvas.width * 0.8;

    let adjustedUserNameSize = userNameSize;
    let adjustedBurnedTextSize = burnedTextSize;
    let adjustedEmojiSize = emojiSize;

    if (totalHeight > maxAllowedHeight) {
      const scale = maxAllowedHeight / totalHeight;
      adjustedUserNameSize = Math.floor(userNameSize * scale);
      adjustedBurnedTextSize = Math.floor(burnedTextSize * scale);
      adjustedEmojiSize = Math.floor(emojiSize * scale);
    }

    const startY = -Math.min(totalHeight, maxAllowedHeight) / 2;

    // Draw elements with proper wrapping
    if (isTopScreen) {
      context.fillStyle = "#c48901";
      context.font = `bold ${titleSize}px Arial`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(rankNumber, 0, startY + titleHeight / 2);
      context.fillText(rankText, 0, startY + titleHeight / 2 + titleSpacing);
      let currentY = startY + titleHeight * 2 + usernamePadding;

      context.fillStyle = "#FFFFFF";
      context.font = `${adjustedUserNameSize}px Arial`;

      wrappedUsername.forEach((line) => {
        context.fillText(line, 0, currentY + adjustedUserNameSize / 2);
        currentY += adjustedUserNameSize * 1.2;
      });

      context.font = `${adjustedBurnedTextSize}px Arial`;
      context.fillText(burnedText, 0, currentY + adjustedBurnedTextSize / 2);
      currentY += adjustedBurnedTextSize * 1.4;

      context.font = `${adjustedEmojiSize}px Arial`;
      context.fillText(emoji, 0, currentY + adjustedEmojiSize / 2);
    } else {
      // New burner layout (same pattern as above)
      context.fillStyle = "#00FF00";
      context.font = `bold ${titleSize}px Arial`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(rankText, 0, startY + titleHeight / 2);
      let currentY = startY + titleHeight + usernamePadding;

      context.fillStyle = "#FFFFFF";
      context.font = `${adjustedUserNameSize}px Arial`;

      wrappedUsername.forEach((line) => {
        context.fillText(line, 0, currentY + adjustedUserNameSize / 2);
        currentY += adjustedUserNameSize * 1.2;
      });

      context.font = `${adjustedBurnedTextSize}px Arial`;
      context.fillText(burnedText, 0, currentY + adjustedBurnedTextSize / 2);
      currentY += adjustedBurnedTextSize * 1.4;

      context.font = `${adjustedEmojiSize}px Arial`;
      context.fillText(emoji, 0, currentY + adjustedEmojiSize / 2);
    }

    context.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.center.set(0.5, 0.5);
    texture.offset.set(-0.05, 0.05);
    texture.repeat.set(1, 1);

    return texture;
  };

  const createTextTexture = (textData) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = Math.round(512 / 1.146);
    const context = canvas.getContext("2d");

    // Clear canvas
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Save context state
    context.save();

    // Calculate initial font sizes
    const TEXT_SCALE = 30;
    const VERTICAL_OFFSET = 25;
    let usernameFontSize = Math.floor((canvas.height / TEXT_SCALE) * 1.2);
    let burnedFontSize = Math.floor(canvas.height / (TEXT_SCALE * 1));

    // Function to measure and scale text if needed
    const measureAndScaleText = (text, fontSize, maxWidth) => {
      context.font = `bold ${fontSize}px Arial`;
      let textWidth = context.measureText(text).width;

      // If text is too wide, scale it down
      if (textWidth > maxWidth) {
        const scale = maxWidth / textWidth;
        return Math.floor(fontSize * scale);
      }
      return fontSize;
    };

    // Maximum width is 80% of the rotated canvas height (which becomes the width after rotation)
    const maxWidth = canvas.height * 0.8;

    // Scale username font if needed
    usernameFontSize = measureAndScaleText(
      textData.userName,
      usernameFontSize,
      maxWidth
    );

    // Scale burned amount font if needed
    if (!textData.isDefault) {
      const burnedText = `${textData.burnedAmount.toLocaleString()} burned`;
      burnedFontSize = measureAndScaleText(
        burnedText,
        burnedFontSize,
        maxWidth
      );
    }

    // Calculate text block height with potentially scaled fonts
    const textBlockHeight = textData.isDefault
      ? usernameFontSize
      : usernameFontSize + burnedFontSize * 1;

    const startY = -textBlockHeight / VERTICAL_OFFSET;

    // Center and rotate
    context.translate(canvas.height / 2, canvas.width / 2);
    context.rotate(-Math.PI / 2);

    // Draw text
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Draw username with scaled font
    context.font = `bold ${usernameFontSize}px Arial`;
    context.fillText(textData.userName, 0, startY + usernameFontSize / 2);

    // Draw burned amount if not default
    if (!textData.isDefault) {
      context.font = `${burnedFontSize}px Arial`;
      context.fillText(
        `${textData.burnedAmount.toLocaleString()} burned`,
        0,
        startY + usernameFontSize + burnedFontSize / 2
      );
    }

    // Debug: draw boundary box (uncomment to see text boundaries)
    // context.strokeStyle = "#FF0000";
    // context.strokeRect(-maxWidth/2, -canvas.width/2, maxWidth, canvas.width);

    context.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Set texture properties for proper centering
    texture.center.set(0.5, 0.5);
    texture.offset.set(-0.05, 0.05);
    texture.repeat.set(1, 1);

    return texture;
  };
  const createImageTexture = async (imageUrl) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";

      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = Math.round(512 / 1.146);
        const context = canvas.getContext("2d");

        // Clear canvas
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.save();

        // Center and rotate
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(-Math.PI / 2);

        // Adjust these values to change image size and position
        const WIDTH_DIVISOR = 1.8; // Increase for smaller width
        const HEIGHT_DIVISOR = 2; // Increase for smaller height
        const X_OFFSET_DIVISOR = 1.8; // Adjust horizontal position
        const Y_OFFSET_DIVISOR = 3.8; // Adjust vertical position

        // Calculate scaled dimensions
        const scale = Math.min(
          canvas.height / (image.width * HEIGHT_DIVISOR),
          canvas.width / (image.height * WIDTH_DIVISOR)
        );

        const scaledWidth = image.width * scale * 0.8;
        const scaledHeight = image.height * scale;

        // Draw image with manual positioning
        context.drawImage(
          image,
          -scaledWidth / X_OFFSET_DIVISOR, // X position
          -scaledHeight / Y_OFFSET_DIVISOR, // Y position
          scaledWidth / WIDTH_DIVISOR, // Width
          scaledHeight / HEIGHT_DIVISOR // Height
        );

        context.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        resolve(texture);
      };

      image.onerror = reject;
      image.src = imageUrl;
    });
  };
  const getTopBurnerPosition = (screenIndex) => {
    // Map physical screen positions to rank positions (unchanged)
    const positions = {
      4: 3, // Screen5 shows #1 (leftmost)
      5: 2, // Screen6 shows #2
      6: 1, // Screen7 shows #3
      7: 0, // Screen8 shows #4 (rightmost)
    };
    return positions[screenIndex];
  };

  const getNewBurnerPosition = (screenIndex) => {
    // Map physical screen positions to newest users array indices
    const positions = {
      0: 3, // Screen1 shows newest (leftmost)
      1: 2, // Screen2 shows second newest
      2: 1, // Screen3 shows third newest
      3: 0, // Screen4 shows fourth newest (rightmost)
    };
    return positions[screenIndex];
  };

  const updateScreens = async () => {
    cycleCount++;
    const showImages = cycleCount % 2 === 0;

    // Update top users (Screens 5-8)
    const paddedTopUsers = [...currentTopUsers];
    while (paddedTopUsers.length < 4) {
      paddedTopUsers.push(createDefaultScreenContent());
    }

    // Update newest users (Screens 1-4)
    const paddedNewestUsers = [...currentNewestUsers];
    while (paddedNewestUsers.length < 4) {
      paddedNewestUsers.push(createDefaultScreenContent());
    }

    // Update all screens
    for (let i = 0; i < 8; i++) {
      const screenName = `Screen${i + 1}`;
      const screen = screenMeshes[screenName];
      if (!screen) continue;

      const isTopScreen = i >= 4;

      // Get the correct user data based on screen position
      const userData = isTopScreen
        ? paddedTopUsers[getTopBurnerPosition(i)] // Use mapping for top users
        : paddedNewestUsers[getNewBurnerPosition(i)]; // Use mapping for new users

      try {
        if (screen.material.map) {
          screen.material.map.dispose();
        }

        let texture;
        if (showImages && userData.image && !userData.isDefault) {
          try {
            texture = await createImageTexture(userData.image);
          } catch (error) {
            texture = createFormattedTextTexture(
              userData,
              isTopScreen ? getTopBurnerPosition(i) : getNewBurnerPosition(i),
              isTopScreen
            );
          }
        } else {
          texture = createFormattedTextTexture(
            userData,
            isTopScreen ? getTopBurnerPosition(i) : getNewBurnerPosition(i),
            isTopScreen
          );
        }

        screen.material.map = texture;
        screen.material.needsUpdate = true;
      } catch (error) {
        console.error(`Error updating screen ${screenName}:`, error);
      }
    }
  };

  // Initialize everything
  console.log("Starting screen management initialization");
  initializeScreens();
  fetchUserNames();

  // Set up display interval (increased to account for third state)
  displayInterval = setInterval(() => {
    updateScreens();
  }, 7500);

  // Return cleanup function
  return () => {
    if (displayInterval) clearInterval(displayInterval);
    if (unsubscribeFirestore) unsubscribeFirestore();

    Object.values(screenMeshes).forEach((screen) => {
      if (screen.material.map) {
        screen.material.map.dispose();
      }
      screen.material.dispose();
    });
  };
};
