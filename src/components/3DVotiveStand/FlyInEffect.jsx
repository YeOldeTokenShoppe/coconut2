import { useEffect, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";

function FlyInEffect({ cameraRef, duration = 4 }) {
  const animationCompleted = useRef(false); // Track if animation has completed

  const isPhoneScreen = () => {
    return window.innerWidth < 768; // Define phone screens as <768px width
  };

  // Function to determine camera positions dynamically
  const getResponsivePositions = () => {
    const screenWidth = window.innerWidth;

    if (screenWidth < 768) {
      // Mobile
      return {
        targetPosition: [8.64, 9.3, 12.9], // Static position for phone screens
        targetLookAt: [-0.07, 5.6, -0.55],
        fov: 60,
        useFlyIn: false, // Skip fly-in effect
      };
    } else if (screenWidth < 1200) {
      // Tablet
      return {
        targetPosition: [4.8, 4.94, 13.9],
        targetLookAt: [0, 0, 0],
        fov: 79.6,
        useFlyIn: true,
      };
    } else {
      // Desktop
      return {
        targetPosition: [-5.95, 5.4, 16.86],
        targetLookAt: [4.8, 5.4, 0],
        fov: 43.5,
        useFlyIn: true,
      };
    }
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
    camera.position.set(40, 40, 40); // Starting far away

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
