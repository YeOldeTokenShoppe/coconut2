// index.jsx
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Center, useHelper } from "@react-three/drei";
import { PointLightHelper } from "three";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import PostProcessingEffects from "./PostProcessingEffects";
import * as THREE from "three";
import gsap from "gsap";
import Model from "./Model";
import { DEFAULT_MARKERS } from "./markers";
import { DEFAULT_CAMERA } from "./defaultCamera";
import { CONTROL_SETTINGS } from "./controlSettings";
import { Annotations, ANNOTATION_SETTINGS } from "./annotations";
import { MODEL_SETTINGS } from "./modelConfig";
import { getScreenCategory } from "./screenCategories";
import { Box } from "@chakra-ui/react";
import CameraGUI from "./CameraGUI";
import RoomWalls from "./RoomWalls";
import dynamic from "next/dynamic";

function ThreeDVotiveStand({ setIsLoading, onCameraMove, onResetView }) {
  const [userData, setUserData] = useState([]);
  const [tooltipData, setTooltipData] = useState(null);
  const [modelScale, setModelScale] = useState(7);

  const [camera, setCamera] = useState(null);
  const [markers, setMarkers] = useState(DEFAULT_MARKERS);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isResetVisible, setIsResetVisible] = useState(true);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [activeAnnotation, setActiveAnnotation] = useState(null);
  const [isAnnotationVisible, setIsAnnotationVisible] = useState(false);
  const [isInteractionInProgress, setIsInteractionInProgress] = useState(false);

  const modelRef = useRef();
  const sceneRef = useRef();
  const canvasRef = useRef();
  const scene = new THREE.Scene();

  // for camera control panel
  const cameraRef = useRef(null); // Reference to the camera
  const controlsRef = useRef(null); // Reference to OrbitControls

  const [screenCategory, setScreenCategory] = useState("desktop");

  const currentSettings = DEFAULT_CAMERA[screenCategory];
  useEffect(() => {
    setScreenCategory(getScreenCategory());
  }, []);

  const commonSettings = DEFAULT_CAMERA.common;
  const [isGuiMode, setIsGuiMode] = useState(false);

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
    const initializeCamera = () => {
      if (!cameraRef.current || !controlsRef.current) return;

      const screenCategory = getScreenCategory();

      // Calculate center of model or use default
      const center = new THREE.Vector3();
      if (modelRef.current) {
        const box = new THREE.Box3().setFromObject(modelRef.current);
        box.getCenter(center);
      }

      // Get default camera settings
      const defaultCameraSettings = DEFAULT_CAMERA[screenCategory];
      const cameraPosition = defaultCameraSettings.position;
      const targetPosition = defaultCameraSettings.target;

      // Set camera position
      cameraRef.current.position.set(
        cameraPosition[0],
        cameraPosition[1],
        cameraPosition[2]
      );

      // Set OrbitControls target
      controlsRef.current.target.set(
        targetPosition[0],
        targetPosition[1],
        targetPosition[2]
      );

      controlsRef.current.update(); // Ensure changes are applied
    };

    // Run initialization
    initializeCamera();
  }, [
    modelRef.current,
    cameraRef.current,
    controlsRef.current,
    screenCategory,
  ]);
  const handleGuiStart = () => {
    if (controlsRef.current) {
      const guiSettings = CONTROL_SETTINGS.guiMode;
      Object.assign(controlsRef.current, guiSettings);
    }
    setIsGuiMode(true);
  };

  const handleGuiEnd = () => {
    if (controlsRef.current) {
      const defaultSettings = CONTROL_SETTINGS.default;
      Object.assign(controlsRef.current, defaultSettings);
    }
    setIsGuiMode(false);
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

    const screenCategory = getScreenCategory();
    const cameraView = {
      position: view.cameraView[screenCategory].position(),
      target: view.cameraView[screenCategory].target(),
      fov: view.cameraView[screenCategory].fov ?? currentSettings.fov,
    };
    // Notify the parent that the camera is moving
    onCameraMove();
    // Set the annotation content but don't show it yet
    setActiveAnnotation({
      text: view.description,
      position: {
        screen: {
          xPercent:
            view.annotationPosition?.[screenCategory]?.xPercent ??
            ANNOTATION_SETTINGS.defaultScreenPosition.xPercent,
          yPercent:
            view.annotationPosition?.[screenCategory]?.yPercent ??
            ANNOTATION_SETTINGS.defaultScreenPosition.yPercent,
        },
      },
    });
    setIsAnnotationVisible(false);

    const masterTimeline = gsap.timeline();

    // Camera movement timeline
    masterTimeline
      .to(
        camera.position,
        {
          x: cameraView.position.x,
          y: cameraView.position.y,
          z: cameraView.position.z,
          duration: 1.5,
          ease: "power2.inOut",
        },
        0
      )
      .to(
        controlsRef.current.target,
        {
          x: cameraView.target.x,
          y: cameraView.target.y,
          z: cameraView.target.z,
          duration: 1.5,
          ease: "power2.inOut",
        },
        0
      )
      .to(
        camera,
        {
          fov: cameraView.fov,
          duration: 1.5,
          ease: "power2.inOut",
        },
        0
      )
      // Add a delay after camera movement before showing annotation
      .call(() => setIsAnnotationVisible(true), [], "+=0.3"); // 0.3 seconds after camera movement

    masterTimeline.eventCallback("onUpdate", () => {
      controlsRef.current.update();
      camera.updateProjectionMatrix();
    });
  };

  const resetCamera = () => {
    if (!camera || !controlsRef.current) return;

    // Hide annotation first
    setIsAnnotationVisible(false);
    setActiveAnnotation(null);

    const defaultPosition = DEFAULT_CAMERA[screenCategory].position;
    const defaultTarget = DEFAULT_CAMERA[screenCategory].target;

    const resetTimeline = gsap.timeline();

    resetTimeline
      .to(
        camera.position,
        {
          x: defaultPosition[0],
          y: defaultPosition[1],
          z: defaultPosition[2],
          duration: 1.5,
          ease: "power2.inOut",
        },
        0
      )
      .to(
        controlsRef.current.target,
        {
          x: defaultTarget[0],
          y: defaultTarget[1],
          z: defaultTarget[2],
          duration: 1.5,
          ease: "power2.inOut",
        },
        0
      )
      .to(
        camera,
        {
          fov: DEFAULT_CAMERA[screenCategory].fov,
          duration: 1.5,
          ease: "power2.inOut",
        },
        0
      );

    resetTimeline.eventCallback("onUpdate", () => {
      controlsRef.current.update();
      camera.updateProjectionMatrix();
    });
  };

  return (
    <>
      <div
        className="votiveContainer"
        style={{
          position: "absolute",
          top: 0,
          margin: "auto",
          height: "100vh",
          width: "100%",
          maxWidth: "100vw",
          pointerEvents: "none", // Add this to allow clicking through to annotations
        }}
      >
        {/* <CameraGUI
          cameraRef={cameraRef}
          controlsRef={controlsRef}
          onGuiStart={handleGuiStart}
          onGuiEnd={handleGuiEnd}
          activeAnnotation={activeAnnotation}
          style={{ pointerEvents: "auto" }} // Add this
        /> */}
        <Canvas
          style={{
            backgroundColor: "#1b1724",
            opacity: 0.9,
            width: "100%",
            height: "100%",
          }}
          camera={{
            position: DEFAULT_CAMERA[screenCategory].position,
            fov: DEFAULT_CAMERA[screenCategory].fov,
            near: commonSettings.near,
            far: commonSettings.far,
          }}
          gl={commonSettings.gl}
          onCreated={({ camera }) => {
            cameraRef.current = camera;
            setCamera(camera);
          }}
        >
          <RoomWalls />

          <ambientLight intensity={1} />

          <directionalLight position={[0, 5, 0]} castShadow />

          <pointLight position={[2, 1, 3]} intensity={5} color={"#88B6FF"} />

          <PostProcessingEffects />
          <Model
            url="/ultima15.glb"
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
          {/* use this version only when using gui */}

          <OrbitControls
            ref={controlsRef}
            {...CONTROL_SETTINGS.default}
            onStart={() => {
              console.log("OrbitControls ready");
              if (!isGuiMode) {
                // Apply default settings when not in GUI mode
                const defaultSettings = CONTROL_SETTINGS.default;
                Object.assign(controlsRef.current, defaultSettings);
                controlsRef.current.update(); // Ensure controls are updated
              }
            }}
          />

          {/* <OrbitControls
            ref={controlsRef}
            rotation={true}
            rotateSpeed={0.3}
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
          /> */}
        </Canvas>

        {activeAnnotation && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none", // Add this
            }}
          >
            <Annotations
              text={activeAnnotation?.text}
              isResetVisible={isResetVisible}
              isVisible={isAnnotationVisible}
              position={activeAnnotation?.position}
              onReset={() => {
                resetCamera();
                onResetView(); // Notify parent to show the chandelier
              }}
              onMoveCamera={onCameraMove} // Notify parent to hide the chandelier
              containerSize={size}
              camera={camera}
            />
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
      </div>
    </>
  );
}

export default ThreeDVotiveStand;
