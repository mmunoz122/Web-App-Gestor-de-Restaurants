import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./screens/Login";
import All from "./screens/All";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />  {/* Pantalla de Login */}
        <Route path="/all" element={<All />} />  {/* Pantalla de All */}
   
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
