import React from "react";
import ChatModal from "../chatModal";
import PollModal from "../pollModal";

const StudentModals = ({
  openChatModal,
  setOpenChatModal,
  quizAnswer,
  messages,
  input,
  setInput,
  onSendChat,
  onSelectAnswer,
  pollResult,
  resultPoll,
}) => {
  return (
    <>
      {/* Chat Modal */}
      {openChatModal && (
        <ChatModal
          messages={messages}
          input={input}
          setInput={setInput}
          onSendChat={onSendChat}
          onClose={() => setOpenChatModal(false)}
        />
      )}

      {/* Quiz Modal for Students */}
      {quizAnswer && (
        <PollModal
          onSelectAnswer={onSelectAnswer}
          onClose={() => {}}
          isTeacher={false}
          pollResult={pollResult}
          resultPoll={resultPoll}
        />
      )}
    </>
  );
};

export default StudentModals;
