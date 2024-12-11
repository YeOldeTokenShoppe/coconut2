import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from "gsap";
import { useUser } from "@clerk/nextjs";

const RocketSimulator = () => {
  const containerRef = useRef(null);
  const [countdown, setCountdown] = useState(20);
  let currentFace = 1; // Track the current face
  let toggled = false; // Track the toggle state for visibility

  const { user } = useUser(); // Access the logged-in user
  const userAvatarUrl = user ? user.imageUrl : "/brett.jpg";

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Define Outline Shader
    const OutlineShader = {
      uniforms: {
        offset: { type: "f", value: 0.3 },
        color: { type: "v3", value: new THREE.Color("#000000") },
        alpha: { type: "f", value: 1.0 },
      },
      vertexShader: `
          uniform float offset;
          void main() {
            vec4 pos = modelViewMatrix * vec4( position + normal * offset, 1.0 );
            gl_Position = projectionMatrix * pos;
          }
        `,
      fragmentShader: `
          uniform vec3 color;
          uniform float alpha;
          void main() {
            gl_FragColor = vec4( color, alpha );
          }
        `,
    };

    // Set up the scene, camera, and renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = "pointer";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x01374b);
    scene.fog = new THREE.Fog(scene.background, 10, 20);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100000
    );
    camera.position.set(0, -6, 3);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.y = 4;
    controls.enableDamping = true;
    controls.enabled = false;

    const aLight = new THREE.AmbientLight(0x555555);
    scene.add(aLight);

    const dLight1 = new THREE.DirectionalLight(0xffffff, 0.4);
    dLight1.position.set(0.7, 1, 1);
    scene.add(dLight1);

    // Rocket Group
    const rocketGroup = new THREE.Group();
    scene.add(rocketGroup);

    const rocket = new THREE.Group();
    rocket.position.y = -1.5;
    rocketGroup.add(rocket);

    // Rocket Body
    const points = [];
    points.push(new THREE.Vector2(0, 0)); // bottom
    for (let i = 0; i < 11; i++) {
      const point = new THREE.Vector2(Math.cos(i * 0.227 - 0.75) * 8, i * 4.0);
      points.push(point);
    }
    points.push(new THREE.Vector2(0, 40)); // tip
    const rocketGeo = new THREE.LatheGeometry(points, 32);
    const rocketMat = new THREE.MeshToonMaterial({
      color: 0xcccccc,
      shininess: 1,
    });
    var rocketOutlineMat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(OutlineShader.uniforms),
      vertexShader: OutlineShader.vertexShader,
      fragmentShader: OutlineShader.fragmentShader,
      side: THREE.BackSide,
    });

    const rocketObj = new THREE.Group();
    const rocketMesh = new THREE.Mesh(rocketGeo, rocketMat);
    const rocketOutlineMesh = new THREE.Mesh(rocketGeo, rocketOutlineMat);

    rocketOutlineMesh.scale.multiplyScalar(1.0);

    rocketObj.add(rocketOutlineMesh);
    rocketObj.add(rocketMesh);

    rocketObj.scale.setScalar(0.1);
    rocket.add(rocketObj);

    // Portal (Window)
    const portalGeo = new THREE.CylinderGeometry(0.26, 0.26, 1.6, 32);
    const portalMat = new THREE.MeshToonMaterial({ color: 0x90dcff });

    // Clone the outline material and adjust it specifically for the portal
    const portalOutlineMat = rocketOutlineMat.clone();
    portalOutlineMat.uniforms.offset.value = 0.03; // Adjust as needed
    // portalOutlineMat.side = THREE.BackSide;

    const portalOutlineMesh = new THREE.Mesh(portalGeo, portalOutlineMat);

    // Apply a larger scaling factor to make the portal outline more prominent
    portalOutlineMesh.scale.multiplyScalar(1.0); // Adjust this scale as needed

    const portal = new THREE.Group();
    const portalMesh = new THREE.Mesh(portalGeo, portalMat);

    portal.add(portalOutlineMesh);
    portal.add(portalMesh);
    portal.position.y = 2;
    portal.rotation.x = Math.PI / 2;
    rocket.add(portal);

    // Load the texture for the first face
    const textureLoader = new THREE.TextureLoader();
    const faceTexture1 = textureLoader.load(userAvatarUrl);
    // const faceTexture2 = textureLoader.load("/face.jpg"); // Replace with your first image path

    // Create the first face mesh
    const faceGeo = new THREE.CylinderGeometry(0.27, 0.27, 0.05, 64);
    const faceMat1 = new THREE.MeshBasicMaterial({
      map: faceTexture1,
      transparent: true,
    });

    const faceMesh1 = new THREE.Mesh(faceGeo, faceMat1);

    // Position the first face inside the first portal
    faceMesh1.position.set(0, 2, 0.8); // Adjust the position as needed
    faceMesh1.rotation.y = Math.PI / 2;
    faceMesh1.rotation.z = Math.PI / 2;
    rocket.add(faceMesh1);

    // Load the texture for the second face
    const faceTexture2 = textureLoader.load("/face.jpg");
    //Replace with your second image path

    // Create the second face mesh with the second texture
    const faceMat2 = new THREE.MeshBasicMaterial({
      map: faceTexture2,
      transparent: true,
    });

    const faceMesh2 = new THREE.Mesh(faceGeo, faceMat2);

    // Position the second face inside the second portal (on the opposite side)
    faceMesh2.position.set(0, 2, -0.8); // Adjust the position as needed
    faceMesh2.rotation.y = -Math.PI / 2;
    faceMesh2.rotation.z = Math.PI / 2;
    rocket.add(faceMesh2);

    // Set both faces initially to visible
    faceMesh1.visible = true;
    faceMesh2.visible = false;

    // Tube
    const circle = new THREE.Shape();
    circle.absarc(0, 0, 3, 0, Math.PI * 2);

    const hole = new THREE.Path();
    hole.absarc(0, 0, 3, 0, Math.PI * 2);
    circle.holes.push(hole);

    const tubeExtrudeSettings = {
      depth: 17,
      steps: 1,
      bevelEnabled: false,
    };
    const tubeGeo = new THREE.ExtrudeGeometry(circle, tubeExtrudeSettings);
    tubeGeo.center();
    const tubeMat = new THREE.MeshToonMaterial({
      color: 0xff0000,
      shininess: 1,
    });
    const tubeOutlineMat = rocketOutlineMat.clone();
    tubeOutlineMat.uniforms.offset.value = 0.2;
    const tube = new THREE.Group();
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    const tubeOutlineMesh = new THREE.Mesh(tubeGeo, tubeOutlineMat);

    tubeOutlineMesh.scale.multiplyScalar(1.0);

    tube.add(tubeOutlineMesh);
    tube.add(tubeMesh);
    tube.position.y = 2;
    tube.scale.setScalar(0.103);
    rocket.add(tube);

    // Wings (Fins)
    const shape = new THREE.Shape();
    shape.moveTo(3, 0);
    shape.quadraticCurveTo(25, -8, 15, -37);
    shape.quadraticCurveTo(13, -21, 0, -20);
    shape.lineTo(3, 0);

    const extrudeSettings = {
      steps: 1,
      amount: 4, // This is the correct parameter name
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 2,
      bevelSegments: 5,
    };

    const wingGroup = new THREE.Group();
    const wingGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    wingGeo.computeVertexNormals(); // Ensure vertex normals are computed

    const wingMat = new THREE.MeshToonMaterial({
      color: 0xff0000,
      shininess: 1,
    });

    // Clone the outline material and adjust it specifically for the wings
    const wingOutlineMat = rocketOutlineMat.clone();
    wingOutlineMat.uniforms.offset.value = -0.05; // Adjust as needed
    wingOutlineMat.side = THREE.BackSide; // Ensure this is set

    const wingOutlineMesh = new THREE.Mesh(wingGeo, wingOutlineMat);

    // Apply a larger scaling factor to make the wing outline more prominent
    wingOutlineMesh.scale.multiplyScalar(1.03); // Adjust this scale as needed

    const wing = new THREE.Group();
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);

    wing.add(wingOutlineMesh);
    wing.add(wingMesh);
    wing.scale.setScalar(0.03);
    wing.position.set(0.6, 0.9, 0);
    wingGroup.add(wing);
    rocket.add(wingGroup);

    const wing2 = wingGroup.clone();
    wing2.rotation.y = Math.PI;
    rocket.add(wing2);

    const wing3 = wingGroup.clone();
    wing3.rotation.y = Math.PI / 2;
    rocket.add(wing3);

    const wing4 = wingGroup.clone();
    wing4.rotation.y = -Math.PI / 2;
    rocket.add(wing4);

    // Fire
    const firePoints = [];
    for (let i = 0; i <= 10; i++) {
      const point = new THREE.Vector2(Math.sin(i * 0.18) * 8, (-10 + i) * 2.5);
      firePoints.push(point);
    }
    const fireGeo = new THREE.LatheGeometry(firePoints, 32);
    const fireMat = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color("yellow") },
        color2: { value: new THREE.Color(0xff7b00) }, // orange
      },
      vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                }
            `,
      fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec2 vUv;
                void main() {
                    gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
                }
            `,
    });

    const fire = new THREE.Mesh(fireGeo, fireMat);
    fire.scale.setScalar(0.06);
    rocket.add(fire);

    const fireLight = new THREE.PointLight(0xff7b00, 1, 9);
    fireLight.position.set(0, -1, 0);
    rocket.add(fireLight);

    const fireUpdate = () => {
      fire.scale.y = THREE.MathUtils.randFloat(0.04, 0.08);
    };

    // Stars (Particles)
    class Particles extends THREE.Group {
      constructor(options) {
        super();
        this.color = options.color || 0x333333;
        this.size = options.size || 0.4;
        this.pointCount = options.pointCount || 40;
        this.rangeV = options.rangeV || 2;
        this.rangeH = options.rangeH || 1;
        this.speed = this.speedTarget = options.speed || 0.0005;

        const randFloatSpread = (range) => range * (0.5 - Math.random());

        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 128;
        const ctx = canvas.getContext("2d");
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#fff";
        ctx.fill();
        const texture = new THREE.Texture(canvas);
        texture.premultiplyAlpha = true;
        texture.needsUpdate = true;

        const pointsGeo = new THREE.BufferGeometry();
        const vertices = [];

        for (let p = 0; p < this.pointCount; p++) {
          const point = new THREE.Vector3(
            randFloatSpread(this.rangeH),
            randFloatSpread(this.rangeV),
            randFloatSpread(this.rangeH)
          );
          vertices.push(point.x, point.y, point.z);
        }

        pointsGeo.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(vertices, 3)
        );

        const pointsMat = new THREE.PointsMaterial({
          color: this.color,
          size: this.size,
          map: texture,
          transparent: true,
          depthWrite: false,
        });

        this.points = new THREE.Points(pointsGeo, pointsMat);
        this.points.position.y = -this.rangeV / 2;
        this.points.sortParticles = true;

        this.add(this.points);
      }

      updateConstant() {
        let pCount = this.pointCount;
        const positions = this.points.geometry.attributes.position.array;
        while (pCount--) {
          const index = pCount * 3 + 1;
          positions[index] -= this.speed;
          if (positions[index] < -this.rangeV / 2) {
            positions[index] = this.rangeV / 2;
          }
        }
        this.points.geometry.attributes.position.needsUpdate = true;
      }
    }

    const stars = new Particles({
      color: 0xffffff,
      size: 0.6,
      rangeH: 20,
      rangeV: 20,
      pointCount: 400,
      size: 0.2,
      speed: 0.1,
    });

    stars.points.position.y = 0;
    scene.add(stars);

    // Mouse interactions
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const rocketTarget = new THREE.Vector3();
    const cameraTarget = new THREE.Vector3();
    cameraTarget.copy(camera.position);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const mousemove = (e) => {
      mouse.x = (e.clientX / container.clientWidth) * 2 - 1;
      mouse.y = -(e.clientY / container.clientHeight) * 2 + 1;
      cameraTarget.x = -mouse.x * 1;
      cameraTarget.z = 3 + mouse.y * 1;
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, rocketTarget);
    };

    const mousedown = (e) => {
      e.preventDefault();

      if (toggled) return; // Prevent further clicks until animation completes
      toggled = true;

      const dir = currentFace === 1 ? 1 : -1; // Adjust the direction based on currentFace

      gsap.to(rocket.rotation, {
        y: rocket.rotation.y + dir * Math.PI,
        duration: 1,
        ease: "power2.inOut",
        onStart: () => {
          // Delay the face visibility change to avoid blinking
          setTimeout(() => {
            faceMesh1.visible = !faceMesh1.visible;
            faceMesh2.visible = !faceMesh2.visible;
          }, 400); // Adjust the timing here if needed
        },
        onComplete: () => {
          currentFace = currentFace === 1 ? 2 : 1; // Toggle the face
          toggled = false; // Reset toggle flag for the next rotation
        },
      });

      gsap.to(rocketGroup.scale, {
        x: 0.9,
        y: 1.2,
        z: 0.9,
        duration: 0.4,
        ease: "power1.inOut",
      });

      stars.speedTarget = 0.3;
      renderer.domElement.style.cursor = "none";
    };

    const mouseup = (e) => {
      gsap.to(rocketGroup.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.4,
        ease: "power1.inOut",
      });

      stars.speedTarget = 0.1;
      renderer.domElement.style.cursor = "pointer";
    };

    renderer.domElement.addEventListener("mousemove", mousemove, false);
    renderer.domElement.addEventListener("mousedown", mousedown, false);
    renderer.domElement.addEventListener("mouseup", mouseup, false);

    const lerp = (object, prop, destination) => {
      if (object && object[prop] !== destination) {
        object[prop] += (destination - object[prop]) * 0.1;
        if (Math.abs(destination - object[prop]) < 0.01) {
          object[prop] = destination;
        }
      }
    };

    const resize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", resize, false);

    const clock = new THREE.Clock();
    let time = 0;
    const angle = THREE.MathUtils.degToRad(3);

    const loop = () => {
      requestAnimationFrame(loop);
      controls.update();
      time += clock.getDelta();
      rocketGroup.rotation.y = Math.cos(time * 8) * angle;
      fireUpdate();
      stars.updateConstant();
      lerp(rocketGroup.position, "y", rocketTarget.y);
      lerp(rocketGroup.position, "x", rocketTarget.x);
      lerp(camera.position, "x", cameraTarget.x);
      lerp(camera.position, "z", cameraTarget.z);
      renderer.render(scene, camera);
    };

    loop();

    return () => {
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("mousemove", mousemove);
      renderer.domElement.removeEventListener("mousedown", mousedown);
      renderer.domElement.removeEventListener("mouseup", mouseup);
      container.removeChild(renderer.domElement);
    };
  }, []);
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Three.js setup code...

    // Optional countdown effect
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      // Clean up Three.js resources...
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          position: "relative", // Ensure the container is positioned relative
        }}
      >
        {/* <video
          autoPlay
          loop
          muted
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1, // Ensure the video is behind the Three.js canvas
          }}
        >
          <source src="/vortex5.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}

        {/* Your RocketSimulator canvas will render above the video */}
        {/* Optional overlay message for countdown */}
        {countdown > 0 && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              color: "white",
              fontSize: "1.2rem",
              background: "rgba(0, 0, 0, 0.5)",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            Arriving at destination in {countdown} seconds...
          </div>
        )}
      </div>
    </>
  );
};

export default RocketSimulator;
