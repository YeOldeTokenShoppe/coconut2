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
  initializeScreenManagement,
} from "./modelUtilities";
import { OrbitControls } from "@react-three/drei";
import { DirectionalLight, PointLight, DirectionalLightHelper } from "three";
import gsap from "gsap";
import DarkClouds from "./Clouds";
import HolographicStatue from "./HolographicStatue";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import FloatingCandleViewer from "./CandleInteraction";
import html2canvas from "html2canvas";
import { TextureLoader, MeshBasicMaterial } from "three";

function Model({
  scale,
  setTooltipData,

  setCamera,
  setMarkers,
  markers,
  modelRef,
  moveCamera,
  rotation,
  handlePointerMove,
  onButtonClick,
  controlsRef,
  showFloatingViewer,
  setShowFloatingViewer,
  onCandleSelect,
}) {
  const gltf = useGLTF("/isometricScene.glb");
  const { actions, mixer } = useAnimations(gltf.animations, modelRef);
  const { camera, size } = useThree();
  const [results, setResults] = useState([]);
  const [shuffledResults, setShuffledResults] = useState([]);
  const [shuffledCandleIndices, setShuffledCandleIndices] = useState([]);
  const mixerRef = useRef();
  const scene = gltf.scene;
  const rotateStandsRef = useRef(null);

  const directionalLightRef = useRef();
  const ambientLightRef = useRef();
  const hemisphereLightRef = useRef();
  const directionalLightHelperRef = useRef();
  const hemisphereLightHelperRef = useRef();
  const guiRef = useRef();
  const box = new THREE.Box3();

  const previousCandleRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const mouseDelta = useRef({ x: 0, y: 0 });
  const previousMousePosition = useRef({ x: 0, y: 0 });
  // const controlsRef = useRef(); // Reference to OrbitControls
  const cameraPositions = {
    default: new THREE.Vector3(-4.03, 25.2, 64.78),
    closeup: new THREE.Vector3(-13.8, 22.8, -16.8),
  };
  const [selectedCandle, setSelectedCandle] = useState(null);
  const handleCandleClick = (event) => {
    console.log("Candle click detected");
    event.stopPropagation();

    if (showFloatingViewer) return;

    // Use normalized coordinates directly from the event
    const mouse = new THREE.Vector2();
    mouse.x =
      (event.nativeEvent.offsetX / event.nativeEvent.target.clientWidth) * 2 -
      1;
    mouse.y =
      -(event.nativeEvent.offsetY / event.nativeEvent.target.clientHeight) * 2 +
      1;

    console.log("Mouse coordinates:", mouse);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersectableObjects = [];
    modelRef.current.traverse((object) => {
      if (object.name.startsWith("VCANDLE")) {
        intersectableObjects.push(object);

        object.children.forEach((child) => {
          if (
            child.name.includes("wax") ||
            child.name.includes("glass") ||
            child.name.startsWith("FLAME")
          ) {
            intersectableObjects.push(child);
          }
        });
      }
    });

    console.log("Checking intersections with candles");
    const intersects = raycaster.intersectObjects(intersectableObjects, true);

    if (intersects.length > 0) {
      let candleParent = intersects[0].object;
      while (candleParent && !candleParent.name.startsWith("VCANDLE")) {
        candleParent = candleParent.parent;
      }

      if (candleParent && candleParent.userData.hasUser) {
        console.log("Found candle with user data:", candleParent.name);
        const candleData = {
          userName: candleParent.userData.userName,
          message: candleParent.userData.message,
          image: candleParent.userData.image,
          burnedAmount: candleParent.userData.burnedAmount,
        };

        console.log("Candle data:", candleData);
        onCandleSelect(candleData);
        setShowFloatingViewer(true);
      }
    }
  };

  // useEffect(() => {
  //   if (modelRef.current) {
  //     const screen = modelRef.current.getObjectByName("Screen1");

  //     if (screen) {
  //       const iframe = document.createElement("iframe");
  //       iframe.src = "/html/magic.html"; // Ensure correct path
  //       iframe.style.width = "1024px";
  //       iframe.style.height = "846px";
  //       iframe.style.border = "none";
  //       iframe.style.position = "absolute";
  //       iframe.style.top = "-10000px"; // Hide off-screen
  //       document.body.appendChild(iframe);

  //       let isRendered = false;

  //       iframe.onload = () => {
  //         if (isRendered) return;
  //         isRendered = true;

  //         const iframeDoc =
  //           iframe.contentDocument || iframe.contentWindow.document;
  //         const iframeBody = iframeDoc.body;

  //         const canvasWidth = 1024;
  //         const canvasHeight = 846;
  //         const canvas = document.createElement("canvas");
  //         canvas.width = canvasWidth;
  //         canvas.height = canvasHeight;
  //         const ctx = canvas.getContext("2d");

  //         try {
  //           html2canvas(iframeBody, {
  //             width: canvasWidth,
  //             height: canvasHeight,
  //             useCORS: true,
  //             backgroundColor: null,
  //             logging: true,
  //             scale: 1,
  //           }).then((iframeCanvas) => {
  //             // Draw the captured iframe content onto the canvas
  //             ctx.drawImage(iframeCanvas, 0, 0, canvasWidth, canvasHeight);

  //             // Apply canvas as texture
  //             const texture = new THREE.CanvasTexture(canvas);
  //             texture.flipY = false; // Correct for Three.js coordinates

  //             // ✅ Rotate the texture 90 degrees (clockwise)
  //             texture.rotation = Math.PI / -2; // 90 degrees in radians
  //             texture.center.set(0.5, 0.5); // Rotate around the center
  //             // texture.offset.set(-0.55, -0.25);

  //             texture.needsUpdate = true;

  //             screen.material = new THREE.MeshBasicMaterial({
  //               map: texture,
  //               side: THREE.DoubleSide,
  //               transparent: false,
  //               opacity: 1,
  //               color: 0xffffff,
  //             });
  //             screen.material.needsUpdate = true;

  //             // ✅ Clean up: Remove the iframe
  //             if (iframe.parentNode) {
  //               document.body.removeChild(iframe);
  //             }
  //           });
  //         } catch (error) {
  //           console.error("Error rendering iframe:", error);
  //         }
  //       };
  //     }
  //   }
  // }, [modelRef.current]);
  // useEffect(() => {
  //   if (modelRef.current) {
  //     const screen = modelRef.current.getObjectByName("Screen1");

  //     if (screen) {
  //       const loader = new TextureLoader();
  //       loader.load("/xray.png", (texture) => {
  //         screen.material = new MeshBasicMaterial({
  //           map: texture,
  //           side: THREE.DoubleSide,
  //         });
  //         screen.material.needsUpdate = true;
  //       });
  //     }
  //   }
  // }, [modelRef.current]);
  // const object3 = scene.getObjectByName("Object_3");

  // if (object3) {
  //   const worldPosition = new THREE.Vector3();
  //   object3.getWorldPosition(worldPosition);
  //   console.log("Object 3 World Position:", worldPosition);
  // }
  useEffect(() => {
    const pointLight1 = new THREE.PointLight(0xff00ff, 10, 200);
    pointLight1.position.set(2, 35, -89); // Adjusted position
    pointLight1.decay = 2;
    pointLight1.castShadow = true; // Optional: enables shadows
    const pointLight2 = new THREE.PointLight(0xa6ffff, 10, 200);
    pointLight2.position.set(-220, 195, 300); // Adjusted position
    pointLight2.decay = 2;
    pointLight2.castShadow = true;
    const lightHelper = new THREE.PointLightHelper(pointLight2, 15);
    scene.add(pointLight1);
    // scene.add(pointLight2);
    // scene.add(lightHelper);

    const ambientLight = new THREE.AmbientLight(0x888888, 0.45);
    const hemiLight = new THREE.HemisphereLight(0x0055ff, 0xff0000, 0.8);
    hemiLight.position.set(0, 30, 30);

    scene.add(ambientLight);
    scene.add(hemiLight);

    return () => {
      // scene.remove(directionalLight);
      scene.remove(ambientLight);
      scene.remove(hemiLight);
      scene.remove(pointLight1);
      scene.remove(pointLight2);
      // scene.remove(hemisphereLight);
    };
  }, [scene]);

  useEffect(() => {
    if (!modelRef.current) {
      return;
    }

    // First, compute the bounding box
    const boundingBox = new THREE.Box3().setFromObject(modelRef.current);

    // Get the center and dimensions
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    console.log("Model dimensions:", {
      width: size.x,
      height: size.y,
      depth: size.z,
      center: center,
    });

    // Reset model position first
    modelRef.current.position.set(0, 0, 0);

    // Move the model up to compensate for the negative center
    modelRef.current.position.y = 0; // Offset to center vertically

    // // Update OrbitControls target to the new center
    // if (controlsRef?.current) {
    //   controlsRef.current.target.set(0, , 0); // Look at middle height of centered model
    //   controlsRef.current.update();
    // }

    // Add visual helpers for debugging
    // const boxHelper = new THREE.BoxHelper(modelRef.current, 0x00ff00);
    // scene.add(boxHelper);

    // // Add axes helper at origin
    // const axesHelper = new THREE.AxesHelper(10);
    // scene.add(axesHelper);

    console.log("New model position:", modelRef.current.position);
  }, [modelRef.current, controlsRef?.current]);
  useEffect(() => {
    if (typeof setMarkers === "function") {
      setMarkers(DEFAULT_MARKERS);
    }
  }, [setMarkers]);

  // In Model.jsx
  useEffect(() => {
    if (!modelRef.current) return;

    // setupVideoTextures(modelRef);

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

  useEffect(() => {
    if (!modelRef.current || !actions) return;

    const rotationPivot = modelRef.current.getObjectByName("RotationPivot");
    const consoleObject = modelRef.current.getObjectByName("Console");

    // Make console clickable
    if (consoleObject && consoleObject.isMesh) {
      consoleObject.raycast = new THREE.Mesh().raycast;
    }

    const rotateStands = () => {
      if (rotateStandsRef.current?.isRotating) return;

      rotateStandsRef.current = { isRotating: true };

      gsap.to(rotationPivot.rotation, {
        y: rotationPivot.rotation.y + Math.PI,
        duration: 4,
        ease: "power1.inOut",
        onComplete: () => {
          rotationPivot.rotation.y %= 2 * Math.PI;
          rotateStandsRef.current.isRotating = false;
        },
      });
    };

    // Explicitly set up console for interaction
    if (consoleObject) {
      consoleObject.userData.clickHandler = rotateStands;
      consoleObject.userData.interactive = true;
    }

    return () => {
      if (consoleObject) {
        delete consoleObject.userData.clickHandler;
        delete consoleObject.userData.interactive;
      }
    };
  }, [modelRef.current, actions]);
  const handleClick = (event) => {
    if (event.object.userData.clickHandler) {
      event.object.userData.clickHandler();
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

  // Fetch results from Firestore
  useEffect(() => {
    const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedResults = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        userName: doc.data().userName || "Anonymous",
        image: doc.data().image,
        message: doc.data().message,
        burnedAmount: doc.data().burnedAmount || 1,
      }));
      setResults(fetchedResults);
    });
    return () => unsubscribe();
  }, []);

  const findCandleComponent = (parent, type) => {
    const candleNumber = parent.name.slice(-3);

    switch (type) {
      case "FLAME":
        // Look for any FLAME in children (since it has different numbering)
        return parent.children.find((child) => child.name.startsWith("FLAME"));

      case "TooltipPlane":
        // Look for TooltipPlane with matching candle number
        return parent.children.find(
          (child) => child.name === `TooltipPlane${candleNumber}`
        );

      case "wax":
        // Find shared wax mesh
        return parent.children.find((child) => child.name.includes("wax"));

      default:
        return null;
    }
  };

  const applyUserImageToLabel = (candle, imageUrl) => {
    console.log("Applying image to candle:", candle.name, imageUrl);

    // Find the Label2 mesh in the candle's children
    const label = candle.children.find((child) =>
      child.name.includes("Label2")
    );
    console.log("Found label:", label?.name);

    if (label && imageUrl) {
      // Create a new texture loader
      const textureLoader = new THREE.TextureLoader();

      // Load the image as a texture
      textureLoader.load(
        imageUrl,
        (texture) => {
          console.log("Texture loaded successfully for", candle.name);
          // Create a new material with the loaded texture
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
          });

          // Apply texture settings
          texture.encoding = THREE.sRGBEncoding;
          texture.flipY = false;
          texture.needsUpdate = true;

          // Apply the new material to the label
          label.material = material;
          label.material.needsUpdate = true;
        },
        undefined,
        (error) => {
          console.error("Error loading texture:", error);
        }
      );
    } else {
      console.warn("Label2 not found or no image URL provided", {
        hasLabel: !!label,
        hasImageUrl: !!imageUrl,
      });
    }
  };

  useEffect(() => {
    if (results.length === 0 || !modelRef.current) {
      console.log("No results or modelRef not ready");
      return;
    }

    console.log("Processing results:", results.length, "candles");

    const availableIndices = [
      "001",
      "002",
      "003",
      "004",
      "005",
      "006",
      "007",
      "008",
    ];

    const selectedIndices = availableIndices
      .sort(() => Math.random() - 0.5)
      .slice(0, results.length);

    console.log("Selected candle indices:", selectedIndices);

    // First reset ALL candles
    modelRef.current.traverse((child) => {
      if (child.name.startsWith("VCANDLE")) {
        const flame = findCandleComponent(child, "FLAME");
        const label = child.children.find((c) => c.name.includes("Label2"));

        // Clean up existing textures and materials
        if (label && label.material) {
          if (label.material.map) {
            label.material.map.dispose();
          }
          label.material.dispose();

          // Reset to a basic material
          label.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            side: THREE.DoubleSide,
          });
        }

        // Reset candle state
        child.userData = {
          hasUser: false,
          userName: null,
          image: null,
          message: null,
          burnedAmount: 0,
          meltingProgress: 0,
        };

        if (flame) {
          flame.visible = false;
        }
      }
    });

    // Then activate selected candles
    results.forEach((result, index) => {
      const paddedIndex = selectedIndices[index];
      if (!paddedIndex) return;

      const candleName = `VCANDLE${paddedIndex}`;
      const candle = modelRef.current.getObjectByName(candleName);

      if (candle) {
        console.log(`Setting up candle ${candleName} with data:`, {
          userName: result.userName,
          hasImage: !!result.image,
          message: result.message?.substring(0, 20) + "...",
        });

        // Set up the candle
        candle.userData = {
          hasUser: true,
          userName: result.userName || "Anonymous",
          image: result.image,
          message: result.message,
          burnedAmount: result.burnedAmount || 1,
          meltingProgress: 0,
        };

        // Apply the user's image to the label using the separate function
        if (result.image) {
          applyUserImageToLabel(candle, result.image);
        } else {
          console.log(`No image provided for candle ${candleName}`);
        }

        const flame = findCandleComponent(candle, "FLAME");
        if (flame) {
          flame.visible = true;
        }
      }
    });

    // Cleanup function
    return () => {
      modelRef.current?.traverse((child) => {
        if (child.name.startsWith("VCANDLE")) {
          const label = child.children.find((c) => c.name.includes("Label2"));
          if (label?.material) {
            if (label.material.map) {
              label.material.map.dispose();
            }
            label.material.dispose();
          }
        }
      });
    };
  }, [results, modelRef.current]);

  // Set Markers
  useEffect(() => {
    if (typeof setMarkers === "function") setMarkers(DEFAULT_MARKERS);
  }, [setMarkers]);

  return (
    <>
      <primitive
        ref={modelRef}
        object={gltf.scene}
        // position={[2.4, 12.7, 37.4]}
        scale={scale}
        rotation={rotation}
        onClick={(e) => {
          e.stopPropagation();
          if (!showFloatingViewer) {
            handleCandleClick(e);
          }
        }}
        onPointerMove={(e) => {
          if (!showFloatingViewer) {
            handlePointerMove(e);
          }
        }}
        style={{
          pointerEvents: showFloatingViewer ? "none" : "auto",
        }}
      />
      <DarkClouds />
    </>
  );
}
export default Model;
