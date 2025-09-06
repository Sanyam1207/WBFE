import React from "react";
import WakeupPopup from "./WakeupPopup";
import StudentChatButton from "./StudentChatButton";
import StudentModals from "./StudentModals";
import AudioController from "./AudioController";
import useStudentSleepDetection from "./hook/StudentSleepDetection";
import useSpacebarHandler from "./hook/SpacebarHandler";
import useQuizHandler from "./hook/QuizHandler";
import useChatHandler from "./hook/ChatHandler";

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
  // Initialize audio controller
  const audioController = new AudioController(audioRef);

  // Handle wake up functionality
  const doNotSendData = () => {
    setWakeupIndex(0);
    audioController.reset();
    setShowPopup(false);
  };

  // Custom hooks for different functionalities
  useStudentSleepDetection({
    roomID,
    userID,
    audioRef,
    setShowPopup,
    setWakeupIndex,
    emitStudentSleeping,
  });

  useSpacebarHandler(showPopup, doNotSendData);

  const handleStudentAnswer = useQuizHandler({
    quizAnswer,
    setResultPoll,
    setPollResult,
    setIsCorrect,
  });

  const handleSendChat = useChatHandler({
    input,
    userID,
    messages,
    store,
    setMessages,
    emitMessages,
    roomID,
  });

  return (
    <>
      <WakeupPopup showPopup={showPopup} onWakeup={doNotSendData} />

      <StudentChatButton onOpenChat={() => setOpenChatModal(true)} />

      <StudentModals
        openChatModal={openChatModal}
        setOpenChatModal={setOpenChatModal}
        quizAnswer={quizAnswer}
        messages={messages}
        input={input}
        setInput={setInput}
        onSendChat={handleSendChat}
        onSelectAnswer={handleStudentAnswer}
        pollResult={pollResult}
        resultPoll={resultPoll}
      />
    </>
  );
};

export default StudentInterface;
