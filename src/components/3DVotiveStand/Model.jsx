// Model.jsx
import React, { useEffect, useState, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { DEFAULT_MARKERS } from "./markers";
import {
  createMarkerFace,
  setupVideoTextures,
  handleCandlesAndFlames,
} from "./modelUtilities";

function Model({
  url,
  scale,
  userData = [],
  setTooltipData,
  setIsLoading,
  controlsRef,
  setActiveAnnotation,
  modelRef,
  handlePointerMove,
  setCamera,
  setMarkers,
  markers,
  moveCamera,
  rotation,
}) {
  const gltf = useGLTF("/ultima15.glb");
  const { actions, mixer } = useAnimations(gltf.animations, modelRef);
  const { camera } = useThree();

  useEffect(() => {
    if (!modelRef.current) return;

    const box = new THREE.Box3().setFromObject(modelRef.current);
    const center = box.getCenter(new THREE.Vector3());
    modelRef.current.position.sub(center); // Center the model
    modelRef.current.position.y += box.getSize(new THREE.Vector3()).y / 2; // Adjust for ground alignment

    // Only update OrbitControls if not modified by the GUI
    if (controlsRef?.current && !controlsRef.current.targetSetByGUI) {
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  }, [controlsRef]);

  useEffect(() => {
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = box.getCenter(new THREE.Vector3());
      console.log("Model center:", center);
    }
  }, [modelRef]);

  useEffect(() => {
    setCamera(camera);
  }, [controlsRef.current, camera, setCamera]);
  useEffect(() => {
    setCamera(camera);
  }, [controlsRef.current, camera, setCamera]);

  const mixerRef = useRef();

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

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

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

          // Log marker creation
          console.log("Created marker:", index, markerFace);
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
