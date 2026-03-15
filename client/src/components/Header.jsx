import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import './Header.css';

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <header className={`header ${isDark ? 'dark' : 'light'}`}>
      <div className="logo-section">
        <h1>College Event System</h1>
      </div>
      {user && (
        <div className="user-section">
          <div className="user-info">
             <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
             </div>
             <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
             </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      )}
    </header>
  );
};

export default Header;