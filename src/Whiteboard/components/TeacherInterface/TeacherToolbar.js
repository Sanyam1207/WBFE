import React from "react";
import ChatButton from "./ChatButton";
import PollButton from "./PollButton";
import FileUpload from "./FileUpload";

const TeacherToolbar = ({ onOpenChat, onOpenPoll, onFileChange }) => {
  return (
    <>
      <ChatButton onOpenChat={onOpenChat} />
      <PollButton onOpenPoll={onOpenPoll} />
      <FileUpload onFileChange={onFileChange} />
    </>
  );
};

export default TeacherToolbar;
