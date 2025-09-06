import React from "react";
import SleepingStudentAlert from "./SleepingStudentAlert";
import TeacherToolbar from "./TeacherToolbar";
import TeacherModals from "./TeacherModals";

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
      <SleepingStudentAlert sleptStudent={sleptStudent} />

      <TeacherToolbar
        onOpenChat={() => setOpenChatModal(true)}
        onOpenPoll={() => setPoleDialogue(true)}
        onFileChange={handleFileChange}
      />

      <TeacherModals
        openChatModal={openChatModal}
        setOpenChatModal={setOpenChatModal}
        poleDialogue={poleDialogue}
        setPoleDialogue={setPoleDialogue}
        messages={messages}
        input={input}
        setInput={setInput}
        onSendChat={handleSendChat}
        onSelectAnswer={manageQuizClick}
      />
    </>
  );
};

export default TeacherInterface;
