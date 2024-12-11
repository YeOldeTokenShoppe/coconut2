import React, { useRef, useEffect, useCallback, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  Physics,
  RigidBody,
  useSphericalJoint,
  RapierRigidBody,
  useRapier,
} from "@react-three/rapier";
import * as THREE from "three";
import gsap from "gsap";

const ChandelierModel = React.forwardRef(({ url, visible }, ref) => {
  const { scene } = useGLTF(url);
  const gltf = useGLTF(url);
  const mixerRef = useRef();
  const materialsRef = useRef([]);

  // Set up materials once when model loads
  useEffect(() => {
    materialsRef.current = [];
    scene.traverse((child) => {
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            mat.transparent = true;
            mat.opacity = visible ? 1 : 0;
            materialsRef.current.push(mat);
          });
        } else {
          child.material.transparent = true;
          child.material.opacity = visible ? 1 : 0;
          materialsRef.current.push(child.material);
        }
      }
    });
  }, [scene]);

  // Handle visibility changes
  useEffect(() => {
    materialsRef.current.forEach((material) => {
      gsap.killTweensOf(material); // Kill any existing tweens
      gsap.to(material, {
        opacity: visible ? 1 : 0,
        duration: 2.5,
        ease: "power2.inOut",
      });
    });

    return () => {
      materialsRef.current.forEach((material) => {
        gsap.killTweensOf(material);
      });
    };
  }, [visible]);

  // Handle animations
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

  return <primitive ref={ref} object={scene} />;
});

function PhysicsChandelier({ url, visible = true }) {
  const bodyA = useRef(null);
  const bodyB = useRef(null);
  const draftTimeRef = useRef(0);
  const modelRef = useRef();

  useSphericalJoint(bodyA, bodyB, [
    [0, 0, 0],
    [0, 2.5, 0],
  ]);
  const handlePointerDown = (e) => {
    e.stopPropagation();
    console.log("Chandelier clicked!");
    // Add behavior for taps here, such as highlighting the object
  };

  useFrame((state, delta) => {
    draftTimeRef.current += delta;

    if (bodyB.current) {
      const baseStrength = 0.00005;
      const gustChance = 0.03;
      const gustMultiplier = 0.00002;

      const xWave = Math.sin(draftTimeRef.current * 0.5) * baseStrength;
      const zWave = Math.cos(draftTimeRef.current * 0.5) * baseStrength;

      bodyB.current.addForce({ x: xWave, y: 0, z: zWave }, true);

      // if (Math.random() < gustChance) {
      //   const gustStrength = baseStrength * gustMultiplier;
      //   const randomGustX = (Math.random() - 0.5) * 0.2 * gustStrength;
      //   const randomGustZ = (Math.random() - 0.5) * 0.2 * gustStrength;

      //   bodyB.current.applyImpulse(
      //     { x: randomGustX, y: 0, z: randomGustZ },
      //     true
      //   );
      // }
      // Random gentle rotation
      const rotationStrength = 0.0001; // Adjust for stronger or weaker rotations
      const xRotation = Math.sin(draftTimeRef.current * 0.6) * rotationStrength;
      const zRotation = Math.cos(draftTimeRef.current * 0.4) * rotationStrength;

      bodyB.current.addTorque({ x: xRotation, y: 0, z: zRotation }, true);

      // Occasional random rotational gusts
      if (Math.random() < gustChance) {
        const gustRotationStrength = rotationStrength * gustMultiplier;
        const randomRotationX =
          (Math.random() - 0.5) * 0.2 * gustRotationStrength;
        const randomRotationZ =
          (Math.random() - 0.5) * 0.2 * gustRotationStrength;

        bodyB.current.applyTorqueImpulse(
          { x: randomRotationX, y: 0, z: randomRotationZ },
          true
        );
      }
    }
  });

  useEffect(() => {
    if (modelRef.current) {
      // Traverse all materials in the model and animate their opacity
      modelRef.current.traverse((child) => {
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.transparent = true;
              gsap.to(mat, {
                opacity: visible ? 1 : 0,
                duration: 1,
                ease: "power2.inOut",
              });
            });
          } else {
            child.material.transparent = true;
            gsap.to(child.material, {
              opacity: visible ? 1 : 0,
              duration: 1.5,
              ease: "power2.inOut",
            });
          }
        }
      });
    }
  }, [visible]);
  return (
    <group>
      <RigidBody
        ref={bodyA}
        type="fixed"
        mass={0}
        position={[0, 1.5, 0]}
        colliders={false}
        enabledTranslations={[false, false, false]}
      >
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </RigidBody>

      <RigidBody
        ref={bodyB}
        position={[0.0, -2.5, 0]}
        colliders="trimesh"
        type="dynamic"
        enabledTranslations={[true, true, true]}
        enabledRotations={[true, true, true]}
        friction={0.9}
        restitution={0.2}
        mass={10}
        // massProperties={{ inertia: [-0.01, 0.1, 0.1] }}
        linearDamping={1.5}
        angularDamping={1.5}
        canSleep={false}
      >
        <group>
          <ChandelierModel url={url} visible={visible} />
        </group>
      </RigidBody>
    </group>
  );
}

function Scene({ visible = true }) {
  return (
    <div
      className="canvas-container"
      style={{
        position: "absolute",
        top: "-2rem",
        // inset: 0, // This sets left, right, top, bottom to 0
        margin: "auto",
        height: "35vh",
        width: "100%",
        maxWidth: "100vw",
      }}
    >
      <Canvas
        camera={{
          position: [0, -3, 6],
          fov: 25,
          near: 0.1,
          far: 100,
        }}
        style={{
          width: "100%",
          height: "100%",
          contain: "layout paint size", // Improve performance and prevent overflow
        }}
      >
        <ambientLight intensity={0.9} />
        {/* <gridHelper args={[10, 10]} /> */}
        <Physics gravity={[0, -20, 0]}>
          <PhysicsChandelier url="/chandelier2.glb" visible={visible} />
        </Physics>
        <OrbitControls
          minPolarAngle={Math.PI * 0.5}
          maxPolarAngle={-Math.PI * 0.5}
          enableZoom={false}
        />
      </Canvas>
    </div>
  );
}
export default Scene;
