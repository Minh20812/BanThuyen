import { createSlice } from "@reduxjs/toolkit";

const playerSlice = createSlice({
  name: "player",
  initialState: {
    id: "",
    name: "",
    token: "",
    onlineStatus: [],
    socketConnection: null,
  },
  reducers: {
    setPlayer: (state, action) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setSocketConnection: (state, action) => {
      state.socketConnection = {
        isConnected: action.payload.isConnected,
        url: action.payload.url,
      };
    },
    setOnlineStatus: (state, action) => {
      state.onlineStatus = action.payload;
    },
  },
});

export const { setPlayer, setToken, setSocketConnection, setOnlineStatus } =
  playerSlice.actions;
export default playerSlice.reducer;
