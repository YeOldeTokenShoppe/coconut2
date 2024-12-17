import React, { useState, useEffect } from "react";
import BurnGallery from "../components/BurnGallery";
import NavBar from "../components/NavBar.client";
import Communion from "../components/Communion";
import Loader from "../components/Loader";

export default function GalleryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [burnGalleryLoaded, setBurnGalleryLoaded] = useState(false);
  const [communionLoaded, setCommunionLoaded] = useState(false);

  useEffect(() => {
    console.log("BurnGallery Loaded:", burnGalleryLoaded);
    console.log("Communion Loaded:", communionLoaded);
    if (burnGalleryLoaded && communionLoaded) {
      setIsLoading(false);
      console.log("Loader finished");

      const scrollPosition = window.innerWidth < 768 ? 50 : 150;

      window.scrollTo({
        top: scrollPosition,
        behavior: "smooth", // Smooth scrolling
      });
    }
  }, [burnGalleryLoaded, communionLoaded]);

  useEffect(() => {
    // Override the body background color
    document.body.style.backgroundColor = "#f0f0f0"; // Set your desired background color

    // Cleanup function to reset the background color when the component unmounts
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <>
      {isLoading && <Loader />}
      <div
        style={{
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.5s ease-in-out",
          position: "relative",
          zIndex: 1,
          // width: "100vw",
          // height: "100%",
        }}
      >
        <BurnGallery setBurnGalleryLoaded={setBurnGalleryLoaded} />
        {/* <div className="canvasNavbar">
          <NavBar />
        </div> */}
        <div style={{ marginTop: "1rem" }}>
          <Communion setCommunionLoaded={setCommunionLoaded} />
        </div>
      </div>
    </>
  );
}
