// config/annotationConfig.js
import * as THREE from "three";
import React, { useEffect, useState } from "react";
import gsap from "gsap";
import "../3DVotiveStand/index.jsx";

export const ANNOTATION_SETTINGS = {
  defaultScreenPosition: { xPercent: 50, yPercent: 50 },
  positions: {
    "phone-small": { xPercent: 50, yPercent: 40 },
    "phone-medium": { xPercent: 50, yPercent: 40 },
    "phone-large": { xPercent: 50, yPercent: 40 },
    "tablet-small-portrait": { xPercent: 50, yPercent: 45 },
    "tablet-small-landscape": { xPercent: 50, yPercent: 45 },
    "tablet-large-portrait": { xPercent: 50, yPercent: 45 },
    "tablet-large-landscape": { xPercent: 50, yPercent: 45 },
    "desktop-small": { xPercent: 50, yPercent: 50 },
    "desktop-medium": { xPercent: 50, yPercent: 50 },
    "desktop-large": { xPercent: 50, yPercent: 50 },
  },
};

export const DEFAULT_BUTTON_CONFIG = {
  primary: {
    label: "Close",
    action: "reset",
  },
};

export const get2DPosition = (
  position,
  camera,
  containerSize,
  screenCategory = "desktop-medium"
) => {
  // Check if we have a position object with the right structure
  if (!position || !position.screen) {
    console.warn("Invalid position object:", position);
    const defaultPosition =
      ANNOTATION_SETTINGS.positions[screenCategory] ||
      ANNOTATION_SETTINGS.positions["desktop-medium"] ||
      ANNOTATION_SETTINGS.defaultScreenPosition;
    return {
      x: (defaultPosition.xPercent / 100) * containerSize.width,
      y: (defaultPosition.yPercent / 100) * containerSize.height,
    };
  }

  // Get category-specific position adjustments
  const categoryAdjustments =
    ANNOTATION_SETTINGS.positions[screenCategory] ||
    ANNOTATION_SETTINGS.positions["desktop-medium"];

  // Calculate position based on percentages, using category adjustments if available
  const xPercent = position.screen.xPercent ?? categoryAdjustments.xPercent;
  const yPercent = position.screen.yPercent ?? categoryAdjustments.yPercent;

  return {
    x: (xPercent / 100) * containerSize.width,
    y: (yPercent / 100) * containerSize.height,
  };
};

export const Annotations = ({
  text,
  isResetVisible,
  isVisible,
  setIsVisible,
  position,
  onReset,
  onMoveCamera,
  containerSize,
  camera,
  extraButton,
  buttons,
  screenCategory = "desktop-medium", // Add this prop
}) => {
  const [delayedVisibility, setDelayedVisibility] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timeout = setTimeout(() => {
        setDelayedVisibility(true);
      }, 1500);

      return () => clearTimeout(timeout);
    } else {
      setDelayedVisibility(false);
    }
  }, [isVisible]);

  if (!position || !position.screen) {
    console.warn("Invalid position passed to Annotations:", position);
    return null;
  }

  const screenPos = get2DPosition(position, camera, containerSize);
  const buttonLabel =
    buttons?.primary?.label || DEFAULT_BUTTON_CONFIG.primary.label;

  const getStylesForScreenCategory = (category) => {
    if (category.startsWith("phone")) {
      return {
        fontSize: "16px",
        padding: "15px",
        maxWidth: "8rem",
        buttonFontSize: "14px",
      };
    }
    if (category.startsWith("tablet")) {
      return {
        fontSize: "18px",
        padding: "18px",
        maxWidth: "9rem",
        buttonFontSize: "15px",
      };
    }
    return {
      fontSize: "20px",
      padding: "20px",
      maxWidth: "10rem",
      buttonFontSize: "16px",
    };
  };

  const categoryStyles = getStylesForScreenCategory(screenCategory);

  return (
    <div
      className="marker-annotation"
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
        fontSize: "20px",
        borderRadius: ".5rem",
        zIndex: 100000,
        opacity: delayedVisibility ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        display: isVisible ? "flex" : "none",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        maxWidth: "10rem",
        pointerEvents: isVisible && delayedVisibility ? "all" : "none",
        border: "2px solid #ffff00",
        transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
        transform: delayedVisibility ? "translateY(0)" : "translateY(10px)",
      }}
    >
      <button
        onClick={() => setIsVisible(false)}
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          backgroundColor: "transparent",
          color: "#fff",
          border: "none",
          fontSize: "20px",
          fontWeight: "bold",
          cursor: "pointer",
          padding: "5px",
          borderRadius: "50%",
          transition: "background-color 0.3s ease, transform 0.2s ease",
          transform: "scale(1)",
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "rgba(255,255,255,0.2)";
          e.target.style.transform = "scale(1.1)";
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "transparent";
          e.target.style.transform = "scale(1)";
        }}
      >
        ×
      </button>

      <p
        style={{
          fontFamily: "Miltonian Tattoo",
          fontSize: "18px",
          margin: 0,
          paddingBottom: "10px",
          paddingTop: "10px",
          opacity: delayedVisibility ? 1 : 0,
          transform: delayedVisibility ? "translateY(0)" : "translateY(5px)",
          transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
          transitionDelay: "0.1s",
        }}
      >
        {text}
      </p>

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
          marginTop: "auto",
          backgroundColor: "#ffff00",
          color: "#000000",
          border: "none",
          borderRadius: "1rem",
          width: "auto",
          minWidth: "70px",
          height: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "16px",

          fontWeight: "bold",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease-in-out",
          opacity: delayedVisibility ? 1 : 0,
          transform: delayedVisibility ? "translateY(0)" : "translateY(5px)",
          transitionDelay: "0.2s",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 8px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        {buttonLabel}
      </button>

      {extraButton && (
        <button
          onClick={() => {
            setIsVisible(false);
            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);
            const targetPosition = camera.position
              .clone()
              .add(forward.multiplyScalar(4.5));

            gsap.to(camera.position, {
              x: targetPosition.x,
              y: targetPosition.y,
              z: targetPosition.z,
              fov: 5,
              duration: 5,
              ease: "power2.inOut",
              onComplete: () => {
                window.location.assign(extraButton.url, "_blank");
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
            opacity: delayedVisibility ? 1 : 0,
            transform: delayedVisibility ? "translateY(0)" : "translateY(5px)",
            transition: "all 0.3s ease-in-out",
            transitionDelay: "0.3s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 8px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          {extraButton.label}
        </button>
      )}
    </div>
  );
};

export default Annotations;
