import { io } from "socket.io-client";
import {
  removeCursorPosition,
  updateCursorPosition,
} from "../CursorOverlay/cursorSlice";
import { clearAudioStream, setActiveAudioSource, setAudioStream } from "../store/audioSlice";
import { setFile } from "../store/fileSlice";
import { setAnswerFromAI } from "../store/questionSlice";
import { store } from "../store/store";
import { setElements, setMessages, setQuizAnswer, setSleepingStudent, updateElement } from "../Whiteboard/whiteboardSlice";

let socket;

function dataURLtoBlob(dataurl) {
  const parts = dataurl.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export const connectWithSocketServer = (roomID, userID) => {
  socket = io("https://wbbe.onrender.com");
  console.log(`room ID from connect to socket : : ${roomID} : : ${userID}`);

  socket.on("connect", () => {
    console.log("connected to socket.io server");
    socket.emit("join-room", { userID, roomID });
  });

  socket.on("whiteboard-state", (data) => {
    const { elements } = data;
    store.dispatch(setElements(elements)); // Set elements for the whiteboard
  });

  socket.on("user-disconnected", ({ userID }) => {
    // For instance, remove the user's cursor or show a notification
    console.log(`User with ID ${userID} has disconnected.`);
  });

  socket.on("element-update", (elementData) => {

    setTimeout(() => {
      store.dispatch(updateElement(elementData)); // Update the whiteboard with new element
    }, 500);
  });

  socket.on("whiteboard-clear", () => {

    setTimeout(() => {
      store.dispatch(setElements([])); // Clear the whiteboard
    }, 500);
  });

  socket.on('student-sleeping', (userID) => {
    console.log(`\n\nStudent ID is sleeping : : : ${userID}`);
    store.dispatch(setSleepingStudent(userID))

    setTimeout(() => {
      store.dispatch(setSleepingStudent(null))
    }, 8000);
  })

  socket.on("cursor-position", (cursorData) => {
    setTimeout(() => {
      store.dispatch(updateCursorPosition(cursorData));
    }, 500);
  });

  socket.on("user-disconnected", (disconnectedUserId) => {
    store.dispatch(removeCursorPosition(disconnectedUserId)); // Remove cursor for disconnected user
  });

  socket.on('message', ({ userID, message, roomID, messageCopy }) => {
    console.log(`Message copy : : ${messageCopy}`);

    store.dispatch(setMessages(messageCopy))
  })

  socket.on('quiz', ({ correctAnswer }) => {
    store.dispatch(setQuizAnswer(correctAnswer))
    console.log(`correct from socket.on ${correctAnswer}`);

    setTimeout(() => {
      store.dispatch(setQuizAnswer(null))
    }, 1 * 15 * 500);
  })

  socket.on('got-definition', (result) => {
    console.log(result);

    store.dispatch(setAnswerFromAI(result))
  })


  socket.on("file-rechieved", (fileName, fileType, fileData) => {
    console.log("Received file:", fileName, fileType, fileData);
    // Use fileData if available; otherwise, assume fileName is the data URL
    const data = fileData || fileName;
    const blob =
      typeof data === "string"
        ? dataURLtoBlob(data)
        : new Blob([data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    console.log("Generated blob URL:", url);
    store.dispatch(setFile(url));
  });



  socket.on('audioStream', ({ audioData, userID }) => {
    try {
      // Validate audio data
      if (!audioData) return;

      // Process audio data
      const newData = audioData.split(";");
      newData[0] = "data:audio/ogg;";
      const processedAudioSrc = newData[0] + newData[1];

      // Dispatch to Redux store
      store.dispatch(setAudioStream(processedAudioSrc));
      store.dispatch(setActiveAudioSource(userID));

      // Optional: Create and play audio
      const audio = new Audio(processedAudioSrc);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        store.dispatch(clearAudioStream());
      });
    } catch (error) {
      console.error('Error processing audio stream:', error);
      store.dispatch(clearAudioStream());
    }
  });
};

export const emitElementUpdate = (elementData, roomID) => {

  socket.emit("element-update", { elementData, roomID });
};

export const emitClearWhiteboard = (roomID) => {
  socket.emit("whiteboard-clear", roomID);
};

export const emitCursorPosition = ({ cursorData, roomID }) => {
  socket.emit("cursor-position", { cursorData, roomID });
};

export const emitStudentSleeping = (userID, roomID) => {
  console.log(`Student ID : : ${userID}, room ID : : : : : ${roomID}`);

  socket.emit('student-sleeping', { userID, roomID })
}

export const emitMessages = ({ userID, message, roomID, messageCopy }) => {
  socket.emit('message', { userID, message, roomID, messageCopy })
}

export const quiz = ({ correctAnswer, roomID }) => {
  console.log(`correct asnwer :  :${correctAnswer}`);

  socket.emit('quiz', { correctAnswer, roomID })
}

export const emitAudioStream = ({ audioData, roomID, userID }) => {
  socket.emit('audioStream', {
    audioData,
    roomID,
    userID // Include user ID to identify the audio source
  })
}

export const emitQuestion = ({ userID, question }) => {
  console.log("emit question trigerred !!", userID)
  socket.emit('get-definition', { userID, question })
}




// --- New Exported Function for File Transfer ---
export const emitFile = ({ roomID, fileName, fileType, fileData }) => {
  const data = fileData || fileName;
  const blob =
    typeof data === "string"
      ? dataURLtoBlob(data)
      : new Blob([data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  console.log("Generated blob URL:", url);
  store.dispatch(setFile(url));
  socket.emit("file", { roomID, fileName, fileType, fileData });
};