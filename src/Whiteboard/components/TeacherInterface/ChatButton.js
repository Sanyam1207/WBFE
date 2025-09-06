import React from "react";
import ActionButton from "./ActionButton";

const ChatButton = ({ onOpenChat }) => {
  const chatIcon = (
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  );

  return (
    <ActionButton
      onClick={onOpenChat}
      icon={chatIcon}
      text="Open Chat"
      position={{ top: "10px", right: "10px" }}
    />
  );
};

export default ChatButton;
