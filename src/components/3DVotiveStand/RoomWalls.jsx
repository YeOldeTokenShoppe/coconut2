import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { shaderMaterial } from "@react-three/drei";
import { ShaderMaterial } from "three";
import { extend, useFrame } from "@react-three/fiber";
import portalVertexShader from "../3DVotiveStand/shaders/vertex.glsl";
import portalFragmentShader from "../3DVotiveStand/shaders/fragment.glsl";

const portalMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0.0 }, // Wrap primitive values in an object with "value"
    uColorStart: { value: new THREE.Color(0xffffff) }, // Color uniforms need "value"
    uColorEnd: { value: new THREE.Color(0xdd58dd) },
  },
  vertexShader: portalVertexShader, // Updated vertex shader
  fragmentShader: portalFragmentShader, // Existing fragment shader
});

extend({ portalMaterial });

function RoomWalls() {
  const doorRef = useRef();
  const portalMaterial = useRef();

  const roomSize = 30;
  const wallHeight = 10;
  const frameWidth = 5;
  const frameHeight = 7;
  const heightOffset = 7;

  const offsets = {
    back: { x: -2, y: 1 },
    left: { x: 2, y: 1 },
    right: { x: -1, y: 0 },
  };

  useFrame((state, delta) => {
    if (portalMaterial.current?.uniforms?.uTime) {
      portalMaterial.current.uniforms.uTime.value += delta;
    }
  });

  useEffect(() => {
    const loader = new GLTFLoader();

    loader.load("/portal4.glb", (gltf) => {
      const scene = gltf.scene;

      // Setup door
      scene.scale.set(5, 5, 5);
      scene.position.set(roomSize / 2, -6.5, offsets.right.x + 7);
      scene.rotation.y = -Math.PI;

      // Find portalLight and create a new material for it
      const portalLight = scene.getObjectByName("portalLight");
      if (portalLight) {
        // Create ShaderMaterial
        const shaderMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0.0 },
            uColorStart: { value: new THREE.Color(0xff0000) },
            uColorEnd: { value: new THREE.Color(0x402da9) },
          },
          vertexShader: portalVertexShader,
          fragmentShader: portalFragmentShader,
          side: THREE.DoubleSide,
        });

        portalLight.material = shaderMaterial;

        // Store shaderMaterial for animation
        portalMaterial.current = shaderMaterial;
      }

      if (doorRef.current) {
        doorRef.current.add(scene);
      }
    });
  }, [roomSize, offsets.right.x]);

  const createWallMaterial = (imagePath) => {
    const texture = new THREE.TextureLoader().load(imagePath);
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false, // Add this
      depthTest: true, // Add this
      alphaTest: 0.1, // Add this
    });
  };

  return (
    <group position={[0, heightOffset, 0]}>
      {/* Portal/Door first */}
      <group ref={doorRef} renderOrder={1} />

      {/* Then walls with explicit render order */}
      <group renderOrder={2}>
        {/* Back wall */}
        <mesh
          position={[
            offsets.back.x,
            wallHeight / 2 + offsets.back.y,
            -roomSize / 2,
          ]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[frameWidth, frameHeight]} />
          <meshBasicMaterial
            map={createWallMaterial("/sgframed.png").map}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Left wall */}
        <mesh
          position={[
            -roomSize / 2,
            wallHeight / 2 + offsets.left.y,
            offsets.left.x,
          ]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[frameWidth, frameHeight]} />
          <meshBasicMaterial
            map={createWallMaterial("/sgframed.png").map}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

export default RoomWalls;
