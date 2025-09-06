import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tool: null,
  elements: [],
  slepingStudent: null,
  messages: [{}],
  quizAnswer: null,
  selectedColor: "#000000" // Add this line for color state
};

const whiteboardSlice = createSlice({
  name: "whiteboard",
  initialState,
  reducers: {
    setToolType: (state, action) => {
      state.tool = action.payload;
    },
    updateElement: (state, action) => {
      const { id } = action.payload;

      const index = state.elements.findIndex((element) => element.id === id);

      if (index === -1) {
        state.elements.push(action.payload);
      } else {
        // if index will be found
        // update element in our array of elements
        state.elements[index] = action.payload;
      }
    },
    setElements: (state, action) => {
      state.elements = action.payload;
    },
    setSleepingStudent: (state, action) => {
      state.slepingStudent = action.payload
    },
    setMessages: (state, action) => {
      state.messages = action.payload
    },
    setQuizAnswer: (state, action) => {
      state.quizAnswer = action.payload
    },
    // Add new reducer for color selection
    setSelectedColor: (state, action) => {
      state.selectedColor = action.payload;
    }
  },
});

export const { 
  setToolType, 
  updateElement, 
  setElements, 
  setSleepingStudent, 
  setMessages, 
  setQuizAnswer,
  setSelectedColor // Export the new action
} = whiteboardSlice.actions;

export default whiteboardSlice.reducer;