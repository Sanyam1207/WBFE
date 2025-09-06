// StudentInterface.js
import React, { useEffect } from "react";
import ring from "../../resources/audio/ring.mp3";
import ChatModal from "./chatModal";
import PollModal from "./pollModal";

const StudentInterface = ({
  userID,
  roomID,
  messages,
  input,
  setInput,
  openChatModal,
  setOpenChatModal,
  showPopup,
  setShowPopup,
  wakeupIndex,
  setWakeupIndex,
  quizAnswer,
  pollResult,
  setPollResult,
  resultPoll,
  setResultPoll,
  iscorrect,
  setIsCorrect,
  audioRef,
  emitStudentSleeping,
  emitMessages,
  setMessages,
  store,
}) => {
  const doNotSendData = () => {
    setWakeupIndex(0);
    if (audioRef.current) {
      resetAudio();
    }
    setShowPopup(false);
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleStudentAnswer = (selectedAnswer) => {
    if (selectedAnswer === quizAnswer) {
      setResultPoll("Congrats You Have Answered Correctly");
    } else {
      setResultPoll("Oops wrong answer, better luck next time");
    }
    setPollResult(true);

    setTimeout(() => {
      setPollResult(false);
      setResultPoll("");
      setIsCorrect(null);
    }, 7000);
  };

  const handleSendChat = () => {
    const dataToSend = { message: input, userID: userID };
    const messageCopy = [...messages, dataToSend];

    store.dispatch(setMessages(messageCopy));
    emitMessages({ userID, message: input, roomID, messageCopy });
  };

  // Spacebar handler for wake-up popup
  useEffect(() => {
    const handleSpacebar = (e) => {
      if (e.code === "Space" || e.keyCode === 32) {
        doNotSendData();
      }
    };

    if (showPopup) {
      window.addEventListener("keydown", handleSpacebar);
    }

    return () => {
      window.removeEventListener("keydown", handleSpacebar);
    };
  }, [showPopup]);

  // Student sleep detection
  useEffect(() => {
    const popupInterval = setInterval(() => {
      setShowPopup(true);
      setWakeupIndex((prev) => {
        const newCount = prev + 1;
        if (newCount === 3) {
          audioRef.current = new Audio(ring);
          playAudio();
          emitStudentSleeping(userID, roomID);
        }
        return newCount;
      });
    }, 1000 * 60 * 1);

    return () => clearInterval(popupInterval);
  }, [roomID, userID]);

  return (
    <>
      {/* Wake-up Popup */}
      {showPopup && (
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
            onClick={() => {
              doNotSendData();
            }}
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

      {/* Quiz Modal for Students */}
      {quizAnswer && (
        <PollModal
          onSelectAnswer={handleStudentAnswer}
          onClose={() => {}}
          isTeacher={false}
          pollResult={pollResult}
          resultPoll={resultPoll}
        />
      )}
    </>
  );
};

export default StudentInterface;
