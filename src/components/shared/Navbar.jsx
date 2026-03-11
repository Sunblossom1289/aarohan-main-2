import React, { useState } from 'react';

export function Navbar({ user, role, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="/logo/logou.webp" alt="myaarohan" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
        Myaarohan
      </div>
      <div className="navbar-menu">
        {user && (
          <div 
            className="user-menu"
            onClick={() => setShowMenu(!showMenu)}
          >
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span>{user.name || 'User'}</span>
            <i className="fas fa-chevron-down"></i>
            {showMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={onLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
