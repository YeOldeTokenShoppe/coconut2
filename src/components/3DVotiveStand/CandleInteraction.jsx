import React, { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function FloatingCandleViewer({ isVisible, onClose, userData }) {
  if (!isVisible) return null;

  const handleClick = (e) => {
    // Prevent single clicks from propagating
    e.stopPropagation();
  };

  const handleDoubleClick = (e) => {
    // Close viewer on double click
    e.stopPropagation();
    onClose();
  };

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
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Prevent clicks on canvas from closing the viewer */}
      <div
        style={{
          width: "60vw",
          height: "80vh",
          borderRadius: "10px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Canvas
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "10px",
          }}
          gl={{ alpha: true }}
          camera={{ position: [0, 1, 5], fov: 45 }}
        >
          <SceneContent userData={userData} />
        </Canvas>
      </div>
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

  const createDynamicTextTexture = (text, userData) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext("2d");

    // Clear canvas and set background
    context.fillStyle = "#F5F5DC"; // Beige background
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Save the current context state
    context.save();

    // Flip the context
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(Math.PI);
    context.translate(-canvas.width / 2, -canvas.height / 2);

    // Configure text with darker color and bold font
    context.fillStyle = "#000000"; // Pure black for maximum contrast
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "bold 32px UnifrakturCook"; // Made text bold

    // Format the text
    const formattedText = text.replace(
      "{userName}",
      userData.userName || "Friend"
    );

    // Handle text wrapping
    const maxWidth = 400;
    const lineHeight = 40;
    const words = formattedText.split(" ");
    let lines = [];
    let currentLine = "";

    context.font = "32px UnifrakturCook";

    words.forEach((word) => {
      const testLine = currentLine + word + " ";
      const metrics = context.measureText(testLine);

      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = word + " ";
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine);

    // Draw the wrapped text
    const startY = (canvas.height - lines.length * lineHeight) / 2;
    lines.forEach((line, index) => {
      // Add text stroke for even more contrast
      context.strokeStyle = "#000000";
      context.lineWidth = 2;
      context.strokeText(line, canvas.width / 2, startY + index * lineHeight);
      context.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  };

  const applyDynamicTextToLabel = (scene, userData) => {
    if (!scene || !userData) return;

    let labelMesh = null;
    scene.traverse((child) => {
      if (child.name.includes("Label1")) {
        // Note: Looking for Label1 here
        labelMesh = child;
        console.log("Found Label1 mesh:", child.name);
      }
    });

    if (labelMesh) {
      // Create dynamic text content
      const dynamicText = `On behalf of {userName},\n\nmay the light of Our Lady of Perepetual Profit illuminate the path to prosperity.`;

      const texture = createDynamicTextTexture(dynamicText, userData);

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.3,
        metalness: 0.2,
        roughness: 0.8,
      });

      if (labelMesh.material) {
        if (labelMesh.material.map) {
          labelMesh.material.map.dispose();
        }
        labelMesh.material.dispose();
      }

      labelMesh.material = material;
      labelMesh.material.needsUpdate = true;
    }
  };

  useEffect(() => {
    if (!candleRef.current) return;

    // Compute bounding box to find center
    const box = new THREE.Box3().setFromObject(candleRef.current);
    const center = box.getCenter(new THREE.Vector3());

    // Adjust OrbitControls target to the center
    if (controlsRef.current) {
      controlsRef.current.target.set(center.x, center.y, center.z);
      controlsRef.current.update();
    }

    // Apply image to Label2
    if (userData?.image) {
      applyUserImageToLabel(scene, userData.image);
    }

    // Apply dynamic text to Label1
    applyDynamicTextToLabel(scene, userData);

    // Control flame visibility
    scene.traverse((child) => {
      if (child.name.startsWith("FLAME")) {
        const isDefaultCandle =
          userData?.userName === "Triumph" &&
          userData?.message === "In memory of triumph";
        child.visible = !isDefaultCandle;
      }
    });
  }, [scene, userData]);

  return (
    <>
      <group ref={candleRef} scale={1.5}>
        <primitive object={scene} />
        <ambientLight intensity={0.8} />
        <pointLight position={[2, 2, 2]} intensity={0.5} />
        <pointLight position={[-2, 1, -2]} intensity={0.3} color="#ff7f50" />
        <pointLight position={[0, 3, 3]} intensity={0.3} color="#ffffff" />
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
