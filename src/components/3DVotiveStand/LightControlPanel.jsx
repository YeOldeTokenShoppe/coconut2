import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import {
  PointLightHelper,
  DirectionalLightHelper,
  SpotLightHelper,
} from "three";

const LightControlPanel = forwardRef(
  ({ lights, scene, onGuiStart = () => {}, onGuiEnd = () => {} }, ref) => {
    useImperativeHandle(ref, () => ({
      togglePanel() {
        if (panel._closed) {
          panel.open();
        } else {
          panel.close();
        }
      },
      copySettings() {
        const settings = {};

        // Loop through all lights and extract properties
        Object.entries(lights).forEach(([key, light]) => {
          if (light) {
            settings[key] = {
              position: {
                x: light.position.x,
                y: light.position.y,
                z: light.position.z,
              },
              intensity: light.intensity,
              color: light.color.getHex(),
            };
          }
        });

        console.log("Light Settings:", JSON.stringify(settings, null, 2));
        navigator.clipboard.writeText(JSON.stringify(settings, null, 2)); // Copy to clipboard
      },
    }));

    useEffect(() => {
      if (!scene || !lights) return;

      const panel = new GUI({ width: 310 });
      const helpers = []; // Track helpers for cleanup

      onGuiStart(); // Notify parent when GUI starts

      const createLightControls = (light, label, HelperClass, options = {}) => {
        if (!light) return; // Skip undefined lights

        const params = {
          positionX: light.position.x,
          positionY: light.position.y,
          positionZ: light.position.z,
          intensity: light.intensity,
          showHelper: true,
          helperSize: options.size || 1,
          helperColor: options.color || 0xff0000,
        };

        const folder = panel.addFolder(label);

        // Create and add helper
        let helper = null;
        if (HelperClass) {
          helper = new HelperClass(
            light,
            params.helperSize,
            params.helperColor
          );
          helpers.push(helper);
          scene.add(helper);
        }

        // Add controls
        folder
          .add(params, "positionX", -50, 50)
          .name("Position X")
          .onChange((value) => (light.position.x = value));
        folder
          .add(params, "positionY", -50, 50)
          .name("Position Y")
          .onChange((value) => (light.position.y = value));
        folder
          .add(params, "positionZ", -50, 50)
          .name("Position Z")
          .onChange((value) => (light.position.z = value));
        folder
          .add(params, "intensity", 0, 10)
          .name("Intensity")
          .onChange((value) => (light.intensity = value));
        folder
          .addColor(params, "helperColor")
          .name("Helper Color")
          .onChange((value) => {
            if (helper && helper.material) helper.material.color.set(value);
          });
        folder
          .add(params, "showHelper")
          .name("Show Helper")
          .onChange((visible) => {
            if (helper) helper.visible = visible;
          });

        folder.open(); // Expand by default
      };

      // Add controls for all lights
      createLightControls(lights.spotlight, "Spotlight", SpotLightHelper, {
        size: 2,
      });
      createLightControls(
        lights.directionalLight1,
        "Directional Light 1",
        DirectionalLightHelper,
        { size: 5 }
      );
      createLightControls(
        lights.directionalLight2,
        "Directional Light 2",
        DirectionalLightHelper,
        { size: 5 }
      );
      createLightControls(lights.pointLight, "Point Light", PointLightHelper, {
        size: 2,
      });

      // Cleanup on unmount
      return () => {
        helpers.forEach((helper) => scene.remove(helper));
        panel.destroy();
        onGuiEnd(); // Notify parent when GUI ends
      };
    }, [lights, scene, onGuiStart, onGuiEnd]);

    return null;
  }
);

export default LightControlPanel;
