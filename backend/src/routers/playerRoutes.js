import express from "express";
import {
  createPlayer,
  updatePlayerActivity,
  updateSelectedCells,
} from "../controllers/playerController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(createPlayer);
router.route("/cells").put(authenticate, updateSelectedCells);
router.use(authenticate, updatePlayerActivity);

export default router;
