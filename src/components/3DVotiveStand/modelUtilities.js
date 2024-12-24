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
  const videoSources = ["/1.mp4", "/2.mp4", "/3.mp4", "/4.mp4"];
  let userNames = [];

  const fetchUserNames = async () => {
    try {
      const resultsRef = collection(db, "results");
      const querySnapshot = await getDocs(resultsRef);
      userNames = querySnapshot.docs.map((doc) => ({
        userName: doc.data().userName || "Anonymous",
        burnedAmount: doc.data().burnedAmount || 0,
      }));
    } catch (error) {
      console.error("Error fetching Firestore data:", error);
      userNames = [{ userName: "Error loading data", burnedAmount: 0 }];
    }
  };

  const createVideoTexture = (videoSrc) => {
    const video = document.createElement("video");
    video.src = videoSrc;
    video.loop = true;
    video.muted = true;
    video.play();

    const texture = new THREE.VideoTexture(video);
    texture.center.set(0.5, 0.5);
    texture.rotation = Math.PI / 2;
    texture.repeat.set(-1, 1);
    texture.offset.set(0, 0);
    texture.needsUpdate = true;
    return texture;
  };

  const createTextTexture = (textData) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#ffffff";
    context.font = "bold 78px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";

    const text = `${textData.userName} staked ${textData.burnedAmount} tokens`;
    // Function to wrap text
    const wrapText = (text, maxWidth) => {
      const words = text.split(" ");
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const width = context.measureText(currentLine + " " + words[i]).width;
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

    context.save();
    context.translate(canvas.width / 2, canvas.height / 2 - 50);
    context.scale(-1, 1);
    const maxWidth = 550; // Adjust this value to control wrap width
    const lines = wrapText(text, maxWidth);
    const lineHeight = 88; // Adjust line spacing

    lines.forEach((line, i) => {
      const yPos = (i - (lines.length - 1) / 2) * lineHeight;
      context.fillText(line, 0, yPos);
    });

    context.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.center.set(0.5, 0.5);
    texture.rotation = Math.PI / 2;
    texture.needsUpdate = true;
    return texture;
  };

  const assignRandomContent = (screen, usedUsers) => {
    if (Math.random() < 0.5 && userNames.length > 0) {
      // Filter out already used users
      const availableUsers = userNames.filter((user) => !usedUsers.has(user));
      if (availableUsers.length > 0) {
        const randomUser =
          availableUsers[Math.floor(Math.random() * availableUsers.length)];
        usedUsers.add(randomUser); // Mark user as used
        return createTextTexture(randomUser);
      }
    }

    // If no users are available or random decision is for a video
    const randomIndex = Math.floor(Math.random() * videoSources.length);
    return createVideoTexture(videoSources[randomIndex]);
  };

  let displayTextures = {};

  const updateScreens = async () => {
    await fetchUserNames();

    // Track used users for this update
    const usedUsers = new Set();

    for (let screenName in displayTextures) {
      const newTexture = assignRandomContent(screenName, usedUsers);

      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          if (child.name === screenName) {
            child.material.map = newTexture;
            child.material.needsUpdate = true;
          }
        });
      }
      displayTextures[screenName] = newTexture;
    }
  };

  const initializeScreens = async () => {
    await fetchUserNames();

    // Track used users for initialization
    const usedUsers = new Set();

    displayTextures = {
      Screen1: assignRandomContent("Screen1", usedUsers),
      Screen2: assignRandomContent("Screen2", usedUsers),
      Screen3: assignRandomContent("Screen3", usedUsers),
      Screen4: assignRandomContent("Screen4", usedUsers),
      Screen5: assignRandomContent("Screen5", usedUsers),
      Screen6: assignRandomContent("Screen6", usedUsers),
    };

    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.material && child.name.startsWith("Screen")) {
          const newMaterial = new THREE.MeshStandardMaterial();
          newMaterial.map = displayTextures[child.name];
          newMaterial.needsUpdate = true;
          child.material = newMaterial;
        }
      });
    }
  };

  initializeScreens();
  setInterval(updateScreens, 10000);
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
