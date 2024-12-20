import React, { useEffect } from "react";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { MODEL_SETTINGS } from "./modelConfig";

const positionUtils = {
  formatCameraPosition: (position, target, fov) => {
    return {
      position: [
        parseFloat(position.x.toFixed(2)),
        parseFloat(position.y.toFixed(2)),
        parseFloat(position.z.toFixed(2)),
      ],
      target: [
        parseFloat(target.x.toFixed(2)),
        parseFloat(target.y.toFixed(2)),
        parseFloat(target.z.toFixed(2)),
      ],
      fov: parseFloat(fov.toFixed(1)),
    };
  },
};

const CameraGUI = ({ cameraRef, controlsRef, onGuiStart, onGuiEnd }) => {
  useEffect(() => {
    if (!cameraRef?.current || !controlsRef?.current) return;

    onGuiStart();
    console.log("CameraGUI initialized");
    const panel = new GUI({ width: 310 });

    const params = {
      positionX: cameraRef.current.position.x,
      positionY: cameraRef.current.position.y,
      positionZ: cameraRef.current.position.z,
      targetX: controlsRef.current.target.x,
      targetY: controlsRef.current.target.y,
      targetZ: controlsRef.current.target.z,
      fov: cameraRef.current.fov,
      minimize: function () {
        panel.close();
        f1.close();
        f2.close();
      },
      maximize: function () {
        panel.open();
        f1.open();
        f2.open();
      },
      toggleView: function () {
        if (panel._closed) {
          params.maximize();
        } else {
          params.minimize();
        }
      },
      reset: function () {
        cameraRef.current.position.set(20, 18.8, 40);
        controlsRef.current.target.set(2.9, 6.7, 5.6);
        cameraRef.current.fov = 40;
        cameraRef.current.updateProjectionMatrix();
        controlsRef.current.update();
      },
      copyValues: function () {
        // Get absolute coordinates
        const absoluteValues = positionUtils.formatCameraPosition(
          cameraRef.current.position,
          controlsRef.current.target,
          cameraRef.current.fov
        );

        const str = JSON.stringify(absoluteValues, null, 2);
        navigator.clipboard.writeText(str);
        console.log("Copied values:", str);
      },
    };

    const f1 = panel.addFolder("Camera Position");
    f1.add(params, "positionX", -50, 50).onChange(
      (v) => (cameraRef.current.position.x = v)
    );
    f1.add(params, "positionY", -50, 50).onChange(
      (v) => (cameraRef.current.position.y = v)
    );
    f1.add(params, "positionZ", -50, 50).onChange(
      (v) => (cameraRef.current.position.z = v)
    );
    f1.add(params, "fov", 20, 120).onChange((v) => {
      cameraRef.current.fov = v;
      cameraRef.current.updateProjectionMatrix();
    });

    const f2 = panel.addFolder("Look At Target");
    f2.add(params, "targetX", -50, 50).onChange((v) => {
      controlsRef.current.target.x = v;
      controlsRef.current.update();
    });
    f2.add(params, "targetY", -50, 50).onChange((v) => {
      controlsRef.current.target.y = v;
      controlsRef.current.update();
    });
    f2.add(params, "targetZ", -50, 50).onChange((v) => {
      controlsRef.current.target.z = v;
      controlsRef.current.update();
    });

    // Main GUI controls
    panel.add(params, "toggleView").name("Toggle Panel");
    panel.add(params, "reset");
    panel.add(params, "copyValues").name("Copy Values");

    // Start minimized on mobile
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      params.minimize();
    }

    // Cleanup and dependencies
    return () => {
      panel.destroy();
      onGuiEnd();
    };
  }, [cameraRef?.current, controlsRef?.current]);

  return null;
};

export default CameraGUI;
