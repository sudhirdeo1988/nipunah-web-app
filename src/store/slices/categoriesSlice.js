"use client";

import { createSlice } from "@reduxjs/toolkit";

/** Initial state for categories (loaded on app init, used e.g. company search dropdown) */
const initialState = {
  list: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.list = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },
    setCategoriesLoading: (state, action) => {
      state.loading = action.payload;
      if (action.payload) state.error = null;
    },
    setCategoriesError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearCategories: (state) => {
      state.list = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setCategories,
  setCategoriesLoading,
  setCategoriesError,
  clearCategories,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
