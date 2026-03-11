import React, { useState } from 'react';
import { getStatusBadge } from '../../utils/helpers';

export function CounselorStudentsList({ state, onViewStudent }) {
  const [searchTerm, setSearchTerm] = useState('');

  const students = state.students || [];
  
  const myStudents = students.filter(s => 
    s.assignedCounselor === state.user?._id || 
    s.assignedCounselor === state.user?.id
  );

  // FIXED: Safe filtering with optional chaining
  const filteredStudents = myStudents.filter(s =>
    s?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s?.phone?.includes(searchTerm) || 
    !searchTerm
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Students</h1>
        <p className="page-subtitle">Total: {myStudents.length} students assigned</p>
      </div>

      <div className="card mb-24">
        <div className="card-body">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {filteredStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <i className="fas fa-user-graduate" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <h3>No Students Found</h3>
              <p>
                {myStudents.length === 0 
                  ? 'No students assigned yet.'
                  : 'No students match your search.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-3">
              {filteredStudents.map(student => (
                // FIXED: Added unique key prop
                <div key={student._id || student.id || student.phone} className="card">
                  <div className="card-body">
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                        {student.gender === 'M' ? '👨‍🎓' : student.gender === 'F' ? '👩‍🎓' : '🧑‍🎓'}
                      </div>
                      <h3 style={{ margin: 0 }}>{student.name || 'Unnamed'}</h3>
                      <p style={{ color: '#999', fontSize: '14px', margin: '4px 0' }}>
                        Grade {student.grade || 'N/A'} • {student.school || 'N/A'}
                      </p>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <strong>📱 Phone:</strong> {student.phone || 'N/A'}
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>📍 District:</strong> {student.district || 'N/A'}
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <strong>Test Status:</strong>{' '}
                      <span className={`badge ${getStatusBadge(student.aptitudeStatus || 'not_started').class}`}>
                        {getStatusBadge(student.aptitudeStatus || 'not_started').label}
                      </span>
                    </div>

                    <button
                      className="btn btn-primary w-full"
                      onClick={() => onViewStudent(student._id || student.id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
