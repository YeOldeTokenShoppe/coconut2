import { useEffect, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { DEFAULT_CAMERA } from "./defaultCamera"; // Centralized configuration
import { getScreenCategory } from "./screenCategories"; // Dynamic screen detection

function FlyInEffect({ cameraRef, duration = 4 }) {
  const animationCompleted = useRef(false); // Track if animation has completed

  // Fetch responsive camera settings dynamically
  const getResponsivePositions = () => {
    const screenCategory = getScreenCategory(); // Detect screen category
    const settings = DEFAULT_CAMERA[screenCategory];

    if (settings) {
      return {
        targetPosition: settings.position, // From configuration
        targetLookAt: settings.target, // From configuration
        fov: settings.fov, // From configuration
        useFlyIn: screenCategory !== "phone-small", // Skip fly-in for phones
      };
    }

    // Fallback to desktop-medium
    return {
      targetPosition: DEFAULT_CAMERA["desktop-medium"].position,
      targetLookAt: DEFAULT_CAMERA["desktop-medium"].target,
      fov: DEFAULT_CAMERA["desktop-medium"].fov,
      useFlyIn: true,
    };
  };

  useEffect(() => {
    if (!cameraRef.current || animationCompleted.current) return;

    const camera = cameraRef.current;
    animationCompleted.current = true;

    // Get responsive positions
    const { targetPosition, targetLookAt, useFlyIn } = getResponsivePositions();

    // Directly set camera for phone screens
    if (!useFlyIn) {
      camera.position.set(...targetPosition);
      camera.lookAt(new THREE.Vector3(...targetLookAt));
      return;
    }

    // Initial Camera Setup for Fly-In
    const startDistance = 40; // Starting far away, can be dynamic if needed
    camera.position.set(startDistance, startDistance, startDistance);

    const tempLookAt = new THREE.Vector3();

    // GSAP Animation for Camera Position
    gsap.to(camera.position, {
      x: targetPosition[0],
      y: targetPosition[1],
      z: targetPosition[2],
      duration,
      ease: "power2.inOut",
      onUpdate: () => {
        tempLookAt.lerp(new THREE.Vector3(...targetLookAt), 0.1);
        camera.lookAt(tempLookAt);
      },
      onComplete: () => {
        camera.lookAt(new THREE.Vector3(...targetLookAt));
      },
    });
  }, [cameraRef, duration]);

  return null;
}

export default FlyInEffect;
