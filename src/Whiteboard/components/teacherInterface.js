// TeacherInterface.js
import React from "react";
import ChatModal from "./chatModal";
import PollModal from "./pollModal";

const TeacherInterface = ({
  userID,
  roomID,
  messages,
  input,
  setInput,
  openChatModal,
  setOpenChatModal,
  sleptStudent,
  poleDialogue,
  setPoleDialogue,
  pollAnswer,
  setPoleAnswer,
  quiz,
  emitFile,
  emitMessages,
  setMessages,
  store,
}) => {
  const handleSendChat = () => {
    const dataToSend = { message: input, userID: userID };
    const messageCopy = [...messages, dataToSend];

    store.dispatch(setMessages(messageCopy));
    emitMessages({ userID, message: input, roomID, messageCopy });
  };

  const manageQuizClick = (correctAnswer) => {
    setPoleAnswer(correctAnswer);
    quiz({ correctAnswer, roomID });
    setPoleDialogue(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (evt) => {
      emitFile({
        roomID,
        fileName: file.name,
        fileType: file.type,
        fileData: evt.target.result,
      });
    };
  };

  return (
    <>
      {/* Sleeping Student Alert */}
      {sleptStudent && (
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
      )}

      {/* Chat Button */}
      <button
        onClick={() => setOpenChatModal(true)}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
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
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#141c59";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#36408a";
          e.currentTarget.style.transform = "scale(1)";
        }}
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
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        Open Chat
      </button>

      {/* Poll Button */}
      <button
        onClick={() => setPoleDialogue(true)}
        style={{
          right: 120,
          backgroundColor: "#36408a",
          color: "#fff",
          border: "none",
          padding: "8px 15px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          transition: "background-color 0.3s ease, transform 0.2s ease",
          position: "absolute",
          top: "10px",
          display: "flex",
          alignItems: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#141c59";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#36408a";
          e.currentTarget.style.transform = "scale(1)";
        }}
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
          <path d="M16 6H3"></path>
          <path d="M21 12H3"></path>
          <path d="M21 18H3"></path>
          <path d="M16 6l4 6-4 6"></path>
        </svg>
        Conduct Poll
      </button>

      {/* File Upload */}
      <div style={{ position: "absolute", top: "10px", left: "60px" }}>
        <input
          id="file-upload"
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#141c59";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#36408a";
            e.currentTarget.style.transform = "scale(1)";
          }}
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

      {/* Chat Modal */}
      {openChatModal && (
        <ChatModal
          messages={messages}
          input={input}
          setInput={setInput}
          onSendChat={handleSendChat}
          onClose={() => setOpenChatModal(false)}
        />
      )}

      {/* Poll Modal */}
      {poleDialogue && (
        <PollModal
          onSelectAnswer={manageQuizClick}
          onClose={() => setPoleDialogue(false)}
          isTeacher={true}
        />
      )}
    </>
  );
};

export default TeacherInterface;
