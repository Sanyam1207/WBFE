import React from "react";

const FileUpload = ({ onFileChange }) => {
  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = "#141c59";
    e.currentTarget.style.transform = "scale(1.05)";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = "#36408a";
    e.currentTarget.style.transform = "scale(1)";
  };

  return (
    <div style={{ position: "absolute", top: "10px", left: "60px" }}>
      <input
        id="file-upload"
        type="file"
        style={{ display: "none" }}
        onChange={onFileChange}
      />
      <label
        htmlFor="file-upload"
        style={{
          display: "inline-flex",
          alignItems: "center",
          backgroundColor: "#36408a",
          color: "#fff",
          padding: "10px 15px",
          fontSize: "14px",
          fontWeight: "600",
          borderRadius: "6px",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ marginRight: "8px" }}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        Upload File
      </label>
    </div>
  );
};

export default FileUpload;
