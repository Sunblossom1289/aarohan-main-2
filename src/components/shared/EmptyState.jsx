import React from 'react';

export function EmptyState({ icon, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{message}</p>
      {action && <div className="mt-16">{action}</div>}
    </div>
  );
}
