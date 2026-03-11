import React, { useEffect } from 'react';

export function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`toast toast-${type}`}>
      <i className={`fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}`}></i>
      <span>{message}</span>
    </div>
  );
}
