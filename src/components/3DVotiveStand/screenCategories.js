const BREAKPOINTS = {
  PHONE_SMALL: 320,
  PHONE_MEDIUM: 375,
  PHONE_LARGE: 576,
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
  const isIpad =
    /iPad|Macintosh/.test(navigator.userAgent) && "ontouchend" in document;

  // console.log(`
  //   Screen Detection Log:
  //   ---------------------
  //   Width: ${width}px
  //   Height: ${height}px
  //   Larger Dimension: ${largerDimension}px
  //   Aspect Ratio: ${aspectRatio.toFixed(2)}
  //   Landscape Mode: ${isLandscape}
  //   Is iPad: ${isIpad}
  // `);

  // Detect iPad Mini
  if (isIpad && largerDimension === 1024) {
    if (isLandscape && width === 1024 && height === 768) {
      // console.log(
      //   `Detected Screen Category: tablet-small-landscape (iPad Mini detected)`
      // );
      return "tablet-small-landscape";
    }
    if (!isLandscape && width === 768 && height === 1024) {
      // console.log(
      //   `Detected Screen Category: tablet-small-portrait (iPad Mini detected)`
      // );
      return "tablet-small-portrait";
    }
  }

  // Detect iPad Air (tablet-medium)
  if (isIpad && largerDimension === 1180) {
    const category = isLandscape
      ? "tablet-medium-landscape"
      : "tablet-medium-portrait";
    // console.log(`Detected Screen Category: ${category} (iPad Air detected)`);
    // return category;
  }

  // Detect iPad Pro (tablet-large)
  if (isIpad && largerDimension === 1366) {
    const category = isLandscape
      ? "tablet-large-landscape"
      : "tablet-large-portrait";
    // console.log(`Detected Screen Category: ${category} (iPad Pro detected)`);
    // return category;
  }

  // General iPad detection (if no specific model matches)
  if (isIpad) {
    const category = isLandscape
      ? "tablet-large-landscape"
      : "tablet-large-portrait";
    // console.log(
    //   `Detected Screen Category: ${category} (General iPad detected)`
    // );
    return category;
  }

  // Phone detection (portrait only)
  if (largerDimension <= BREAKPOINTS.PHONE_LARGE && !isLandscape) {
    const category =
      width <= BREAKPOINTS.PHONE_SMALL
        ? "phone-small"
        : width <= BREAKPOINTS.PHONE_MEDIUM
        ? "phone-medium"
        : "phone-large";
    // console.log(`Detected Screen Category: ${category}`);
    // return category;
  }

  // Tablet detection (non-iPad devices)
  if (largerDimension <= BREAKPOINTS.TABLET_SMALL) {
    const category = isLandscape
      ? "tablet-small-landscape"
      : "tablet-small-portrait";
    // console.log(`Detected Screen Category: ${category}`);
    // return category;
  }

  if (
    largerDimension > BREAKPOINTS.TABLET_SMALL &&
    largerDimension <= BREAKPOINTS.TABLET_MEDIUM
  ) {
    const category = isLandscape
      ? "tablet-medium-landscape"
      : "tablet-medium-portrait";
    // console.log(`Detected Screen Category: ${category}`);
    // return category;
  }

  if (
    largerDimension > BREAKPOINTS.TABLET_MEDIUM &&
    largerDimension <= BREAKPOINTS.TABLET_LARGE
  ) {
    const category = isLandscape
      ? "tablet-large-landscape"
      : "tablet-large-portrait";
    // console.log(`Detected Screen Category: ${category}`);
    // return category;
  }

  // Desktop detection
  if (largerDimension > BREAKPOINTS.TABLET_LARGE) {
    const category =
      width <= BREAKPOINTS.DESKTOP_SMALL
        ? "desktop-small"
        : width <= BREAKPOINTS.DESKTOP_MEDIUM
        ? "desktop-medium"
        : "desktop-large";
    // console.log(`Detected Screen Category: ${category}`);
    // return category;
  }

  // Fallback
  // console.log("Detected Screen Category: desktop-medium (fallback)");
  // return "desktop-medium";
};
