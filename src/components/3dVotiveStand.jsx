import React, { useRef, useEffect, useState, use } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../utilities/firebaseClient";
import { useGLTF, OrbitControls, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

function Model({
  url,
  scale,
  userData = [],
  setTooltipData,
  setIsLoading,
  controlsRef,
  setActiveAnnotation,
  modelRef, // Pass modelRef as a prop
  handlePointerMove, // Pass handlePointerMove as a prop
  setCamera,
  setMarkers,
}) {
  const gltf = useGLTF(url);
  const { actions, mixer } = useAnimations(gltf.animations, modelRef);
  const { camera, size } = useThree();
  const [debugSpheres, setDebugSpheres] = useState([]);
  const [modelScale, setModraelScale] = useState(0.75);
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetCameraPos] = useState(new THREE.Vector3());
  const [targetLookAt] = useState(new THREE.Vector3());
  const [lerpProgress, setLerpProgress] = useState(0);
  const [targetEndPos, setTargetEndPos] = useState(new THREE.Vector3());
  const [currentView, setCurrentView] = useState(null);
  const [startRotation] = useState(new THREE.Euler());

  useEffect(() => {
    console.log("Model controlsRef:", controlsRef);
    setCamera(camera); // Set the camera reference
  }, [controlsRef.current, camera, setCamera]);

  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  const [markers] = useState([
    {
      position: new THREE.Vector3(-4, 7.5, -0.7),
      label: "View 1",
      description: "This area shows the front of the model with...",
      cameraView: {
        position: new THREE.Vector3(-2.5, 6.5, 2),
        rotation: new THREE.Euler(-Math.PI * 0.15, -Math.PI * 0.2, 0),
        target: new THREE.Vector3(-4, 7.5, -0.7),
      },
    },
    {
      position: new THREE.Vector3(2, 4, 2),
      label: "View 2",
      description: "From this angle you can see...",
      cameraView: {
        position: new THREE.Vector3(8, 3, 5),
      },
    },
    {
      position: new THREE.Vector3(5, 8, -1),
      label: "View 3",
      description: "This perspective reveals...",
      cameraView: {
        position: new THREE.Vector3(0, 8, -8),
      },
    },
  ]);

  useEffect(() => {
    if (typeof setMarkers === "function") {
      setMarkers(markers); // Set the markers reference
    }
  }, [markers, setMarkers]);

  const handleIntersection = (event, intersectedMarker) => {
    const markerIndex = intersectedMarker.parent.markerIndex;
    const markerData = markers?.[markerIndex];

    if (!markerData) {
      console.warn(`No marker data found for index ${markerIndex}`);
      return;
    }

    const worldPos = new THREE.Vector3();
    intersectedMarker.getWorldPosition(worldPos);
    const screenPos = worldPos.clone();
    screenPos.project(camera);

    // Show annotation on hover
    setActiveAnnotation({
      text: markerData.description,
      position: {
        x: (0.5 + screenPos.x / 2) * window.innerWidth,
        y: (0.5 - screenPos.y / 2) * window.innerHeight,
      },
    });

    // Move camera on click
    if (event.type === "click") {
      moveCamera(markerData);
    }
  };

  useEffect(() => {
    const logCameraPosition = (event) => {
      if (event.key === "l") {
        console.log("Camera Position:", camera.position);
        console.log("Camera Rotation:", camera.rotation);
      }
    };

    window.addEventListener("keydown", logCameraPosition);

    return () => {
      window.removeEventListener("keydown", logCameraPosition);
    };
  }, [camera]);

  useEffect(() => {
    if (modelRef.current) {
      console.log("Creating markers");

      markers.forEach((marker, index) => {
        const markerGroup = new THREE.Group();

        const createMarkerFace = () => {
          const face = new THREE.Group();

          const markerGeometry = new THREE.CircleGeometry(0.15, 32);
          const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
          });
          const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);

          const borderGeometry = new THREE.RingGeometry(0.16, 0.2, 32);
          const borderMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
          });
          const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);

          const canvas = document.createElement("canvas");
          canvas.width = 64;
          canvas.height = 64;
          const context = canvas.getContext("2d");
          context.fillStyle = "white";
          context.font = "bold 40px Arial";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText((index + 1).toString(), 32, 32);

          const numberTexture = new THREE.CanvasTexture(canvas);
          const numberGeometry = new THREE.PlaneGeometry(0.2, 0.2);
          const numberMaterial = new THREE.MeshBasicMaterial({
            map: numberTexture,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
          numberMesh.position.z = 0.01;

          face.add(markerMesh);
          face.add(borderMesh);
          face.add(numberMesh);

          markerMesh.isBillboard = true;
          borderMesh.isBillboard = true;
          numberMesh.isBillboard = true;

          return face;
        };

        const frontFace = createMarkerFace();
        const backFace = createMarkerFace();
        backFace.rotation.y = Math.PI;

        markerGroup.add(frontFace);
        markerGroup.add(backFace);

        markerGroup.position.copy(marker.position);

        markerGroup.isMarker = true;
        markerGroup.markerIndex = index;

        modelRef.current.add(markerGroup);
        markerGroup.lookAt(camera.position);
      });
    }
  }, [markers, modelRef, camera]);
  useEffect(() => {
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = box.getCenter(new THREE.Vector3());
      modelRef.current.position.sub(center);
      modelRef.current.scale.set(scale, scale, scale);

      const action = actions["Take 001"];
      if (action) {
        action.reset();
        action.setEffectiveTimeScale(0.5);
        action.setLoop(THREE.LoopRepeat);
        action.play();
      }

      // Randomly assign candles for each user in `userData`
      const candleIndexes = Array.from({ length: 52 }, (_, i) => i);
      const assignedIndexes = [];
      while (assignedIndexes.length < userData.length) {
        const randomIndex = Math.floor(Math.random() * candleIndexes.length);
        assignedIndexes.push(candleIndexes.splice(randomIndex, 1)[0]);
      }

      // Inside the Model component's useEffect, update the flame setup section:
      // First, let's store candle positions in a map
      const candlePositions = new Map();
      let userIndex = 0;

      // First pass: store candle positions
      modelRef.current.traverse((child) => {
        if (child.name.startsWith("ZCandle")) {
          child.visible = true;

          const candleIndex = parseInt(child.name.replace("ZCandle", ""), 10);

          if (
            assignedIndexes.includes(candleIndex) &&
            userIndex < userData.length
          ) {
            const user = userData[userIndex];
            if (user) {
              child.userData.isMelting = true;
              child.userData.initialHeight = child.scale.y;
              child.userData.userName = user.userName;
              // Store the candle's position
              candlePositions.set(candleIndex, {
                x: child.position.x,
                y: child.position.y,
                z: child.position.z,
                userName: user.userName,
              });
              userIndex++;
            }
          }
        }
      });

      modelRef.current.traverse((child) => {
        if (child.name.startsWith("ZFlame")) {
          child.visible = false;

          const flameIndex = parseInt(child.name.replace("ZFlame", ""), 10);

          if (
            assignedIndexes.includes(flameIndex) &&
            assignedIndexes.indexOf(flameIndex) < userData.length
          ) {
            const correspondingUser =
              userData[assignedIndexes.indexOf(flameIndex)];

            // Get the stored candle position
            const candlePos = candlePositions.get(flameIndex);

            if (candlePos) {
              child.visible = true;
              child.userData.isFlame = true;
              child.userData.userName = correspondingUser.userName;

              // Set flame position to match candle
              child.position.set(candlePos.x, candlePos.y, candlePos.z);

              const debugGeometry = new THREE.SphereGeometry(0.1, 16, 16);

              const debugMaterial = new THREE.MeshBasicMaterial({
                color: "black",
                transparent: true,
                opacity: 0,
                depthTest: false,
                depthWrite: false,
              });
              const debugSphere = new THREE.Mesh(debugGeometry, debugMaterial);

              // Position the debug sphere at the candle's position
              debugSphere.position.set(
                candlePos.x,
                candlePos.y + child.scale.y * 10 + 0.2,
                candlePos.z
              );

              debugSphere.raycast = THREE.Mesh.prototype.raycast;
              debugSphere.userData = {
                userName: correspondingUser.userName,
                candleIndex: flameIndex,
                isDebugSphere: true,
              };

              debugSphere.renderOrder = 999;

              // Store reference to debug sphere
              child.userData.debugSphere = debugSphere;
              modelRef.current.add(debugSphere);

              console.log(
                "Added debug sphere for flame:",
                flameIndex,
                "user:",
                correspondingUser.userName,
                "position:",
                debugSphere.position.toArray(),
                "candle position:",
                [candlePos.x, candlePos.y, candlePos.z]
              );
            }
          }
        }
      });

      const createVideoTexture = () => {
        const video = document.createElement("video");
        video.src = "/noise.mp4";
        video.loop = true;
        video.muted = true;
        video.play();

        const texture = new THREE.VideoTexture(video);

        // Rotate texture
        texture.center.set(0.5, 0.5);
        texture.rotation = Math.PI / 2;

        // Scale texture
        texture.repeat.set(1, 1); // Adjust these values to scale
        texture.offset.set(0, 0); // Adjust these values to move the texture

        texture.needsUpdate = true;
        return texture;
      };

      const videoTextures = {
        Screen1: createVideoTexture(),
        Screen2: createVideoTexture(),
        Screen3: createVideoTexture(),
        Screen4: createVideoTexture(),
        Screen5: createVideoTexture(),
        Screen6: createVideoTexture(),
      };

      modelRef.current.traverse((child) => {
        if (child.isMesh && child.material && child.name.startsWith("Screen")) {
          const newMaterial = new THREE.MeshStandardMaterial();
          newMaterial.map = videoTextures[child.name];
          newMaterial.needsUpdate = true;
          child.material = newMaterial;
        }
      });

      // Add event listeners
      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.style.cursor = "pointer";
        canvas.addEventListener("pointermove", handlePointerMove);
        canvas.addEventListener("click", handlePointerMove);
      }

      // Cleanup function
      return () => {
        const canvas = document.querySelector("canvas");
        if (canvas) {
          canvas.removeEventListener("pointermove", handlePointerMove);
          canvas.removeEventListener("click", handlePointerMove);
        }
        // Clean up debug spheres
        // modelRef.current?.traverse((child) => {
        //   if (child.name.startsWith("ZFlame") && child.userData?.debugSphere) {
        //     modelRef.current.remove(child.userData.debugSphere);
        //   }
        // });
        if (mixer) mixer.stopAllAction();
      };
    }
  }, [gltf, userData, actions, mixer, scale]);

  return (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      position={[0, -5, 0]}
      scale={scale}
      onPointerMove={(e) => handlePointerMove(e.nativeEvent)}
      onClick={(e) => handlePointerMove(e.nativeEvent)}
    />
  );
}

