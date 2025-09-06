// ChatModal.js
import React from "react";

const ChatModal = ({ messages, input, setInput, onSendChat, onClose }) => {
  return (
    <div
      style={{
        width: "400px",
        borderRadius: "12px",
        display: "flex",
        position: "absolute",
        bottom: "20px",
        right: "20px",
        flexDirection: "column",
        backgroundColor: "#333",
        color: "#fff",
        overflow: "hidden",
        boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 15px",
          backgroundColor: "#36408a",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "16px" }}>Class Chat</div>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "#fff",
            border: "none",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div
        style={{
          flex: 1,
          padding: "10px",
          overflow: "auto",
          maxHeight: "250px",
          minHeight: "200px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              margin: "8px 0",
              padding: "10px 12px",
              backgroundColor: "#444",
              borderRadius: "8px",
              fontSize: "14px",
              wordBreak: "break-word",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "4px",
                color: "#E91E63",
              }}
            >
              {msg.userID}
            </div>
            <div>{msg.message}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          padding: "10px 12px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          backgroundColor: "#282828",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px 12px",
            fontSize: "14px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "#444",
            color: "#fff",
            outline: "none",
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              onSendChat();
            }
          }}
        />
        <button
          onClick={onSendChat}
          style={{
            marginLeft: "10px",
            padding: "10px 15px",
            backgroundColor: "#36408a",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#141c59";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#36408a";
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatModal;
