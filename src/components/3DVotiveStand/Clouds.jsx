import React, { useRef, useState, useEffect } from "react";
import { Cloud, Clouds } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

function DarkClouds() {
  const lightningRef = useRef();
  const [flash, setFlash] = useState(false);
  const [intensity, setIntensity] = useState(0);

  // Refs for cloud groups
  const cloudGroup1 = useRef();
  const cloudGroup2 = useRef();
  const cloudGroup3 = useRef();
  const cloudGroup4 = useRef();

  // Random lightning effect
  useEffect(() => {
    const interval = setInterval(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), 100 + Math.random() * 200);
    }, 2000 + Math.random() * 1000);

    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    // Lightning flash intensity
    if (flash) {
      setIntensity(5 + Math.random() * 10);
    } else {
      setIntensity((prev) => Math.max(0, prev - 0.5));
    }
    if (lightningRef.current) {
      lightningRef.current.intensity = intensity;
    }

    // ☁️ Cloud Movement Logic
    const time = state.clock.elapsedTime;

    // Gentle horizontal drift
    if (cloudGroup1.current) cloudGroup1.current.position.x += 0.01 * delta;
    if (cloudGroup2.current) cloudGroup2.current.position.x -= 0.008 * delta;
    if (cloudGroup3.current) cloudGroup3.current.position.z += 0.005 * delta;
    if (cloudGroup4.current) cloudGroup4.current.position.z -= 0.006 * delta;

    // Subtle vertical bobbing (floating effect)
    [cloudGroup1, cloudGroup2, cloudGroup3, cloudGroup4].forEach(
      (group, index) => {
        if (group.current) {
          group.current.position.y += Math.sin(time * 0.5 + index) * 0.005;
        }
      }
    );
  });

  return (
    <group>
      {/* ⚡ Lightning Source */}
      <pointLight
        ref={lightningRef}
        color={"#ffffff"}
        intensity={0}
        distance={150}
        position={[0, 50, 0]}
        decay={2}
      />

      <Clouds material={THREE.MeshLambertMaterial}>
        {/* ☁️ Cloud group 1 - center */}
        <group ref={cloudGroup1} position={[0, 45, 0]}>
          <Cloud
            seed={1}
            fade={30}
            speed={0.1}
            growth={4}
            segments={40}
            volume={6}
            opacity={0.6}
            bounds={[10, 2, 10]}
          />
          <Cloud
            seed={2}
            fade={30}
            speed={0.5}
            growth={4}
            volume={8}
            opacity={0.4}
            bounds={[8, 2, 8]}
            position={[2, 1, 2]}
          />
        </group>

        {/* ☁️ Cloud group 2 - left */}
        <group ref={cloudGroup2} position={[-20, 40, -10]}>
          <Cloud
            seed={3}
            fade={30}
            speed={0.2}
            growth={4}
            segments={40}
            volume={5}
            opacity={0.5}
            bounds={[8, 2, 8]}
          />
        </group>

        {/* ☁️ Cloud group 3 - right */}
        <group ref={cloudGroup3} position={[20, 42, 10]}>
          <Cloud
            seed={4}
            fade={30}
            speed={0.15}
            growth={4}
            segments={40}
            volume={7}
            opacity={0.5}
            bounds={[9, 2, 9]}
          />
        </group>

        {/* ☁️ Cloud group 4 - back */}
        <group ref={cloudGroup4} position={[5, 43, -15]}>
          <Cloud
            seed={5}
            fade={30}
            speed={0.1}
            growth={4}
            segments={40}
            volume={6}
            opacity={0.4}
            bounds={[7, 2, 7]}
          />
        </group>
      </Clouds>
    </group>
  );
}

export default DarkClouds;
