import React, { useState } from 'react';
import { DISTRICTS, PROGRAMS, COUNSELORS } from '../../utils/constants';
import { getStatusBadge } from '../../utils/helpers';

export function AdminStudentsManagement({ state, dispatch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  
  // Safe check for students array
  const students = state.students || [];
  
  const filteredStudents = students.filter(s => {
    const matchesSearch = s?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s?.phone?.includes(searchTerm) || 
                          !searchTerm;
    const matchesDistrict = !filterDistrict || s.district === filterDistrict;
    const matchesGrade = !filterGrade || String(s.grade) === filterGrade;
    return matchesSearch && matchesDistrict && matchesGrade;
  });
  
  const handleAssignCounselor = (studentId, counselorId) => {
    dispatch({
      type: 'ASSIGN_COUNSELOR',
      payload: { studentId, counselorId: parseInt(counselorId) }
    });
  };
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Students Management</h1>
        <p className="page-subtitle">Total: {students.length} students</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="card mb-24">
        <div className="card-body">
          <div className="grid grid-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search students..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select
              className="form-control"
              value={filterDistrict}
              onChange={e => setFilterDistrict(e.target.value)}
            >
              <option value="">All Districts</option>
              {DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              className="form-control"
              value={filterGrade}
              onChange={e => setFilterGrade(e.target.value)}
            >
              <option value="">All Grades</option>
              {['9', '10', '11', '12'].map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
            <button
              className="btn btn-outline"
              onClick={() => {
                setSearchTerm('');
                setFilterDistrict('');
                setFilterGrade('');
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div className="card-body" style={{ overflowX: 'auto' }}>
          {filteredStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <i className="fas fa-user-graduate" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <h3>No Students Found</h3>
              <p>
                {students.length === 0 
                  ? 'No students have registered yet. Students will appear here after signup.'
                  : 'No students match your search criteria. Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>District</th>
                  <th>Grade</th>
                  <th>Program</th>
                  <th>Test Status</th>
                  <th>Assigned Counselor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const program = PROGRAMS.find(p => p.id === student.program);
                  const counselor = COUNSELORS.find(c => c.id === student.assignedCounselor);
                  
                  return (
                    <tr key={student._id || student.id || student.phone}>
                      <td>{student.name || 'Unnamed'}</td>
                      <td>{student.phone || 'N/A'}</td>
                      <td>{student.district || 'N/A'}</td>
                      <td>{student.grade || 'N/A'}</td>
                      <td>{program?.name || 'Free'}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(student.aptitudeStatus || 'not_started').class}`}>
                          {getStatusBadge(student.aptitudeStatus || 'not_started').label}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-control"
                          value={student.assignedCounselor || ''}
                          onChange={e => handleAssignCounselor(student._id || student.id, e.target.value)}
                          style={{ minWidth: '150px' }}
                        >
                          <option value="">Not Assigned</option>
                          {COUNSELORS.filter(c => c.verificationStatus === 'approved').map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline">View Details</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
