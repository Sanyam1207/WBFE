import { configureStore } from "@reduxjs/toolkit";
import whiteboardSliceReducer from "../Whiteboard/whiteboardSlice";
import cursorSliceReducer from "../CursorOverlay/cursorSlice";
import audioReducer from './audioSlice'
import  aiReducer from "../store/questionSlice"
import fileReducer from "./fileSlice"

export const store = configureStore({
  reducer: {
    whiteboard: whiteboardSliceReducer,
    cursor: cursorSliceReducer,
    audioStreaming: audioReducer,
    ai:aiReducer,
    file: fileReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: ["whiteboard/setElements"],
        ignoredPaths: ["whiteboard.elements"],
      },
    }),
});
