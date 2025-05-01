import React from "react";
import "./App.css";
import Registration from "./components/Registration";
import Login from "./components/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Profile from "./components/Profile";
import { AuthProvider } from "./components/Protected";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotEmail from "./components/forgot/ForgotEmail";
import ResetPassword from "./components/forgot/ResetPassword";
import AddUser from "./components/AddUser";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot" element={<ForgotEmail />} />
            <Route path="/ResetPassword" element={<ResetPassword />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/adduser"
              element={
                <ProtectedRoute>
                  <AddUser />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
