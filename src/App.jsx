import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TestInterface from "./pages/TestInterface";
import AdminPanel from "./pages/AdminPanel"; // ✅ Add this

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/test/:id" element={<TestInterface />} />
        <Route path="/admin" element={<AdminPanel />} /> {/* ✅ New admin route */}
      </Routes>
    </BrowserRouter>
  );
}

