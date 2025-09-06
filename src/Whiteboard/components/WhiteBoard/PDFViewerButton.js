import React from "react";
import { Package2Icon } from "lucide-react";

const PDFViewerButton = ({ onOpen }) => {
  return (
    <div
      onClick={onOpen}
      style={{
        position: "absolute",
        top: 5,
        left: 200,
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(45deg, #FF4081, #E91E63)",
        borderRadius: "50%",
        cursor: "pointer",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
      }}
    >
      <Package2Icon style={{ color: "#fff", fontSize: "24px" }} />
    </div>
  );
};

export default PDFViewerButton;
