/*import React, { useState } from 'react';
import ResumeUpload from './components/ResumeUpload';
import JobMatcher from './components/JobMatcher';
import CareerPath from './components/CareerPath';
import ATSFeedback from './components/ATSFeedback';



function App() {
  const [resumeText, setResumeText] = useState('');

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1>AI Resume Builder</h1>
      <ResumeUpload onResumeData={setResumeText} />
      <hr />
      <JobMatcher resumeData={resumeText} />
      <hr />
      <CareerPath resumeText={resumeText} />
      <hr />
      <ATSFeedback resumeText={resumeText} />
    </div>
  );
}

export default App;*/
/*// src/App.jsx
//import React, { useState } from "react";
//import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
//import './index.css';
import React from 'react';
import LandingPage from "./components/LandingPage";
//import Login from "./pages/auth/Login";   // Only one file now
//import Dashboard from "./components/Dashboard";

function App() {
  return (
    <>
      <LandingPage/>
    </>
  );
}

export default App;*/
import React from 'react';
import { useState, useEffect } from 'react';
import './index.css';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <LandingPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
