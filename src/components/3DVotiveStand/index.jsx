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
import { Scene, SpotLight, DirectionalLight, PointLight } from "three";
import { Perf } from "r3f-perf";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import PostProcessingEffects from "./PostProcessingEffects";
import * as THREE from "three";
import gsap from "gsap";
import Model from "./Model";
import { DEFAULT_MARKERS } from "./markers";
import { DEFAULT_CAMERA, getCameraSettings } from "./defaultCamera";
import { CONTROL_SETTINGS } from "./controlSettings";
import { Annotations, ANNOTATION_SETTINGS } from "./annotations";
import { MODEL_SETTINGS } from "./modelConfig";
import { getScreenCategory } from "./screenCategories";
import { Box } from "@chakra-ui/react";
import CameraGUI from "./CameraGUI";
import LightControlPanel from "./LightControlPanel";
import RoomWalls from "./RoomWalls";
import dynamic from "next/dynamic";
import styled from "styled-components";
import { candleShader } from "./shaders/videoShaders";
import { SCREEN_VIEWS, BUTTON_MESSAGES } from "./modelUtilities";
import { screenStateManager } from "./modelUtilities";
import { ScreenAnnotation } from "./screenAnnotations";
import FlyInEffect from "./FlyInEffect";
import { debounce } from "lodash";
import MobileModel from "./MobileModel";

