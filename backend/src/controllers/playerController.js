import Player from "../models/PlayerModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import createToken from "../utils/createToken.js";

const createPlayer = asyncHandler(async (req, res) => {
  const { playername, roomname } = req.body;
  if (!playername || !roomname) {
    throw new Error("Please provide all the required fields");
  }

  const newPlayer = new Player({ playername, roomname });

  try {
    await newPlayer.save();
    createToken(res, newPlayer._id);

    res.status(201).json({
      _id: newPlayer._id,
      playername: newPlayer.playername,
      roomname: newPlayer.roomname,
    });
  } catch (err) {
    res.status(400).send(err);
    throw new Error(err);
  }
});

const updatePlayerActivity = asyncHandler(async (req, res, next) => {
  if (req.user) {
    await Player.findByIdAndUpdate(req.user._id, {
      updatedAt: new Date(),
    });
  }
  next();
});

const updateSelectedCells = asyncHandler(async (req, res) => {
  const { cells } = req.body;

  if (!req.user?._id) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const player = await Player.findById(req.user._id);
  if (!player) {
    res.status(404);
    throw new Error("Player not found");
  }

  player.selectedCells = cells;
  await player.save();

  res.status(200).json({
    selectedCells: player.selectedCells,
  });
});

export { createPlayer, updatePlayerActivity, updateSelectedCells };
