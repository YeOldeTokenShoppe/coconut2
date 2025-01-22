import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { initializeScreenManagement } from "./modelUtilities";
import Scene from "../3dChandelier";

function RoomWalls({ db }) {
  // Add db as a prop
  const doorRef = useRef();
  const shelfRef = useRef();
  const portalMaterial = useRef();
  const modelRef = useRef();

  const roomSize = 22;
  const wallHeight = 10;
  const frameWidth = 5;
  const frameHeight = 7;
  const heightOffset = 9;

  const offsets = {
    back: { x: 0, y: 1 },
    left: { x: 2, y: 5 },
    right: { x: -1, y: 1 },
  };

  const portal = useGLTF("/portal4.glb");
  const wallShelf = useGLTF("/eightMonitors.glb");

  useEffect(() => {
    // Clone the wallShelf scene to avoid modifying the cached model
    if (wallShelf.scene) {
      const clonedScene = wallShelf.scene.clone();
      modelRef.current = clonedScene;

      // Initialize screen management with the cloned scene
      const cleanup = initializeScreenManagement({
        modelRef: modelRef,
        db: db,
      });

      return () => {
        if (cleanup) {
          cleanup();
        }
        // Clean up the cloned scene
        if (modelRef.current) {
          modelRef.current.traverse((child) => {
            if (child.geometry) {
              child.geometry.dispose();
            }
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
        }
      };
    }
  }, [wallShelf.scene, db]);

  useFrame((state, delta) => {
    if (portalMaterial.current?.uniforms?.uTime) {
      portalMaterial.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <group position={[0, heightOffset, 0]}>
      {/* Portal/Door */}

      {/* Walls */}
      <group renderOrder={2}>
        {/* Back wall */}
        <mesh
          position={[
            offsets.back.x - 6,
            wallHeight / 2 + offsets.back.y + 2,
            -roomSize / 2,
          ]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[frameWidth, frameHeight]} />
          <meshBasicMaterial
            map={new THREE.TextureLoader().load("/sgframed.png")}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
          <group ref={shelfRef}>
            {/* Use the modelRef for the wallShelf */}
            <primitive
              object={modelRef.current || wallShelf.scene}
              scale={[5.5, 5.5, 5.5]}
              position={[
                -roomSize / 2 + 2,
                wallHeight / 2 + offsets.left.y - 4,
                -5,
              ]}
              rotation={[-Math.PI, 0, 0]}
            />
          </group>
        </mesh>

        <mesh
          position={[
            -roomSize / 2,
            wallHeight / 2 + offsets.left.y,
            offsets.left.x,
          ]}
          rotation={[0, Math.PI / 2, 0]}
          renderOrder={1} // Set the rendering order
        >
          <planeGeometry args={[frameWidth, frameHeight]} />
          <meshBasicMaterial
            map={new THREE.TextureLoader().load("/sgframed2.png")}
            transparent
            side={THREE.DoubleSide}
            depthTest={false} // Disable depth testing
            depthWrite={false} // Prevent writing to the depth buffer
          />
        </mesh>

        {/* Right wall */}
        <mesh
          position={[
            roomSize / 2,
            wallHeight / 2 + offsets.left.y,
            offsets.right.x,
          ]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[frameWidth, frameHeight]} />
          <meshBasicMaterial
            map={new THREE.TextureLoader().load("/sgframed3.png")}
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
