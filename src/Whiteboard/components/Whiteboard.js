// Whiteboard.js
import { Package2Icon } from "lucide-react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import rough from "roughjs/bundled/rough.esm";
import { v4 as uuid } from "uuid";

import CursorOverlay from "../CursorOverlay";
import AiSearchPopup from "../../components/AiSearchPopup";
import PdfViewer from "../../components/PdfViewer";
import WebsiteShareControl from "../../components/WebsiteShareControl";
import WebsiteDisplay from "../../components/WebsiteDisplay";
import { actions, cursorPositions, toolTypes } from "../../constants";
import {
  emitAudioStream,
  emitCursorPosition,
  emitFile,
  emitMessages,
  emitStudentSleeping,
  quiz,
} from "../../socketConn/socketConn";
import { clearAudioStream } from "../../store/slices/audioSlice";
import { clearFile } from "../../store/slices/fileSlice";
import { store } from "../../store/store";
import Menu from "./Menu";
import image from "../../resources/icons/image.png";
import {
  adjustElementCoordinates,
  adjustmentRequired,
  createElement,
  drawElement,
  getCursorForPosition,
  getElementAtPosition,
  getResizedCoordinates,
  updateElement,
  updatePencilElementWhenMoving,
} from "../utils";
import {
  setMessages,
  updateElement as updateElementInStore,
} from "../../store/slices/whiteboardSlice";

// Import the new components
import TeacherInterface from "./teacherInterface";
import StudentInterface from "./studentInterface";
import CommonModals from "./commonModal";

let emitCursor = true;
let lastCursorPosition;