function ThreeDVotiveStand({ setIsLoading }) {
  const [isClient, setIsClient] = useState(false);
  const [userData, setUserData] = useState([]);
  const [tooltipData, setTooltipData] = useState(null);
  const [modelScale, setModelScale] = useState(1);
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef();
  const [activeAnnotation, setActiveAnnotation] = useState(null);
  const [camera, setCamera] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const moveCamera = (view) => {
    if (!view?.cameraView) return;

    const duration = 1.5;
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }

    gsap.to(camera.position, {
      x: view.cameraView.position.x,
      y: view.cameraView.position.y,
      z: view.cameraView.position.z,
      duration,
      ease: "power2.inOut",
    });

    if (view.cameraView.rotation) {
      gsap.to(camera.rotation, {
        x: view.cameraView.rotation.x,
        y: view.cameraView.rotation.y,
        z: view.cameraView.rotation.z,
        duration,
        ease: "power2.inOut",
      });
    }

    if (view.cameraView.target && controlsRef.current) {
      gsap.to(controlsRef.current.target, {
        x: view.cameraView.target.x,
        y: view.cameraView.target.y,
        z: view.cameraView.target.z,
        duration,
        ease: "power2.inOut",
        onComplete: () => {
          if (controlsRef.current) {
            controlsRef.current.enabled = true;
            controlsRef.current.update();
          }
        },
      });
    }
  };

  const handlePointerMove = (event) => {
    if (!setActiveAnnotation) {
      console.warn("setActiveAnnotation not provided to Model component");
      return;
    }

    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();

    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    if (camera) {
      raycaster.setFromCamera(mouse, camera);
    }

    const markerObjects = [];
    const debugSpheres = [];
    modelRef.current?.traverse((object) => {
      if (object.isMarker) {
        markerObjects.push(object);
      }
      if (object.userData?.isDebugSphere) {
        debugSpheres.push(object);
      }
    });

    const intersects = raycaster.intersectObjects(markerObjects, true);
    const intersectsDebugSpheres = raycaster.intersectObjects(
      debugSpheres,
      true
    );
    if (intersects.length > 0) {
      const intersectedMarker = intersects[0].object.parent;
      const markerIndex = intersectedMarker.markerIndex;
      const markerData = markers?.[markerIndex];

      if (!markerData) {
        console.warn(`No marker data found for index ${markerIndex}`);
        return;
      }

      // Handle click
      if (event.type === "click") {
        moveCamera(markerData);
      }

      const worldPos = new THREE.Vector3();
      intersectedMarker.getWorldPosition(worldPos);
      const screenPos = worldPos.clone();
      screenPos.project(camera);

      const screenX = (0.5 + screenPos.x / 2) * size.width;
      const screenY = (0.5 - screenPos.y / 2) * size.height;

      // Handle hover - show annotation
      setActiveAnnotation({
        text: markerData.description,
        position: {
          x: screenX + 0.01,
          y: screenY - 0.01,
        },
      });

      // Handle click - move camera
      if (event.type === "click") {
        console.log("Click detected on marker:", markerIndex);
        console.log("Marker data:", markerData);
        console.log("Camera view data:", markerData.cameraView);
        moveCamera(markerData);
      }
    } else {
      setActiveAnnotation(null);
    }

    if (intersectsDebugSpheres.length > 0) {
      const intersectedSphere = intersectsDebugSpheres[0].object;

      const worldPos = new THREE.Vector3();
      intersectedSphere.getWorldPosition(worldPos);
      const screenPos = worldPos.clone();
      screenPos.project(camera);

      const screenX = (0.5 + screenPos.x / 2) * size.width;
      const screenY = (0.5 - screenPos.y / 2) * size.height;

      setTooltipData([
        {
          userName: intersectedSphere.userData.userName,
          position: {
            x: screenX,
            y: screenY,
          },
        },
      ]);
    } else {
      setTooltipData(null);
    }
  };

  // Adjust camera FOV based on screen width
  const adjustCameraFOV = () => {
    const width = window.innerWidth;
    return width < 768 ? 80 : width < 1200 ? 50 : 40;
  };

  return (
    <div
      className="canvas-container"
      style={{
        position: "relative",
        // width: "100%",
        // height: "100vh",
        paddingBottom: "8rem", // Adjust spacing
        // touchAction: "none",
      }}
      // onPointerDown={(e) => e.stopPropagation()} // Prevent pointer events from reaching the parent
    >
      <Canvas
        camera={{
          position: [0, -5, 27], // Adjust for a 3/4 view angle
          fov: 45, // Reduce fov for a less exaggerated perspective
          near: 0.1,
          far: 1000,
        }}
        style={{
          width: "100%",
          height: "70rem",
          paddingTop: "8rem",
          paddingBottom: "1rem",
          marginBottom: "5rem",
          zIndex: "23",
          pointerEvents: "auto",
        }}
        // gl={{
        //   antialias: true,
        //   pixelRatio: Math.min(window.devicePixelRatio, 2),
        // }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[7, 2, 2]} castShadow />
        <Model
          url="/ultima3.glb"
          scale={modelScale}
          setIsLoading={setIsLoading}
          controlsRef={controlsRef}
          modelRef={modelRef}
          handlePointerMove={handlePointerMove}
          setCamera={setCamera}
          setMarkers={setMarkers}
          markers={markers} // Add this prop
          moveCamera={moveCamera}
        />

        <OrbitControls
          ref={controlsRef}
          target={[0, 0, 0]}
          autoRotate={false}
          autoRotateSpeed={0.3}
          interpolate={true}
          enableZoom={false} // Enable zoom
          minDistance={15} // Match min field of view
          maxZoom={45} // Match max field of view
          enablePan={false}
          minDistance={5} // Allow closer zoom
          maxDistance={33}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      {activeAnnotation && (
        <>
          {console.log("Rendering annotation:", activeAnnotation)}
          <div
            className="annotation"
            style={{
              position: "absolute",
              left: `${activeAnnotation.position.x - 1}px`,
              top: `${activeAnnotation.position.y - 1}px`,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              padding: "10px",
              color: "#fff",
              zIndex: 99999,
              // opacity: 1,
              // transform: "translateY(0)",
            }}
          >
            {activeAnnotation.text}
          </div>
        </>
      )}

      <div className="threejs-padding"></div>
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
  );
}

export default ThreeDVotiveStand;
