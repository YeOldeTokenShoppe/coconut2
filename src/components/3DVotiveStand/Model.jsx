import React, { useEffect, useState, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { DEFAULT_MARKERS } from "./markers";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../utilities/firebaseClient";
import {
  createMarkerFace,
  setupVideoTextures,
  handleCandles,
} from "./modelUtilities";
import gsap from "gsap";

function Model({
  scale,
  setTooltipData,
  controlsRef,
  setCamera,
  setMarkers,
  markers,
  modelRef,
  moveCamera,
  rotation,
  handlePointerMove,
  onButtonClick,
}) {
  const gltf = useGLTF("/testUltima.glb");
  const { actions, mixer } = useAnimations(gltf.animations, modelRef);
  const { camera, size } = useThree();
  const [results, setResults] = useState([]);
  const [shuffledResults, setShuffledResults] = useState([]);
  const [shuffledCandleIndices, setShuffledCandleIndices] = useState([]);
  const mixerRef = useRef();
  const scene = gltf.scene;
  const rotateStandsRef = useRef(null);

  const box = new THREE.Box3();

  // Use this to find the position of a specific object in the scene
  // const Button1 = scene.getObjectByName("Button1");
  // const ButtonPosition = new THREE.Vector3();

  // if (Button1) {
  //   Button1.getWorldPosition(ButtonPosition);
  //   console.log("Button world position:", ButtonPosition);
  // } else {
  //   console.error("ButtonPosition not found in the scene.");
  // }
  useEffect(() => {
    if (!modelRef.current) return;

    const box = new THREE.Box3().setFromObject(modelRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // console.log("Bounding Box:", box);
    // console.log("Center of Model:", center);
    // console.log("Dimensions (Width, Height, Depth):", size);

    // Center the model
    modelRef.current.position.sub(center);
    modelRef.current.position.y += size.y / 2; // Align to ground
    // modelRef.current.position.z += size.z / 2 - 0.025;

    // Update controls if they exist
    if (controlsRef?.current) {
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  }, [controlsRef]);

  useEffect(() => {
    if (typeof setMarkers === "function") {
      setMarkers(DEFAULT_MARKERS);
    }
  }, [setMarkers]);

  // In Model.jsx
  useEffect(() => {
    if (!modelRef.current) return;

    setupVideoTextures(modelRef);

    const markerRefs = [];

    markers.forEach((marker, index) => {
      try {
        const markerFace = createMarkerFace(index);
        markerFace.position.copy(marker.position);

        // Ensure these properties are set
        markerFace.isMarker = true;
        markerFace.markerIndex = index;

        if (gltf.scene) {
          gltf.scene.add(markerFace);
          markerRefs.push(markerFace);
        }
      } catch (error) {
        console.error("Error adding marker:", error);
      }
    });

    const updateMarkers = () => {
      markerRefs.forEach((marker) => {
        if (marker && camera) {
          const markerWorldPos = new THREE.Vector3();
          marker.getWorldPosition(markerWorldPos);

          const cameraWorldPos = new THREE.Vector3();
          camera.getWorldPosition(cameraWorldPos);

          const direction = cameraWorldPos.clone().sub(markerWorldPos);
          const rotationMatrix = new THREE.Matrix4();
          rotationMatrix.lookAt(
            direction,
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 1, 0)
          );
          marker.setRotationFromMatrix(rotationMatrix);
        }
      });
    };

    let animationId;
    const animate = () => {
      updateMarkers();
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      markerRefs.forEach((marker) => {
        if (marker && marker.parent) {
          marker.parent.remove(marker);
        }
      });
    };
  }, [markers, camera, gltf.scene]);

  const audioListener = useRef(new THREE.AudioListener());
  const sound = useRef(new THREE.Audio(audioListener.current));

  // Add this effect to load the sound
  useEffect(() => {
    if (!camera) return;

    // Add listener to camera
    camera.add(audioListener.current);

    // Load the sound file
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("/mech.mp3", (buffer) => {
      sound.current.setBuffer(buffer);
      sound.current.setVolume(0.5);
      sound.current.setLoop(false);
    });

    // Cleanup
    return () => {
      camera.remove(audioListener.current);
      sound.current.stop();
    };
  }, [camera]);

  useEffect(() => {
    // Wait for both the model reference and animations to be ready
    if (!modelRef.current || !actions) return;

    try {
      // Get our objects from modelRef instead of gltf.scene
      const rotationPivot = modelRef.current.getObjectByName("RotationPivot");

      // if (!rotationPivot) {
      //   console.error("RotationPivot not found in model");
      //   return;
      // }

      const stand1Group = rotationPivot.getObjectByName("Stand1Group");
      const stand2Group = rotationPivot.getObjectByName("Stand2Group");
      const button1 = modelRef.current.getObjectByName("VisibleButton1");
      const button2 = modelRef.current.getObjectByName("VisibleButton2");

      // Initially hide Stand2
      if (stand2Group) {
        stand2Group.visible = true;
      }

      // Define rotation function
      const rotateStands = () => {
        // Play button animation once
        const buttonAnim = actions["SK_Button|Anim_ButtonPress"];
        if (buttonAnim) {
          buttonAnim
            .reset()
            .setLoop(THREE.LoopOnce) // Play only once
            .setEffectiveTimeScale(1) // Normal speed
            .setEffectiveWeight(1) // Full influence
            .play();
        }

        // Slower rotation with sound
        const rotationDuration = 4; // 4 seconds instead of 2

        // Play creaky sound (assuming you have the audio file)
        const sound = new Audio("/mech.mp3");
        sound.play();

        gsap.to(rotationPivot.rotation, {
          y: rotationPivot.rotation.y + Math.PI,
          duration: rotationDuration,
          ease: "power1.inOut", // Smoother easing for mechanical feel
          onStart: () => {
            // Could start sound here instead
          },
          onComplete: () => {
            rotationPivot.rotation.y %= 2 * Math.PI;
            // Could stop or fade out sound here
          },
        });
      };
      // Store rotation function in ref
      rotateStandsRef.current = rotateStands;

      // Add click handlers to buttons
      if (button1) {
        button1.userData.clickHandler = rotateStands;
      }
      if (button2) {
        button2.userData.clickHandler = rotateStands;
      }

      // console.log("Rotation setup complete", {
      //   rotationPivot: !!rotationPivot,
      //   stand1Group: !!stand1Group,
      //   stand2Group: !!stand2Group,
      //   button1: !!button1,
      //   button2: !!button2,
      // });
    } catch (error) {
      console.error("Error setting up rotation:", error);
    }
  }, [modelRef.current, actions]); // Add both dependencies

  const handleClick = (event) => {
    if (event.object.userData.clickHandler) {
      event.object.userData.clickHandler();
    }
  };
  const createCandleShaderMaterial = (colorOffset, timeScale, offsetX) => {
    return new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        offsetX: { value: offsetX },
        colorOffset: { value: colorOffset },
        timeScale: { value: timeScale },
        emission: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;
        uniform float offsetX;
        uniform vec3 colorOffset;
        uniform float timeScale;
        uniform float emission; 
        varying vec2 vUv;
  
        void main() {
          vec2 uv = vUv;
          uv.y = 1.0 - uv.y;
          uv.x += offsetX;
  
          // Modify the base colors with colorOffset and timeScale
          vec3 col = vec3(
            0.4 + 0.35 * cos(iTime * timeScale * 0.7 + uv.x + 4.5 + colorOffset.x),
            0.15 + 0.15 * cos(iTime * timeScale * 0.7 + uv.x + 2.0 + colorOffset.y),
            0.5 + 0.45 * cos(iTime * timeScale * 0.7 + uv.x + 7.0 + colorOffset.z)
          );
  
    // Candle body (now green)
    float c = smoothstep(0.13, 0.10, abs(0.5 - uv.x));
    c *= smoothstep(0.6, 0.59, abs(uv.y));
    col += vec3(0.0, c * 0.5, 0.0); // Green candle

    // Flame (reduced intensity)
if (uv.y > 0.60) { // Only calculate the flame for the upper half
    float f = smoothstep(0.04, 0.00, 
        sin(uv.y * 12.0 + 2.1) * 0.02 + 
        abs((0.5 + sin(uv.y * 9.1 + iTime) * 0.01) - uv.x));
    col += vec3(f * 1.0, f * 2.0, f * 0.0);
}

    // Output final color
    col += col * emission; 
    gl_FragColor = vec4(col, 1.0);
}
        
      `,
    });
  };

  // Create materials array with variations
  const shaderMaterials = [
    createCandleShaderMaterial(new THREE.Vector3(0.0, 0.0, 0.0), 1.0, 0.3), // Original
    createCandleShaderMaterial(new THREE.Vector3(1.2, 0.5, 0.8), 0.85, 0.32), // Warmer
    createCandleShaderMaterial(new THREE.Vector3(0.5, 0.8, 1.5), 1.15, 0.28), // Cooler
    createCandleShaderMaterial(new THREE.Vector3(0.3, 1.0, 0.2), 0.95, 0.31), // Nature
    createCandleShaderMaterial(new THREE.Vector3(1.0, 0.2, 1.0), 1.05, 0.29), // Mystical
    createCandleShaderMaterial(new THREE.Vector3(0.2, 0.7, 1.2), 0.9, 0.33), // Ocean
    createCandleShaderMaterial(new THREE.Vector3(1.4, 0.3, 0.5), 1.1, 0.27), // Sunset
    createCandleShaderMaterial(new THREE.Vector3(0.7, 0.9, 0.6), 0.98, 0.3), // Forest
  ];

  // Add this to your Model component
  const handleButtonClick = (buttonNumber) => {
    if (!modelRef.current) return;

    // Find the corresponding Selection mesh
    const selectionMesh = modelRef.current.getObjectByName(
      `Selection${buttonNumber}`
    );
    if (selectionMesh && selectionMesh.material) {
      // Animate the emission value
      gsap.to(selectionMesh.material.uniforms.emission, {
        value: 1,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          // Fade back to normal
          gsap.to(selectionMesh.material.uniforms.emission, {
            value: 0,
            duration: 0.5,
            ease: "power2.in",
          });
        },
      });
    }
  };

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

  useEffect(() => {
    if (!modelRef.current) return;

    modelRef.current.traverse((child) => {
      if (child.name.startsWith("Selection")) {
        // Get the index from the selection name (1-based to 0-based)
        const index = parseInt(child.name.replace("Selection", "")) - 1;
        if (index >= 0 && index < shaderMaterials.length) {
          child.material = shaderMaterials[index];
        }
      }
    });
  }, [modelRef]);

  // You can temporarily add this to your Model component to log screen positions:
  // useEffect(() => {
  //   if (!modelRef.current) return;
  //   modelRef.current.traverse((object) => {
  //     if (object.name.startsWith("Screen")) {
  //       const position = new THREE.Vector3();
  //       object.getWorldPosition(position);
  //       console.log(`${object.name} position:`, position);
  //     }
  //   });
  // }, [modelRef]);
  // useEffect(() => {
  //   const video = document.createElement("video");
  //   video.src = "colaCandle1.mp4"; // Path to your MP4 file
  //   video.loop = true;
  //   video.muted = true;
  //   video.play();

  //   const videoTexture = new THREE.VideoTexture(video);
  //   videoTexture.minFilter = THREE.LinearFilter;
  //   videoTexture.magFilter = THREE.LinearFilter;
  //   videoTexture.format = THREE.RGBFormat;

  //   // Adjust the video texture scaling
  //   videoTexture.repeat.set(6.06 / 0.56, 1); // Scale horizontally
  //   videoTexture.offset.set(0, 0); // Optional: adjust centering
  //   videoTexture.wrapS = THREE.ClampToEdgeWrapping;
  //   videoTexture.wrapT = THREE.ClampToEdgeWrapping;

  //   // Apply the video texture to the mesh
  //   modelRef.current.traverse((child) => {
  //     if (child.name === "Selection1") {
  //       const videoMaterial = new THREE.MeshBasicMaterial({
  //         map: videoTexture,
  //       });

  //       child.material = videoMaterial;

  //       // Scale the mesh to match the video aspect ratio
  //       child.scale.set(1, 0.56 / 6.06, 1);
  //     }
  //   });
  // }, [modelRef]);

  const candleCache = {
    bodies: new Map(), // ZCandle -> {flame, topMesh}
    tops: new Map(), // ZCandleTop -> originalScale
  };

  // Fetch results from Firestore
  useEffect(() => {
    const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedResults = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        userName: doc.data().userName || "Anonymous",
        burnedAmount: doc.data().burnedAmount || 1,
      }));
      setResults(fetchedResults);
    });
    return () => unsubscribe();
  }, []);

  const initializeCandleCache = (model) => {
    model.traverse((child) => {
      if (child.name.startsWith("XCandle")) {
        let flame;
        let candleMesh; // This will be our Candle_default_ mesh

        // Find associated components
        child.traverse((descendant) => {
          if (descendant.name.startsWith("XFlame")) {
            flame = descendant;
          }
          if (descendant.name.startsWith("")) {
            candleMesh = descendant;
          }
        });

        // Store references and initial height of the actual candle mesh
        candleCache.bodies.set(child, {
          flame,
          candleMesh,
          initialHeight: candleMesh ? candleMesh.scale.z : 1,
        });
      }
    });
  };

  useEffect(() => {
    if (results.length === 0 || !modelRef.current) return;

    const shuffled = [...results].sort(() => Math.random() - 0.5);

    // Adjust for 001-009 format
    const candleIndexes = Array.from({ length: 9 }, (_, i) => i + 1); // Will create [1,2,3,4,5,6,7,8,9]
    const assignedIndices = candleIndexes
      .sort(() => Math.random() - 0.5)
      .slice(0, shuffled.length);

    // console.log("Number of results:", results.length);
    // console.log("Available candle indices:", candleIndexes);
    // console.log("Assigned indices:", assignedIndices);

    // Reset all candles
    modelRef.current.traverse((child) => {
      if (child.name.startsWith("XCandle")) {
        // console.log("Found candle:", child.name); // Debug log

        // Store original scale first time we see it
        if (!child.userData.originalScale) {
          child.userData.originalScale = {
            x: child.scale.x,
            y: child.scale.y,
            z: child.scale.z,
          };
        }

        // Reset candle state
        child.userData = {
          isMelting: false,
          originalScale: child.userData.originalScale,
          userName: "Anonymous",
          burnedAmount: 1,
          meltingProgress: undefined,
        };

        // Find and reset flame
        child.traverse((descendant) => {
          if (descendant.name.startsWith("XFlame")) {
            descendant.visible = false;
          }
        });
      }
    });

    // Assign selected candles
    modelRef.current.traverse((child) => {
      if (child.name.startsWith("XCandle")) {
        // Parse the index, converting "001" to 1, "002" to 2, etc.
        const candleIndex = parseInt(child.name.slice(-3), 10);
        const userIndex = assignedIndices.indexOf(candleIndex);

        if (userIndex !== -1) {
          const user = shuffled[userIndex];
          // console.log(
          //   `Assigning user ${user.userName} to candle ${child.name}`
          // ); // Debug log

          child.userData = {
            isMelting: true,
            originalScale: child.userData.originalScale,
            userName: user.userName,
            burnedAmount: user.burnedAmount || 1,
            meltingProgress: 0,
          };

          // Find and show flame
          child.traverse((descendant) => {
            if (descendant.name.startsWith("XFlame")) {
              descendant.visible = true;
            }
          });
        }
      }
    });

    setShuffledResults(shuffled);
  }, [results, modelRef]);

  // Modified useFrame for melting
  useFrame((state, delta) => {
    const { clock } = state;

    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    if (!modelRef.current) return;

    modelRef.current.traverse((child) => {
      // Update shader time
      if (
        child.name.startsWith("Selection") &&
        child.material.uniforms?.iTime
      ) {
        child.material.uniforms.iTime.value = clock.getElapsedTime();
      }

      // Handle melting for ZCandle objects
      if (
        child.name.startsWith("XCandle") &&
        child.userData?.isMelting === true
      ) {
        // Update melting progress
        child.userData.meltingProgress += delta;

        const meltingSpeed = 0.01;
        const MIN_SCALE = 0.1;

        // Calculate scale as percentage of original height
        const percentageRemaining = Math.max(
          1 - meltingSpeed * child.userData.meltingProgress,
          MIN_SCALE
        );

        // Apply scale if we have valid originalScale
        if (child.userData.originalScale?.z) {
          child.scale.z = child.userData.originalScale.z * percentageRemaining;
        }
      }
    });
  });
  // Set Markers
  useEffect(() => {
    if (typeof setMarkers === "function") setMarkers(DEFAULT_MARKERS);
  }, [setMarkers]);

  return (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      position={[0, 0, -1.5]}
      scale={scale}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        handlePointerMove(e.nativeEvent);
        handleClick(e);
      }}
      onPointerMove={(e) => handlePointerMove(e.nativeEvent)}
    />
  );
}

export default Model;
