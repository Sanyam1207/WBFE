import { configureStore } from "@reduxjs/toolkit";
import whiteboardSliceReducer from "./slices/whiteboardSlice";
import cursorSliceReducer from "./slices/cursorSlice";
import audioReducer from "./slices/audioSlice";
import aiReducer from "./slices/questionSlice";
import fileReducer from "./slices/fileSlice";
import websiteReducer from "./slices/websiteSlice";

export const store = configureStore({
  reducer: {
    whiteboard: whiteboardSliceReducer,
    cursor: cursorSliceReducer,
    audioStreaming: audioReducer,
    ai: aiReducer,
    file: fileReducer,
    website: websiteReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: ["whiteboard/setElements"],
        ignoredPaths: ["whiteboard.elements"],
      },
    }),
});
