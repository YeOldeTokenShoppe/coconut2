export const getScreenCategory = () => {
  if (typeof window === "undefined") return "desktop"; // Default for SSR
  const width = window.innerWidth;
  if (width <= 767) return "phone";
  if (width <= 1200) return "tablet";
  return "desktop";
};
