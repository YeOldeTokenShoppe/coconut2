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
  const textureTypes = new WeakMap();
  let displayTextures = {};
  let animationFrameId;
  let updateInterval;
  const screenTimers = {};
  const screenDurations = {};
  const screenUserMap = {};

  let unsubscribeFirestore;

  const fetchUserNames = async () => {
    try {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }

      const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
      unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
        const newUserNames = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("User data from Firestore:", data);
          return {
            userName: data.userName || "Anonymous",
            burnedAmount: data.burnedAmount || 0,
            image: data.image || null,
          };
        });

        // Only update if there are actual changes
        if (JSON.stringify(newUserNames) !== JSON.stringify(userNames)) {
          console.log("New user data detected, updating screens");
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
    console.log("Creating texture for user data:", textData);
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext("2d");

      // Add wrapText function here
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

      // Background
      context.fillStyle = "#000033";
      context.fillRect(0, 0, canvas.width, canvas.height);

      if (textData.image) {
        const img = new Image();
        img.onload = () => {
          console.log("Avatar image loaded:", textData.image);
          drawTextAndAvatar(img);
        };
        img.onerror = (err) => {
          console.error("Error loading avatar image:", err);
          drawTextAndAvatar(null);
        };
        img.src = textData.image;
        console.log("Attempting to load image:", textData.image);
      } else {
        drawTextAndAvatar(null);
      }

      function drawTextAndAvatar(img) {
        // In the drawTextAndAvatar function:
        if (img) {
          context.save();

          const avatarX = canvas.width * 0.22; // Or whatever your current value is
          const avatarY = canvas.height * 0.5;
          const avatarRadius = 110;

          // Draw border first
          context.beginPath();
          context.arc(avatarX, avatarY, avatarRadius + 3.8, 0, Math.PI * 2.5); // Slightly larger for border
          context.fillStyle = "#000000"; // Black border
          context.fill();
          // Move to where we want the center of rotation to be
          context.translate(avatarX, avatarY);

          // Rotate 90 degrees clockwise (Math.PI/2)
          context.rotate(Math.PI / 0.67);
          context.scale(-1, 1);

          // Move back
          context.translate(-avatarX, -avatarY);

          // Create circular clipping path for avatar (after rotation)
          context.beginPath();
          context.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
          context.clip();

          // Draw avatar image
          context.drawImage(
            img,
            avatarX - avatarRadius,
            avatarY - avatarRadius,
            avatarRadius * 2,
            avatarRadius * 2
          );
          context.restore();
        }

        // Rest of your drawing code...
        context.save();
        context.translate(canvas.width / 2, canvas.height / 2);
        context.scale(1, -1);
        context.rotate(Math.PI / -2);

        // const text = `${textData.userName} staked ${textData.burnedAmount} tokens`;
        const text = `${textData.userName}`;
        const fontSize = 80;
        context.font = `bold ${fontSize}px Arial`;
        context.textAlign = "center";
        context.textBaseline = "middle";

        const maxWidth = 450;
        const lines = wrapText(text, maxWidth);
        const lineHeight = 80;

        context.shadowColor = "#4a9eff";
        context.shadowBlur = 4;
        context.fillStyle = "#ffffff";

        lines.forEach((line, i) => {
          const yPos = (i - (lines.length - 1) / 2) * lineHeight + 20;
          context.fillText(line, 0, yPos);
        });

        context.restore();

        const texture = new THREE.CanvasTexture(canvas);
        textureTypes.set(texture, "text");
        texture.needsUpdate = true;
        resolve(texture);
      }
    });
  };

  const cyberpunkShader = {
    uniforms: {
      tDiffuse: { value: null },
      individualTime: { value: 0 },
      timeOffset: { value: 0 },
      glowAmount: { value: 0.01 },
      anaglyphOffset: { value: 0.004 },
      glitchIntensity: { value: 0.001 },
      isText: { value: false },
      colorScheme: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float individualTime;
    uniform bool isText;
    uniform int colorScheme;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

void main() {
      vec2 uv = vUv;
      
      if (isText) {
        vec4 originalColor = texture2D(tDiffuse, uv);
        
         // Check for avatar area first
        vec2 avatarCenter = vec2(0.5, 0.8);  // Your current position
        vec2 rotatedUV = vec2(uv.y, 1.0 - uv.x);
        float dist = distance(rotatedUV, avatarCenter);
        float avatarRadius = 0.2;
        
            if (dist < avatarRadius) {
          // Just return the original texture color with no effects
          gl_FragColor = texture2D(tDiffuse, uv);
          return;
        }

        vec4 color = vec4(0.0, 0.0, 0.2, 1.0);
        
        // Base 3D effect
        float offset = 0.02 * (sin(individualTime * 1.5) * 0.2 + 0.8);
        vec4 redColor = texture2D(tDiffuse, uv + vec2(offset, 0.0));
        vec4 blueColor = texture2D(tDiffuse, uv - vec2(offset, 0.0));
        
        if (colorScheme == 0) {
          color = vec4(
            redColor.r * 2.0,
            0.0,
            blueColor.b * 2.0,
            max(redColor.a, blueColor.a)
          );
        } else if (colorScheme == 1) {
          color = vec4(
            blueColor.b * 1.5,
            redColor.r * 1.5,
            redColor.r * 0.3,
            max(redColor.a, blueColor.a)
          );
        } else {
          float intensity = (redColor.r + blueColor.b) * 0.0001;
          color = vec4(
            intensity * 0.1,
            intensity * 0.6,
            intensity * 0.1,
            max(redColor.a, blueColor.a)
          );
        }

        // Rest of your original effects...
        float timeSlice = floor(individualTime * 8.0);
        float strongGlitch = rand(vec2(timeSlice, 0.0));
        float weakGlitch = rand(vec2(timeSlice * 2.0, 0.0));
        
      if (strongGlitch > 0.85) {
          float glitchOffset = 0.1 * rand(vec2(individualTime));
          vec2 glitchUv = uv + vec2(glitchOffset, 0.0);
          vec4 glitchColor = texture2D(tDiffuse, glitchUv);
          
          if (colorScheme == 2) {
            // Terminal-style glitch
            float glitchIntensity = (glitchColor.r + glitchColor.b) * 1.5;
            glitchColor = vec4(
              glitchIntensity * 0.2,
              glitchIntensity * 1.4,
              glitchIntensity * 0.2,
              glitchColor.a
            );
          }
          
          if (rand(vec2(timeSlice, 1.0)) > 0.5) {
            if (colorScheme == 0) {
              color.r = glitchColor.r;
              color.b = texture2D(tDiffuse, glitchUv - vec2(0.05, 0.0)).b;
            } else if (colorScheme == 1) {
              color.rg = glitchColor.rg;
              color.b = texture2D(tDiffuse, glitchUv - vec2(0.05, 0.0)).b;
            } else {
              // Terminal glitch keeps the green theme
              color = glitchColor;
            }
          } else {
            color = mix(color, glitchColor, 0.7);
          }
        }


        float noise = rand(uv + vec2(individualTime)) * 0.01;
        if (colorScheme == 2) {
          color.rgb += noise * vec3(0.0, 0.1, 0.0);
        } else {
          color.rgb += noise * vec3(0.1, 0.0, 0.2);
        }

        gl_FragColor = color;
      } else {
        gl_FragColor = texture2D(tDiffuse, uv);
      }
    }
`,
  };

  const createVideoTexture = (videoSrc) => {
    const video = document.createElement("video");
    video.src = videoSrc;
    video.loop = true;
    video.muted = true;
    video.play();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        video.pause();
      } else {
        video.play().catch((e) => console.log("Playback failed:", e));
      }
    });

    // Create an intermediary canvas
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    const texture = new THREE.CanvasTexture(canvas);
    textureTypes.set(texture, "video"); // Mark as video
    texture.center.set(0.5, 0.5);

    let animationFrameId;
    function updateCanvasTexture() {
      if (video.readyState === video.HAVE_ENOUGH_DATA && !document.hidden) {
        context.save();
        context.translate(canvas.width / 2, canvas.height / 2);
        context.scale(1, -1);
        context.rotate(Math.PI / -2);
        context.translate(-canvas.width / 2, -canvas.height / 2);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.restore();
        texture.needsUpdate = true;
      }
      animationFrameId = requestAnimationFrame(updateCanvasTexture);
    }
    updateCanvasTexture();

    // Add cleanup function
    texture.dispose = () => {
      cancelAnimationFrame(animationFrameId);
      video.pause();
      video.remove();
    };

    return texture;
  };
  const createShaderMaterial = (screenName, isText = false) => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        ...cyberpunkShader.uniforms,
        tDiffuse: { value: null },
        isText: { value: isText },
        individualTime: { value: 0.0 },
        colorScheme: { value: Math.floor(Math.random() * 3) }, // Random 0, 1, or 2
      },
      vertexShader: cyberpunkShader.vertexShader,
      fragmentShader: cyberpunkShader.fragmentShader,
      transparent: true,
    });

    screenTimers[screenName] = {
      speed: 0.5 + Math.random() * 1.0,
      offset: Math.random() * 10000,
      lastUpdate: performance.now(),
    };

    shaderMaterials[screenName] = material;
    return material;
  };
  const assignRandomContent = async (screen, usedUsers) => {
    // Chance of documents vs video appearance
    if (Math.random() < 0.8 && userNames.length > 0) {
      const availableUsers = userNames.filter((user) => !usedUsers.has(user));
      if (availableUsers.length > 0) {
        const randomUser =
          availableUsers[Math.floor(Math.random() * availableUsers.length)];
        console.log(`Assigning user to ${screen}:`, randomUser); // Add this log
        usedUsers.add(randomUser);
        screenUserMap[screen] = randomUser;
        return await createTextTexture(randomUser);
      }
    }

    delete screenUserMap[screen];
    const randomIndex = Math.floor(Math.random() * videoSources.length);
    return createVideoTexture(videoSources[randomIndex]);
  };
  const updateScreens = async () => {
    await fetchUserNames();
    const usedUsers = new Set();

    for (let screenName in displayTextures) {
      if (screenName !== "Screen1") {
        // Skip Screen1
        const newTexture = await assignRandomContent(screenName, usedUsers);

        if (modelRef.current) {
          modelRef.current.traverse((child) => {
            if (child.name === screenName) {
              const material = shaderMaterials[screenName];
              material.uniforms.tDiffuse.value = newTexture;
              material.uniforms.isText.value =
                textureTypes.get(newTexture) === "text";
              material.needsUpdate = true;
            }
          });
        }
        displayTextures[screenName] = newTexture;
      }
    }
  };
  const initializeScreens = async () => {
    await fetchUserNames();
    const usedUsers = new Set();

    displayTextures = {
      Screen1: assignRandomContent("Screen1", usedUsers),
      Screen2: assignRandomContent("Screen2", usedUsers),
      Screen3: assignRandomContent("Screen3", usedUsers),
      Screen4: assignRandomContent("Screen4", usedUsers),
      Screen5: assignRandomContent("Screen5", usedUsers),
      Screen6: assignRandomContent("Screen6", usedUsers),
    };

    const testMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        
        float map(vec2 p) {
          return length(p) - 0.2;
        }
        
        void main() {
          vec2 uv = (vUv * 4.0 - 0.5) * 2.0;
          vec3 col = vec3(0.0);
          float animTime = time * 0.25;
          float frequency = 1.0;

          for(float j = 0.0; j < 3.0; j++) {
            for(float i = 1.0; i < 8.0; i++) {
              uv.x += (0.2 / (i + j) * sin(i * atan(time) * 2.0 * uv.y + (time * 0.1) + i * j));
              uv.y += (1.0 / (i + j) * cos(i * 0.6 * uv.x + (time * 0.25) + i * j));
              float angle = time * 0.1;
              mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
              uv = rotation * uv;
            }
            vec3 newColor = vec3(
              0.5 * sin(frequency * uv.x + animTime) + 0.5,
              0.5 * sin(frequency * uv.y + animTime + 2.0) + 0.5,
              sin(frequency * (uv.x + uv.y) + animTime + 4.0)
            );
            newColor = pow(newColor, vec3(2.0));
            col += newColor;
          }
          col /= 3.0;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    shaderMaterials["Screen1"] = testMaterial;

    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.name === "Screen1") {
          child.material = testMaterial;
        } else if (
          child.isMesh &&
          child.material &&
          child.name.startsWith("Screen")
        ) {
          const texture = displayTextures[child.name];
          const isText = textureTypes.get(texture) === "text";
          const shaderMaterial = createShaderMaterial(child.name, isText);
          shaderMaterial.uniforms.tDiffuse.value = texture;
          child.material = shaderMaterial;
        }
      });
    }
  };
  const shaderMaterials = {};

  // Animation loop to update shader uniforms
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    const currentTime = performance.now();

    // Update standard screens
    for (let screenName in shaderMaterials) {
      const material = shaderMaterials[screenName];
      if (screenName === "Screen1") {
        material.uniforms.time.value = currentTime * 0.001;
      } else {
        const timer = screenTimers[screenName];
        const deltaTime = (currentTime - timer.lastUpdate) / 1000;
        timer.lastUpdate = currentTime;
        const screenTime = (currentTime * timer.speed) / 1000 + timer.offset;
        material.uniforms.individualTime.value = screenTime;
      }
    }
  };
  const cleanup = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
    Object.values(displayTextures).forEach((texture) => {
      if (texture.dispose) texture.dispose();
    });
    Object.values(shaderMaterials).forEach((material) => material.dispose());
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  };

  initializeScreens();
  animate();
  updateInterval = setInterval(updateScreens, 10000);

  return cleanup; // Return cleanup function for component unmounting
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
