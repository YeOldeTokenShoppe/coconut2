"use client";

import { useEffect, useRef, useState } from "react";
import { EffectComposer, GodRays } from "@react-three/postprocessing";
import { Sparkles } from "@react-three/drei";
import { BlendFunction } from "@react-three/postprocessing";
import * as THREE from "three";
import { useControls } from "leva";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";

const GodRayEffect = () => {
  const godRaySourceRef = useRef();
  const [lightSource, setLightSource] = useState(null);

  // Replace dat.gui with Leva controls
  const {
    positionX,
    positionY,
    positionZ,
    rotationX,
    rotationY,
    rotationZ,
    density,
    decay,
    weight,
    exposure,
    maxRadius,
    innerCount,
    outerCount,
    innerScale,
    outerScale,
    innerOpacity,
    outerOpacity,
  } = useControls({
    positionX: { value: 3, min: -10, max: 10 },
    positionY: { value: 15, min: 0, max: 30 },
    positionZ: { value: 0, min: -10, max: 10 },
    rotationX: { value: -0.3, min: -Math.PI, max: Math.PI },
    rotationY: { value: 0, min: -Math.PI, max: Math.PI },
    rotationZ: { value: 0.2, min: -Math.PI, max: Math.PI },
    density: { value: 0.17, min: 0, max: 1 },
    decay: { value: 0.93, min: 0, max: 1 },
    weight: { value: 1.0, min: 0, max: 2 },
    exposure: { value: 0.6, min: 0, max: 1 },
    maxRadius: { value: 0.03, min: 0, max: 1 },
    innerCount: { value: 100, min: 0, max: 500 },
    outerCount: { value: 150, min: 0, max: 500 },
    innerScale: { value: 1, min: 0, max: 5 },
    outerScale: { value: 1.5, min: 0, max: 5 },
    innerOpacity: { value: 0.6, min: 0, max: 1 },
    outerOpacity: { value: 0.4, min: 0, max: 1 },
  });

  useEffect(() => {
    if (godRaySourceRef.current) {
      setLightSource(godRaySourceRef.current);
    }
  }, []);

  return (
    <>
      <group
        rotation={[rotationX, rotationY, rotationZ]}
        position={[2, 10, -2]}
      >
        <mesh
          position={[positionX, positionY, positionZ]}
          ref={godRaySourceRef}
        >
          <cylinderGeometry args={[0.5, 1, 20]} />
          <meshBasicMaterial
            color="#ffffff"
            opacity={0.001}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>

        <Sparkles
          count={innerCount}
          scale={[innerScale, 20, innerScale]}
          size={0.2}
          speed={0.1}
          noise={1.5}
          opacity={innerOpacity}
          color="#ffd700"
          position={[positionX, positionY, positionZ]}
        />
        <Sparkles
          count={outerCount}
          scale={[outerScale, 20, outerScale]}
          size={0.15}
          speed={0.2}
          noise={2}
          opacity={outerOpacity}
          color="#fff8e0"
          position={[positionX, positionY, positionZ]}
        />
      </group>

      {lightSource && (
        <EffectComposer>
          <GodRays
            sun={lightSource}
            blendFunction={16}
            samples={60}
            density={density}
            decay={decay}
            weight={weight}
            exposure={exposure}
            clampMax={1}
            maxRadius={maxRadius}
          />
        </EffectComposer>
      )}
    </>
  );
};

export default GodRayEffect;
