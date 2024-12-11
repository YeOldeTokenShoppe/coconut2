// Import styles
"use client";
import React, { useState, useEffect } from "react";
import WordPressSlider from "../components/WordPressSlider";
import RotatingBadge from "../components/RotatingBadge";
import Link from "next/link";
import Loader from "../components/Loader";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [rotatingBadgeLoaded, setRotatingBadgeLoaded] = useState(false);
  const [wordPressSliderLoaded, setWordPressSliderLoaded] = useState(false);

  useEffect(() => {
    console.log("Loading status:", {
      rotatingBadgeLoaded,
      wordPressSliderLoaded,
    });
    if (rotatingBadgeLoaded && wordPressSliderLoaded) {
      console.log("Both components loaded, hiding loader");
      setIsLoading(false);
    }
  }, [rotatingBadgeLoaded, wordPressSliderLoaded]);
  return (
    <div
      // className="flex-text"
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        position: "absolute", // Position the badge absolutely within the container

        opacity: isLoading ? 0 : 1,
        transition: "opacity 0.5s ease-in-out",
        visibility: isLoading ? "hidden" : "visible",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          width: "100%",
          margin: "auto",
          position: "absolute", // Position the container relatively
        }}
      >
        <WordPressSlider setWordPressSliderLoaded={setWordPressSliderLoaded} />
      </div>
      {/* </div> */}
      <Link
        href="/home"
        style={{
          textDecoration: "none",
          position: "absolute",
          top: "2rem",
          right: "2rem",
        }}
      >
        <RotatingBadge setRotatingBadgeLoaded={setRotatingBadgeLoaded} />
      </Link>
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
          }}
        >
          <Loader />
        </div>
      )}
    </div>
  );
}
