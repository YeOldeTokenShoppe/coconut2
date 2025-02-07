import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useControls } from "leva";

const Lights = ({ scene }) => {
  const lightHelpers = useRef([]);

  const {
    pointLight1Color,
    pointLight1Intensity,
    pointLight1X,
    pointLight1Y,
    pointLight1Z,

    pointLight2Color,
    pointLight2Intensity,
    pointLight2X,
    pointLight2Y,
    pointLight2Z,

    hemiLightIntensity,
    ambientLightIntensity,
  } = useControls({
    pointLight1Color: "#ff00ff",
    pointLight1Intensity: { value: 10, min: 0, max: 50 },
    pointLight1X: { value: 2, min: -500, max: 500 },
    pointLight1Y: { value: 35, min: -500, max: 500 },
    pointLight1Z: { value: -89, min: -500, max: 500 },

    pointLight2Color: "#a6ffff",
    pointLight2Intensity: { value: 10, min: 0, max: 50 },
    pointLight2X: { value: -220, min: -500, max: 500 },
    pointLight2Y: { value: 195, min: -500, max: 500 },
    pointLight2Z: { value: 300, min: -500, max: 500 },

    hemiLightIntensity: { value: 0.9, min: 0, max: 2 },
    ambientLightIntensity: { value: 0.75, min: 0, max: 2 },
  });

  useEffect(() => {
    // Point Light 1
    const pointLight1 = new THREE.PointLight(
      pointLight1Color,
      pointLight1Intensity,
      200
    );
    pointLight1.position.set(pointLight1X, pointLight1Y, pointLight1Z);
    pointLight1.decay = 2;
    pointLight1.castShadow = true;
    const helper1 = new THREE.PointLightHelper(pointLight1, 10);

    // Point Light 2
    const pointLight2 = new THREE.PointLight(
      pointLight2Color,
      pointLight2Intensity,
      200
    );
    pointLight2.position.set(pointLight2X, pointLight2Y, pointLight2Z);
    pointLight2.decay = 2;
    pointLight2.castShadow = true;
    const helper2 = new THREE.PointLightHelper(pointLight2, 10);

    // Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(
      0x0055ff,
      0xff0000,
      hemiLightIntensity
    );
    hemiLight.position.set(0, 30, 30);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(
      0x888888,
      ambientLightIntensity
    );

    // Add Lights & Helpers
    scene.add(
      pointLight1,
      pointLight2,
      hemiLight,
      ambientLight,
      helper1,
      helper2
    );
    lightHelpers.current = [helper1, helper2];

    // Cleanup
    return () => {
      scene.remove(
        pointLight1,
        pointLight2,
        hemiLight,
        ambientLight,
        helper1,
        helper2
      );
    };
  }, [
    scene,
    pointLight1Color,
    pointLight1Intensity,
    pointLight1X,
    pointLight1Y,
    pointLight1Z,
    pointLight2Color,
    pointLight2Intensity,
    pointLight2X,
    pointLight2Y,
    pointLight2Z,
    hemiLightIntensity,
    ambientLightIntensity,
  ]);

  return null;
};

export default Lights;
