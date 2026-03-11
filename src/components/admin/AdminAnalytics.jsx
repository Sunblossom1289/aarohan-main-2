import React from 'react';

export function AdminAnalytics({ state }) {
  const { students } = state;
  
  // Logic to calculate Grade Distribution
  const gradeCounts = {};
  students.forEach(s => {
    gradeCounts[s.grade] = (gradeCounts[s.grade] || 0) + 1;
  });
  
  // Logic to calculate Gender Distribution
  const genderCounts = { M: 0, F: 0, O: 0 };
  students.forEach(s => {
    genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1;
  });
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">Platform insights and statistics</p>
      </div>
      
      <div className="grid grid-3 mb-24">
        {/* Grade Distribution Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Grade Distribution</h3>
          </div>
          <div className="card-body">
            {Object.entries(gradeCounts).map(([grade, count]) => (
              <div key={grade} style={{ marginBottom: 'var(--space-12)' }}>
                <div className="flex justify-between mb-8">
                  <span>Grade {grade}</span>
                  <strong>{count}</strong>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(count / students.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Distribution Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Gender Distribution</h3>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <strong>Male: </strong>
              {genderCounts.M} ({Math.round((genderCounts.M / students.length) * 100)}%)
            </div>
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <strong>Female: </strong>
              {genderCounts.F} ({Math.round((genderCounts.F / students.length) * 100)}%)
            </div>
            <div>
              <strong>Other: </strong>
              {genderCounts.O}
            </div>
          </div>
        </div>

        {/* Test Completion Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Test Completion</h3>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <strong>Aptitude: </strong>
              {students.filter(s => s.aptitudeStatus === 'completed').length}/{students.length}
            </div>
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <strong>Personality: </strong>
              {students.filter(s => s.personalityStatus === 'completed').length}/{students.length}
            </div>
            <div>
              <strong>Interest: </strong>
              {students.filter(s => s.interestStatus === 'completed').length}/{students.length}
            </div>
          </div>
        </div>
      </div>

      {/* Export Data Card */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="card-title">Export Data</h3>
            <button className="btn btn-primary">
              <i className="fas fa-download"></i> Download CSV
            </button>
          </div>
        </div>
        <div className="card-body">
          <p>Export student data, test results, and analytics reports in CSV format for further analysis.</p>
        </div>
      </div>
    </div>
  );
}