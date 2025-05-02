import { Package2Icon } from "lucide-react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import rough from "roughjs/bundled/rough.esm";
import { v4 as uuid } from "uuid";
import ring from ".././resources/audio/ring.mp3";
import CursorOverlay from "../CursorOverlay/CursorOverlay";
import AiSearchPopup from "../components/AiSearchPopup";
import PdfViewer from "../components/PdfViewer";
import { actions, cursorPositions, toolTypes } from "../constants";
import {
  emitAudioStream,
  emitCursorPosition,
  emitFile,
  emitMessages,
  emitStudentSleeping,
  quiz,
} from "../socketConn/socketConn";
import { clearAudioStream } from "../store/audioSlice";
import { clearFile } from "../store/fileSlice";
import { store } from "../store/store";
import Menu from "./Menu";
import image from "./image.png";
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
} from "./utils";
import {
  setMessages,
  updateElement as updateElementInStore,
} from "./whiteboardSlice";
import WebsiteShareControl from "../components/WebsiteShareControl";
import WebsiteDisplay from "../components/WebsiteDisplay";

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

  // eslint-disable-next-line
  const [moveCanvas, setMoveCanvas] = useState("");
  const file = useSelector((state) => state.file.file);
  // eslint-disable-next-line
  const toolType = useSelector((state) => state.whiteboard.tool);
  const [AISearchOpen, setAISearchOpen] = useState(false);
  const selectedColor = useSelector((state) => state.whiteboard.selectedColor);

  // eslint-disable-next-line
  const elements = useSelector((state) => state.whiteboard.elements);
  // eslint-disable-next-line
  const sleptStudent = useSelector((state) => state.whiteboard.slepingStudent);
  const messages = useSelector((state) => state.whiteboard.messages);
  const quizAnswer = useSelector((state) => state.whiteboard.quizAnswer);
  const [pollResult, setPollResult] = useState(false);
  const [iscorrect, setIsCorrect] = useState(null);
  const [resultPoll, setResultPoll] = useState("");
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });
  const [openImageModel, setOpenImageModel] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [input, setInput] = useState("");
  const [showPdf, setShowPdf] = useState(true);

  const [action, setAction] = useState(null);
  // eslint-disable-next-line
  const [wakeupIndex, setWakeupIndex] = useState(0);
  const [openChatModal, setOpenChatModal] = useState(false);
  const [poleDialogue, setPoleDialogue] = useState(false);
  // eslint-disable-next-line
  const [pollAnswer, setPoleAnswer] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const dispatch = useDispatch();
  const audioRef = useRef(null);

  const audioStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Select audio-related state from Redux
  // eslint-disable-next-line
  const activeAudioSource = useSelector(
    (state) => state.audioStreaming.activeAudioSource
  );
  const audioStream = useSelector((state) => state.audioStreaming.audioStream);

  useEffect(() => {
    const handleSpacebar = (e) => {
      // Check if the spacebar was pressed
      if (e.code === "Space" || e.keyCode === 32) {
        doNotSendData();
      }
    };

    if (showPopup) {
      window.addEventListener("keydown", handleSpacebar);
    }

    // Cleanup listener when popup is hidden or component unmounts
    return () => {
      window.removeEventListener("keydown", handleSpacebar);
    };
    // eslint-disable-next-line
  }, [showPopup]);

  useEffect(() => {
    // Audio streaming setup for teacher
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
            audioChunks.length = 0; // Clear the array

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

            // Restart recording
            mediaRecorderRef.current.start();
            setTimeout(() => {
              mediaRecorderRef.current.stop();
            }, 150);
          });

          // Initial start
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

    // Cleanup function
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

  // Optional: Audio playback for students
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

  const doNotSendData = () => {
    setWakeupIndex(0);
    if (audioRef.current) {
      resetAudio();
    }
    setShowPopup(false);
  };

  useEffect(() => {
    if (role === "student") {
      const popupInterval = setInterval(() => {
        setShowPopup(true);
        setWakeupIndex((prev) => {
          const newCount = prev + 1;
          if (newCount === 3) {
            audioRef.current = new Audio(ring);
            playAudio();
            console.log(userID);

            emitStudentSleeping(userID, roomID);
          }
          return newCount;
        });
      }, 1000 * 60 * 1);

      return () => clearInterval(popupInterval); // Cleanup interval on unmount
    }
  }, [role, roomID, userID]);

  useEffect(() => {
    if (file) {
      // Create a Blob from the file data (assumed to be binary data)
      const blob = new Blob([file.data], { type: file.fileType });
      const url = URL.createObjectURL(blob);

      // Create a temporary link and trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();

      // Clean up: remove the link and revoke the object URL
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Optionally clear the file from the store after download
      dispatch(clearFile());
    }
  }, [file, dispatch]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    console.log("Rendering elements:", elements.length);

    elements.forEach((element) => {

      drawElement({ roughCanvas, context: ctx, element });
    });
  }, [elements]);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause(); // Pause the audio
      audioRef.current.currentTime = 0; // Reset the playback position to the start
    }
  };

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
          color: selectedColor, // Pass the selected color
        });

        console.log(clientY);
        console.log(adjustedY);

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
          color: selectedColor, // Pass the selected color
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
    console.log("Mouse up called, action:", action, "selectedElement:", selectedElement?.id);

    const selectedElementIndex = elements.findIndex(
      (el) => el.id === selectedElement?.id
    );

    if (selectedElementIndex !== -1) {
      if (action === actions.DRAWING || action === actions.RESIZING) {
        // Log the element type to verify it's being recognized
        console.log("Element type:", elements[selectedElementIndex].type);

        if (adjustmentRequired(elements[selectedElementIndex].type)) {
          const { x1, y1, x2, y2 } = adjustElementCoordinates(
            elements[selectedElementIndex]
          );

          // Get the current color from the element before adjustment
          const currentColor = elements[selectedElementIndex].color;

          console.log("Adjusting element coordinates:", { x1, y1, x2, y2, color: currentColor });

          updateElement(
            {
              id: selectedElement.id,
              index: selectedElementIndex,
              x1,
              x2,
              y1,
              y2,
              type: elements[selectedElementIndex].type,
              color: currentColor // Preserve the color during adjustment
            },
            elements,
            roomID
          );
        }
      }
    }

    // Reset action and selected element regardless of whether the element was found
    setAction(null);
    setSelectedElement(null);
  };


  // The issue is in the handleMouseMove function where the color isn't being preserved
  // Here's the fix for your Whiteboard.js file:

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;

    // Get the current selected color from the Redux store to ensure we always have it
    const selectedColor = store.getState().whiteboard.selectedColor || "#000000";

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
      // find index of selected element
      const index = elements.findIndex((el) => el.id === selectedElement.id);

      if (index !== -1) {

        const elementColor = elements[index].color ||
          selectedElement.color ||
          store.getState().whiteboard.selectedColor ||
          '#000000';

        // Make sure we're passing the color from the selected element
        updateElement(
          {
            index,
            id: elements[index].id,
            x1: elements[index].x1,
            y1: elements[index].y1,
            x2: clientX,
            y2: clientY,
            type: elements[index].type,
            color: elementColor, // Preserve the color!
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
        // Preserve the color during pencil movement
        updatePencilElementWhenMoving(
          {
            index,
            newPoints,
            color: selectedElement.color // Make sure color is preserved
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
            color, // Add color here
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
            color: selectedElement.color, // Add color here to preserve it
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

  const handleSendChat = () => {
    const dataToSend = { message: input, userID: userID };
    const messageCopy = [...messages, dataToSend];
    console.log(messageCopy);

    store.dispatch(setMessages(messageCopy));
    emitMessages({ userID, message: input, roomID, messageCopy });
  };

  const manageQuizClick = (correctAnswer) => {
    console.log("quiz clicked");

    setPoleAnswer(correctAnswer);
    quiz({ correctAnswer, roomID });
    setPoleDialogue(false);
  };

  const handleStudentAnswer = (selectedAnswer) => {
    if (selectedAnswer === quizAnswer) {
      setResultPoll("Congrats You Have Answered Correctly");
      console.log(`is correct ${iscorrect}`);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    // Read the file as a Data URL
    reader.readAsDataURL(file);
    reader.onload = (evt) => {
      // evt.target.result is a Data URL (a base64 encoded string)
      emitFile({
        roomID,
        fileName: file.name,
        fileType: file.type,
        fileData: evt.target.result, // Data URL string
      });
    };
  };

  return (
    //     <>
    //       {role === 'teacher' && (
    //         <>
    //           <Menu roomID={roomID} />
    //           {action === actions.WRITING ? (
    //             <textarea
    //               ref={textAreaRef}
    //               onBlur={handleTextareaBlur}
    //               style={{
    //                 position: "absolute",
    //                 top: selectedElement.y1 - 3,
    //                 left: selectedElement.x1,
    //                 font: "12px sans-serif",
    //                 margin: 0,
    //                 padding: 0,
    //                 border: 0,
    //                 outline: 0,
    //                 resize: "auto",
    //                 overflow: "visible",
    //                 whiteSpace: "pre",
    //                 background: "transparent",
    //               }}
    //             />
    //           ) : null}
    //         </>
    //       )}

    //       {openImageModel && (
    //         <div
    //           style={{
    //             position: "absolute",
    //             top: '50%',
    //             left: '50%',
    //             background: "white",
    //             padding: "20px",
    //             border: "1px solid black",
    //             display: "flex",
    //             flexDirection: "column",
    //             alignItems: "center",
    //             zIndex: 1000,
    //           }}
    //         >
    //           <input
    //             type="text"
    //             placeholder="Enter image URL"
    //             value={imageUrl || ""}
    //             onChange={(e) => setImageUrl(e.target.value)}
    //             style={{ marginBottom: "10px", width: "200px", padding: "5px" }}
    //           />
    //           <div>
    //             <button
    //               onClick={(e) => {
    //                 if (imageUrl) {
    //                   // Add the image element to the canvas
    //                   const element = createElement({
    //                     x1: mousePosition.x,
    //                     y1: mousePosition.y,
    //                     x2: mousePosition.x + 600,
    //                     y2: mousePosition.y + 600,
    //                     toolType: toolTypes.IMAGE,
    //                     id: uuid(),
    //                     src: imageUrl,
    //                     roomID
    //                   });

    //                   setSelectedElement(element);
    //                   dispatch(updateElementInStore(element));
    //                 }
    //                 setOpenImageModel(false);
    //                 setImageUrl(""); // Clear input field
    //               }}
    //               style={{ marginRight: "10px" }}
    //             >
    //               Add
    //             </button>
    //             <button onClick={() => setOpenImageModel(false)}>Cancel</button>
    //           </div>
    //         </div>
    //       )}

    //       {role === 'student' && <CursorOverlay />}

    //       {role === 'student' && showPopup && (
    //         <div style={{

    //           border: '2px solid black',
    //           width: '200px',
    //           position: 'absolute',
    //           top: '80vh',
    //           right: '0vh',
    //           borderRadius: '20px',
    //           display: 'flex',
    //           flexDirection: 'column',
    //           backgroundColor: '#787878',
    //           color: '#fff',
    //           justifyContent: 'center',
    //           alignItems: 'center'
    //         }}>
    //           <button style={{
    //             height: '100%',
    //             width: '100%',
    //           }} className="awake-button"
    //             onClick={() => { doNotSendData() }}
    //           >
    //             <h2>Are You Awake ?</h2>
    //             <p>Press SPACE to confirm</p>
    //           </button>
    //         </div>
    //       )}

    //       <canvas
    //         onMouseDown={handleMouseDown}
    //         onMouseUp={handleMouseUp}
    //         onMouseMove={handleMouseMove}
    //         ref={canvasRef}
    //         className={moveCanvas}
    //         width={window.innerWidth}
    //         height={window.innerHeight}
    //         id="canvas"
    //       />

    //       {role === 'teacher' && sleptStudent && (
    //         <div
    //           style={{
    //             position: 'absolute',
    //             fontSize: '2.2rem',
    //             bottom: 20,
    //             right: 10,
    //             zIndex: 10
    //           }}
    //         >
    //           {sleptStudent} is sleeping
    //         </div>
    //       )}

    //       {openChatModal && (
    //         <div className="chat-container">
    //           <div className="chat-display">
    //             {messages.map((msg, index) => (
    //               <div key={index} className="chat-message">
    //                 from : {msg.userID}  : : {msg.message}
    //               </div>
    //             ))}
    //           </div>
    //           <div className="chat-input-container">
    //             <input
    //               type="text"
    //               value={input}
    //               onChange={(e) => setInput(e.target.value)}
    //               placeholder="Type a message..."
    //               className="chat-input"
    //             />
    //             <button onClick={() => { handleSendChat() }} className="chat-send-button">
    //               Send
    //             </button>
    //             <button className="chat-send-button" onClick={() => { setOpenChatModal(false) }}>
    //               Close
    //             </button>
    //           </div>
    //         </div>
    //       )}
    //       {
    //         role === 'teacher' && (
    //           <button onClick={() => setPoleDialogue(true)} style={{
    //             right: 120
    //           }} className="chatbutton">
    //             conduct poll
    //           </button>
    //         )
    //       }

    //       {
    //         role === 'teacher' && poleDialogue && (
    //           <div className="papa-button-container">
    //             <h3>Please select the correct answer</h3>
    //             <div className="button-container">
    //               <button className="button" onClick={() => { manageQuizClick(1) }}>Option 1</button>
    //               <button className="button" onClick={() => { manageQuizClick(2) }}>Option 2</button>
    //               <button className="button" onClick={() => { manageQuizClick(3) }}>Option 3</button>
    //               <button className="button" onClick={() => { manageQuizClick(4) }}>Option 4</button>
    //             </div>
    //           </div>

    //         )
    //       }

    //       {
    //         role === 'student' && quizAnswer && (
    //           <div className="papa-button-container">
    //             <h3>Please select the correct answer</h3>

    //             {
    //               pollResult && (
    //                 <div>
    //                   <h2>
    //                     {resultPoll}
    //                   </h2>
    //                 </div>
    //               )
    //             }

    //             <div className="button-container">
    //               <button className="button" onClick={() => { handleStudentAnswer(1) }}>Option 1</button>
    //               <button className="button" onClick={() => { handleStudentAnswer(2) }}>Option 2</button>
    //               <button className="button" onClick={() => { handleStudentAnswer(3) }}>Option 3</button>
    //               <button className="button" onClick={() => { handleStudentAnswer(4) }}>Option 4</button>
    //             </div>
    //           </div>
    //         )
    //       }

    //       <button onClick={() => setAISearchOpen(true)}
    //         style={{
    //           padding: 4,
    //           borderRadius: 5,
    //           position: 'absolute',
    //           top: 4,
    //           left: 10,
    //           margin: 0
    //         }}
    //       ><img src={image} alt="crashed" style={{
    //         height: '30px',
    //         width: 'auto',
    //       }} /></button>
    //       {AISearchOpen && <AiSearchPopup userID={userID} onClose={setAISearchOpen} />}

    //       <button onClick={() => setOpenChatModal(true)} className="chatbutton">
    //         Open Chat
    //       </button>

    //       {role === 'teacher' && (<div style={{ position: 'absolute', top: 5, left: 60 }}>
    //         {/*
    //         1. Hide the actual file input
    //         2. Style the label as your “sexy button”
    //       */}
    //         <input
    //           id="file-upload"
    //           type="file"
    //           style={{ display: 'none' }}
    //           onChange={handleFileChange}
    //         />
    //         <label
    //           htmlFor="file-upload"
    //           style={{
    //             display: 'inline-block',
    //             backgroundColor: '#36408a', // Pink accent
    //             color: '#fff',
    //             padding: '12px 20px',
    //             fontSize: '16px',
    //             fontWeight: 'bold',
    //             borderRadius: '6px',
    //             cursor: 'pointer',
    //             boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    //             transition: 'background-color 0.3s ease'
    //           }}
    //           onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#141c59')}
    //           onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#595e91')}
    //         >
    //           Upload File
    //         </label>
    //       </div>)}

    //       <div
    //   onClick={() => setShowPdf(true)}
    //   style={{
    //     position: 'absolute',
    //     top: 5,
    //     left: 200,
    //     width: '40px',
    //     height: '40px',
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     background: 'linear-gradient(45deg, #FF4081, #E91E63)',
    //     borderRadius: '50%',
    //     cursor: 'pointer',
    //     boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    //     transition: 'transform 0.2s, box-shadow 0.2s'
    //   }}
    //   onMouseEnter={e => {
    //     e.currentTarget.style.transform = 'scale(1.1)';
    //     e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
    //   }}
    //   onMouseLeave={e => {
    //     e.currentTarget.style.transform = 'scale(1)';
    //     e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    //   }}
    // >
    //   <Package2Icon style={{ color: '#fff', fontSize: '24px' }} />
    // </div>

    //       {showPdf && (<div style={{
    //         position: 'absolute',
    //         bottom: 10,
    //         right: 10,
    //         display: 'flex',
    //         padding: 10,
    //         backgroundColor: '#fff',

    //       }}>
    //         <button onClick={() => {setShowPdf(false)}} style={{
    //           backgroundColor: '#303038',
    //           color: '#fff',
    //         }}>
    //           X
    //         </button>
    //         <PdfViewer />
    //       </div>)}

    //     </>

    <>
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

      {openImageModel && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#333",
            borderRadius: "12px",
            padding: "25px",
            width: "400px",
            maxWidth: "90%",
            boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <h3 style={{
              color: "#fff",
              textAlign: "center",
              marginTop: 0,
              marginBottom: "20px",
              fontSize: "20px"
            }}>Add Image</h3>

            <input
              type="text"
              placeholder="Enter image URL"
              value={imageUrl || ""}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 15px",
                marginBottom: "20px",
                fontSize: "14px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#444",
                color: "#fff",
                outline: "none"
              }}
            />

            <div style={{
              display: "flex",
              justifyContent: "center",
              width: "100%"
            }}>
              <button
                onClick={(e) => {
                  if (imageUrl) {
                    // Add the image element to the canvas
                    const element = createElement({
                      x1: mousePosition.x,
                      y1: mousePosition.y,
                      x2: mousePosition.x + 600,
                      y2: mousePosition.y + 600,
                      toolType: toolTypes.IMAGE,
                      id: uuid(),
                      src: imageUrl,
                      roomID,
                    });

                    setSelectedElement(element);
                    dispatch(updateElementInStore(element));
                  }
                  setOpenImageModel(false);
                  setImageUrl(""); // Clear input field
                }}
                style={{
                  padding: "10px 20px",
                  minWidth: "100px",
                  backgroundColor: imageUrl ? "#36408a" : "#555",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  marginRight: "10px",
                  cursor: imageUrl ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (imageUrl) {
                    e.currentTarget.style.backgroundColor = "#141c59";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (imageUrl) {
                    e.currentTarget.style.backgroundColor = "#36408a";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                Add
              </button>
              <button
                onClick={() => setOpenImageModel(false)}
                style={{
                  padding: "10px 20px",
                  minWidth: "100px",
                  backgroundColor: "#E91E63",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#C2185B";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#E91E63";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}



      {role === "student" && <CursorOverlay />}

      {role === "student" && showPopup && (
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
            animation: "pulse 2s infinite"
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
              textAlign: "center"
            }}
            onClick={() => {
              doNotSendData();
            }}
          >
            <div style={{ backgroundColor: "#E91E63", padding: "10px", borderRadius: "50%", width: "50px", height: "50px", margin: "0 auto 15px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
              </svg>
            </div>
            <h2 style={{ margin: "0 0 10px 0", fontSize: "20px" }}>Are You Awake?</h2>
            <p style={{ margin: "0", opacity: "0.8", fontSize: "14px" }}>Press SPACE to confirm</p>
          </button>
        </div>
      )}

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

      {role === "teacher" && sleptStudent && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            padding: "12px 20px",
            backgroundColor: "#E91E63",
            color: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            fontSize: "18px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            zIndex: 1000,
            animation: "fadeIn 0.5s ease"
          }}
        >
          <style>
            {`@keyframes fadeIn {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }`}
          </style>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "12px" }}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <span>{sleptStudent} is sleeping</span>
        </div>
      )}


      {openChatModal && (
        <div className="chat-container" style={{
          width: "400px",
          borderRadius: "12px",
          display: "flex",
          position: "absolute",
          bottom: "20px",
          right: "20px",
          flexDirection: "column",
          backgroundColor: "#333",
          color: "#fff",
          overflow: "hidden",
          boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
          zIndex: 1000
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 15px",
            backgroundColor: "#36408a",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>Class Chat</div>
            <button
              onClick={() => setOpenChatModal(false)}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "none",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div style={{
            flex: 1,
            padding: "10px",
            overflow: "auto",
            maxHeight: "250px",
            minHeight: "200px"
          }}>
            {messages.map((msg, index) => (
              <div key={index} style={{
                margin: "8px 0",
                padding: "10px 12px",
                backgroundColor: "#444",
                borderRadius: "8px",
                fontSize: "14px",
                wordBreak: "break-word"
              }}>
                <div style={{ fontWeight: "bold", marginBottom: "4px", color: "#E91E63" }}>
                  {msg.userID}
                </div>
                <div>{msg.message}</div>
              </div>
            ))}
          </div>
          <div style={{
            display: "flex",
            padding: "10px 12px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "#282828"
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "10px 12px",
                fontSize: "14px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#444",
                color: "#fff",
                outline: "none"
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendChat();
                }
              }}
            />
            <button
              onClick={() => {
                handleSendChat();
              }}
              style={{
                marginLeft: "10px",
                padding: "10px 15px",
                backgroundColor: "#36408a",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "background-color 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#141c59";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#36408a";
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
      {role === "teacher" && (
        <button
          onClick={() => setPoleDialogue(true)}
          style={{
            right: 120,
            backgroundColor: '#36408a',
            color: '#fff',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
            position: 'absolute',
            top: '10px',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#141c59';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#36408a';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M16 6H3"></path>
            <path d="M21 12H3"></path>
            <path d="M21 18H3"></path>
            <path d="M16 6l4 6-4 6"></path>
          </svg>
          Conduct Poll
        </button>
      )}

      {role === "teacher" && poleDialogue && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1200
        }}>
          <div style={{
            backgroundColor: '#333',
            borderRadius: '12px',
            padding: '25px',
            width: '500px',
            maxWidth: '90%',
            boxShadow: '0 5px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{
              color: '#fff',
              textAlign: 'center',
              marginTop: 0,
              marginBottom: '25px',
              fontSize: '20px'
            }}>Select the correct answer for your poll</h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <button
                onClick={() => manageQuizClick(1)}
                style={{
                  backgroundColor: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '15px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#555';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Option 1
              </button>
              <button
                onClick={() => manageQuizClick(2)}
                style={{
                  backgroundColor: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '15px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#555';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Option 2
              </button>
              <button
                onClick={() => manageQuizClick(3)}
                style={{
                  backgroundColor: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '15px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#555';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Option 3
              </button>
              <button
                onClick={() => manageQuizClick(4)}
                style={{
                  backgroundColor: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '15px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#555';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Option 4
              </button>
            </div>

            <button
              onClick={() => setPoleDialogue(false)}
              style={{
                backgroundColor: '#E91E63',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'block',
                margin: '0 auto',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#C2185B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E91E63';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {role === "student" && quizAnswer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1200
        }}>
          <div style={{
            backgroundColor: '#333',
            borderRadius: '12px',
            padding: '25px',
            width: '500px',
            maxWidth: '90%',
            boxShadow: '0 5px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{
              color: '#fff',
              textAlign: 'center',
              marginTop: 0,
              marginBottom: '20px',
              fontSize: '20px'
            }}>Select your answer</h3>

            {pollResult && (
              <div style={{
                backgroundColor: '#36408a',
                color: '#fff',
                textAlign: 'center',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>{resultPoll}</h2>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <button
                onClick={() => handleStudentAnswer(1)}
                style={{
                  backgroundColor: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '15px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#555';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Option 1
              </button>
              <button
                onClick={() => handleStudentAnswer(2)}
                style={{
                  backgroundColor: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '15px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#555';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Option 2
              </button>
              <button
                onClick={() => handleStudentAnswer(3)}
                style={{
                  backgroundColor: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '15px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#555';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Option 3
              </button>
              <button
                onClick={() => handleStudentAnswer(4)}
                style={{
                  backgroundColor: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '15px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#555';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Option 4
              </button>
            </div>
          </div>
        </div>
      )}

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
          justifyContent: "center"
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
          style={{
            height: "30px",
            width: "auto",
          }}
        />
      </button>
      {AISearchOpen && (
        <AiSearchPopup userID={userID} onClose={setAISearchOpen} />
      )}

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
          transition: "background-color 0.3s ease, transform 0.2s ease"
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
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px" }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        Open Chat
      </button>

      {role === "teacher" && (
        <div style={{ position: "absolute", top: "10px", left: "60px" }}>
          <input
            id="file-upload"
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <label
            htmlFor="file-upload"
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "#36408a",
              color: "#fff",
              padding: "10px 15px",
              fontSize: "14px",
              fontWeight: "600",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease"
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px" }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload File
          </label>
        </div>
      )}

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
            zIndex: 1000
          }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 15px",
            backgroundColor: "#36408a",
            color: "#fff"
          }}>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>Document Viewer</div>
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
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            <div style={{ padding: "10px 15px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center" }}>
              <WebsiteShareControl roomID={roomID} userID={userID} isTeacher={true} />
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
