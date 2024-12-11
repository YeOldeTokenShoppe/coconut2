// components/WordPressSlider.js
import React, { useEffect } from "react";

const frameUrl = "https://rl80.com";

const WordPressSlider = ({ setWordPressSliderLoaded }) => {
  useEffect(() => {
    // Simulate async data or image loading
    const loadWordPressSliderContent = async () => {
      // Example: simulate loading (replace with real logic)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setWordPressSliderLoaded(true); // Notify parent that loading is complete
    };

    loadWordPressSliderContent();
  }, [setWordPressSliderLoaded]);
  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          margin: 0,
          padding: 0,
        }}
      >
        <iframe
          src={frameUrl}
          width="100%"
          height="100%"
          style={{ border: "none", margin: 0, padding: 0 }}
          allowFullScreen
          scrolling="no"
        />
      </div>
    </>
  );
};

export default WordPressSlider;
