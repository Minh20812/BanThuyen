import apiSlice from "./apiSlice";
import { PLAYERS_URL } from "../constants";

const playerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateCells: builder.mutation({
      query: (cells) => ({
        url: `${PLAYERS_URL}/cells`,
        method: "PUT",
        body: { cells },
        credentials: "include",
      }),
      // Add error handling
      transformErrorResponse: (response) => {
        return response.data?.message || "Failed to update cells";
      },
      invalidatesTags: ["Player"],
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: `${PLAYERS_URL}`,
        method: "POST",
        body: {
          playername: credentials.playerName,
          roomname: credentials.roomName,
        },
        credentials: "include",
      }),
      invalidatesTags: ["Player"],
    }),
  }),
});

export const { useLoginMutation, useUpdateCellsMutation } = playerApiSlice;
export default playerApiSlice;
