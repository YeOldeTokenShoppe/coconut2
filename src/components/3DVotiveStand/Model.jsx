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
// import { OrbitControls } from "@react-three/drei";
import { BoxHelper, AxesHelper, PointLightHelper } from "three";
import { DirectionalLight, PointLight, DirectionalLightHelper } from "three";
import gsap from "gsap";
import DarkClouds from "./Clouds";
import HolographicStatue from "./HolographicStatue";
// import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GUI } from "lil-gui";
import FloatingCandleViewer from "./CandleInteraction";
import gui from "lil-gui";
import BackgroundEffects from "./BackgroundEffects";
import FloatingPhoneViewer from "./FloatingPhoneViewer";
import coffeeSmokeVertexShader from "./shaders/coffeeSmoke/vertex.glsl";
import coffeeSmokeFragmentShader from "./shaders/coffeeSmoke/fragment.glsl";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import CoffeeSmoke from "./CoffeeSmoke";
import {
  VideoTexture,
  LinearFilter,
  DoubleSide,
  MeshBasicMaterial,
} from "three";

function Model({
  scale,
  setTooltipData,
  setShowSpotify,
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
  setShowPhoneViewer,
  showPhoneViewer,
  onCandleSelect,

  showWebContent,
  setShowWebContent,
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
  // const [showSpotify, setShowSpotify] = useState(false);
  const directionalLightRef = useRef();
  const ambientLightRef = useRef();
  const hemisphereLightRef = useRef();
  const directionalLightHelperRef = useRef();
  const hemisphereLightHelperRef = useRef();
  // const guiRef = useRef();
  const box = new THREE.Box3();
  // const gui = new GUI();
  const previousCandleRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const mouseDelta = useRef({ x: 0, y: 0 });
  const previousMousePosition = useRef({ x: 0, y: 0 });

  const videoRef = useRef(null);
  const cameraPositions = {
    default: new THREE.Vector3(-4.03, 25.2, 64.78),
    closeup: new THREE.Vector3(-13.8, 22.8, -16.8),
  };
  const [selectedCandle, setSelectedCandle] = useState(null);
  const textureLoader = new THREE.TextureLoader();
  // Smoke effect references
  // const SmokeComponent = CoffeeSmoke();
  // function CoffeeSmoke() {
  //   const smokeRef = useRef();
  //   const canvas = document.querySelector("canvas.webgl");
  //   const clockRef = useRef(new THREE.Clock());

  //   // Scene
  //   const scene = new THREE.Scene();

  //   // Loaders
  //   const sizes = {
  //     width: window.innerWidth,
  //     height: window.innerHeight,
  //   };

  //   window.addEventListener("resize", () => {
  //     // Update sizes
  //     sizes.width = window.innerWidth;
  //     sizes.height = window.innerHeight;

  //     // Update camera
  //     camera.aspect = sizes.width / sizes.height;
  //     camera.updateProjectionMatrix();

  //     // Update renderer
  //     renderer.setSize(sizes.width, sizes.height);
  //     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  //   });
  //   // Create geometry
  //   const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
  //   smokeGeometry.translate(0, 0.5, 0);
  //   smokeGeometry.scale(0.75, 3, 0.75);

  //   // Load perlin texture
  //   const textureLoader = new THREE.TextureLoader();
  //   const perlinTexture = textureLoader.load("./perlin.png");
  //   perlinTexture.wrapS = THREE.RepeatWrapping;
  //   perlinTexture.wrapT = THREE.RepeatWrapping;

  //   // Material
  //   const smokeMaterial = new THREE.ShaderMaterial({
  //     vertexShader: coffeeSmokeVertexShader,
  //     fragmentShader: coffeeSmokeFragmentShader,
  //     uniforms: {
  //       uTime: new THREE.Uniform(0),
  //       uPerlinTexture: new THREE.Uniform(perlinTexture),
  //     },
  //     side: THREE.DoubleSide,
  //     transparent: true,
  //     depthWrite: false,
  //     depthTest: false,
  //   });
  //   const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
  //   smoke.position.y = 1.83;
  //   scene.add(smoke);

  //   // Animation
  //   // useFrame((state) => {
  //   //   if (smokeRef.current) {
  //   //     smokeRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
  //   //   }
  //   // });
  //   useFrame(() => {
  //     const elapsedTime = clockRef.current.getElapsedTime();

  //     // Update smoke
  //     if (smokeRef.current) {
  //       smokeRef.current.material.uniforms.uTime.value = elapsedTime;
  //     }
  //   });

  //   return (
  //     <mesh
  //       // ref={smokeRef}
  //       geometry={smokeGeometry}
  //       material={smokeMaterial}
  //       position={[11.5, 9, -4.9]}
  //     />
  //   );
  // }
  // const [isPlaying, setIsPlaying] = useState(false);
  // const audioRef = useRef(null);

  // useEffect(() => {
  //   audioRef.current = new Audio("/every1.mp3");
  //   audioRef.current.loop = true;

  //   return () => {
  //     if (audioRef.current) {
  //       audioRef.current.pause();
  //       audioRef.current.currentTime = 0;
  //     }
  //   };

  const handleCandleClick = (event) => {
    event.stopPropagation();

    if (showFloatingViewer) return;

    const mouse = new THREE.Vector2();
    mouse.x =
      (event.nativeEvent.offsetX / event.nativeEvent.target.clientWidth) * 2 -
      1;
    mouse.y =
      -(event.nativeEvent.offsetY / event.nativeEvent.target.clientHeight) * 2 +
      1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersectableObjects = [];
    modelRef.current.traverse((object) => {
      if (
        object.name === "Object_5" ||
        object.parent?.name === "Object_5" ||
        object.name.startsWith("Boombox") ||
        object.name.toLowerCase().includes("ball") ||
        object.name.startsWith("VCANDLE") ||
        object.name.startsWith("Keyboard") // Added Keyboard to click detection
      ) {
        console.log("Found clickable object:", object.name); // Debug log
        intersectableObjects.push(object);

        // Handle VCANDLE children
        if (object.name.startsWith("VCANDLE")) {
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
      }
    });

    console.log("Total clickable objects:", intersectableObjects.length); // Debug log
    const intersects = raycaster.intersectObjects(intersectableObjects, true);
    console.log(
      "Intersected objects:",
      intersects.map((i) => i.object.name)
    ); // Debug log

    if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      console.log("Clicked object:", hitObject.name); // Debug log

      if (hitObject.name.startsWith("Keyboard")) {
        console.log("Processing keyboard click");
        const screen = modelRef.current.getObjectByName("Screen1");

        if (screen) {
          if (showWebContent) {
            // Switch back to video
            const video = videoRef.current;
            const videoTexture = new VideoTexture(video);
            videoTexture.minFilter = LinearFilter;
            videoTexture.magFilter = LinearFilter;
            videoTexture.format = THREE.RGBAFormat;
            videoTexture.anisotropy = 16;
            videoTexture.rotation = Math.PI / -2;
            videoTexture.center.set(0.5, 0.5);
            videoTexture.flipY = false;

            screen.material = new MeshBasicMaterial({
              map: videoTexture,
              side: DoubleSide,
              transparent: false,
              opacity: 1,
              color: 0xffffff,
            });

            video.play().catch(console.error);
          } else {
            // Switch to HTML content
            if (videoRef.current) {
              videoRef.current.pause();
            }

            const htmlTexture = createHTMLTexture();
            screen.material = new MeshBasicMaterial({
              map: htmlTexture,
              side: DoubleSide,
              transparent: false,
              opacity: 1,
              color: 0xffffff,
            });
          }
          screen.material.needsUpdate = true;
        }

        setShowWebContent((prev) => !prev);
        return;
      }

      // Handle other clicks
      if (
        hitObject.name === "Object_5" ||
        hitObject.parent?.name === "Object_5.001"
      ) {
        const modal = document.getElementById("phoneModal");
        if (modal) {
          modal.style.display = "flex";
          modal.onclick = (e) => {
            if (e.target === modal) {
              modal.style.display = "none";
            }
          };
        }
        return;
      }

      if (
        hitObject.name.startsWith("Boombox") ||
        (hitObject.parent && hitObject.parent.name.startsWith("Boombox"))
      ) {
        console.log("Boombox clicked!");
        setShowSpotify((prev) => !prev);
        return;
      }

      if (hitObject.name.toLowerCase().includes("ball")) {
        console.log("Ball clicked!");
        const modal = document.getElementById("magic8Modal");
        if (modal) {
          modal.style.display = "flex";
        }
        return;
      }

      // Handle candle click
      let candleParent = hitObject;
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

  // Helper function to create and setup a video element with iOS support
  const createVideoElement = (src) => {
    const video = document.createElement("video");

    // Essential attributes for iOS
    video.playsInline = true;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.crossOrigin = "anonymous";
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.src = src;

    // Return the video element immediately without trying to play
    return video;
  };

  const createHTMLTexture = () => {
    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext("2d");

    // Fill background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some content
    ctx.fillStyle = "black";
    ctx.font = "48px Arial";
    ctx.fillText("Interactive Screen Content", 50, 100);

    ctx.font = "24px Arial";
    ctx.fillText(
      "This is your HTML content displayed on the 3D screen.",
      50,
      200
    );

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.rotation = Math.PI / -2;
    texture.center.set(0.5, 0.5);
    texture.flipY = false;

    return texture;
  };
  useEffect(() => {
    if (!modelRef.current) return;

    const screen = modelRef.current.getObjectByName("Screen1");
    const keyboards = [
      modelRef.current.getObjectByName("Keyboard"),
      modelRef.current.getObjectByName("Keyboard_1"),
      modelRef.current.getObjectByName("Keyboard_2"),
    ].filter(Boolean);

    if (!screen || keyboards.length === 0) return;

    // Create video and texture
    const video = createVideoElement("/13.mp4");
    videoRef.current = video;

    const videoTexture = new VideoTexture(video);
    videoTexture.minFilter = LinearFilter;
    videoTexture.magFilter = LinearFilter;
    videoTexture.format = THREE.RGBAFormat;
    videoTexture.anisotropy = 16;
    videoTexture.rotation = Math.PI / -2;
    videoTexture.center.set(0.5, 0.5);
    videoTexture.flipY = false;

    const videoMaterial = new MeshBasicMaterial({
      map: videoTexture,
      side: DoubleSide,
      transparent: false,
      opacity: 1,
      color: 0xffffff,
    });

    screen.material = videoMaterial;
    screen.material.needsUpdate = true;

    // Define event handlers outside the forEach
    const onKeyboardHover = (event) => {
      console.log("Keyboard hover:", event.type);
      document.body.style.cursor =
        event.type === "pointerenter" ? "pointer" : "auto";
    };

    const onKeyboardClick = async () => {
      console.log("Keyboard clicked");
      setShowWebContent((prev) => {
        const newState = !prev;
        if (newState) {
          video.pause();
        } else {
          video.play().catch(console.error);
        }
        return newState;
      });
    };

    // Set up keyboard interactions
    keyboards.forEach((keyboard) => {
      keyboard.raycast = new THREE.Mesh().raycast;
      keyboard.userData.interactive = true;
    });

    // Try to play the video after setup
    const startPlayback = async () => {
      try {
        await video.play();
        console.log("Video playing successfully");
      } catch (error) {
        console.log("Initial playback prevented:", error);
        const playOnClick = async () => {
          try {
            await video.play();
            document.removeEventListener("click", playOnClick);
          } catch (e) {
            console.error("Play on click failed:", e);
          }
        };
        document.addEventListener("click", playOnClick);
      }
    };

    // Start video playback when loaded
    video.addEventListener("loadeddata", () => {
      console.log("Video loaded, starting playback");
      startPlayback();
    });

    // Cleanup function
    return () => {
      keyboards.forEach((keyboard) => {});

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
      }
      if (videoTexture) {
        videoTexture.dispose();
      }
      if (videoMaterial) {
        videoMaterial.dispose();
      }
    };
  }, [modelRef.current]);
  useEffect(() => {
    if (modelRef.current) {
      const screen = modelRef.current.getObjectByName("Screen2");

      if (screen) {
        const video = createVideoElement("/14.mp4");

        const videoTexture = new VideoTexture(video);
        videoTexture.minFilter = LinearFilter;
        videoTexture.magFilter = LinearFilter;
        videoTexture.format = THREE.RGBAFormat;
        videoTexture.anisotropy = 16;
        videoTexture.rotation = Math.PI / -2;
        videoTexture.center.set(0.5, 0.5);
        videoTexture.flipY = false;

        screen.material = new MeshBasicMaterial({
          map: videoTexture,
          side: DoubleSide,
          transparent: false,
          opacity: 1,
          color: 0xffffff,
        });

        screen.material.needsUpdate = true;

        // Cleanup
        return () => {
          video.pause();
          video.src = "";
          video.load();
          videoTexture.dispose();
        };
      }
    }
  }, [modelRef.current]);
  useEffect(() => {
    if (modelRef.current) {
      const screen = modelRef.current.getObjectByName("Screen3");

      if (screen) {
        const video = createVideoElement("/15.mp4");

        const videoTexture = new VideoTexture(video);
        videoTexture.minFilter = LinearFilter;
        videoTexture.magFilter = LinearFilter;
        videoTexture.format = THREE.RGBAFormat;
        videoTexture.anisotropy = 16;
        videoTexture.rotation = Math.PI / -2;
        videoTexture.center.set(0.5, 0.5);
        videoTexture.flipY = false;

        screen.material = new MeshBasicMaterial({
          map: videoTexture,
          side: DoubleSide,
          transparent: false,
          opacity: 1,
          color: 0xffffff,
        });

        screen.material.needsUpdate = true;

        // Cleanup
        return () => {
          video.pause();
          video.src = "";
          video.load();
          videoTexture.dispose();
        };
      }
    }
  }, [modelRef.current]);
  useEffect(() => {
    if (modelRef.current) {
      const screen = modelRef.current.getObjectByName("Screen4");

      if (screen) {
        const video = createVideoElement("/12.mp4");

        const videoTexture = new VideoTexture(video);
        videoTexture.minFilter = LinearFilter;
        videoTexture.magFilter = LinearFilter;
        videoTexture.format = THREE.RGBAFormat;
        videoTexture.anisotropy = 16;
        videoTexture.rotation = Math.PI / -2;
        videoTexture.center.set(0.5, 0.5);
        videoTexture.flipY = false;

        screen.material = new MeshBasicMaterial({
          map: videoTexture,
          side: DoubleSide,
          transparent: false,
          opacity: 1,
          color: 0xffffff,
        });

        screen.material.needsUpdate = true;

        // Cleanup
        return () => {
          video.pause();
          video.src = "";
          video.load();
          videoTexture.dispose();
        };
      }
    }
  }, [modelRef.current]);
  useEffect(() => {
    if (modelRef.current) {
      const screen = modelRef.current.getObjectByName("Screen5");

      if (screen) {
        const video = createVideoElement("/3.mp4");

        const videoTexture = new VideoTexture(video);
        videoTexture.minFilter = LinearFilter;
        videoTexture.magFilter = LinearFilter;
        videoTexture.format = THREE.RGBAFormat;
        videoTexture.anisotropy = 16;
        videoTexture.rotation = Math.PI / -2;
        videoTexture.center.set(0.5, 0.5);
        videoTexture.flipY = false;

        screen.material = new MeshBasicMaterial({
          map: videoTexture,
          side: DoubleSide,
          transparent: false,
          opacity: 1,
          color: 0xffffff,
        });

        screen.material.needsUpdate = true;

        // Cleanup
        return () => {
          video.pause();
          video.src = "";
          video.load();
          videoTexture.dispose();
        };
      }
    }
  }, [modelRef.current]);
  useEffect(() => {
    if (modelRef.current) {
      const screen = modelRef.current.getObjectByName("Screen6");

      if (screen) {
        const video = createVideoElement("/20.mp4");

        const videoTexture = new VideoTexture(video);
        videoTexture.minFilter = LinearFilter;
        videoTexture.magFilter = LinearFilter;
        videoTexture.format = THREE.RGBAFormat;
        videoTexture.anisotropy = 16;
        videoTexture.rotation = Math.PI / -2;
        videoTexture.center.set(0.5, 0.5);
        videoTexture.flipY = false;

        screen.material = new MeshBasicMaterial({
          map: videoTexture,
          side: DoubleSide,
          transparent: false,
          opacity: 1,
          color: 0xffffff,
        });

        screen.material.needsUpdate = true;

        // Cleanup
        return () => {
          video.pause();
          video.src = "";
          video.load();
          videoTexture.dispose();
        };
      }
    }
  }, [modelRef.current]);

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
  // const object5 = scene.getObjectByName("Object_5");

  // if (object5) {
  //   const worldPosition = new THREE.Vector3();
  //   object5.getWorldPosition(worldPosition);
  //   console.log("Object 5 World Position:", worldPosition);
  // }

  // const helpers = useRef({});

  // useEffect(() => {
  //   const gui = new GUI();

  //   // === Point Light 1 ===
  //   const pointLight1 = new THREE.PointLight(0xff00ff, 10, 100);
  //   pointLight1.position.set(4, 23, -90);
  //   pointLight1.decay = 2;
  //   pointLight1.castShadow = true;

  //   const helper1 = new THREE.PointLightHelper(pointLight1, 15);
  //   helpers.current.pointLight1 = helper1;
  //   scene.add(pointLight1);

  //   const pointLight1Folder = gui.addFolder("Point Light 1");
  //   const pointLight1Settings = {
  //     color: "#ff00ff",
  //     showHelper: false,
  //   };
  //   pointLight1Folder
  //     .add(pointLight1, "intensity", 0, 10, 0.1)
  //     .name("Intensity");
  //   pointLight1Folder
  //     .add(pointLight1.position, "x", -300, 300, 1)
  //     .name("Position X");
  //   pointLight1Folder
  //     .add(pointLight1.position, "y", -300, 300, 1)
  //     .name("Position Y");
  //   pointLight1Folder
  //     .add(pointLight1.position, "z", -300, 300, 1)
  //     .name("Position Z");

  //   // Color Picker
  //   pointLight1Folder
  //     .addColor(pointLight1Settings, "color")
  //     .name("Color")
  //     .onChange((value) => pointLight1.color.set(value));

  //   // Helper Toggle
  //   pointLight1Folder
  //     .add(pointLight1Settings, "showHelper")
  //     .name("Toggle Helper")
  //     .onChange((value) =>
  //       value ? scene.add(helper1) : scene.remove(helper1)
  //     );

  //   // === Point Light 2 ===
  //   const pointLight2 = new THREE.PointLight(0xa6ffff, 10, 200);
  //   pointLight2.position.set(-220, 195, 300);
  //   pointLight2.decay = 2;
  //   pointLight2.castShadow = true;

  //   const helper2 = new THREE.PointLightHelper(pointLight2, 15);
  //   helpers.current.pointLight2 = helper2;
  //   scene.add(pointLight2);

  //   const pointLight2Folder = gui.addFolder("Point Light 2");
  //   const pointLight2Settings = {
  //     color: "#a6ffff",
  //     showHelper: false,
  //   };
  //   pointLight2Folder
  //     .add(pointLight2, "intensity", 0, 10, 0.1)
  //     .name("Intensity");
  //   pointLight2Folder
  //     .add(pointLight2.position, "x", -300, 300, 1)
  //     .name("Position X");
  //   pointLight2Folder
  //     .add(pointLight2.position, "y", -300, 300, 1)
  //     .name("Position Y");
  //   pointLight2Folder
  //     .add(pointLight2.position, "z", -300, 300, 1)
  //     .name("Position Z");

  //   // Color Picker
  //   pointLight2Folder
  //     .addColor(pointLight2Settings, "color")
  //     .name("Color")
  //     .onChange((value) => pointLight2.color.set(value));

  //   // Helper Toggle
  //   pointLight2Folder
  //     .add(pointLight2Settings, "showHelper")
  //     .name("Toggle Helper")
  //     .onChange((value) =>
  //       value ? scene.add(helper2) : scene.remove(helper2)
  //     );

  //   // === Ambient Light ===
  //   const ambientLight = new THREE.AmbientLight(0x888888, 1);
  //   scene.add(ambientLight);

  //   const ambientFolder = gui.addFolder("Ambient Light");
  //   ambientFolder.add(ambientLight, "intensity", 0, 5, 0.1).name("Intensity");

  //   // === Hemisphere Light ===
  //   const hemiLight = new THREE.HemisphereLight(0x0055ff, 0xff0000, 0.9);
  //   hemiLight.position.set(0, 30, 30);
  //   scene.add(hemiLight);

  //   const hemiHelper = new THREE.HemisphereLightHelper(hemiLight, 20);
  //   helpers.current.hemiLight = hemiHelper;

  //   const hemiLightSettings = {
  //     color: "#0055ff",
  //     groundColor: "#ff0000",
  //     showHelper: false,
  //   };

  //   const hemiFolder = gui.addFolder("Hemisphere Light");
  //   hemiFolder.add(hemiLight, "intensity", 0, 5, 0.1).name("Intensity");
  //   hemiFolder.add(hemiLight.position, "x", -300, 300, 1).name("Position X");
  //   hemiFolder.add(hemiLight.position, "y", -300, 300, 1).name("Position Y");
  //   hemiFolder.add(hemiLight.position, "z", -300, 300, 1).name("Position Z");

  //   // Color Pickers for Sky and Ground
  //   hemiFolder
  //     .addColor(hemiLightSettings, "color")
  //     .name("Sky Color")
  //     .onChange((value) => hemiLight.color.set(value));

  //   hemiFolder
  //     .addColor(hemiLightSettings, "groundColor")
  //     .name("Ground Color")
  //     .onChange((value) => hemiLight.groundColor.set(value));

  //   // Helper Toggle
  //   hemiFolder
  //     .add(hemiLightSettings, "showHelper")
  //     .name("Toggle Helper")
  //     .onChange((value) =>
  //       value ? scene.add(hemiHelper) : scene.remove(hemiHelper)
  //     );

  //   // === Copy Settings Button ===
  //   const copySettings = () => {
  //     const lightSettings = {
  //       pointLight1: {
  //         color: pointLight1Settings.color,
  //         intensity: pointLight1.intensity,
  //         position: {
  //           x: pointLight1.position.x,
  //           y: pointLight1.position.y,
  //           z: pointLight1.position.z,
  //         },
  //       },
  //       pointLight2: {
  //         color: pointLight2Settings.color,
  //         intensity: pointLight2.intensity,
  //         position: {
  //           x: pointLight2.position.x,
  //           y: pointLight2.position.y,
  //           z: pointLight2.position.z,
  //         },
  //       },
  //       ambientLight: {
  //         intensity: ambientLight.intensity,
  //       },
  //       hemisphereLight: {
  //         skyColor: hemiLightSettings.color,
  //         groundColor: hemiLightSettings.groundColor,
  //         intensity: hemiLight.intensity,
  //         position: {
  //           x: hemiLight.position.x,
  //           y: hemiLight.position.y,
  //           z: hemiLight.position.z,
  //         },
  //       },
  //     };

  //     navigator.clipboard
  //       .writeText(JSON.stringify(lightSettings, null, 2))
  //       .then(() => alert("Light settings copied to clipboard!"))
  //       .catch((err) => console.error("Error copying settings:", err));
  //   };

  //   gui.add({ copySettings }, "copySettings").name("📋 Copy Settings");

  //   // === Cleanup ===
  //   return () => {
  //     scene.remove(pointLight1, pointLight2, ambientLight, hemiLight);
  //     Object.values(helpers.current).forEach((helper) => scene.remove(helper));
  //     gui.destroy();
  //   };
  // }, [scene]);

  useEffect(() => {
    const pointLight1 = new THREE.PointLight(0x01ffed, 3.5);
    pointLight1.position.set(1, 43, -24); // Adjusted position
    pointLight1.decay = 2;
    pointLight1.castShadow = true; // Optional: enables shadows
    const pointLight2 = new THREE.PointLight(0xa6ffff, 10);
    pointLight2.position.set(-43, 57, 64); // Adjusted position
    pointLight2.decay = 2;
    pointLight2.castShadow = true;
    const lightHelper = new THREE.PointLightHelper(pointLight2, 15);
    scene.add(pointLight1);
    scene.add(pointLight2);
    // scene.add(lightHelper);

    const ambientLight = new THREE.AmbientLight(0x888888, 1.9);
    const hemiLight = new THREE.HemisphereLight(0x7300ff, 0xff0000, 1);
    hemiLight.position.set(32, 33, 89);

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
    // console.log("Applying image to candle:", candle.name, imageUrl);

    // Find the Label2 mesh in the candle's children
    const label = candle.children.find((child) =>
      child.name.includes("Label2")
    );
    // console.log("Found label:", label?.name);

    if (label && imageUrl) {
      // Create a new texture loader
      const textureLoader = new THREE.TextureLoader();

      // Load the image as a texture
      textureLoader.load(
        imageUrl,
        (texture) => {
          // console.log("Texture loaded successfully for", candle.name);
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
          // console.error("Error loading texture:", error);
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

    const DEFAULT_IMAGE = "Triumph.jpg";
    // console.log("Processing results:", results.length, "candles");

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

    // console.log("Selected candle indices:", selectedIndices);

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

          // Reset to basic material
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

    // Then activate selected candles with user data
    results.forEach((result, index) => {
      const paddedIndex = selectedIndices[index];
      if (!paddedIndex) return;

      const candleName = `VCANDLE${paddedIndex}`;
      const candle = modelRef.current.getObjectByName(candleName);

      if (candle) {
        // console.log(`Setting up candle ${candleName} with data:`, {
        //   userName: result.userName,
        //   hasImage: !!result.image,
        //   message: result.message?.substring(0, 20) + "...",
        // });

        // Set up the candle
        candle.userData = {
          hasUser: true,
          userName: result.userName || "Anonymous",
          image: result.image,
          message: result.message,
          burnedAmount: result.burnedAmount || 1,
          meltingProgress: 0,
        };

        // Apply user image if available
        if (result.image) {
          applyUserImageToLabel(candle, result.image);
        }

        const flame = findCandleComponent(candle, "FLAME");
        if (flame) {
          flame.visible = true;
        }
      }
    });

    // Finally, apply default image to unused candles
    availableIndices.forEach((index) => {
      if (!selectedIndices.includes(index)) {
        const candleName = `VCANDLE${index}`;
        const candle = modelRef.current.getObjectByName(candleName);
        if (candle) {
          // console.log(`Applying default image to unused candle ${candleName}`);

          // Make the candle selectable with default data
          candle.userData = {
            hasUser: true, // Set to true to make it selectable
            userName: "Triumph",
            image: DEFAULT_IMAGE,
            message: "In memory of triumph",
            burnedAmount: 1,
            meltingProgress: 0,
          };

          applyUserImageToLabel(candle, DEFAULT_IMAGE);
          const flame = findCandleComponent(candle, "FLAME");
          if (flame) {
            flame.visible = false;
          }
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
      {/* <BackgroundEffects /> */}
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
      <CoffeeSmoke />
    </>
  );
}
export default Model;
