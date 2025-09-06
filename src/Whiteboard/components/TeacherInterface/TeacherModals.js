import React from "react";
import ChatModal from "../chatModal";
import PollModal from "../pollModal";

const TeacherModals = ({
  openChatModal,
  setOpenChatModal,
  poleDialogue,
  setPoleDialogue,
  messages,
  input,
  setInput,
  onSendChat,
  onSelectAnswer,
}) => {
  return (
    <>
      {openChatModal && (
        <ChatModal
          messages={messages}
          input={input}
          setInput={setInput}
          onSendChat={onSendChat}
          onClose={() => setOpenChatModal(false)}
        />
      )}

      {poleDialogue && (
        <PollModal
          onSelectAnswer={onSelectAnswer}
          onClose={() => setPoleDialogue(false)}
          isTeacher={true}
        />
      )}
    </>
  );
};

export default TeacherModals;
