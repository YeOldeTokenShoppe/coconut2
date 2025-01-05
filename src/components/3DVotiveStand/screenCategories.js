import * as THREE from "three";

const BREAKPOINTS = {
  PHONE_SMALL: 320,
  PHONE_MEDIUM: 375,
  PHONE_LARGE: 414,
  TABLET_SMALL: 1024,
  TABLET_MEDIUM: 1180,
  TABLET_LARGE: 1280,
  DESKTOP_SMALL: 1366,
  DESKTOP_MEDIUM: 1460,
  DESKTOP_LARGE: 1920,
};

export const getScreenCategory = () => {
  if (typeof window === "undefined") return "desktop-medium";

  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = width / height;
  const isLandscape = aspectRatio > 1;
  const largerDimension = Math.max(width, height);

  console.log(`
    Dimensions: ${width}x${height}
    Larger dimension: ${largerDimension}
    Is Landscape: ${isLandscape}
    Breaking points:
    - TABLET_SMALL: ${BREAKPOINTS.TABLET_SMALL}
    - TABLET_MEDIUM: ${BREAKPOINTS.TABLET_MEDIUM}
    - DESKTOP_MEDIUM: ${BREAKPOINTS.DESKTOP_MEDIUM}
  `);

  // Phone detection (portrait only)
  if (largerDimension <= BREAKPOINTS.PHONE_LARGE && !isLandscape) {
    if (width <= BREAKPOINTS.PHONE_SMALL) return "phone-small";
    if (width <= BREAKPOINTS.PHONE_MEDIUM) return "phone-medium";
    return "phone-large";
  }

  // Tablet detection - now checking specifically for tablet dimensions
  if (largerDimension <= BREAKPOINTS.TABLET_SMALL) {
    console.log("Detected as tablet-small");
    return isLandscape ? "tablet-small-landscape" : "tablet-small-portrait";
  }

  if (largerDimension <= BREAKPOINTS.TABLET_MEDIUM) {
    console.log("Detected as tablet-medium");
    return isLandscape ? "tablet-medium-landscape" : "tablet-medium-portrait";
  }

  if (largerDimension <= BREAKPOINTS.TABLET_LARGE) {
    console.log("Detected as tablet-large");
    return isLandscape ? "tablet-large-landscape" : "tablet-large-portrait";
  }

  // Only proceed to desktop detection if larger dimension exceeds tablet ranges
  if (largerDimension > BREAKPOINTS.TABLET_LARGE) {
    if (width <= BREAKPOINTS.DESKTOP_SMALL) {
      console.log("Detected as desktop-small");
      return "desktop-small";
    }
    if (width <= BREAKPOINTS.DESKTOP_MEDIUM) {
      console.log("Detected as desktop-medium");
      return "desktop-medium";
    }
    console.log("Detected as desktop-large");
    return "desktop-large";
  }

  // Fallback to tablet-large if nothing else matches
  return isLandscape ? "tablet-large-landscape" : "tablet-large-portrait";
};
