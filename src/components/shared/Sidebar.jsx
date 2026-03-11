import React, { useState } from 'react';

export function Sidebar({ role, currentView, onNavigate, user, isAdminCounselor, className }) {
  const [collapsed, setCollapsed] = useState(false);

  const profileIncomplete = role === 'student' && user && !user.profileCompleted;
  const noTestsDone = role === 'student' && user && user.aptitudeStatus !== 'completed' && user.personalityStatus !== 'completed' && user.interestStatus !== 'completed';

  const menuItems = {
    student: [
      { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard' },
      { id: 'profile', icon: 'fas fa-user', label: 'Profile', badge: profileIncomplete ? '!' : null },
      { id: 'tests', icon: 'fas fa-clipboard-list', label: 'Tests', locked: profileIncomplete },
      { id: 'results', icon: 'fas fa-chart-bar', label: 'Results', locked: noTestsDone },
      { id: 'counseling', icon: 'fas fa-calendar-alt', label: 'Career Mentorship' },
      { id: 'support', icon: 'fas fa-headset', label: 'Student Support' },
      { id: 'upgrade', icon: 'fas fa-star', label: 'Upgrade Program' }
    ],
    counselor: [
      { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard' },
      { id: 'students', icon: 'fas fa-users', label: 'My Students' },
      { id: 'sessions', icon: 'fas fa-calendar-check', label: 'Sessions' },
      { id: 'profile', icon: 'fas fa-user', label: 'Profile' },
      { id: 'auth', icon: 'fas fa-shield-alt', label: 'Auth' }
    ],
    adminTabs: [
      { id: 'admin-dashboard', icon: 'fas fa-tachometer-alt', label: 'Admin Dashboard' },
      { id: 'admin-students', icon: 'fas fa-user-graduate', label: 'All Students' },
      { id: 'admin-counselors', icon: 'fas fa-chalkboard-teacher', label: 'All Counselors' },
      { id: 'admin-sessions', icon: 'fas fa-calendar-alt', label: 'Sessions' },
      { id: 'admin-programs', icon: 'fas fa-box', label: 'Programs' },
      { id: 'admin-assessments', icon: 'fas fa-tasks', label: 'Assessments' },
      { id: 'admin-analytics', icon: 'fas fa-chart-pie', label: 'Analytics' }
    ],
    admin: [
      { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard' },
      { id: 'students', icon: 'fas fa-user-graduate', label: 'All Students' },
      { id: 'counselors', icon: 'fas fa-chalkboard-teacher', label: 'All Counselors' },
      { id: 'sessions', icon: 'fas fa-calendar-alt', label: 'Sessions' },
      { id: 'programs', icon: 'fas fa-box', label: 'Programs' },
      { id: 'assessments', icon: 'fas fa-tasks', label: 'Assessments' },
      { id: 'analytics', icon: 'fas fa-chart-pie', label: 'Analytics' }
    ]
  };

  let items = menuItems[role] || [];

  // If counselor has admin access, add admin tabs
  if (role === 'counselor' && isAdminCounselor) {
    items = [
      ...menuItems.counselor,
      { type: 'divider' },
      { type: 'header', label: '🔒 ADMIN PANEL' },
      ...menuItems.adminTabs
    ];
  }

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${className || ''}`}>
      {/* Hamburger toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span className="sidebar-toggle-bar"></span>
        <span className="sidebar-toggle-bar"></span>
        <span className="sidebar-toggle-bar"></span>
      </button>

      <ul className="sidebar-nav">
        {items.map((item, index) => {
          if (item.type === 'divider') {
            return <li key={`div-${index}`} className="sidebar-divider" />;
          }
          if (item.type === 'header') {
            return (
              <li key={`hdr-${index}`} className="sidebar-header">
                {!collapsed && item.label}
              </li>
            );
          }
          return (
            <li key={item.id} className="sidebar-item">
              <a
                className={`sidebar-link ${currentView === item.id ? 'active' : ''}`}
                onClick={() => { if (item.locked) return; onNavigate(item.id); }}
                title={collapsed ? item.label : (item.locked ? (item.id === 'results' ? 'Complete at least one test first' : 'Complete your profile first') : '')}
                style={item.locked ? { opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'auto' } : { cursor: 'pointer' }}
              >
                <i className={item.icon}></i>
                {!collapsed && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    {item.label}
                    {item.badge && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: '#ef4444', color: 'white',
                        fontSize: '11px', fontWeight: 700, lineHeight: 1,
                        flexShrink: 0
                      }}>{item.badge}</span>
                    )}
                    {item.locked && (
                      <i className="fas fa-lock" style={{ fontSize: '11px', color: '#94a3b8', marginLeft: 'auto' }}></i>
                    )}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
