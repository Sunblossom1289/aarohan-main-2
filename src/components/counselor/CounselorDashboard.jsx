import React from 'react';
import { EmptyState } from '../shared/EmptyState';

export function CounselorDashboard({ state, onNavigate }) {
  const { user, students } = state;
  const assignedStudents = students.filter(s => s.assignedCounselor === user.id);
  const upcomingSessions = state.sessions.filter(s => s.counselorId === user.id && s.status === 'scheduled');
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user.name}!</h1>
        <p className="page-subtitle">Your career mentorship dashboard</p>
      </div>

      <div className="grid grid-4 mb-24">
        {/* Statistics Cards */}
        <div className="stat-card">
          <div className="stat-value">{assignedStudents.length}</div>
          <div className="stat-label">Assigned Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user.sessionsCompleted || 0}</div>
          <div className="stat-label">Sessions Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{upcomingSessions.length}</div>
          <div className="stat-label">Upcoming Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">4.8</div>
          <div className="stat-label">Average Rating</div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Recent Students Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Students</h3>
          </div>
          <div className="card-body">
            {assignedStudents.length > 0 ? (
              <div>
                {assignedStudents.slice(0, 5).map(student => (
                  <div
                    key={student.id}
                    className="flex justify-between items-center"
                    style={{ padding: 'var(--space-12) 0', borderBottom: '1px solid var(--color-card-border-inner)' }}
                  >
                    <div>
                      <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{student.name}</div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        Grade {student.grade} • {student.school}
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => onNavigate('students', student.id)}
                    >
                      View
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-outline w-full mt-16"
                  onClick={() => onNavigate('students')}
                >
                  View All Students
                </button>
              </div>
            ) : (
              <EmptyState icon="📚" message="No students assigned yet" />
            )}
          </div>
        </div>

        {/* Upcoming Sessions Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Upcoming Sessions</h3>
          </div>
          <div className="card-body">
            {upcomingSessions.length > 0 ? (
              <div>
                {upcomingSessions.slice(0, 5).map(session => {
                  const student = students.find(s => s.id === session.studentId);
                  return (
                    <div
                      key={session.id}
                      className="flex justify-between items-center"
                      style={{ padding: 'var(--space-12) 0', borderBottom: '1px solid var(--color-card-border-inner)' }}
                    >
                      <div>
                        <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{student?.name}</div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          {session.date} • {session.time}
                        </div>
                      </div>
                      <span className="badge badge-warning">Scheduled</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon="📅" message="No upcoming sessions" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}