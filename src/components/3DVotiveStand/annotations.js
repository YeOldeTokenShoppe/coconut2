// config/annotationConfig.js
import * as THREE from "three";
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
  position,
  onReset,
  onMoveCamera,
  containerSize,
  camera,
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
        zIndex: 100000,
        opacity: isResetVisible ? 1 : 0,
        visibility: isResetVisible ? "visible" : "hidden",
        display: isVisible ? "flex" : "none",
        transition: "opacity 0.5s ease, visibility 0s linear 0.5s",
        pointerEvents: isResetVisible ? "all" : "none",
      }}
    >
      <p style={{ margin: 0, padding: 0 }}>{text}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReset();
        }}
        style={{
          padding: "10px",
          marginTop: "10px",
          backgroundColor: "goldenrod",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        OK
      </button>
    </div>
  );
};
export default Annotations;
