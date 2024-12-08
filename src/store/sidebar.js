import { createSlice } from "@reduxjs/toolkit";

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    current: null,
  },
  reducers: {
    changesidebar(state, action) {
      state.current = action.payload;
    },
  },
});

export default sidebarSlice.reducer;
export const sidebarActions = sidebarSlice.actions;
