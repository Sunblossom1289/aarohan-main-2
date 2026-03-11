import React from 'react';

export function AdminDashboard({ state }) {
  const { students, counselors } = state;
  
  const completionRate = students.length > 0 
    ? Math.round((students.filter(s => s.aptitudeStatus === 'completed').length / students.length) * 100)
    : 0;

  // Calculate district distribution
  const districtCounts = {};
  students.forEach(s => {
    if (s.district) {
      districtCounts[s.district] = (districtCounts[s.district] || 0) + 1;
    }
  });

  // Get max count for scaling the bars
  const maxCount = Math.max(...Object.values(districtCounts), 1);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4 mb-24">
        <div className="stat-card">
          <div className="stat-value">{students.length}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{counselors.length}</div>
          <div className="stat-label">Total Counselors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completionRate}%</div>
          <div className="stat-label">Test Completion Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {counselors.filter(c => c.verificationStatus === 'pending').length}
          </div>
          <div className="stat-label">Pending Verifications</div>
        </div>
      </div>

      {/* Student Distribution by District */}
      <div className="card mb-24">
        <div className="card-header">
          <h3 className="card-title">📊 Student Distribution by District</h3>
        </div>
        <div className="card-body">
          {Object.keys(districtCounts).length > 0 ? (
            <div>
              {Object.entries(districtCounts)
                .sort((a, b) => b[1] - a[1]) // Sort by count descending
                .map(([district, count]) => (
                  <div key={district} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '500' }}>{district}</span>
                      <strong style={{ color: 'var(--color-primary, #1FB8CD)' }}>
                        {count} student{count !== 1 ? 's' : ''}
                      </strong>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${(count / maxCount) * 100}%`,
                          backgroundColor: '#1FB8CD',
                          transition: 'width 0.3s ease'
                        }} 
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              No student data available
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📈 Test Completion Status</h3>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Aptitude Test</span>
                <strong>{students.filter(s => s.aptitudeStatus === 'completed').length}/{students.length}</strong>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${students.length > 0 ? (students.filter(s => s.aptitudeStatus === 'completed').length / students.length) * 100 : 0}%` 
                  }} 
                />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Personality Test</span>
                <strong>{students.filter(s => s.personalityStatus === 'completed').length}/{students.length}</strong>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${students.length > 0 ? (students.filter(s => s.personalityStatus === 'completed').length / students.length) * 100 : 0}%` 
                  }} 
                />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Interest Test</span>
                <strong>{students.filter(s => s.interestStatus === 'completed').length}/{students.length}</strong>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${students.length > 0 ? (students.filter(s => s.interestStatus === 'completed').length / students.length) * 100 : 0}%` 
                  }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">👨‍🏫 Counselor Status</h3>
          </div>
          <div className="card-body">
            {counselors.map(counselor => (
              <div 
                key={counselor.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border, #eee)'
                }}
              >
                <div>
                  <div style={{ fontWeight: '500' }}>{counselor.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {counselor.district} • {counselor.experience} yrs exp
                  </div>
                </div>
                <span 
                  className={`badge ${
                    counselor.verificationStatus === 'approved' ? 'badge-success' : 
                    counselor.verificationStatus === 'pending' ? 'badge-warning' : 'badge-error'
                  }`}
                >
                  {counselor.verificationStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
