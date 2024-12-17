import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

function PostProcessingEffects() {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef();

  // Bloom setup
  useEffect(() => {
    // Debug
    // scene.traverse((obj) => {
    //   if (obj.name === "Halo") {
    //   }
    // });

    // Create composer
    composer.current = new EffectComposer(gl);

    // Add base render pass
    const renderPass = new RenderPass(scene, camera);
    composer.current.addPass(renderPass);

    // Add aggressive bloom for testing
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.4, // strength
      0.1, // radius
      0.4 // threshold - lower number means more things will glow
    );
    composer.current.addPass(bloomPass);

    return () => composer.current?.dispose();
  }, [gl, scene, camera, size]);

  // Handle resize
  useEffect(() => {
    composer.current?.setSize(size.width, size.height);
  }, [size]);

  // Replace default render with composer
  useFrame(() => {
    if (composer.current) {
      composer.current.render();
    }
  }, 1);

  return null;
}

export default PostProcessingEffects;
