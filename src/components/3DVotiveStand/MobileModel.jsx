import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { rotate } from "three/src/nodes/TSL.js";
import PostProcessingEffects from "./PostProcessingEffects";

const MOBILE_CAMERA_SETTINGS = {
  position: [0, 6, 12], // Raised Y position
  fov: 50,
  near: 0.1,
  far: 200,
};

const MOBILE_CONTROL_SETTINGS = {
  enableZoom: true,
  enablePan: false,
  enableRotate: true,
  maxPolarAngle: Math.PI * 0.65,
  minPolarAngle: Math.PI * 0.25,
  maxDistance: 20,
  minDistance: 4,
  rotateSpeed: 0.7,
  zoomSpeed: 0.8,
  target: [0, 4, 0], // Raised target point
};

function MobileModel({ scale, setTooltipData }) {
  const gltf = useGLTF("/mobileVersion.glb");
  const modelRef = useRef();
  const controlsRef = useRef();
  const { camera, viewport, size } = useThree();

  // Initialize camera position
  useEffect(() => {
    if (camera) {
      camera.position.set(
        MOBILE_CAMERA_SETTINGS.position[0],
        MOBILE_CAMERA_SETTINGS.position[1],
        MOBILE_CAMERA_SETTINGS.position[2]
      );
      camera.fov = MOBILE_CAMERA_SETTINGS.fov;
      camera.near = MOBILE_CAMERA_SETTINGS.near;
      camera.far = MOBILE_CAMERA_SETTINGS.far;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  // Center the model and set up camera
  useEffect(() => {
    if (!modelRef.current) return;

    // Calculate model bounds
    const box = new THREE.Box3().setFromObject(modelRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    console.log("Model dimensions:", {
      size: size.toArray(),
      center: center.toArray(),
      originalPosition: modelRef.current.position.toArray(),
    });

    // Center the model
    modelRef.current.position.set(-center.x, -center.y + size.y / 2, -center.z);

    console.log("New position:", modelRef.current.position.toArray());

    // Update camera and controls
    if (camera && controlsRef?.current) {
      const distance = size.length() * 1.5;
      camera.position.set(0, size.y / 2, distance);
      camera.lookAt(0, size.y / 2, 0);
      camera.updateProjectionMatrix();

      controlsRef.current.target.set(0, size.y / 2, 0);
      controlsRef.current.update();

      console.log("Camera setup:", {
        position: camera.position.toArray(),
        target: controlsRef.current.target.toArray(),
        distance,
      });
    }
  }, [camera, modelRef.current]);

  // Handle mobile interactions
  const handleMobileInteraction = (event) => {
    if (!camera || !modelRef.current) return;

    // R3F provides normalized device coordinates directly
    const mouse = new THREE.Vector2(event.point.x, event.point.y);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Only check for candle intersections
    const candleObjects = [];
    modelRef.current.traverse((object) => {
      if (
        object.name.startsWith("ZCandle") ||
        object.name.startsWith("ZFlame")
      ) {
        candleObjects.push(object);
      }
    });

    const intersects = raycaster.intersectObjects(candleObjects, true);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      const candleNumber = intersectedObject.name.match(/\d+/)?.[0];

      if (candleNumber) {
        const zCandle = modelRef.current.getObjectByName(
          `ZCandle${candleNumber}`
        );

        if (zCandle?.userData?.isMelting) {
          const worldPos = new THREE.Vector3();
          zCandle.getWorldPosition(worldPos);
          worldPos.project(camera);

          // Convert to screen coordinates
          const x = ((worldPos.x + 1) * size.width) / 2;
          const y = ((-worldPos.y + 1) * size.height) / 2;

          setTooltipData([
            {
              userName: zCandle.userData?.userName || "Anonymous",
              position: { x, y },
            },
          ]);
          return;
        }
      }
    }
    setTooltipData([]);
  };

  return (
    <>
      <primitive
        ref={modelRef}
        object={gltf.scene}
        scale={scale}
        position={[0, 9, -1]}
        rotation={[0, Math.PI * 0.1, 0]}
        onClick={(e) => {
          e.stopPropagation();
          handleMobileInteraction(e);
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          handleMobileInteraction(e);
        }}
      />
      <PostProcessingEffects />

      <OrbitControls
        ref={controlsRef}
        {...MOBILE_CONTROL_SETTINGS}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />

      {/* Mobile-optimized lighting */}
      <ambientLight intensity={1} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.5}
        castShadow={false}
      />
    </>
  );
}

// Preload the mobile model
useGLTF.preload("/mobileVersion.glb");

export default MobileModel;
