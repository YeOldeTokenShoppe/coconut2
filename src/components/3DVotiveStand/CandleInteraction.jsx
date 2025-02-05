import React, { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function FloatingCandleViewer({ isVisible, onClose, userData }) {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
      onClick={onClose}
    >
      <Canvas
        style={{
          width: "60vw",
          height: "80vh",
          borderRadius: "10px",
        }}
        gl={{ alpha: true }}
        camera={{ position: [0, 1, 5], fov: 45 }}
      >
        <SceneContent userData={userData} />
      </Canvas>
    </div>
  );
}

function SceneContent({ userData }) {
  const { scene } = useGLTF("/singleCandle.glb");
  const candleRef = useRef();
  const controlsRef = useRef();

  const applyUserImageToLabel = (scene, imageUrl) => {
    if (!scene || !imageUrl) return;

    let labelMesh = null;
    scene.traverse((child) => {
      if (child.name.includes("Label2")) {
        labelMesh = child;
        console.log("Found Label2 mesh:", child.name);
      }
    });

    if (labelMesh) {
      const textureLoader = new THREE.TextureLoader();

      textureLoader.load(
        imageUrl,
        (texture) => {
          // Enhanced material settings
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.5,
            emissiveMap: texture,
            metalness: 0.3,
            roughness: 0.2,
          });

          texture.encoding = THREE.sRGBEncoding;
          texture.flipY = false;
          texture.needsUpdate = true;

          if (labelMesh.material) {
            if (labelMesh.material.map) {
              labelMesh.material.map.dispose();
            }
            labelMesh.material.dispose();
          }

          labelMesh.material = material;
          labelMesh.material.needsUpdate = true;
        },
        undefined,
        (error) => console.error("Error loading texture:", error)
      );
    }
  };

  useEffect(() => {
    if (!candleRef.current) return;

    // Compute bounding box to find center
    const box = new THREE.Box3().setFromObject(candleRef.current);
    const center = box.getCenter(new THREE.Vector3());

    // Adjust OrbitControls target to the center of the candle
    if (controlsRef.current) {
      controlsRef.current.target.set(center.x, center.y, center.z);
      controlsRef.current.update();
    }

    // Apply image if available
    if (userData?.image) {
      applyUserImageToLabel(scene, userData.image);
    }
  }, [scene, userData]); // Run effect when scene or userData changes

  return (
    <>
      <group ref={candleRef} scale={1.5}>
        <primitive object={scene} />
        <ambientLight intensity={0.8} />
        <pointLight position={[2, 2, 2]} intensity={1.5} />
        <pointLight position={[-2, 1, -2]} intensity={0.8} color="#ff7f50" />
        <pointLight position={[0, 3, 3]} intensity={1.2} color="#ffffff" />
      </group>
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={false}
        minDistance={2}
        maxDistance={10}
      />
    </>
  );
}

useGLTF.preload("/singleCandle.glb");

export default FloatingCandleViewer;
