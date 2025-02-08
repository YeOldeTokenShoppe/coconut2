import React, { useState, useEffect } from "react";
import BurnGallery from "../components/BurnGallery";
import NavBar from "../components/NavBar.client";
import Communion3 from "../components/Communion3";
import Loader from "../components/Loader";
import MusicPlayer from "../components/MusicPlayer2";
import Draggable from "react-draggable";

export default function GalleryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [componentsLoaded, setComponentsLoaded] = useState({
    burnGallery: false,
    // communion: false,
    threeDScene: false,
  });
  const [showSpotify, setShowSpotify] = useState(false);
  const [showWebContent, setShowWebContent] = useState(false);

  useEffect(() => {
    if (
      componentsLoaded.burnGallery &&
      // componentsLoaded.communion &&
      componentsLoaded.threeDScene
    ) {
      setIsLoading(false);
    }
  }, [componentsLoaded]);

  useEffect(() => {
    // Override the body background color
    document.body.style.backgroundColor = "#000000"; // Set your desired background color

    // Cleanup function to reset the background color when the component unmounts
    return () => {
      document.body.style.backgroundColor = "#1b1724";
    };
  }, []);
  const WebContentOverlay = () => {
    if (!showWebContent) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80vw",
          maxWidth: "1024px",
          height: "80vh",
          maxHeight: "768px",
          backgroundColor: "white",
          zIndex: 1000,
          borderRadius: "12px",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
          padding: "20px",
          overflow: "auto",
          opacity: showWebContent ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        <div className="web-content">
          <h1>Interactive Screen Content</h1>
          <p>This is your HTML content displayed as an overlay.</p>
          {/* Add your interactive content here */}
        </div>
        <button
          onClick={() => setShowWebContent(false)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
    );
  };

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
          <BurnGallery
            setComponentLoaded={(status) =>
              setComponentsLoaded((prev) => ({ ...prev, burnGallery: status }))
            }
            setThreeDSceneLoaded={(status) =>
              setComponentsLoaded((prev) => ({ ...prev, threeDScene: status }))
            }
            setShowSpotify={setShowSpotify}
            showWebContent={showWebContent}
            setShowWebContent={setShowWebContent}
          />

          {/* <div className="canvasNavbar">
          <NavBar />
        </div> */}
          <div style={{ marginTop: "1rem" }}>
            <Communion3 />
          </div>
          <div id="magic8Modal" className="modal-overlay">
            <div className="modal-content">
              <iframe
                src="/html/magic.html" // Make sure this path matches where you put the HTML file
                frameBorder="0"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "20px",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  overflow: "hidden", // Prevent content from spilling out
                }}
              />
            </div>
          </div>
          {/* Add this alongside your other modals */}
          {/* Add alongside your other modals */}
          <div
            id="phoneModal"
            className="phone-modal-overlay"
            style={{ display: "none" }}
          >
            <div
              className="phone-modal-content"
              style={{
                transform: "scale(1.5)", // Adjust this value to scale up or down
                transformOrigin: "center center",
              }}
            >
              <iframe
                src="/html/phone_modal.html"
                frameBorder="0"
                style={{
                  width: "240px",
                  height: "480px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                }}
              />
            </div>
          </div>
          {/* 
          <Draggable
            // bounds="parent"
            handle=".music-player" // Use the music player div as the drag handle
          > */}
          <div
            style={{
              position: "fixed",
              bottom: "6rem",
              right: "4rem",
              // width: "8rem",
              // height: "8rem",
              zIndex: 1000,
              borderRadius: "12px",
              // overflow: "hidden",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
              opacity: showSpotify ? 1 : 0,
              transform: `scale(0.6) translateY(${showSpotify ? 0 : "20px"})`,
              transition: "opacity 0.3s ease, transform 0.3s ease",
              pointerEvents: showSpotify ? "auto" : "none",
              cursor: "move",
            }}
          >
            <MusicPlayer isVisible={showSpotify} />
            {/* <iframe
              src="https://open.spotify.com/embed/playlist/5wWiiVDG0Q83zVitjPf6fj?utm_source=generator"
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            /> */}
          </div>
          {/* </Draggable> */}
        </div>
      </div>
    </>
  );
  GalleryPage.theme = "dark";
}
