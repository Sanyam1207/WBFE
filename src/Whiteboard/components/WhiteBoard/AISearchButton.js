import React from "react";
import image from "../../../resources/icons/image.png";

const AISearchButton = ({ onOpen }) => {
  return (
    <button
      onClick={onOpen}
      style={{
        padding: "10px",
        borderRadius: "10px",
        position: "absolute",
        top: "10px",
        left: "10px",
        margin: 0,
        backgroundColor: "#333",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
      }}
    >
      <img
        src={image}
        alt="AI Search"
        style={{ height: "30px", width: "auto" }}
      />
    </button>
  );
};

export default AISearchButton;
