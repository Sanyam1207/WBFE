import React from "react";

const WakeupPopup = ({ showPopup, onWakeup }) => {
  if (!showPopup) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        width: "280px",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
        backgroundColor: "#333",
        color: "#fff",
        animation: "pulse 2s infinite",
      }}
    >
      <style>
        {`@keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(233, 30, 99, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(233, 30, 99, 0); }
          100% { box-shadow: 0 0 0 0 rgba(233, 30, 99, 0); }
        }`}
      </style>
      <button
        style={{
          width: "100%",
          border: "none",
          backgroundColor: "transparent",
          padding: "20px",
          cursor: "pointer",
          color: "#fff",
          textAlign: "center",
        }}
        onClick={onWakeup}
      >
        <div
          style={{
            backgroundColor: "#E91E63",
            padding: "10px",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            margin: "0 auto 15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
          </svg>
        </div>
        <h2 style={{ margin: "0 0 10px 0", fontSize: "20px" }}>
          Are You Awake?
        </h2>
        <p style={{ margin: "0", opacity: "0.8", fontSize: "14px" }}>
          Press SPACE to confirm
        </p>
      </button>
    </div>
  );
};

export default WakeupPopup;