const Whiteboard = ({ role, userID, roomID }) => {
  const canvasRef = useRef();
  const textAreaRef = useRef();

  if (role === "teacher") {
    emitCursor = true;
  } else {
    emitCursor = false;
  }

  // Redux state
  const file = useSelector((state) => state.file.file);
  const toolType = useSelector((state) => state.whiteboard.tool);
  const selectedColor = useSelector((state) => state.whiteboard.selectedColor);
  const elements = useSelector((state) => state.whiteboard.elements);
  const sleptStudent = useSelector((state) => state.whiteboard.slepingStudent);
  const messages = useSelector((state) => state.whiteboard.messages);
  const quizAnswer = useSelector((state) => state.whiteboard.quizAnswer);
  const audioStream = useSelector((state) => state.audioStreaming.audioStream);

  // State variables
  const [moveCanvas, setMoveCanvas] = useState("");
  const [AISearchOpen, setAISearchOpen] = useState(false);
  const [pollResult, setPollResult] = useState(false);
  const [iscorrect, setIsCorrect] = useState(null);
  const [resultPoll, setResultPoll] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [openImageModel, setOpenImageModel] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [input, setInput] = useState("");
  const [showPdf, setShowPdf] = useState(true);
  const [action, setAction] = useState(null);
  const [wakeupIndex, setWakeupIndex] = useState(0);
  const [openChatModal, setOpenChatModal] = useState(false);
  const [poleDialogue, setPoleDialogue] = useState(false);
  const [pollAnswer, setPoleAnswer] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const audioStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Audio streaming setup for teacher (existing code)
  useEffect(() => {
    if (role === "teacher") {
      const startAudioCapture = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });

          audioStreamRef.current = stream;
          mediaRecorderRef.current = new MediaRecorder(stream);

          const audioChunks = [];

          mediaRecorderRef.current.addEventListener(
            "dataavailable",
            (event) => {
              audioChunks.push(event.data);
            }
          );

          mediaRecorderRef.current.addEventListener("stop", () => {
            const audioBlob = new Blob(audioChunks);
            audioChunks.length = 0;

            const fileReader = new FileReader();
            fileReader.readAsDataURL(audioBlob);
            fileReader.onloadend = () => {
              const base64String = fileReader.result;
              emitAudioStream({
                audioData: base64String,
                roomID,
                userID,
              });
            };

            mediaRecorderRef.current.start();
            setTimeout(() => {
              mediaRecorderRef.current.stop();
            }, 150);
          });

          mediaRecorderRef.current.start();
          setTimeout(() => {
            mediaRecorderRef.current.stop();
          }, 100);
        } catch (error) {
          console.error("Error setting up audio capture:", error);
        }
      };

      startAudioCapture();
    }

    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      dispatch(clearAudioStream());
    };
  }, [role, roomID, userID, dispatch]);

  // Audio playback for students
  useEffect(() => {
    if (role === "student" && audioStream) {
      const audio = new Audio(audioStream);
      audio.play().catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error playing audio:", error);
          dispatch(clearAudioStream());
        }
      });

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [audioStream, role, dispatch]);

  // File download effect
  useEffect(() => {
    if (file) {
      const blob = new Blob([file.data], { type: file.fileType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      dispatch(clearFile());
    }
  }, [file, dispatch]);

  // Canvas rendering
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    elements.forEach((element) => {
      drawElement({ roughCanvas, context: ctx, element });
    });
  }, [elements]);

  // Mouse event handlers
  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;
    const adjustedY = clientY;

    if (selectedElement && action === actions.WRITING) {
      return;
    }

    switch (toolType) {
      case toolTypes.RECTANGLE:
      case toolTypes.LINE:
      case toolTypes.PENCIL:
      case toolTypes.CIRCLE:
      case toolTypes.TRIANGLE: {
        const element = createElement({
          x1: clientX,
          y1: adjustedY,
          x2: clientX,
          y2: adjustedY,
          toolType,
          id: uuid(),
          color: selectedColor,
        });

        setAction(actions.DRAWING);
        setSelectedElement(element);
        dispatch(updateElementInStore(element));
        break;
      }
      case toolTypes.TEXT: {
        const element = createElement({
          x1: clientX,
          y1: clientY,
          x2: clientX,
          y2: clientY,
          toolType,
          id: uuid(),
          color: selectedColor,
        });

        setAction(actions.WRITING);
        setSelectedElement(element);
        dispatch(updateElementInStore(element));
        break;
      }
      case toolTypes.IMAGE: {
        setOpenImageModel(true);
        setMousePosition({ x: clientX, y: clientY });
        break;
      }
      case toolTypes.SELECTION: {
        const element = getElementAtPosition(clientX, clientY, elements);

        if (
          element &&
          (element.type === toolTypes.RECTANGLE ||
            element.type === toolTypes.TEXT ||
            element.type === toolTypes.LINE ||
            element.type === toolTypes.IMAGE)
        ) {
          setAction(
            element.position === cursorPositions.INSIDE
              ? actions.MOVING
              : actions.RESIZING
          );

          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;

          setSelectedElement({ ...element, offsetX, offsetY });
        }

        if (element && element.type === toolTypes.PENCIL) {
          setAction(actions.MOVING);

          const xOffsets = element.points.map((point) => clientX - point.x);
          const yOffsets = element.points.map((point) => clientY - point.y);

          setSelectedElement({ ...element, xOffsets, yOffsets });
        }
        break;
      }
      default: {
        return;
      }
    }
  };

  const handleMouseUp = () => {
    const selectedElementIndex = elements.findIndex(
      (el) => el.id === selectedElement?.id
    );

    if (selectedElementIndex !== -1) {
      if (action === actions.DRAWING || action === actions.RESIZING) {
        if (adjustmentRequired(elements[selectedElementIndex].type)) {
          const { x1, y1, x2, y2 } = adjustElementCoordinates(
            elements[selectedElementIndex]
          );

          const currentColor = elements[selectedElementIndex].color;

          updateElement(
            {
              id: selectedElement.id,
              index: selectedElementIndex,
              x1,
              x2,
              y1,
              y2,
              type: elements[selectedElementIndex].type,
              color: currentColor,
            },
            elements,
            roomID
          );
        }
      }
    }

    setAction(null);
    setSelectedElement(null);
  };

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;

    const selectedColor =
      store.getState().whiteboard.selectedColor || "#000000";

    lastCursorPosition = {
      cursorData: { x: clientX, y: clientY },
      roomID: roomID,
    };

    if (emitCursor) {
      emitCursorPosition({
        cursorData: { x: clientX, y: clientY },
        roomID: roomID,
      });

      setTimeout(() => {
        emitCursor = true;
        emitCursorPosition(lastCursorPosition);
      }, [80]);
    }

    if (action === actions.DRAWING) {
      const index = elements.findIndex((el) => el.id === selectedElement.id);

      if (index !== -1) {
        const elementColor =
          elements[index].color ||
          selectedElement.color ||
          store.getState().whiteboard.selectedColor ||
          "#000000";

        updateElement(
          {
            index,
            id: elements[index].id,
            x1: elements[index].x1,
            y1: elements[index].y1,
            x2: clientX,
            y2: clientY,
            type: elements[index].type,
            color: elementColor,
          },
          elements,
          roomID
        );
      }
    }

    if (toolType === toolTypes.SELECTION) {
      const element = getElementAtPosition(clientX, clientY, elements);
      event.target.style.cursor = element
        ? getCursorForPosition(element.position)
        : "default";
    }

    if (
      selectedElement &&
      toolType === toolTypes.SELECTION &&
      action === actions.MOVING &&
      selectedElement.type === toolTypes.PENCIL
    ) {
      const newPoints = selectedElement.points.map((_, index) => ({
        x: clientX - selectedElement.xOffsets[index],
        y: clientY - selectedElement.yOffsets[index],
      }));

      const index = elements.findIndex((el) => el.id === selectedElement.id);

      if (index !== -1) {
        updatePencilElementWhenMoving(
          {
            index,
            newPoints,
            color: selectedElement.color,
          },
          elements
        );
      }
      return;
    }

    if (
      toolType === toolTypes.SELECTION &&
      action === actions.MOVING &&
      selectedElement
    ) {
      const { id, x1, x2, y1, y2, type, offsetX, offsetY, text, color } =
        selectedElement;

      const width = x2 - x1;
      const height = y2 - y1;

      const newX1 = clientX - offsetX;
      const newY1 = clientY - offsetY;

      const index = elements.findIndex((el) => el.id === selectedElement.id);

      if (index !== -1) {
        updateElement(
          {
            id,
            x1: newX1,
            y1: newY1,
            x2: newX1 + width,
            y2: newY1 + height,
            type,
            index,
            text,
            color,
          },
          elements,
          roomID
        );
      }
    }

    if (
      toolType === toolTypes.SELECTION &&
      action === actions.RESIZING &&
      selectedElement
    ) {
      const { id, type, position, color, ...coordinates } = selectedElement;
      const { x1, y1, x2, y2 } = getResizedCoordinates(
        clientX,
        clientY,
        position,
        coordinates
      );

      const selectedElementIndex = elements.findIndex(
        (el) => el.id === selectedElement.id
      );

      if (selectedElementIndex !== -1) {
        updateElement(
          {
            x1,
            x2,
            y1,
            y2,
            type: selectedElement.type,
            id: selectedElement.id,
            index: selectedElementIndex,
            color: selectedElement.color,
          },
          elements,
          roomID
        );
      }
    }
  };

  const handleTextareaBlur = (event) => {
    const { id, x1, y1, type } = selectedElement;
    const index = elements.findIndex((el) => el.id === selectedElement.id);

    if (index !== -1) {
      updateElement(
        { id, x1, y1, type, text: event.target.value, index },
        elements,
        roomID
      );
      setAction(null);
      setSelectedElement(null);
    }
  };

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
    store,
    emitMessages,
    setMessages,
  };

  const teacherProps = {
    ...commonProps,
    sleptStudent,
    poleDialogue,
    setPoleDialogue,
    pollAnswer,
    setPoleAnswer,
    quiz,
    emitFile,
    clearFile,
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
    audioRef,
    emitStudentSleeping,
  };

  const modalProps = {
    openImageModel,
    setOpenImageModel,
    imageUrl,
    setImageUrl,
    mousePosition,
    createElement,
    toolTypes,
    uuid,
    setSelectedElement,
    updateElementInStore,
    dispatch,
  };

  return (
    <>
      {/* Role-specific interfaces */}
      {role === "teacher" && <TeacherInterface {...teacherProps} />}
      {role === "student" && <StudentInterface {...studentProps} />}

      {/* Common elements */}
      {role === "teacher" && (
        <>
          <Menu roomID={roomID} />
          {action === actions.WRITING ? (
            <textarea
              ref={textAreaRef}
              onBlur={handleTextareaBlur}
              style={{
                position: "absolute",
                top: selectedElement.y1 - 3,
                left: selectedElement.x1,
                font: "12px sans-serif",
                margin: 0,
                padding: 0,
                border: 0,
                outline: 0,
                resize: "auto",
                overflow: "visible",
                whiteSpace: "pre",
                background: "transparent",
              }}
            />
          ) : null}
        </>
      )}

      {role === "student" && <CursorOverlay />}

      {/* Canvas */}
      <canvas
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        ref={canvasRef}
        className={moveCanvas}
        width={window.innerWidth}
        height={window.innerHeight}
        id="canvas"
      />

      {/* Common modals and popups */}
      <CommonModals {...modalProps} />

      {/* AI Search Button and Popup */}
      <button
        onClick={() => setAISearchOpen(true)}
        style={{
          padding: "10px",
          borderRadius: "10px",
          position: "absolute",
          top: "10px",
          left: "10px",
          margin: 0,
          backgroundColor: "#333",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
        }}
      >
        <img
          src={image}
          alt="AI Search"
          style={{ height: "30px", width: "auto" }}
        />
      </button>

      {AISearchOpen && (
        <AiSearchPopup userID={userID} onClose={setAISearchOpen} />
      )}

      {/* PDF Viewer Button */}
      <div
        onClick={() => setShowPdf(true)}
        style={{
          position: "absolute",
          top: 5,
          left: 200,
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(45deg, #FF4081, #E91E63)",
          borderRadius: "50%",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
        }}
      >
        <Package2Icon style={{ color: "#fff", fontSize: "24px" }} />
      </div>

      {/* PDF Viewer Modal */}
      {showPdf && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            width: "80%",
            height: "80%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            borderTopLeftRadius: "12px",
            boxShadow: "0 -5px 25px rgba(0,0,0,0.2)",
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 15px",
              backgroundColor: "#36408a",
              color: "#fff",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>
              Document Viewer
            </div>
            <button
              onClick={() => setShowPdf(false)}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "none",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 15px",
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
              }}
            >
              <WebsiteShareControl
                roomID={roomID}
                userID={userID}
                isTeacher={true}
              />
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              <PdfViewer />
            </div>
          </div>
          <WebsiteDisplay roomID={roomID} userID={userID} />
        </div>
      )}
    </>
  );
};

export default Whiteboard;
