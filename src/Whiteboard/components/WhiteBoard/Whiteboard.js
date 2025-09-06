import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import CursorOverlay from "../../CursorOverlay";
import AiSearchPopup from "../../../components/AiSearchPopup";
import Menu from "../Menu";

// Import the new components
import TeacherInterface from "../TeacherInterface/TeacherInterface";
import StudentInterface from "../StudentInterface/StudentInterface";
import CommonModals from "../commonModal";
import WhiteboardCanvas from "./WhiteboardCanvas";
import useAudioStreaming from "./hooks/useAudioStreaming";
import useFileDownload from "./hooks/useFileDownload";
import AISearchButton from "./AISearchButton";
import PDFViewerButton from "./PDFViewerButton";
import PDFViewerModal from "./PDFViewerModal";

const Whiteboard = ({ role, userID, roomID }) => {
  const textAreaRef = useRef();

  // Redux state
  const file = useSelector((state) => state.file.file);
  const elements = useSelector((state) => state.whiteboard.elements);
  const sleptStudent = useSelector((state) => state.whiteboard.slepingStudent);
  const messages = useSelector((state) => state.whiteboard.messages);
  const quizAnswer = useSelector((state) => state.whiteboard.quizAnswer);

  // State variables
  const [AISearchOpen, setAISearchOpen] = useState(false);
  const [pollResult, setPollResult] = useState(false);
  const [iscorrect, setIsCorrect] = useState(null);
  const [resultPoll, setResultPoll] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [openImageModel, setOpenImageModel] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [input, setInput] = useState("");
  const [showPdf, setShowPdf] = useState(false);
  const [action, setAction] = useState(null);
  const [wakeupIndex, setWakeupIndex] = useState(0);
  const [openChatModal, setOpenChatModal] = useState(false);
  const [poleDialogue, setPoleDialogue] = useState(false);
  const [pollAnswer, setPoleAnswer] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const dispatch = useDispatch();

  // Custom hooks
  useAudioStreaming(role, roomID, userID, dispatch);
  useFileDownload(file, dispatch);

  // Common props for child components
  const commonProps = {
    userID,
    roomID,
    messages,
    input,
    setInput,
    openChatModal,
    setOpenChatModal,
    AISearchOpen,
    setAISearchOpen,
    showPdf,
    setShowPdf,
    dispatch,
  };

  const teacherProps = {
    ...commonProps,
    sleptStudent,
    poleDialogue,
    setPoleDialogue,
    pollAnswer,
    setPoleAnswer,
  };

  const studentProps = {
    ...commonProps,
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
  };

  const modalProps = {
    openImageModel,
    setOpenImageModel,
    imageUrl,
    setImageUrl,
    mousePosition,
    setSelectedElement,
    dispatch,
  };

  const canvasProps = {
    role,
    roomID,
    elements,
    action,
    setAction,
    selectedElement,
    setSelectedElement,
    textAreaRef,
  };

  return (
    <>
      {/* Role-specific interfaces */}
      {role === "teacher" && <TeacherInterface {...teacherProps} />}
      {role === "student" && <StudentInterface {...studentProps} />}

      {/* Common elements */}
      {role === "teacher" && <Menu roomID={roomID} />}
      {role === "student" && <CursorOverlay />}

      {/* Canvas */}
      <WhiteboardCanvas {...canvasProps} />

      {/* Common modals and popups */}
      <CommonModals {...modalProps} />

      {/* AI Search Button and Popup */}
      <AISearchButton onOpen={() => setAISearchOpen(true)} />
      {AISearchOpen && (
        <AiSearchPopup userID={userID} onClose={setAISearchOpen} />
      )}

      {/* PDF Viewer Button */}
      <PDFViewerButton onOpen={() => setShowPdf(true)} />

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        showPdf={showPdf}
        onClose={() => setShowPdf(false)}
        roomID={roomID}
        userID={userID}
      />
    </>
  );
};

export default Whiteboard;
