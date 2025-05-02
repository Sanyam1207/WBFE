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
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            background: "white",
            padding: "20px",
            border: "1px solid black",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <input
            type="text"
            placeholder="Enter image URL"
            value={imageUrl || ""}
            onChange={(e) => setImageUrl(e.target.value)}
            style={{ marginBottom: "10px", width: "200px", padding: "5px" }}
          />
          <div>
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
              style={{ marginRight: "10px" }}
            >
              Add
            </button>
            <button onClick={() => setOpenImageModel(false)}>Cancel</button>
          </div>
        </div>
      )}

      {role === "student" && <CursorOverlay />}

      {role === "student" && showPopup && (
        <div
          style={{
            border: "2px solid black",
            width: "200px",
            position: "absolute",
            top: "80vh",
            right: "0vh",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#787878",
            color: "#fff",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            style={{
              height: "100%",
              width: "100%",
            }}
            className="awake-button"
            onClick={() => {
              doNotSendData();
            }}
          >
            <h2>Are You Awake ?</h2>
            <p>Press SPACE to confirm</p>
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
            fontSize: "2.2rem",
            bottom: 20,
            right: 10,
            zIndex: 10,
          }}
        >
          {sleptStudent} is sleeping
        </div>
      )}

      {openChatModal && (
        <div className="chat-container">
          <div className="chat-display">
            {messages.map((msg, index) => (
              <div key={index} className="chat-message">
                from : {msg.userID} : : {msg.message}
              </div>
            ))}
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
            />
            <button
              onClick={() => {
                handleSendChat();
              }}
              className="chat-send-button"
            >
              Send
            </button>
            <button
              className="chat-send-button"
              onClick={() => {
                setOpenChatModal(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {role === "teacher" && (
        <button
          onClick={() => setPoleDialogue(true)}
          style={{
            right: 120,
          }}
          className="chatbutton"
        >
          conduct poll
        </button>
      )}

      {role === "teacher" && poleDialogue && (
        <div className="papa-button-container">
          <h3>Please select the correct answer</h3>
          <div className="button-container">
            <button
              className="button"
              onClick={() => {
                manageQuizClick(1);
              }}
            >
              Option 1
            </button>
            <button
              className="button"
              onClick={() => {
                manageQuizClick(2);
              }}
            >
              Option 2
            </button>
            <button
              className="button"
              onClick={() => {
                manageQuizClick(3);
              }}
            >
              Option 3
            </button>
            <button
              className="button"
              onClick={() => {
                manageQuizClick(4);
              }}
            >
              Option 4
            </button>
          </div>
        </div>
      )}

      {role === "student" && quizAnswer && (
        <div className="papa-button-container">
          <h3>Please select the correct answer</h3>

          {pollResult && (
            <div>
              <h2>{resultPoll}</h2>
            </div>
          )}

          <div className="button-container">
            <button
              className="button"
              onClick={() => {
                handleStudentAnswer(1);
              }}
            >
              Option 1
            </button>
            <button
              className="button"
              onClick={() => {
                handleStudentAnswer(2);
              }}
            >
              Option 2
            </button>
            <button
              className="button"
              onClick={() => {
                handleStudentAnswer(3);
              }}
            >
              Option 3
            </button>
            <button
              className="button"
              onClick={() => {
                handleStudentAnswer(4);
              }}
            >
              Option 4
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setAISearchOpen(true)}
        style={{
          padding: 4,
          borderRadius: 5,
          position: "absolute",
          top: 4,
          left: 10,
          margin: 0,
        }}
      >
        <img
          src={image}
          alt="crashed"
          style={{
            height: "30px",
            width: "auto",
          }}
        />
      </button>
      {AISearchOpen && (
        <AiSearchPopup userID={userID} onClose={setAISearchOpen} />
      )}

      <button onClick={() => setOpenChatModal(true)} className="chatbutton">
        Open Chat
      </button>

      {role === "teacher" && (
        <div style={{ position: "absolute", top: 5, left: 60 }}>
          <input
            id="file-upload"
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <label
            htmlFor="file-upload"
            style={{
              display: "inline-block",
              backgroundColor: "#36408a",
              color: "#fff",
              padding: "12px 20px",
              fontSize: "16px",
              fontWeight: "bold",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#141c59")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#595e91")
            }
          >
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
            position: "absolute",
            bottom: 10,
            right: 10,
            display: "flex",
            padding: 10,
            backgroundColor: "#fff",
          }}
        >
          <button
            onClick={() => {
              setShowPdf(false);
            }}
            style={{
              backgroundColor: "#303038",
              color: "#fff",
            }}
          >
            X
          </button>
          <PdfViewer />
          <WebsiteShareControl roomID={roomID} userID={userID} isTeacher={true} />
          <WebsiteDisplay roomID={roomID} userID={userID} />
        </div>
      )}
    </>
  );
};

export default Whiteboard;
