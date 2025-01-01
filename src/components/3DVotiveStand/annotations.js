// config/annotationConfig.js
import * as THREE from "three";
import gsap from "gsap";
import "../3DVotiveStand/index.jsx";

export const ANNOTATION_SETTINGS = {
  defaultScreenPosition: { xPercent: 50, yPercent: 50 },
};

export const get2DPosition = (position, camera, containerSize) => {
  // Check if we have a position object with the right structure
  if (!position || !position.screen) {
    console.warn("Invalid position object:", position);
    return {
      x: containerSize.width / 2,
      y: containerSize.height / 2,
    };
  }

  // Calculate position based on percentages
  return {
    x: (position.screen.xPercent / 100) * containerSize.width,
    y: (position.screen.yPercent / 100) * containerSize.height,
  };
};

export const Annotations = ({
  text,
  isResetVisible, //this prop is for Chandelier visibility
  isVisible, //this prop is for annotations
  setIsVisible,
  position,
  onReset,
  onMoveCamera,
  containerSize,
  camera,
  extraButton,
}) => {
  if (!position || !position.screen) {
    console.warn("Invalid position passed to Annotations:", position);
    return null;
  }

  const screenPos = get2DPosition(position, camera, containerSize);

  return (
    <div
      className="annotation"
      style={{
        position: "fixed",
        left: `${Math.max(
          Math.min(screenPos.x, containerSize.width - 100),
          10
        )}px`,
        top: `${Math.max(
          Math.min(screenPos.y, containerSize.height - 100),
          10
        )}px`,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "#fff",
        borderRadius: "5%",
        zIndex: 100000,
        opacity: isResetVisible ? 1 : 0,
        visibility: isResetVisible ? "visible" : "hidden",
        display: isVisible ? "flex" : "none",
        transition: "opacity 0.5s ease, visibility 0s linear 0.5s",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        pointerEvents: isVisible ? "all" : "none",
        border: "2px solid goldenrod",
      }}
    >
      <p style={{ margin: 0, paddingBottom: "10px" }}>{text}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReset();
        }}
        style={{
          position: "relative",
          zIndex: 100001,
          pointerEvents: "all",
          cursor: "pointer",
          padding: "10px",
          marginTop: "auto", // Push the button to the bottom
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
          transition: "background-color 0.3s ease, transform 0.3s ease",
        }}
      >
        OK
      </button>
      {extraButton && (
        <button
          onClick={() => {
            setIsVisible(false);
            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);
            const targetPosition = camera.position
              .clone()
              .add(forward.multiplyScalar(10));

            gsap.to(camera.position, {
              x: targetPosition.x,
              y: targetPosition.y,
              z: targetPosition.z,
              duration: 4,
              ease: "power2.inOut",
              onUpdate: () => {
                camera.updateProjectionMatrix();
              },
              onComplete: () => {
                // Navigate to the new URL in the same window
                window.location.assign(extraButton.url, "_blank");

                // Note: onReset might not be necessary here since we're leaving the page
                // but included it just in case the navigation fails
                setTimeout(onReset, 100);
              },
            });
          }}
          style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#e60bd7",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
        >
          {extraButton.label}
        </button>
      )}
    </div>
  );
};
export default Annotations;
