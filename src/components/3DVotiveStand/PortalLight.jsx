import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import portalVertexShader from "../3DVotiveStand/shaders/vertex.glsl";
import portalFragmentShader from "../3DVotiveStand/shaders/fragment.glsl";
import { shaderMaterial } from "@react-three/drei";
import { ShaderMaterial } from "three";

function PortalLight({ scene, portalVertexShader, portalFragmentShader }) {
  const materialRef = useRef();

  useFrame((state, delta) => {
    if (materialRef.current?.uniforms?.uTime) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  React.useEffect(() => {
    const portalLight = scene.getObjectByName("portalLight");
    if (portalLight) {
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
      materialRef.current = shaderMaterial;
    }
  }, [scene, portalVertexShader, portalFragmentShader]);

  return null; // This component manages the material, nothing to render
}

export default PortalLight;
