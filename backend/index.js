import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import playerRoutes from "./src/routers/playerRoutes.js";
import { app, server } from "./src/socket/socket.js";
import cleanupInactivePlayers from "./src/utils/cleanup.js";

dotenv.config();
const port = process.env.PORT || 5001;
const __dirname = path.resolve();

connectDB();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

app.use("/api/players", playerRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

setInterval(cleanupInactivePlayers, 24 * 60 * 60 * 1000);

cleanupInactivePlayers();

server.listen(port, () => console.log(`Server running on port ${port}`));
