import React from "react";
import { BrowserRouter } from "react-router-dom";
import Routers from "./Routers";

const App = () => {
  return (
    <BrowserRouter>
      <Routers />
    </BrowserRouter>
  );
};

export default App;
