import React, { useEffect, useState, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { DEFAULT_MARKERS } from "./markers";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../utilities/firebaseClient";
import {
  createMarkerFace,
  setupVideoTextures,
  handleCandles,
} from "./modelUtilities";

function Model({
  scale,
  setTooltipData,
  controlsRef,
  setCamera,
  setMarkers,
  markers,
  modelRef,
  moveCamera,
  rotation,
  handlePointerMove,
  onButtonClick,
}) {
  const gltf = useGLTF("/slimUltima5.glb");
  const { actions, mixer } = useAnimations(gltf.animations, modelRef);
  const { camera, size } = useThree();
  const [results, setResults] = useState([]);
  const [shuffledResults, setShuffledResults] = useState([]);
  const [shuffledCandleIndices, setShuffledCandleIndices] = useState([]);
  const mixerRef = useRef();
  const scene = gltf.scene;

  // Center and align model
  useEffect(() => {
    if (!modelRef.current) return;

    const box = new THREE.Box3().setFromObject(modelRef.current);
    const center = box.getCenter(new THREE.Vector3());
    modelRef.current.position.sub(center); // Center the model
    modelRef.current.position.y += box.getSize(new THREE.Vector3()).y / 2; // Align to ground

    if (controlsRef?.current) {
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  }, [controlsRef]);

  // Use this to find the position of a specific object in the scene
  // const Button1 = scene.getObjectByName("Button1");
  // const ButtonPosition = new THREE.Vector3();

  // if (Button1) {
  //   Button1.getWorldPosition(ButtonPosition);
  //   console.log("Button world position:", ButtonPosition);
  // } else {
  //   console.error("ButtonPosition not found in the scene.");
  // }

  useEffect(() => {
    if (typeof setMarkers === "function") {
      setMarkers(DEFAULT_MARKERS);
    }
  }, [setMarkers]);

  // In Model.jsx
  useEffect(() => {
    if (!modelRef.current) return;

    setupVideoTextures(modelRef);

    const markerRefs = [];

    markers.forEach((marker, index) => {
      try {
        const markerFace = createMarkerFace(index);
        markerFace.position.copy(marker.position);

        // Ensure these properties are set
        markerFace.isMarker = true;
        markerFace.markerIndex = index;

        if (gltf.scene) {
          gltf.scene.add(markerFace);
          markerRefs.push(markerFace);
        }
      } catch (error) {
        console.error("Error adding marker:", error);
      }
    });

    const updateMarkers = () => {
      markerRefs.forEach((marker) => {
        if (marker && camera) {
          const markerWorldPos = new THREE.Vector3();
          marker.getWorldPosition(markerWorldPos);

          const cameraWorldPos = new THREE.Vector3();
          camera.getWorldPosition(cameraWorldPos);

          const direction = cameraWorldPos.clone().sub(markerWorldPos);
          const rotationMatrix = new THREE.Matrix4();
          rotationMatrix.lookAt(
            direction,
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 1, 0)
          );
          marker.setRotationFromMatrix(rotationMatrix);
        }
      });
    };

    let animationId;
    const animate = () => {
      updateMarkers();
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      markerRefs.forEach((marker) => {
        if (marker && marker.parent) {
          marker.parent.remove(marker);
        }
      });
    };
  }, [markers, camera, gltf.scene]);
  const createCandleShaderMaterial = (colorOffset, timeScale, offsetX) => {
    return new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        offsetX: { value: offsetX },
        colorOffset: { value: colorOffset },
        timeScale: { value: timeScale },
        emission: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;
        uniform float offsetX;
        uniform vec3 colorOffset;
        uniform float timeScale;
        uniform float emission; 
        varying vec2 vUv;
  
        void main() {
          vec2 uv = vUv;
          uv.y = 1.0 - uv.y;
          uv.x += offsetX;
  
          // Modify the base colors with colorOffset and timeScale
          vec3 col = vec3(
            0.4 + 0.35 * cos(iTime * timeScale * 0.7 + uv.x + 4.5 + colorOffset.x),
            0.15 + 0.15 * cos(iTime * timeScale * 0.7 + uv.x + 2.0 + colorOffset.y),
            0.5 + 0.45 * cos(iTime * timeScale * 0.7 + uv.x + 7.0 + colorOffset.z)
          );
  
    // Candle body (now green)
    float c = smoothstep(0.13, 0.10, abs(0.5 - uv.x));
    c *= smoothstep(0.6, 0.59, abs(uv.y));
    col += vec3(0.0, c * 0.5, 0.0); // Green candle

    // Flame (reduced intensity)
if (uv.y > 0.60) { // Only calculate the flame for the upper half
    float f = smoothstep(0.04, 0.00, 
        sin(uv.y * 12.0 + 2.1) * 0.02 + 
        abs((0.5 + sin(uv.y * 9.1 + iTime) * 0.01) - uv.x));
    col += vec3(f * 1.0, f * 2.0, f * 0.0);
}

    // Output final color
    col += col * emission; 
    gl_FragColor = vec4(col, 1.0);
}
        
      `,
    });
  };

  // Create materials array with variations
  const shaderMaterials = [
    createCandleShaderMaterial(new THREE.Vector3(0.0, 0.0, 0.0), 1.0, 0.3), // Original
    createCandleShaderMaterial(new THREE.Vector3(1.2, 0.5, 0.8), 0.85, 0.32), // Warmer
    createCandleShaderMaterial(new THREE.Vector3(0.5, 0.8, 1.5), 1.15, 0.28), // Cooler
    createCandleShaderMaterial(new THREE.Vector3(0.3, 1.0, 0.2), 0.95, 0.31), // Nature
    createCandleShaderMaterial(new THREE.Vector3(1.0, 0.2, 1.0), 1.05, 0.29), // Mystical
    createCandleShaderMaterial(new THREE.Vector3(0.2, 0.7, 1.2), 0.9, 0.33), // Ocean
    createCandleShaderMaterial(new THREE.Vector3(1.4, 0.3, 0.5), 1.1, 0.27), // Sunset
    createCandleShaderMaterial(new THREE.Vector3(0.7, 0.9, 0.6), 0.98, 0.3), // Forest
  ];

  // Add this to your Model component
  const handleButtonClick = (buttonNumber) => {
    if (!modelRef.current) return;

    // Find the corresponding Selection mesh
    const selectionMesh = modelRef.current.getObjectByName(
      `Selection${buttonNumber}`
    );
    if (selectionMesh && selectionMesh.material) {
      // Animate the emission value
      gsap.to(selectionMesh.material.uniforms.emission, {
        value: 1,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          // Fade back to normal
          gsap.to(selectionMesh.material.uniforms.emission, {
            value: 0,
            duration: 0.5,
            ease: "power2.in",
          });
        },
      });
    }
  };

  useEffect(() => {
    if (gltf.animations.length) {
      mixerRef.current = new THREE.AnimationMixer(gltf.scene);
      const animationClip = gltf.animations.find((clip) =>
        clip.name.startsWith("Take 001")
      );
      if (animationClip) {
        const action = mixerRef.current.clipAction(animationClip);
        action.play();
      }
    }
  }, [gltf]);

  useEffect(() => {
    if (!modelRef.current) return;

    modelRef.current.traverse((child) => {
      if (child.name.startsWith("Selection")) {
        // Get the index from the selection name (1-based to 0-based)
        const index = parseInt(child.name.replace("Selection", "")) - 1;
        if (index >= 0 && index < shaderMaterials.length) {
          child.material = shaderMaterials[index];
        }
      }
    });
  }, [modelRef]);

  // You can temporarily add this to your Model component to log screen positions:
  // useEffect(() => {
  //   if (!modelRef.current) return;
  //   modelRef.current.traverse((object) => {
  //     if (object.name.startsWith("Screen")) {
  //       const position = new THREE.Vector3();
  //       object.getWorldPosition(position);
  //       console.log(`${object.name} position:`, position);
  //     }
  //   });
  // }, [modelRef]);
  // useEffect(() => {
  //   const video = document.createElement("video");
  //   video.src = "colaCandle1.mp4"; // Path to your MP4 file
  //   video.loop = true;
  //   video.muted = true;
  //   video.play();

  //   const videoTexture = new THREE.VideoTexture(video);
  //   videoTexture.minFilter = THREE.LinearFilter;
  //   videoTexture.magFilter = THREE.LinearFilter;
  //   videoTexture.format = THREE.RGBFormat;

  //   // Adjust the video texture scaling
  //   videoTexture.repeat.set(6.06 / 0.56, 1); // Scale horizontally
  //   videoTexture.offset.set(0, 0); // Optional: adjust centering
  //   videoTexture.wrapS = THREE.ClampToEdgeWrapping;
  //   videoTexture.wrapT = THREE.ClampToEdgeWrapping;

  //   // Apply the video texture to the mesh
  //   modelRef.current.traverse((child) => {
  //     if (child.name === "Selection1") {
  //       const videoMaterial = new THREE.MeshBasicMaterial({
  //         map: videoTexture,
  //       });

  //       child.material = videoMaterial;

  //       // Scale the mesh to match the video aspect ratio
  //       child.scale.set(1, 0.56 / 6.06, 1);
  //     }
  //   });
  // }, [modelRef]);

  // Fetch results from Firestore
  useEffect(() => {
    const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedResults = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        userName: doc.data().userName || "Anonymous",
        burnedAmount: doc.data().burnedAmount || 1,
      }));
      setResults(fetchedResults);
    });
    return () => unsubscribe();
  }, []);

  // Assign Candles and Flames

  useEffect(() => {
    if (results.length === 0 || !modelRef.current) return;

    const shuffled = [...results].sort(() => Math.random() - 0.5);

    // Create indices for assignment (52 candles)
    const candleIndexes = Array.from({ length: 52 }, (_, i) => i);
    const assignedIndices = candleIndexes
      .sort(() => Math.random() - 0.5)
      .slice(0, shuffled.length);

    // First, reset ALL candles and flames to unassigned state
    modelRef.current.traverse((child) => {
      if (child.name.startsWith("ZCandle")) {
        // Reset candle state
        child.userData = {
          isMelting: false,
          initialHeight: child.scale.y,
          userName: "Anonymous",
          burnedAmount: 1,
          meltingProgress: undefined, // Clear any previous melting progress
        };
      } else if (child.name.startsWith("ZFlame")) {
        // Reset all flames to invisible first
        child.visible = false;
      }
    });

    // Then assign only the selected candles
    modelRef.current.traverse((child) => {
      if (child.name.startsWith("ZCandle")) {
        const candleIndex = parseInt(child.name.replace("ZCandle", ""), 10);
        const userIndex = assignedIndices.indexOf(candleIndex);

        if (userIndex !== -1) {
          const user = shuffled[userIndex];
          child.userData = {
            isMelting: true,
            initialHeight: child.scale.y,
            userName: user.userName,
            burnedAmount: user.burnedAmount || 1,
            meltingProgress: 0, // Initialize melting progress
          };
        }
      }
      // Handle flame visibility
      else if (child.name.startsWith("ZFlame")) {
        const flameIndex = parseInt(child.name.replace("ZFlame", ""), 10);
        child.visible = assignedIndices.includes(flameIndex);
      }
    });

    setShuffledResults(shuffled);
  }, [results, modelRef]);
  // Handle Melting Effect and Tooltips
  useFrame((state, delta) => {
    const { clock } = state; // Access the clock from the state

    if (mixerRef.current) {
      mixerRef.current.update(delta); // Update the mixer
    }

    if (!modelRef.current) return;

    let meltingCount = 0;

    modelRef.current.traverse((child) => {
      if (
        child.name.startsWith("Selection") &&
        child.material.uniforms?.iTime
      ) {
        child.material.uniforms.iTime.value = clock.getElapsedTime();
      }

      // Handle melting logic for ZCandle objects
      if (
        child.name.startsWith("ZCandle") &&
        child.userData?.isMelting === true
      ) {
        meltingCount++;

        // Initialize melting progress and originalScale if not set
        if (!child.userData.originalScale) {
          child.userData = {
            ...child.userData,
            meltingProgress: 0,
            originalScale: {
              x: child.scale.x,
              y: child.scale.y,
              z: child.scale.z,
            },
          };
        }

        // Update melting progress
        child.userData.meltingProgress += delta;

        const burnAmount = child.userData.burnedAmount || 1;
        const meltingSpeed = 0.01;

        // Calculate the desired minimum scale (e.g., 0.01 for 1% of original height)
        const MIN_SCALE = 0.1; // Change this value to set minimum height percentage

        // Calculate scale directly as a percentage of original height
        const percentageRemaining = Math.max(
          1 - meltingSpeed * child.userData.meltingProgress,
          MIN_SCALE
        );

        // Store original values before change
        const oldScale = child.scale.y;

        // Only proceed if we have valid originalScale
        if (child.userData.originalScale?.y) {
          // Apply new scale
          child.scale.y = child.userData.originalScale.y * percentageRemaining;
        }
      }
    });
  });
  // Set Markers
  useEffect(() => {
    if (typeof setMarkers === "function") setMarkers(DEFAULT_MARKERS);
  }, [setMarkers]);

  return (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      position={[0, 0, 0]}
      scale={scale}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        handlePointerMove(e.nativeEvent);
        console.log("Model clicked:", e.object.name);
      }}
      // onClick={(e) => {
      //   e.stopPropagation();
      //   handlePointerMove(e.nativeEvent);
      // }}
      onPointerMove={(e) => handlePointerMove(e.nativeEvent)}
    />
  );
}

export default Model;
