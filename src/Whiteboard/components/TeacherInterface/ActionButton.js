import React from "react";

const ActionButton = ({
  onClick,
  icon,
  text,
  style = {},
  position = { top: "10px", right: "10px" },
}) => {
  const baseStyle = {
    position: "absolute",
    backgroundColor: "#36408a",
    color: "#fff",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    transition: "background-color 0.3s ease, transform 0.2s ease",
    ...position,
    ...style,
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = "#141c59";
    e.currentTarget.style.transform = "scale(1.05)";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = "#36408a";
    e.currentTarget.style.transform = "scale(1)";
  };

  return (
    <button
      onClick={onClick}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {icon && (
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
          {icon}
        </svg>
      )}
      {text}
    </button>
  );
};

export default ActionButton;
