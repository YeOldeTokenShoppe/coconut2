import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { shaderMaterial } from "@react-three/drei";
import { ShaderMaterial } from "three";
import { extend, useFrame, useThree } from "@react-three/fiber";
import portalVertexShader from "../3DVotiveStand/shaders/vertex.glsl";
import portalFragmentShader from "../3DVotiveStand/shaders/fragment.glsl";

const portalMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0.0 },
    uColorStart: { value: new THREE.Color(0xffffff) },
    uColorEnd: { value: new THREE.Color(0xdd58dd) },
  },
  vertexShader: portalVertexShader,
  fragmentShader: portalFragmentShader,
});

extend({ portalMaterial });

function RoomWalls() {
  const doorRef = useRef();
  const portalMaterial = useRef();
  const portalLightRef = useRef();
  const { camera, gl } = useThree();
  const [fadeOut, setFadeOut] = useState(false);
  const [transitionActive, setTransitionActive] = useState(false);

  const roomSize = 30;
  const wallHeight = 10;
  const frameWidth = 5;
  const frameHeight = 7;
  const heightOffset = 7;

  const offsets = {
    back: { x: -2, y: 1 },
    left: { x: 2, y: 1 },
    right: { x: -1, y: 0 },
  };

  useFrame((state, delta) => {
    if (portalMaterial.current?.uniforms?.uTime) {
      portalMaterial.current.uniforms.uTime.value += delta;
    }
  });

  const handlePortalClick = (event) => {
    if (transitionActive) return; // Prevent multiple clicks during transition

    event.stopPropagation();
    setTransitionActive(true);
    setFadeOut(true);

    // Start the transition sequence
    setTimeout(() => {
      window.open("https://ourlady.io/rocket", "_blank");
      setFadeOut(false);
      setTransitionActive(false);
    }, 4500);
  };

  // Add animation styles
  useEffect(() => {
    const fadeOutKeyframes = `
      @keyframes fadeOut {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }

      @keyframes zoomOut {
        0% { transform: scale(1); }
        100% { transform: scale(1.1); }
      }

      .fade-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: black;
        opacity: 0;
        pointer-events: none;
        transition: opacity 4.5s ease-in-out;
        z-index: 9999;
      }

      .fade-overlay.active {
        opacity: 1;
      }

      .scene-container {
        transition: transform 4.5s ease-in-out;
      }

      .scene-container.zoom {
        transform: scale(1.1);
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerHTML = fadeOutKeyframes;
    document.head.appendChild(styleSheet);

    // Create fade overlay element
    const overlay = document.createElement("div");
    overlay.className = "fade-overlay";
    document.body.appendChild(overlay);

    // Add scene container class to canvas parent
    const canvas = gl.domElement;
    canvas.parentElement.classList.add("scene-container");

    return () => {
      document.head.removeChild(styleSheet);
      if (overlay.parentNode) {
        document.body.removeChild(overlay);
      }
    };
  }, [gl]);

  // Handle fade effect
  useEffect(() => {
    if (fadeOut) {
      const overlay = document.querySelector(".fade-overlay");
      const sceneContainer = gl.domElement.parentElement;

      if (overlay && sceneContainer) {
        overlay.classList.add("active");
        sceneContainer.classList.add("zoom");
      }
    } else {
      const overlay = document.querySelector(".fade-overlay");
      const sceneContainer = gl.domElement.parentElement;

      if (overlay && sceneContainer) {
        overlay.classList.remove("active");
        sceneContainer.classList.remove("zoom");
      }
    }
  }, [fadeOut, gl]);

  useEffect(() => {
    const loader = new GLTFLoader();

    loader.load("/portal4.glb", (gltf) => {
      const scene = gltf.scene;

      scene.scale.set(5, 5, 5);
      scene.position.set(roomSize / 2 - 2, -6.5, offsets.right.x + 2);
      scene.rotation.y = -Math.PI;

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
        portalLight.userData.clickable = true;
        portalLightRef.current = portalLight;
        portalMaterial.current = shaderMaterial;
      }

      if (doorRef.current) {
        doorRef.current.add(scene);
      }
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event) => {
      if (transitionActive) return;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (portalLightRef.current) {
        const intersects = raycaster.intersectObject(
          portalLightRef.current,
          true
        );

        if (intersects.length > 0) {
          handlePortalClick(event);
        }
      }
    };

    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [roomSize, offsets.right.x, camera, transitionActive]);

  const createWallMaterial = (imagePath) => {
    const texture = new THREE.TextureLoader().load(imagePath);
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
  };

  return (
    <group position={[0, heightOffset, 0]}>
      <mesh
        position={[
          offsets.back.x,
          wallHeight / 2 + offsets.back.y,
          -roomSize / 2,
        ]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshBasicMaterial
          map={createWallMaterial("/sgframed.png").map}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

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
          map={createWallMaterial("/sgframed.png").map}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={doorRef} />
    </group>
  );
}

export default RoomWalls;
