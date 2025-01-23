import mongoose from "mongoose";

const playerSchema = mongoose.Schema(
  {
    playername: {
      type: String,
      required: true,
    },
    roomname: {
      type: String,
      required: true,
    },
    selectedCells: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

const Player = mongoose.model("Player", playerSchema);
export default Player;
