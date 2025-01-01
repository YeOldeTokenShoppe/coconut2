// ButtonClickHandler.jsx
import React, { useState } from "react";

// Single component that returns both parts
const ButtonClickHandler = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [clickedButton, setClickedButton] = useState("");

  const handleClick = (event) => {
    event.stopPropagation();
    if (event.object.name.includes("Button")) {
      console.log(`${event.object.name} clicked!`);
      setClickedButton(event.object.name);
      setShowAlert(true);
    }
  };

  return (
    <>
      {/* Part that goes in the Canvas */}
      <group onClick={handleClick} />

      {/* Alert UI */}
      {showAlert && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#fff",
            borderRadius: "5%",
            zIndex: 100000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px",
            border: "2px solid goldenrod",
            pointerEvents: "auto",
          }}
        >
          <p style={{ margin: 0, paddingBottom: "10px" }}>
            {clickedButton} Clicked!
          </p>
          <button
            onClick={() => setShowAlert(false)}
            style={{
              position: "relative",
              zIndex: 100001,
              pointerEvents: "auto",
              cursor: "pointer",
              padding: "10px",
              marginTop: "auto",
              backgroundColor: "goldenrod",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              width: "70px",
              height: "30px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "16px",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.3s ease, transform 0.3s ease",
            }}
          >
            OK
          </button>
        </div>
      )}
    </>
  );
};

export default ButtonClickHandler;
