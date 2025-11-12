// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import AudioRecorder from "./components/AudioRecorder";
import ProfileDashboard from "./pages/ProfileDashboard";

// Helper function to check auth
const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

// Protected Route wrapper
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// 🔹 Simple Navbar component (for logged-in users)
const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center bg-gray-900 text-white px-8 py-4 shadow-lg">
      <h1 className="text-2xl font-bold text-emerald-400">VirtuHire</h1>
      <div className="flex gap-6 items-center">
        <Link to="/recorder" className="hover:text-emerald-400 transition-all">🎙 Recorder</Link>
        <Link to="/profile" className="hover:text-emerald-400 transition-all">👤 Profile</Link>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-md font-medium transition-all"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

// 🔹 Wrapper that includes navbar only for authenticated routes
const ProtectedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Protected Recorder Page */}
        <Route
          path="/recorder"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <AudioRecorder />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* ✅ Profile Dashboard Page */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <ProfileDashboard />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
