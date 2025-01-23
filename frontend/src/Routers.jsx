import React from "react";
import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import Game from "./pages/Game";
import Look from "./pages/Look";

const Routers = () => {
  const { userInfo } = useSelector((state) => state.auth);
  console.log("Current userInfo:", userInfo);

  return (
    <Routes>
      {!userInfo ? (
        <Route path="/" element={<Game />} />
      ) : (
        <Route path="*" element={<Game />} />
      )}
    </Routes>
  );
};

export default Routers;
