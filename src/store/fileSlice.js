import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  url:null
};

const fileSlice = createSlice({
  name: "file",
  initialState,
  reducers: {
    // Save file data to state
    setFile: (state, action) => {
      state.url = action.payload;
    },
    // Clear file data from state (after downloading, for example)
    clearFile: (state) => {
      state.url = null;
    },
  },
});

export const { setFile, clearFile } = fileSlice.actions;
export default fileSlice.reducer;
