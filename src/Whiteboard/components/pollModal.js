// PollModal.js
import React from "react";

const PollModal = ({
  onSelectAnswer,
  onClose,
  isTeacher,
  pollResult,
  resultPoll,
}) => {
  const title = isTeacher
    ? "Select the correct answer for your poll"
    : "Select your answer";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1200,
      }}
    >
      <div
        style={{
          backgroundColor: "#333",
          borderRadius: "12px",
          padding: "25px",
          width: "500px",
          maxWidth: "90%",
          boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h3
          style={{
            color: "#fff",
            textAlign: "center",
            marginTop: 0,
            marginBottom: "25px",
            fontSize: "20px",
          }}
        >
          {title}
        </h3>

        {!isTeacher && pollResult && (
          <div
            style={{
              backgroundColor: "#36408a",
              color: "#fff",
              textAlign: "center",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "18px" }}>{resultPoll}</h2>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          {[1, 2, 3, 4].map((option) => (
            <button
              key={option}
              onClick={() => onSelectAnswer(option)}
              style={{
                backgroundColor: "#444",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "15px",
                fontSize: "16px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#555";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#444";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Option {option}
            </button>
          ))}
        </div>

        {isTeacher && (
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#E91E63",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              display: "block",
              margin: "0 auto",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#C2185B";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#E91E63";
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default PollModal;
