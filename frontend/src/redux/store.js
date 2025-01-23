import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import apiSlice from "./api/apiSlice";
import authReducer from "./feature/authSlice";
import playerReducer from "./feature/playerSlice";
import webSocketMiddleware from "./webSocketMiddleware.js";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Tắt kiểm tra tuần tự hóa
    }).concat(apiSlice.middleware, webSocketMiddleware),
  devTools: true,
});

setupListeners(store.dispatch);

export default store;
