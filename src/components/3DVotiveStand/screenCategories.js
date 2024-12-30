export const getScreenCategory = () => {
  if (typeof window === "undefined") return "desktop"; // Default for SSR

  const width = window.innerWidth;
  const height = window.innerHeight;

  if (width <= 767) return "phone";

  // Differentiate between tablet portrait and landscape
  if (width <= 1200) {
    return width < height ? "tablet-portrait" : "tablet-landscape";
  }

  return "desktop";
};
