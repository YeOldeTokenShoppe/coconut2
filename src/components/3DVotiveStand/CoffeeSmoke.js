import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import coffeeSmokeVertexShader from "./shaders/coffeeSmoke/vertex.glsl";
import coffeeSmokeFragmentShader from "./shaders/coffeeSmoke/fragment.glsl";

const CoffeeSmoke = ({
  position = [11.5, 9, -4.9],
  scale = [0.75, 3, 0.75],
}) => {
  const smokeRef = useRef();
  const textureLoader = new THREE.TextureLoader();
  const perlinTexture = textureLoader.load("/perlin.png");

  // Ensure texture wraps correctly
  perlinTexture.wrapS = THREE.RepeatWrapping;
  perlinTexture.wrapT = THREE.RepeatWrapping;

  // Shader Material
  const smokeMaterial = new THREE.ShaderMaterial({
    vertexShader: coffeeSmokeVertexShader,
    fragmentShader: coffeeSmokeFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uPerlinTexture: { value: perlinTexture },
    },
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  });

  useFrame(({ clock }) => {
    if (smokeRef.current) {
      smokeMaterial.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={smokeRef} position={position} scale={scale}>
      <planeGeometry args={[1, 1, 16, 64]} />
      <primitive object={smokeMaterial} attach="material" />
    </mesh>
  );
};

export default CoffeeSmoke;
