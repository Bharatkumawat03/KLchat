import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: [],
  reducers: {
    setMessage(state, action) {
      return action.payload;
    },
    addMessage(state, action) {
      return [...state, action.payload];
    },
    removeMessage(state, action) {
      state = state.filter((message) => message.id !== action.payload);
    },
  },
});

export const { setMessage, addMessage, removeMessage } = chatSlice.actions;

export default chatSlice.reducer;
