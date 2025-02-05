import React, { useEffect, useRef } from "react";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import * as THREE from "three";

const LightGUI = ({
  directionalLightRef,
  ambientLightRef,
  hemisphereLightRef,
  renderer,
  scene,
  camera,
  onGuiStart,
  onGuiEnd,
}) => {
  useEffect(() => {
    if (
      !directionalLightRef?.current ||
      !ambientLightRef?.current ||
      !hemisphereLightRef?.current
    )
      return;

    onGuiStart();
    const panel = new GUI({ width: 310 });

    // Directional Light Folder
    const directionalFolder = panel.addFolder("Directional Light");
    directionalFolder.add(directionalLightRef.current, "intensity", 0, 2);
    directionalFolder
      .addColor({ color: directionalLightRef.current.color.getHex() }, "color")
      .onChange((value) => {
        directionalLightRef.current.color.setHex(value);
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        } else {
          console.warn("Renderer, scene, or camera not available");
        }
      });

    // Add Directional Light Helper
    const directionalLightHelper = new THREE.DirectionalLightHelper(
      directionalLightRef.current,
      0.2
    );
    scene.add(directionalLightHelper);

    // Ambient Light Folder
    const ambientFolder = panel.addFolder("Ambient Light");
    ambientFolder.add(ambientLightRef.current, "intensity", 0, 1);
    ambientFolder
      .addColor({ color: ambientLightRef.current.color.getHex() }, "color")
      .onChange((value) => {
        ambientLightRef.current.color.setHex(value);
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
          console.log("Render called");
        }
      });

    // Hemisphere Light Folder

    const hemisphereFolder = panel.addFolder("Hemisphere Light");
    hemisphereFolder.add(hemisphereLightRef.current, "intensity").min(0).max(2);
    hemisphereFolder.addColor(hemisphereLightRef.current, "color");
    hemisphereFolder.addColor(hemisphereLightRef.current, "groundColor");
    // Add Hemisphere Light Helper
    const hemisphereLightHelper = new THREE.HemisphereLightHelper(
      hemisphereLightRef.current,
      0.2
    );
    scene.add(hemisphereLightHelper);

    return () => {
      panel.destroy();
      scene.remove(directionalLightHelper);
      scene.remove(hemisphereLightHelper);
      onGuiEnd();
    };
  }, [directionalLightRef, ambientLightRef, hemisphereLightRef]);

  return null;
};

export default LightGUI;
