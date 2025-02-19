// src/store/slices/categorySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CategoryState {
    selectedCategory: string; 
}

const initialState: CategoryState = {
    selectedCategory: "privateRoom", 
};

export const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        setSelectedCategory: (state, action: PayloadAction<string>) => {
            state.selectedCategory = action.payload;
        },
    },
});

export const { setSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;
