import React, { useState, useEffect } from "react";
import BurnGallery from "../components/BurnGallery";
import NavBar from "../components/NavBar.client";
import Communion3 from "../components/Communion3";
import Loader from "../components/Loader";

export default function GalleryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [burnGalleryLoaded, setBurnGalleryLoaded] = useState(false);
  const [communionLoaded, setCommunionLoaded] = useState(false);

  useEffect(() => {
    if (burnGalleryLoaded && communionLoaded) {
      setIsLoading(false);

      const scrollPosition = window.innerWidth < 768 ? 50 : 150;

      window.scrollTo({
        top: scrollPosition,
        behavior: "smooth", // Smooth scrolling
      });
    }
  }, [burnGalleryLoaded, communionLoaded]);

  useEffect(() => {
    // Override the body background color
    document.body.style.backgroundColor = "#000000"; // Set your desired background color

    // Cleanup function to reset the background color when the component unmounts
    return () => {
      document.body.style.backgroundColor = "#1b1724";
    };
  }, []);

  return (
    <>
      <div style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
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
            <Communion3 setCommunionLoaded={setCommunionLoaded} />
          </div>
        </div>
      </div>
    </>
  );
  GalleryPage.theme = "dark";
}
