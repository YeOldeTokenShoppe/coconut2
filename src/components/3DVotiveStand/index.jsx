// index.jsx
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import PostProcessingEffects from "../PostProcessingEffects";
import * as THREE from "three";
import gsap from "gsap";
import Model from "./Model";
import { DEFAULT_MARKERS } from "./constants";
import CameraControlPanel from "../CameraControlPanel";
import { Box } from "@chakra-ui/react";

import RoomWalls from "./RoomWalls";

function ThreeDVotiveStand({ setIsLoading, onCameraMove, onResetView }) {
  const [userData, setUserData] = useState([]);
  const [tooltipData, setTooltipData] = useState(null);
  const [modelScale, setModelScale] = useState(7);
  const [activeAnnotation, setActiveAnnotation] = useState(null);
  const [camera, setCamera] = useState(null);
  const [markers, setMarkers] = useState(DEFAULT_MARKERS);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isResetVisible, setIsResetVisible] = useState(true);
  const [rotation, setRotation] = useState([0, 0, 0]);

  const [lastActiveAnnotation, setLastActiveAnnotation] = useState(null);
  const [isAnnotationVisible, setIsAnnotationVisible] = useState(false);

  const controlsRef = useRef(null);
  const modelRef = useRef();
  const sceneRef = useRef();
  const canvasRef = useRef();

  // // Handle window resize
  // window.addEventListener("resize", onWindowResize, false);

  // for camera control panel
  // const [cameraPosition, setCameraPosition] = useState({
  //   x: 17.3,
  //   y: 3.9,
  //   z: 16.1,
  // });
  // const [cameraTarget, setCameraTarget] = useState({
  //   x: 0.1,
  //   y: 6.657,
  //   z: -0.6,
  // });

  // useEffect(() => {
  //   if (camera && controlsRef.current) {
  //     // Update camera position when state changes
  //     camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
  //     controlsRef.current.target.set(
  //       cameraTarget.x,
  //       cameraTarget.y,
  //       cameraTarget.z
  //     );
  //     controlsRef.current.update();
  //   }
  // }, [camera, cameraPosition, cameraTarget]);

  // for camera control panel

  // const GodRayEffect = () => {
  //   const godRaySourceRef = useRef();
  //   const [lightSource, setLightSource] = useState(null);

  //   useEffect(() => {
  //     if (godRaySourceRef.current) {
  //       setLightSource(godRaySourceRef.current);
  //     }
  //   }, []);

  //   return (
  //     <>
  //       <group rotation={[-0.3, 0, 0.2]} position={[2, 10, 2]}>
  //         {/* Light source */}
  //         <mesh position={[3, 15, 0]} ref={godRaySourceRef}>
  //           <cylinderGeometry args={[0.5, 1, 20]} />
  //           <meshBasicMaterial
  //             color="#ffffff"
  //             opacity={0.001}
  //             transparent
  //             side={THREE.DoubleSide}
  //           />
  //         </mesh>

  //         {/* Inner sparkles - aligned with light beam */}
  //         <Sparkles
  //           count={100}
  //           scale={[1, 20, 1]} // Matched to cylinder dimensions
  //           size={0.2}
  //           speed={0.1}
  //           noise={1.5}
  //           opacity={0.6}
  //           color="#ffd700"
  //           position={[3, 15, 0]} // Matched to light source position
  //         />

  //         {/* Outer sparkles - slightly larger */}
  //         <Sparkles
  //           count={150}
  //           scale={[1.5, 20, 1.5]} // Slightly wider than the beam
  //           size={0.15}
  //           speed={0.2}
  //           noise={2}
  //           opacity={0.4}
  //           color="#fff8e0"
  //           position={[3, 15, 0]} // Same position as light source
  //         />
  //       </group>

  //       {lightSource && (
  //         <EffectComposer>
  //           <GodRays
  //             sun={lightSource}
  //             blendFunction={16}
  //             samples={60}
  //             density={0.17}
  //             decay={0.93}
  //             weight={1.0}
  //             exposure={0.6}
  //             clampMax={1}
  //             maxRadius={0.03}
  //           />
  //         </EffectComposer>
  //       )}
  //     </>
  //   );
  // };

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const initializeScene = async () => {
      // Simulate loading logic or wait for model to load
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false); // Signal completion
    };

    initializeScene();
  }, [setIsLoading]);
  useEffect(() => {
    if (modelRef.current && controlsRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      console.log("Scene size:", size);
      console.log("Scene center:", center);

      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  }, [modelRef, controlsRef]);

  const MODEL_CENTER = {
    x: 17,
    y: 3.5,
    z: 6.5, // effectively 0
  };

  const getViewByScreenSize = () => {
    const width = window.innerWidth;

    const center = new THREE.Vector3(
      MODEL_CENTER.x,
      MODEL_CENTER.y,
      MODEL_CENTER.z
    );
    // Calculate center dynamically for each view

    // Start with mobile view (default case)
    if (width <= 767) {
      return {
        scale: 7,
        position: [
          center.x + (-13.4 - MODEL_CENTER.x),
          center.y + (6.66 - MODEL_CENTER.y),
          center.z + (25 - MODEL_CENTER.z),
        ],
        target: [
          center.x + (1.4 - MODEL_CENTER.x),
          center.y + (2.8 - MODEL_CENTER.y),
          center.z + (-0.52 - MODEL_CENTER.z),
        ],
        fov: 40,
      };
    }
    // Tablet
    else if (width <= 1200) {
      return {
        scale: 7,
        position: [
          center.x + (-2.3 - MODEL_CENTER.x),
          center.y + (6.3 - MODEL_CENTER.y),
          center.z + (26.4 - MODEL_CENTER.z),
        ],
        target: [
          center.x + (0 - MODEL_CENTER.x),
          center.y + (6.7 - MODEL_CENTER.y),
          center.z + (-0.52 - MODEL_CENTER.z),
        ],
        fov: 40,
      };
    }
    // Desktop
    else {
      return {
        scale: 7,
        position: [
          center.x + (-1 - MODEL_CENTER.x),
          center.y + (4.1 - MODEL_CENTER.y),
          center.z + (25.2 - MODEL_CENTER.z),
        ],
        target: [
          center.x + (0 - MODEL_CENTER.x),
          center.y + (6.1 - MODEL_CENTER.y),
          center.z + (-0.523 - MODEL_CENTER.z),
        ],
        fov: 40,
      };
    }
  };
  // Animate function for billboarding
  useEffect(() => {
    const animate = () => {
      if (sceneRef.current && camera) {
        sceneRef.current.traverse((object) => {
          if (object.userData.isBillboard) {
            object.lookAt(camera.position); // Make the object face the camera
            object.rotation.set(0, object.rotation.y, 0); // Reset unwanted rotation
          }
        });
      }

      requestAnimationFrame(animate);
    };

    animate(); // Start the animation loop
  }, [camera]);

  // const DEFAULT_CAMERA_VIEW = {
  //   position: new THREE.Vector3(20, 18.8, 40), // Default position
  //   target: new THREE.Vector3(2.9, 6.7, 5.6), // Default target
  // };

  const DEFAULT_ANNOTATION_POSITION = {
    xPercent: 50,
    yPercent: 50,
  };

  const handlePointerMove = (event) => {
    if (!camera) return;

    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1,
      -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Find all marker meshes
    const markerObjects = [];
    modelRef.current?.traverse((object) => {
      if (object.isMarker || object.parent?.isMarker) {
        markerObjects.push(object);
      }
    });

    const intersects = raycaster.intersectObjects(markerObjects, true);

    if (intersects.length > 0) {
      // Find the marker by traversing up the parent chain
      let markerObject = intersects[0].object;
      while (markerObject && !markerObject.isMarker) {
        markerObject = markerObject.parent;
      }

      if (markerObject && markerObject.markerIndex !== undefined) {
        const markerData = markers?.[markerObject.markerIndex];

        if (markerData) {
          console.log("Marker clicked:", markerObject.markerIndex);
          if (event.type === "click") {
            moveCamera(markerData, markerObject.markerIndex);
          }
        }
      }
    }
  };

  const moveCamera = (view) => {
    if (!view?.cameraView) return;

    if (onCameraMove) {
      onCameraMove();
    }

    const screenCategory =
      window.innerWidth > 1200
        ? "desktop"
        : window.innerWidth > 767
        ? "tablet"
        : "phone";

    const center = new THREE.Vector3();
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      box.getCenter(center);
    }

    const cameraView = {
      position: view.cameraView[screenCategory].position(center),
      target: view.cameraView[screenCategory].target(center),
    };

    const annotationPosition =
      view.annotationPosition?.[screenCategory] || DEFAULT_ANNOTATION_POSITION;

    // Hide annotation immediately when starting new camera move
    setIsAnnotationVisible(false);

    // Animate to new position
    gsap.to(camera.position, {
      x: cameraView.position.x,
      y: cameraView.position.y,
      z: cameraView.position.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => controlsRef.current.update(),
      onComplete: () => {
        // Show annotation with a delay after camera movement completes
        setTimeout(() => {
          setIsAnnotationVisible(true);
        }, 200); // 200ms delay after camera arrives
      },
    });

    gsap.to(controlsRef.current.target, {
      x: cameraView.target.x,
      y: cameraView.target.y,
      z: cameraView.target.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => controlsRef.current.update(),
    });

    setActiveAnnotation({
      text: view.description,
      position: {
        xPercent: annotationPosition.xPercent,
        yPercent: annotationPosition.yPercent,
      },
    });
    setIsResetVisible(true);
  };

  const resetCamera = () => {
    if (!camera || !controlsRef.current) return;

    if (onResetView) {
      onResetView();
    }

    // Immediately hide annotation on reset
    setIsAnnotationVisible(false);

    const { scale, position, target, fov } = getViewByScreenSize();
    const timeline = gsap.timeline();

    timeline
      .to(
        camera.position,
        {
          x: position[0],
          y: position[1],
          z: position[2],
          duration: 1.5,
          ease: "power2.inOut",
        },
        0
      )
      .to(
        controlsRef.current.target,
        {
          x: target[0],
          y: target[1],
          z: target[2],
          duration: 1.5,
          ease: "power2.inOut",
        },
        0
      )
      .eventCallback("onUpdate", () => controlsRef.current.update());

    setActiveAnnotation(null);
    setLastActiveAnnotation(null);
    setIsResetVisible(false);
  };
  useEffect(() => {
    const updateView = () => {
      if (!camera || !controlsRef.current) return;

      const { scale, position, target, fov } = getViewByScreenSize();

      setModelScale(scale);
      camera.position.set(...position);
      camera.fov = fov;
      camera.updateProjectionMatrix();

      // Set target directly - no need for initial/orbit separation
      controlsRef.current.target.set(...target);
      controlsRef.current.update();
    };

    updateView();
    window.addEventListener("resize", updateView);
    return () => window.removeEventListener("resize", updateView);
  }, [camera, controlsRef]);

  return (
    <>
      {/* <Box position="absolute" top={8} right={0} zIndex={"100000"}>
        <CameraControlPanel camera={camera} controls={controlsRef.current} />
      </Box> */}
      <div
        className="votiveContainer"
        style={{
          position: "absolute",
          top: 0,
          // inset: 0,  // This sets left, right, top, bottom to 0
          margin: "auto",
          height: "100vh",
          width: "100%",
          maxWidth: "100vw",
        }}
      >
        <Canvas
          camera={{
            position: [17.3, -0.9, 16.1],
            // position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],

            fov: 40,
            near: 0.1,
            far: 200,
          }}
          style={{
            width: "100%",
            height: "100%",
            contain: "layout paint size", // Improve performance and prevent overflow
          }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1,
          }}
        >
          <RoomWalls />

          <ambientLight intensity={1} />

          <directionalLight position={[0, 5, 0]} castShadow />
          <pointLight color={"#88B6FF"} position={[10, 3, 0]} intensity={0.9} />
          <pointLight color={"#88B6FF"} position={[0, 5, 0]} intensity={0.5} />
          <pointLight
            color={"#ffffff"}
            position={[2, 6.4, 1]}
            intensity={0.25}
          />
          <PostProcessingEffects />
          <Model
            url="/ultima14.glb"
            scale={modelScale}
            setIsLoading={setIsLoading}
            controlsRef={controlsRef}
            modelRef={modelRef}
            handlePointerMove={handlePointerMove}
            setCamera={setCamera}
            setMarkers={setMarkers}
            markers={markers}
            userData={userData}
            moveCamera={moveCamera}
          />

          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            screenSpacePanning={true}
            panSpeed={3}
            enableZoom={true}
            zoomSpeed={0.3}
            maxDistance={20}
            minDistance={0}
            enableRotate={true}
            maxAzimuthAngle={Infinity} // Limit horizontal rotation
            minAzimuthAngle={-Infinity} // Limit horizontal rotation
            maxPolarAngle={Math.PI / 2} // Limit vertical rotation
            minPolarAngle={0} // Limit vertical rotation
          />
        </Canvas>
      </div>
      {activeAnnotation && (
        <div
          className={`annotation ${!isResetVisible ? "hidden" : ""}`}
          style={{
            position: "absolute",
            left: `${Math.max(
              Math.min(
                (activeAnnotation.position.xPercent / 100) * size.width,
                size.width - 100
              ),
              10
            )}px`,
            top: `${Math.max(
              Math.min(
                (activeAnnotation.position.yPercent / 100) * size.height,
                size.height - 100
              ),
              10
            )}px`,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#fff",
            zIndex: 99999,
            opacity: isAnnotationVisible ? 1 : 0,
            visibility: isResetVisible ? "visible" : "hidden",
            transition: "opacity 0.5s ease", // Smooth fade in
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px",
            height: "auto",
          }}
        >
          <p>{activeAnnotation.text}</p>
          <button
            onClick={resetCamera}
            style={{
              padding: "10px",
              marginTop: "10px",
              backgroundColor: "goldenrod",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              width: "70px",
              height: "30px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",

              fontSize: "16px",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.3s ease, transform 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#daa520";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "goldenrod";
              e.target.style.transform = "scale(1)";
            }}
          >
            OK
          </button>
        </div>
      )}

      {tooltipData?.map((tooltip, index) => (
        <div
          key={index}
          className="tooltip-container"
          style={{
            position: "absolute",
            left: `${tooltip.position.x}px`,
            top: `${tooltip.position.y - 50}px`,
            transform: "translate(-50%, -100%)",
            transition: "all 0.2s ease-in-out",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            pointerEvents: "none",
            zIndex: 1000,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            fontSize: "14px",
            fontWeight: "600",
            letterSpacing: "0.02em",
            minWidth: "100px",
            textAlign: "center",
          }}
        >
          {tooltip.userName}
        </div>
      ))}
    </>
  );
}

export default ThreeDVotiveStand;
