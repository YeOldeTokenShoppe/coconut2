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
import { DEFAULT_CAMERA } from "./defaultCamera";
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
  const [buttonData, setButtonData = useState] = useState("");
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
  const [screenCategory, setScreenCategory] = useState("desktop");
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
  useEffect(() => {
    spotlightRef.current = new SpotLight(0xffffff, 1);
    directionalLight1Ref.current = new DirectionalLight(0xffffff, 1);
    directionalLight2Ref.current = new DirectionalLight(0xffffff, 1);
    pointLightRef.current = new PointLight(0xffffff, 1);
  }, []);
  useEffect(() => {
    // Add lights to the scene
    const scene = sceneRef.current;

    if (spotlightRef.current) scene.add(spotlightRef.current);
    if (directionalLight1Ref.current) scene.add(directionalLight1Ref.current);
    if (directionalLight2Ref.current) scene.add(directionalLight2Ref.current);
    if (pointLightRef.current) scene.add(pointLightRef.current);
  }, []);

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
          description: currentContent ? currentContent.userName : null, // This will be used by setActiveAnnotation
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

  const moveCamera = (view, markerIndex = null) => {
    setIsMarkerMovement(true);
    if (!view) {
      console.log("Invalid view data:", view);
      return;
    }

    const screenCategory = getScreenCategory();
    let cameraView;

    // Check if this is a marker view (which uses Three.Vector3)

    if (view.cameraView?.[screenCategory]?.position instanceof Function) {
      // Screen view format
      cameraView = {
        position: view.cameraView[screenCategory].position(),
        target: view.cameraView[screenCategory].target(),
        fov: view.cameraView[screenCategory].fov ?? currentSettings.fov,
      };
    } else {
      // Marker view format
      cameraView = {
        position: view.cameraView[screenCategory].position,
        target: view.cameraView[screenCategory].target,
        fov: view.cameraView[screenCategory].fov ?? currentSettings.fov,
      };
    }

    // Notify the parent that the camera is moving

    onCameraMove(); // This should trigger setIsChandelierVisible(false)

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
      fromScreen: view.fromScreen, // Preserve the fromScreen flag
      extraButton: markerIndex === 3 ? view.extraButton : null,
    });

    setIsAnnotationVisible(view.showAnnotation ?? true);

    const masterTimeline = gsap.timeline();

    controlsRef.current.autoRotate = false;

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
          // onStart: () => console.log("Camera position animation started"),
          // onComplete: () => console.log("Camera position animation completed"),
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
      .call(
        () => {
          if (view.showAnnotation) {
            setIsAnnotationVisible(true);
          }
        },
        [],
        "+=0.3"
      );

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

        <CameraGUI
          cameraRef={cameraRef}
          controlsRef={controlsRef}
          onGuiStart={handleGuiStart}
          onGuiEnd={handleGuiEnd}
          activeAnnotation={activeAnnotation}
          style={{ pointerEvents: "auto" }} // Add this
        />
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
          <Perf position="top-left" />
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
            autoRotate
            autoRotateSpeed={0.05}
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
            }}
            onChange={(event) => {
              const camera = event.target?.object;
              if (camera && !isInMarkerView) {
                if (camera.position.z < 10) {
                  onZoom?.();
                } else if (camera.position.z > 10) {
                  onResetView?.();
                }
              }
            }}
            // Add error handling for touch events
            onTouchStart={(event) => {
              event.preventDefault();
            }}
            onTouchMove={(event) => {
              event.preventDefault();
            }}
          />

          <PostProcessingEffects />
        </Canvas>

        {activeAnnotation && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none", // Allow clicking through to annotations
            }}
          >
            <Annotations
              text={activeAnnotation?.text}
              isResetVisible={isResetVisible}
              isVisible={isAnnotationVisible}
              setIsVisible={setIsAnnotationVisible}
              position={activeAnnotation?.position}
              onReset={() => {
                // Check if we're currently viewing a screen
                const isViewingScreen = activeAnnotation?.fromScreen;

                if (isViewingScreen) {
                  // Return to marker 3's view
                  const marker3View = markers[2]; // Assuming marker 3 is at index 2
                  moveCamera(marker3View, 2);
                } else {
                  // Normal reset behavior for non-screen views
                  resetCamera();
                }
                onResetView(); // Notify parent to show the chandelier
              }}
              onMoveCamera={onCameraMove} // Notify parent to hide the chandelier
              containerSize={size}
              camera={camera}
              extraButton={activeAnnotation?.extraButton} // Pass the extraButton data
            />
          </div>
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
    </>
  );
}

export default ThreeDVotiveStand;
