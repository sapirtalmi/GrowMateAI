import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        GrowMate Providers
      </div>
      
      <ul className="navbar-nav">
        <li>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link 
            to="/users" 
            className={`nav-link ${isActive('/users') ? 'active' : ''}`}
          >
            Users
          </Link>
        </li>
        <li>
          <Link 
            to="/hazards" 
            className={`nav-link ${isActive('/hazards') ? 'active' : ''}`}
          >
            Hazards
          </Link>
        </li>
        <li>
          <Link 
            to="/sensors" 
            className={`nav-link ${isActive('/sensors') ? 'active' : ''}`}
          >
            Sensors
          </Link>
        </li>
      </ul>

      <div className="navbar-user">
        <span>Welcome, {user?.name || user?.email || 'Admin'}</span>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
