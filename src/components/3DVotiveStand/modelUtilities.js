// modelUtils.js
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

  // Marker Circle
  const markerGeometry = new THREE.CircleGeometry(0.15, 32);
  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
  });
  const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
  container.add(markerMesh);

  // Marker Border (with emissive glow)
  const borderGeometry = new THREE.RingGeometry(0.16, 0.2, 32);
  const borderMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00, // Base yellow color
    emissive: 0xffff00, // Yellow glow
    emissiveIntensity: 1, // Glow strength
    side: THREE.DoubleSide,
  });
  const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
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
    // Pulse Effect (scale oscillation)
    pulseTime += 0.05; // Adjust speed
    const scale = 1 + Math.sin(pulseTime) * 0.2; // Adjust amplitude
    borderMesh.scale.set(scale, scale, scale);

    // Glow Effect (emissive intensity oscillation)
    borderMaterial.emissiveIntensity = 0.8 + Math.sin(pulseTime) * 0.2; // Between 0.6 and 1.0
  };

  return container;
};
export const setupVideoTextures = (modelRef) => {
  const createVideoTexture = () => {
    const video = document.createElement("video");
    video.src = "/noise.mp4";
    video.loop = true;
    video.muted = true;
    video.play();

    const texture = new THREE.VideoTexture(video);
    texture.center.set(0.5, 0.5);
    texture.rotation = Math.PI / 2;
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    texture.needsUpdate = true;
    return texture;
  };

  const videoTextures = {
    Screen1: createVideoTexture(),
    Screen2: createVideoTexture(),
    Screen3: createVideoTexture(),
    Screen4: createVideoTexture(),
    Screen5: createVideoTexture(),
    Screen6: createVideoTexture(),
  };

  modelRef.current.traverse((child) => {
    if (child.isMesh && child.material && child.name.startsWith("Screen")) {
      const newMaterial = new THREE.MeshStandardMaterial();
      newMaterial.map = videoTextures[child.name];
      newMaterial.needsUpdate = true;
      child.material = newMaterial;
    }
  });
};

export const handleCandlesAndFlames = (modelRef, userData) => {
  const candleIndexes = Array.from({ length: 52 }, (_, i) => i);
  const assignedIndexes = [];
  while (assignedIndexes.length < userData.length) {
    const randomIndex = Math.floor(Math.random() * candleIndexes.length);
    assignedIndexes.push(candleIndexes.splice(randomIndex, 1)[0]);
  }

  const candlePositions = new Map();
  let userIndex = 0;

  // Handle candles
  modelRef.current.traverse((child) => {
    if (child.name.startsWith("ZCandle")) {
      child.visible = true;
      const candleIndex = parseInt(child.name.replace("ZCandle", ""), 10);

      if (
        assignedIndexes.includes(candleIndex) &&
        userIndex < userData.length
      ) {
        const user = userData[userIndex];
        if (user) {
          child.userData.isMelting = true;
          child.userData.initialHeight = child.scale.y;
          child.userData.userName = user.userName;
          candlePositions.set(candleIndex, {
            x: child.position.x,
            y: child.position.y,
            z: child.position.z,
            userName: user.userName,
          });
          userIndex++;
        }
      }
    }
  });

  // Handle flames
  modelRef.current.traverse((child) => {
    if (child.name.startsWith("ZFlame")) {
      child.visible = false;
      const flameIndex = parseInt(child.name.replace("ZFlame", ""), 10);

      if (
        assignedIndexes.includes(flameIndex) &&
        assignedIndexes.indexOf(flameIndex) < userData.length
      ) {
        const correspondingUser = userData[assignedIndexes.indexOf(flameIndex)];
        const candlePos = candlePositions.get(flameIndex);

        if (candlePos) {
          child.visible = true;
          child.userData.isFlame = true;
          child.userData.userName = correspondingUser.userName;
          child.position.set(candlePos.x, candlePos.y, candlePos.z);

          const debugSphere = createDebugSphere(
            candlePos,
            child,
            correspondingUser,
            flameIndex
          );
          child.userData.debugSphere = debugSphere;
          modelRef.current.add(debugSphere);
        }
      }
    }
  });
};

const createDebugSphere = (candlePos, flameObj, user, flameIndex) => {
  const debugGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const debugMaterial = new THREE.MeshBasicMaterial({
    color: "black",
    transparent: true,
    opacity: 0,
    depthTest: false,
    depthWrite: false,
  });

  const debugSphere = new THREE.Mesh(debugGeometry, debugMaterial);
  debugSphere.position.set(
    candlePos.x,
    candlePos.y + flameObj.scale.y * 10 + 0.2,
    candlePos.z
  );

  debugSphere.raycast = THREE.Mesh.prototype.raycast;
  debugSphere.userData = {
    userName: user.userName,
    candleIndex: flameIndex,
    isDebugSphere: true,
  };
  debugSphere.renderOrder = 999;

  return debugSphere;
};
