import React from "react";
import ActionButton from "./ActionButton";

const PollButton = ({ onOpenPoll }) => {
  const pollIcon = (
    <>
      <path d="M16 6H3"></path>
      <path d="M21 12H3"></path>
      <path d="M21 18H3"></path>
      <path d="M16 6l4 6-4 6"></path>
    </>
  );

  return (
    <ActionButton
      onClick={onOpenPoll}
      icon={pollIcon}
      text="Conduct Poll"
      position={{ top: "10px", right: "120px" }}
    />
  );
};

export default PollButton;
