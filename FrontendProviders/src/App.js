import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import HazardsPage from './pages/HazardsPage';
import SensorsPage from './pages/SensorsPage';

// Services
import { api } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    console.log('🔍 Checking authentication...');
    const token = localStorage.getItem('token');
    console.log('🔑 Token from localStorage:', { 
      hasToken: !!token, 
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
    });
    
    if (token) {
      console.log('✅ Token found, verifying with backend...');
      // Verify token with backend
      api.verifyToken()
        .then(response => {
          console.log('🎉 Token verification successful:', response.data);
          setIsAuthenticated(true);
          setUser(response.data.user);
        })
        .catch((error) => {
          console.error('❌ Token verification failed:', error);
          console.log('🗑️ Removing invalid token');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        })
        .finally(() => {
          console.log('🏁 Auth check complete');
          setLoading(false);
        });
    } else {
      console.log('⚠️ No token found, user not authenticated');
      setLoading(false);
    }
  };

  const handleLogin = (token, userData) => {
    console.log('🎯 handleLogin called with:', { 
      hasToken: !!token, 
      tokenLength: token?.length,
      userData 
    });
    
    console.log('💾 Storing token in localStorage...');
    localStorage.setItem('token', token);
    
    console.log('✅ Setting authenticated state...');
    setIsAuthenticated(true);
    setUser(userData);
    
    console.log('🎉 Login process complete!');
  };

  const handleLogout = () => {
    console.log('👋 Logging out...');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    console.log('✅ Logout complete');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated ? (
          <>
            <Navbar user={user} onLogout={handleLogout} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/hazards" element={<HazardsPage />} />
                <Route path="/sensors" element={<SensorsPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
