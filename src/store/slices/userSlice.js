"use client";

import { createSlice } from "@reduxjs/toolkit";
import { USER_ROLES } from "@/constants/roles";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  role: null, // Current user role
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const userData = action.payload;
      state.user = userData;
      state.isAuthenticated = !!userData;
      // Extract role from user data
      state.role =
        userData?.role ||
        userData?.type ||
        userData?.userType ||
        userData?.user_type ||
        null;
      state.loading = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.role = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateUser: (state, action) => {
      if (state.user) {
        const updatedUser = { ...state.user, ...action.payload };
        state.user = updatedUser;
        // Update role if it's being updated
        if (action.payload.role || action.payload.type) {
          state.role =
            action.payload.role ||
            action.payload.type ||
            updatedUser.role ||
            updatedUser.type;
        }
      }
    },
    setRole: (state, action) => {
      state.role = action.payload;
      if (state.user) {
        state.user.role = action.payload;
        state.user.type = action.payload;
      }
    },
  },
});

export const { setUser, clearUser, setLoading, setError, updateUser, setRole } =
  userSlice.actions;

export default userSlice.reducer;

