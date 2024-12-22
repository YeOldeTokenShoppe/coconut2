import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

const MobileModel = () => {
  const modelRef = useRef();
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const startTime = performance.now();

    gltfLoader.load(
      "/ultimaMobile.glb",
      (gltf) => {
        const loadTime = ((performance.now() - startTime) / 1000).toFixed(2);

        // Analyze the model
        let totalVertices = 0;
        let totalFaces = 0;
        let textureCount = 0;
        let materialCount = 0;

        gltf.scene.traverse((node) => {
          if (node.isMesh) {
            totalVertices += node.geometry.attributes.position.count;
            totalFaces += node.geometry.index
              ? node.geometry.index.count / 3
              : 0;

            if (node.material) {
              materialCount++;
              if (node.material.map) textureCount++;
              node.material.precision = "lowp";
            }
          }
        });

        const analysisText = `=== Mobile Model Analysis ===
Load Time: ${loadTime} seconds
Vertices: ${totalVertices.toLocaleString()}
Faces: ${totalFaces.toLocaleString()}
Materials: ${materialCount}
Textures: ${textureCount}
Estimated Memory: ~${Math.round((totalVertices * 12) / 1024 / 1024)}MB
========================`;

        console.log(analysisText);
        setAnalysis(analysisText);
        modelRef.current = gltf.scene;
      },
      (xhr) => {
        console.log(`Loading: ${((xhr.loaded / xhr.total) * 100).toFixed(1)}%`);
      },
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    return () => {
      dracoLoader.dispose();
    };
  }, []);

  if (!modelRef.current) return null;
  return (
    <primitive ref={modelRef} object={modelRef.current} position={[0, 0, 0]} />
  );
};

const MobileModelViewer = () => {
  const [analysis, setAnalysis] = useState(null);

  const downloadAnalysis = () => {
    if (!analysis) return;

    const blob = new Blob([analysis], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mobile-model-analysis.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        {analysis && (
          <button
            onClick={downloadAnalysis}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Download Analysis
          </button>
        )}
      </div>
      <div className="h-96" style={{ aspectRatio: "1 / 1" }}>
        <Canvas
          gl={{
            powerPreference: "high-performance",
            antialias: false,
            precision: "lowp",
            alpha: false,
            stencil: false,
            depth: true,
          }}
          camera={{ position: [0, 1, 5], fov: 50 }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <MobileModel setAnalysis={setAnalysis} />
          <OrbitControls
            enableDamping={false}
            rotateSpeed={0.5}
            maxDistance={8}
            minDistance={2}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default MobileModelViewer;
