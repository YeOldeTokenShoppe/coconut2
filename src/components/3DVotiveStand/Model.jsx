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
}) {
  const gltf = useGLTF("/slimUltima4.glb");
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
  // const statueFace = scene.getObjectByName("Statue_Face");
  // const facePosition = new THREE.Vector3();

  // if (statueFace) {
  //   statueFace.getWorldPosition(facePosition);
  //   console.log("Statue_Face world position:", facePosition);
  // } else {
  //   console.error("Statue_Face not found in the scene.");
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

  // Play Animation (Take 001

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
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    if (!modelRef.current) return;

    let meltingCount = 0;

    modelRef.current.traverse((child) => {
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
        const MIN_SCALE = 0.015; // Change this value to set minimum height percentage

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
      onPointerMove={(e) => handlePointerMove(e.nativeEvent)}
      onClick={(e) => handlePointerMove(e.nativeEvent)}
    />
  );
}

export default Model;
