import React from "react";

const SleepingStudentAlert = ({ sleptStudent }) => {
  if (!sleptStudent) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        padding: "12px 20px",
        backgroundColor: "#E91E63",
        color: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        fontSize: "18px",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        zIndex: 1000,
        animation: "fadeIn 0.5s ease",
      }}
    >
      <style>
        {`@keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }`}
      </style>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ marginRight: "12px" }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
      <span>{sleptStudent} is sleeping</span>
    </div>
  );
};

export default SleepingStudentAlert;
