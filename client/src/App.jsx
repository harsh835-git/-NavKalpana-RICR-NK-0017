import React from "react";
import Header from "./components/Header";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      {/* Wrap your routes in the Routes component */}
      <div className="pt-2 h-20 bg-[#F3F4F6]"></div>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Optional: Add a home route so the screen isn't blank on startup */}
        <Route
          path="/"
          element={<div className="p-10 text-center">Welcome to FitAI!</div>}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
