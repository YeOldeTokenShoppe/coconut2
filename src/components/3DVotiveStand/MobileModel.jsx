import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import PostProcessingEffects from "./PostProcessingEffects";
import FlyInEffect2 from "./FlyInEffect2";
import CameraGUI from "./CameraGUI";

const MOBILE_CAMERA_SETTINGS = {
  position: [-6.86, 13.3, 12.19],
  fov: 103,
  near: 0.1,
  far: 200,
};

const MOBILE_CONTROL_SETTINGS = {
  enableZoom: false,
  enablePan: false,
  enableRotate: true,
  maxPolarAngle: Math.PI * 0.65,
  minPolarAngle: Math.PI * 0.25,
  maxDistance: 20,
  minDistance: 4,
  rotateSpeed: 0.6,
  zoomSpeed: 0.8,
  target: [-3, 22, -8.4],
};

function MobileModel({ scale, setTooltipData }) {
  const gltf = useGLTF("/mobileVersion.glb");
  const modelRef = useRef();
  const controlsRef = useRef();
  const { camera, viewport, size } = useThree();
  const mixerRef = useRef();
  const { actions, mixer } = useAnimations(gltf.animations, modelRef);
  const cameraRef = useRef(camera);

  // Initialize camera position
  useEffect(() => {
    if (camera) {
      // Don't set initial position here anymore, let FlyInEffect2 handle it
      camera.fov = MOBILE_CAMERA_SETTINGS.fov;
      camera.near = MOBILE_CAMERA_SETTINGS.near;
      camera.far = MOBILE_CAMERA_SETTINGS.far;
      camera.updateProjectionMatrix();
      cameraRef.current = camera; // Update camera reference
    }
  }, [camera]);

  // Center the model and set up camera
  useEffect(() => {
    if (!modelRef.current) return;

    // Calculate model bounds
    const box = new THREE.Box3().setFromObject(modelRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center the model
    modelRef.current.position.set(-center.x, -center.y + size.y / 2, -center.z);

    if (controlsRef?.current) {
      controlsRef.current.target.set(0, size.y / 2, 0);
      controlsRef.current.update();
    }
  }, [camera, modelRef.current]);

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

  useFrame((state, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
  });

  // Handle mobile interactions
  const handleMobileInteraction = (event) => {
    if (!camera || !modelRef.current) return;

    const mouse = new THREE.Vector2(event.point.x, event.point.y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

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
        scale={7}
        position={[0, 8.3, -0.5]}
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
      <FlyInEffect2 cameraRef={cameraRef} duration={8} />
      <OrbitControls
        ref={controlsRef}
        {...MOBILE_CONTROL_SETTINGS}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />
      <CameraGUI
        cameraRef={cameraRef}
        controlsRef={controlsRef}
        onGuiStart={() => {}}
        onGuiEnd={() => {}}
      />
      <ambientLight intensity={1} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.5}
        castShadow={false}
      />
    </>
  );
}

useGLTF.preload("/mobileVersion.glb");

export default MobileModel;
