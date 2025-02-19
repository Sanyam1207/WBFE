import { configureStore } from "@reduxjs/toolkit";
import { categorySlice } from "../slices/categorySlice";
// Import any slice reducers here:


export const store = configureStore({
  reducer: {

  },
});

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
