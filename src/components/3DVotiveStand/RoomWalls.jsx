import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

function RoomWalls() {
  const doorRef = useRef();
  const shelfRef = useRef();
  const portalMaterial = useRef();

  const roomSize = 22;
  const wallHeight = 10;
  const frameWidth = 5;
  const frameHeight = 7;
  const heightOffset = 9;

  const offsets = {
    back: { x: -2, y: 1 },
    left: { x: 2, y: 1 },
    right: { x: -1, y: 1 },
  };

  const portal = useGLTF("/portal4.glb");
  const wallShelf = useGLTF("/wallShelf.glb");

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
            offsets.back.x - 4,
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
            map={new THREE.TextureLoader().load("/sgframed2.png")}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Right wall */}
        <mesh
          position={[
            roomSize / 2,
            wallHeight / 2 + offsets.right.y,
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

      {/* Shelf */}
      {/* <group ref={shelfRef}>
        <primitive
          object={wallShelf.scene}
          scale={[1.5, 1.5, 1.5]}
          position={[
            -roomSize / 2 + 1,
            wallHeight / 2 + offsets.left.y - 3.2,
            offsets.left.x,
          ]}
          rotation={[0, Math.PI / 2, 0]} // Face the correct wall
        />
      </group> */}
    </group>
  );
}

export default RoomWalls;
