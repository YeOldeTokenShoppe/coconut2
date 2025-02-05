import React, { useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

function HolographicStatue() {
  const statueRef = useRef();
  const { scene } = useThree();
  const loader = new GLTFLoader();
  const initialY = useRef(0);

  const holographicMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x00ffff) },
    },
    vertexShader: `
      uniform float uTime;
      varying vec3 vPosition;
      varying vec3 vNormal;
  
      vec2 random2D(vec2 st) {
        st = vec2(dot(st, vec2(127.1, 311.7)),
                 dot(st, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
      }

      void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);

        float glitchTime = uTime - modelPosition.y;
        float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);
        glitchStrength /= 3.0;
        glitchStrength = smoothstep(0.9, 1.0, glitchStrength);
        glitchStrength *= 0.1;
        modelPosition.x += (random2D(modelPosition.xz + uTime).x - 0.5) * glitchStrength;
        modelPosition.z += (random2D(modelPosition.zx + uTime).x - 0.5) * glitchStrength;

        gl_Position = projectionMatrix * viewMatrix * modelPosition;

        vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
        vPosition = modelPosition.xyz;
        vNormal = modelNormal.xyz;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        vec3 normal = normalize(vNormal);
        if(!gl_FrontFacing)
            normal *= -1.0;

        float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
        stripes = pow(stripes, 3.0);

        vec3 viewDirection = normalize(vPosition - cameraPosition);
        float fresnel = dot(viewDirection, normal) + 1.0;
        fresnel = pow(fresnel, 2.5);

        float falloff = smoothstep(0.8, 0.2, fresnel);

        float holographic = stripes * fresnel;
        holographic += fresnel * 2.25;
        holographic *= falloff;

        gl_FragColor = vec4(uColor, holographic);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false, // Disable depth testing
    side: THREE.DoubleSide,
  });

  const applyHolographicEffect = (model) => {
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = holographicMaterial;
      }
    });
  };

  const object3 = scene.getObjectByName("Object_3");

  if (object3) {
    const worldPosition = new THREE.Vector3();
    object3.getWorldPosition(worldPosition);
    console.log("World Position:", worldPosition);
  }
  useEffect(() => {
    loader.load("/statue3.glb", (gltf) => {
      const statue = gltf.scene;
      statueRef.current = statue;

      // const box = new THREE.Box3().setFromObject(statue);
      // const size = box.getSize(new THREE.Vector3());
      // console.log("Statue dimensions:", size);

      statue.scale.set(0.2, 0.2, 0.2);
      statue.position.set(0, 0, 0);

      statue.rotation.y = Math.PI / 180;
      initialY.current = statue.position.y;

      // Create a separate holographic material for the halo with a gold color
      const goldHolographicMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(0xffd700) }, // Gold color
        },
        vertexShader: holographicMaterial.vertexShader,
        fragmentShader: holographicMaterial.fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });

      // Apply materials
      statue.traverse((child) => {
        if (child.isMesh) {
          if (child.name.toLowerCase().includes("halo")) {
            console.log("Found halo:", child.name);
            // Apply the gold holographic material to the halo
            child.material = goldHolographicMaterial;
          } else {
            // Apply the regular holographic material to the rest
            child.material = holographicMaterial;
          }
        }
      });

      scene.add(statue);
    });

    return () => {
      if (statueRef.current) {
        scene.remove(statueRef.current);
      }
    };
  }, [scene]);
  useFrame((state, delta) => {
    if (statueRef.current) {
      // Hover animation for floating effect
      statueRef.current.position.y =
        initialY.current + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

      // Slowly rotate the statue group
      // statueRef.current.rotation.y += delta * 0.1;
      // Adjust 0.1 to change the rotation speed

      // Update shader time for holographic effect
      statueRef.current.traverse((child) => {
        if (child.material?.uniforms?.uTime) {
          child.material.uniforms.uTime.value += delta;
        }
      });
    }
  });
  return null;
}

export default HolographicStatue;
