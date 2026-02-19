import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

import Login from '@/pages/Login';
import Home from '@/pages/Home';
import CareerPredictor from '@/pages/CareerPredictor';
import ResumeValidator from '@/pages/ResumeValidator';
import JobRecommendations from '@/pages/JobRecommendations';
import Dashboard from '@/pages/Dashboard';
import Chatbot from '@/pages/chatbot';
import Navbar from '@/components/Navbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
export const API = `${BACKEND_URL}/api`;

export const axiosInstance = axios.create({
  baseURL: API,
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Toaster position="top-right" />
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/career-predictor"
            element={
              <ProtectedRoute>
                <CareerPredictor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-validator"
            element={
              <ProtectedRoute>
                <ResumeValidator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <JobRecommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