function ThreeDVotiveStand({
  setIsLoading,
  onCameraMove,
  onResetView,
  onZoom,
  isInMarkerView,
}) {
  const [userData, setUserData] = useState([]);
  const [tooltipData, setTooltipData] = useState([]);
  const [isMarkerMovement, setIsMarkerMovement] = useState(false);
  const [modelScale, setModelScale] = useState(7);
  const [buttonPopupVisible, setButtonPopupVisible] = useState(false);
  const [clickedButtonName, setClickedButtonName] = useState("");
  const [buttonData, setButtonData] = useState("");
  const [camera, setCamera] = useState(null);
  const [markers, setMarkers] = useState(DEFAULT_MARKERS);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isResetVisible, setIsResetVisible] = useState(true);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [activeAnnotation, setActiveAnnotation] = useState(null);
  const [isAnnotationVisible, setIsAnnotationVisible] = useState(false);
  const [isInteractionInProgress, setIsInteractionInProgress] = useState(false);

  const modelRef = useRef();
  const sceneRef = useRef(new Scene());
  const canvasRef = useRef();
  const scene = new THREE.Scene();
  const helperRef = useRef();
  const targetRef = useRef();
  // for camera control panel
  const cameraRef = useRef(null); // Reference to the camera
  const controlsRef = useRef(null); // Reference to OrbitControls
  const spotlightRef = useRef();
  const directionalLight1Ref = useRef();
  const directionalLight2Ref = useRef();
  const pointLightRef = useRef();
  // Change this line
  const [screenCategory, setScreenCategory] = useState(() =>
    getScreenCategory()
  );

  const [isPanelVisible, setIsPanelVisible] = useState(true);

  const panelRef = useRef();

  const togglePanel = () => {
    panelRef.current?.togglePanel();
  };
  const currentSettings = DEFAULT_CAMERA[screenCategory];
  useEffect(() => {
    setScreenCategory(getScreenCategory());
  }, []);

  const commonSettings = DEFAULT_CAMERA.common;
  const [isGuiMode, setIsGuiMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Add mobile detection logic
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 576; // You can adjust this breakpoint
      setIsMobile(mobile);
      setModelScale(mobile ? 5 : 7); // Adjust scale for mobile if needed
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Then use this useEffect
  useEffect(() => {
    // Get initial screen category and set initial size
    const initialCategory = getScreenCategory();
    setScreenCategory(initialCategory);
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Debounced resize handler
    const handleResize = debounce(() => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const newCategory = getScreenCategory();
      if (newCategory !== screenCategory) {
        setScreenCategory(newCategory);
      }
    }, 250);

    // Initial call
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [screenCategory]);

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

      const currentCategory = getScreenCategory();

      try {
        // Calculate center of model or use default
        const center = new THREE.Vector3();
        if (modelRef.current) {
          const box = new THREE.Box3().setFromObject(modelRef.current);
          box.getCenter(center);
        }

        // Get camera settings with fallback
        const cameraSettings = getCameraConfig(currentCategory);

        // Set camera position
        cameraRef.current.position.set(
          cameraSettings.position[0],
          cameraSettings.position[1],
          cameraSettings.position[2]
        );

        // Get target position from settings or fallback
        const targetSettings =
          DEFAULT_CAMERA[currentCategory]?.target ||
          DEFAULT_CAMERA["desktop-medium"].target;

        // Set OrbitControls target
        controlsRef.current.target.set(
          targetSettings[0],
          targetSettings[1],
          targetSettings[2]
        );

        // Update FOV if needed
        if (cameraRef.current.fov !== cameraSettings.fov) {
          cameraRef.current.fov = cameraSettings.fov;
          cameraRef.current.updateProjectionMatrix();
        }

        controlsRef.current.update(); // Ensure changes are applied
      } catch (error) {
        console.warn(
          "Error initializing camera, falling back to defaults:",
          error
        );
        // Use desktop-medium as fallback
        const fallbackSettings = DEFAULT_CAMERA["desktop-medium"];
        cameraRef.current.position.set(
          fallbackSettings.position[0],
          fallbackSettings.position[1],
          fallbackSettings.position[2]
        );
        cameraRef.current.fov = fallbackSettings.fov;
        cameraRef.current.updateProjectionMatrix();

        controlsRef.current.target.set(
          fallbackSettings.target[0],
          fallbackSettings.target[1],
          fallbackSettings.target[2]
        );
        controlsRef.current.update();
      }
    };

    // Run initialization
    initializeCamera();
  }, [
    modelRef.current,
    cameraRef.current,
    controlsRef.current,
    screenCategory,
  ]);

  const handleGuiStart = (panel) => {
    if (controlsRef.current) {
      const guiSettings = CONTROL_SETTINGS.guiMode;
      Object.assign(controlsRef.current, guiSettings);
    }
    setIsGuiMode(panel); // Track which panel activated GUI mode
  };

  const handleGuiEnd = () => {
    if (controlsRef.current) {
      const defaultSettings = CONTROL_SETTINGS.default;
      Object.assign(controlsRef.current, defaultSettings);
    }
    setIsGuiMode(false);
  };
  const handleButtonClick = (buttonNumber) => {
    if (!modelRef.current) return;

    const selectionMesh = modelRef.current.getObjectByName(
      `Selection${buttonNumber}`
    );
    if (selectionMesh && selectionMesh.material) {
      gsap.to(selectionMesh.material.uniforms.emission, {
        value: 1,
        duration: 0.9,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(selectionMesh.material.uniforms.emission, {
            value: 0,
            duration: 0.9,
            ease: "power2.in",
          });
        },
      });
    }
  };

  // Animate function for billboarding
  useEffect(() => {
    const animate = () => {
      if (sceneRef.current && camera) {
        sceneRef.current.traverse((object) => {
          if (object.userData.isBillboard) {
            object.lookAt(camera.position); // Make the object face the camera
            // object.rotation.set(0, object.rotation.y, 0); // Reset unwanted rotation
          }
        });
      }
      requestAnimationFrame(animate);
    };

    animate(); // Start the animation loop
  }, [camera]);

  let previousTooltipData = []; // Track previous tooltip data to prevent unnecessary updates

  const handlePointerMove = (event) => {
    if (!camera || !modelRef.current) return;
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1,
      -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    // Add these before the intersectObjects call
    raycaster.near = 0.1;
    raycaster.far = 1000; // Adjust based on your scene scale
    // Collect all interactive objects at once
    const screenObjects = [];
    const markerObjects = [];
    const interactiveObjects = [];

    modelRef.current.traverse((object) => {
      // Collect screens
      if (
        (object.isMesh && object.name.startsWith("Screen")) ||
        (object.isMesh && object.parent?.name.includes("Screen"))
      ) {
        screenObjects.push(object);
      }
      // Collect markers
      if (object.isMarker || object.parent?.isMarker) {
        markerObjects.push(object);
      }
      // Collect candle-related objects
      if (
        object.name.startsWith("ZCandle") ||
        object.name.startsWith("CandleBase") ||
        object.name.startsWith("ZFlame")
      ) {
        interactiveObjects.push(object);
      }
    });

    // Check screen intersections first
    const screenIntersects = raycaster.intersectObjects(screenObjects, true);
    if (screenIntersects.length > 0 && event.type === "click") {
      const clickedObject = screenIntersects[0].object;
      let screenName = clickedObject.name.startsWith("Screen")
        ? clickedObject.name
        : clickedObject.parent.name.replace("001", "");

      const screenView = SCREEN_VIEWS[screenName];

      if (screenView) {
        // Get current content for this screen
        const currentContent = screenStateManager.screenContent[screenName];

        // Create view object with description from current content
        const viewWithDescription = {
          ...screenView,
          fromScreen: true,
          screenName: screenName, // Add screenName for annotation component
          description: currentContent ? currentContent.userName : null,
          showAnnotation: !!currentContent,
        };

        moveCamera(viewWithDescription, null);
        return;
      }
    }

    // Check marker intersections second
    const markerIntersects = raycaster.intersectObjects(markerObjects, true);
    if (markerIntersects.length > 0) {
      let markerObject = markerIntersects[0].object;
      while (markerObject && !markerObject.isMarker) {
        markerObject = markerObject.parent;
      }

      if (markerObject?.markerIndex !== undefined) {
        const markerData = markers?.[markerObject.markerIndex];
        if (markerData && event.type === "click") {
          moveCamera(markerData, markerObject.markerIndex);
        }
      }
      setTooltipData([]);
      return;
    }

    // Check candle intersections last
    const candleIntersects = raycaster.intersectObjects(
      interactiveObjects,
      true
    );

    // Handle all intersections instead of just the first one
    const newTooltipData = [];

    candleIntersects.forEach((intersection) => {
      const intersectedObject = intersection.object;
      const candleNumber = intersectedObject.name.match(/\d+/)?.[0];

      if (candleNumber) {
        let zCandle = null;
        modelRef.current.traverse((object) => {
          if (object.name === `ZCandle${candleNumber}`) {
            zCandle = object;
          }
        });

        if (zCandle && zCandle.userData?.isMelting) {
          const worldPos = new THREE.Vector3();
          zCandle.getWorldPosition(worldPos);
          worldPos.y += 0.5;
          worldPos.project(camera);

          const x = (0.5 + worldPos.x / 2) * canvas.clientWidth;
          const y = (0.5 - worldPos.y / 2) * canvas.clientHeight;

          newTooltipData.push({
            userName: zCandle.userData?.userName || "Anonymous",
            position: { x, y },
            distance: intersection.distance, // Add distance for potential z-ordering
          });
        }
      }
    });

    // Sort tooltips by distance if needed (optional)
    newTooltipData.sort((a, b) => a.distance - b.distance);

    // Update tooltip data with all found intersections
    if (newTooltipData.length > 0) {
      setTooltipData(newTooltipData);
    } else {
      // Clear tooltips if no intersections
      setTooltipData([]);
    }
    if (event.type === "click") {
      const buttonObjects = [];
      modelRef.current.traverse((object) => {
        if (object.name.includes("Button")) {
          buttonObjects.push(object);
        }
      });

      const buttonIntersects = raycaster.intersectObjects(buttonObjects, true);
      if (buttonIntersects.length > 0) {
        const hitObject = buttonIntersects[0].object;
        const buttonNumber = hitObject.name.replace("Button", "");
        const buttonData =
          BUTTON_MESSAGES[hitObject.name] || BUTTON_MESSAGES.default;

        console.log(`${hitObject.name} clicked!`);
        setClickedButtonName(hitObject.name);
        setButtonData(buttonData); // Make sure this state exists
        setButtonPopupVisible(true);
        handleButtonClick(buttonNumber); // Keep the glow effect
      }
    }
  };
  //

  const getCameraView = (view, currentCategory) => {
    try {
      // Get default settings for fallback
      const defaultSettings = getCameraSettings(currentCategory);

      // Check if view and cameraView exist
      if (!view?.cameraView) {
        console.warn("Invalid view data, using default settings");
        return {
          position: defaultSettings.position,
          target: defaultSettings.target,
          fov: defaultSettings.fov,
        };
      }

      // Get category-specific view settings
      const categoryView = view.cameraView[currentCategory];

      // If no settings exist for current category, try fallback to desktop-medium
      if (!categoryView) {
        console.warn(
          `No camera settings for category ${currentCategory}, falling back to desktop-medium`
        );
        const fallbackView = view.cameraView["desktop-medium"];

        if (!fallbackView) {
          return {
            position: defaultSettings.position,
            target: defaultSettings.target,
            fov: defaultSettings.fov,
          };
        }

        // Handle function or direct value
        return {
          position:
            fallbackView.position instanceof Function
              ? fallbackView.position()
              : fallbackView.position,
          target:
            fallbackView.target instanceof Function
              ? fallbackView.target()
              : fallbackView.target,
          fov: fallbackView.fov ?? defaultSettings.fov,
        };
      }

      // Return the view for current category
      return {
        position:
          categoryView.position instanceof Function
            ? categoryView.position()
            : categoryView.position,
        target:
          categoryView.target instanceof Function
            ? categoryView.target()
            : categoryView.target,
        fov: categoryView.fov ?? defaultSettings.fov,
      };
    } catch (error) {
      console.error("Error getting camera view:", error);
      // Final fallback to default camera settings
      const safeSettings = getCameraSettings("desktop-medium");
      return {
        position: safeSettings.position,
        target: safeSettings.target,
        fov: safeSettings.fov,
      };
    }
  };

  const moveCamera = (view, markerIndex = null) => {
    setIsMarkerMovement(true);
    if (!view) {
      console.error("Invalid view data:", view);
      return;
    }

    const currentCategory = screenCategory || "desktop-medium";
    console.log("Move Camera - Category:", currentCategory);
    console.log(
      "Move Camera - Position:",
      view.annotationPosition?.[currentCategory]
    );

    // Get camera view settings
    const cameraView = getCameraView(view, currentCategory);
    if (!cameraView) {
      console.error("Failed to get camera view");
      return;
    }
    onCameraMove();

    onCameraMove();

    setActiveAnnotation({
      text: view.description,
      position: {
        screen: {
          xPercent:
            view.annotationPosition?.[currentCategory]?.xPercent ??
            ANNOTATION_SETTINGS.defaultScreenPosition.xPercent,
          yPercent:
            view.annotationPosition?.[currentCategory]?.yPercent ??
            ANNOTATION_SETTINGS.defaultScreenPosition.yPercent,
        },
      },
      fromScreen: view.fromScreen,
      buttons: view.buttons,
      extraButton: view.extraButton,
    });

    setIsAnnotationVisible(view.showAnnotation ?? true);

    const masterTimeline = gsap.timeline();
    controlsRef.current.autoRotate = false;

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
      );

    // Rest of your timeline setup...
    masterTimeline.eventCallback("onUpdate", () => {
      controlsRef.current.update();
      camera.updateProjectionMatrix();
    });
    masterTimeline.eventCallback("onComplete", () => {
      setIsMarkerMovement(false);
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
      camera.updateProjectionMatrix();
      controlsRef.current.autoRotate = true;
    });
  };
  const getCameraConfig = (category) => {
    try {
      const settings =
        DEFAULT_CAMERA[category] || DEFAULT_CAMERA["desktop-medium"];
      return {
        position: settings.position,
        fov: settings.fov,
        near: DEFAULT_CAMERA.common.near,
        far: DEFAULT_CAMERA.common.far,
      };
    } catch (error) {
      console.warn(`Falling back to default camera settings: ${error.message}`);
      return {
        position: DEFAULT_CAMERA["desktop-medium"].position,
        fov: DEFAULT_CAMERA["desktop-medium"].fov,
        near: DEFAULT_CAMERA.common.near,
        far: DEFAULT_CAMERA.common.far,
      };
    }
  };
  const lastCameraPosition = useRef(null);
  const lastFOV = useRef(null);
  return (
    <>
      {isMobile ? (
        // Mobile version - much simpler Canvas setup
        <Canvas
          style={{
            width: "100vw",
            height: "100vh",
            maxWidth: "none",
            maxHeight: "none",
          }}
          onCreated={({ camera }) => {
            cameraRef.current = camera;
            setCamera(camera);
          }}
        >
          <MobileModel scale={modelScale} setTooltipData={setTooltipData} />
        </Canvas>
      ) : (
        <div
          className="votiveContainer"
          style={{
            position: "absolute",
            top: 0,
            margin: "auto",
            height: "100vh",
            width: "100%",
            maxWidth: "100vw",
            pointerEvents: "auto",
          }}
        >
          {/* <button
          onClick={togglePanel}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
            padding: "10px",
          }}
        >
          Toggle Panel
        </button>

        {isPanelVisible && (
          <LightControlPanel
            lights={{
              spotlight: spotlightRef.current,
              directionalLight1: directionalLight1Ref.current,
              directionalLight2: directionalLight2Ref.current,
              pointLight: pointLightRef.current,
            }}
            scene={sceneRef.current}
            onGuiStart={() => console.log("GUI started")}
            onGuiEnd={() => console.log("GUI ended")}
          />
        )} */}

          {/* <CameraGUI
            cameraRef={cameraRef}
            controlsRef={controlsRef}
            onGuiStart={handleGuiStart}
            onGuiEnd={handleGuiEnd}
            activeAnnotation={activeAnnotation}
            style={{ pointerEvents: "auto" }} // Add this
          /> */}
          <Canvas
            onPointerMove={handlePointerMove}
            onPointerOut={() => setTooltipData([])} // Clear tooltips when pointer leaves canvas
            style={{
              // backgroundColor: "#1b1724",
              // opacity: 0.9,
              width: "100vw", // Full viewport width
              height: "100vh", // Full viewport height
              maxWidth: "none", // Override parent constraints
              maxHeight: "none",
            }}
            camera={getCameraConfig(screenCategory)}
            gl={commonSettings.gl}
            onCreated={({ camera }) => {
              cameraRef.current = camera;
              setCamera(camera);
            }}
          >
            <FlyInEffect
              cameraRef={cameraRef}
              screenCategory={screenCategory} // Ensure this prop is set correctly
              duration={3}
            />
            {/* <Perf position="top-left" /> */}
            <RoomWalls />

            <ambientLight intensity={0.8} />

            <directionalLight position={[0, 5, 0]} castShadow />

            <Model
              url="/slimUltima5.glb"
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
              setTooltipData={setTooltipData}
              onButtonClick={handleButtonClick}
            />
            {/* use this version only when using gui */}

            <OrbitControls
              autoRotate={false}
              autoRotateSpeed={0.001}
              ref={controlsRef}
              {...CONTROL_SETTINGS.default}
              touches={{
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN,
              }}
              onStart={() => {
                if (!isGuiMode) {
                  const defaultSettings = CONTROL_SETTINGS.default;
                  Object.assign(controlsRef.current, defaultSettings);
                  controlsRef.current.update();
                }
                if (
                  lastCameraPosition.current === null &&
                  controlsRef.current?.object
                ) {
                  lastCameraPosition.current =
                    controlsRef.current.object.position.z;
                }
              }}
              onChange={(event) => {
                const camera = event.target?.object;
                if (camera && !isInMarkerView) {
                  if (lastCameraPosition.current === null) {
                    lastCameraPosition.current = camera.position.z;
                    if (camera.position.z < 10) {
                      onZoom?.();
                    }
                    return;
                  }

                  const zDifference = Math.abs(
                    camera.position.z - lastCameraPosition.current
                  );

                  // If we're in a zoomed state (z < 10), stay zoomed
                  if (camera.position.z < 10) {
                    onZoom?.();
                  }
                  // Only reset view if we're actually returning to main view
                  else if (camera.position.z > 10) {
                    onResetView?.();
                  }

                  lastCameraPosition.current = camera.position.z;
                }
              }}
              onTouchStart={(event) => {
                event.preventDefault();
              }}
              onTouchMove={(event) => {
                event.preventDefault();
              }}
            />

            <PostProcessingEffects />
          </Canvas>
          {activeAnnotation && activeAnnotation.fromScreen ? (
            <ScreenAnnotation
              text={activeAnnotation.text}
              isVisible={isAnnotationVisible}
              setIsVisible={setIsAnnotationVisible}
              position={activeAnnotation.position}
              onReset={() => {
                const marker3View = markers[2];
                moveCamera(marker3View, 2);
                onResetView();
              }}
              containerSize={size}
              camera={camera}
              screenName={activeAnnotation.screenName}
            />
          ) : (
            activeAnnotation && (
              <Annotations
                text={activeAnnotation.text}
                isResetVisible={isResetVisible}
                isVisible={isAnnotationVisible}
                setIsVisible={setIsAnnotationVisible}
                position={activeAnnotation.position}
                onReset={resetCamera}
                onMoveCamera={onCameraMove}
                containerSize={size}
                camera={camera}
                buttons={activeAnnotation?.buttons}
                extraButton={activeAnnotation?.buttons?.extraButton}
                screenCategory={screenCategory}
                primary
              />
            )
          )}

          <div className="tooltip-wrapper">
            {tooltipData.map((tooltip, index) => (
              <div
                key={index}
                className="tooltip-container"
                style={{
                  position: "absolute",
                  padding: "8px 12px",
                  left: `${tooltip.position.x}px`,
                  top: `${tooltip.position.y}px`,
                  transform: "translate(-50%, -100%)",
                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                  color: "white",
                  borderRadius: "4px",
                  zIndex: 1000,
                  fontSize: "16px",
                  fontWeight: "600",
                  opacity: tooltip.userName ? 1 : 0,
                  visibility: tooltip.userName ? "visible" : "hidden",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {tooltip.userName}
              </div>
            ))}
          </div>
          {/* After your existing annotation div */}
          {buttonPopupVisible && (
            <div
              style={{
                position: "fixed",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "#fff",
                borderRadius: "5%",
                zIndex: 100000,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px",
                border: "2px solid goldenrod",
                pointerEvents: "auto",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  marginBottom: "10px",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                {buttonData.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  paddingBottom: "15px",
                  textAlign: "center",
                }}
              >
                {buttonData.message}
              </p>
              <button
                onClick={() => setButtonPopupVisible(false)}
                style={{
                  position: "relative",
                  zIndex: 100001,
                  pointerEvents: "auto",
                  cursor: "pointer",
                  padding: "10px",
                  marginTop: "auto",
                  backgroundColor: "goldenrod",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  width: "70px",
                  height: "30px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "16px",
                  fontWeight: "bold",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                OK
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ThreeDVotiveStand;
