import React, { useState } from 'react';
import { PROGRAMS } from '../../utils/constants';
import { getStatusBadge, formatDate } from '../../utils/helpers';
import { Modal } from '../shared/Modal';
import { EmptyState } from '../shared/EmptyState';

export function StudentReportView({ studentId, state, onBack, onAddNote }) {
  const student = state.students.find(s => s.id === studentId);
  const notes = state.counselorNotes[studentId] || [];
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  
  if (!student) return <div>Student not found</div>;
  
  const handleAddNote = () => {
    if (noteText.trim()) {
      onAddNote(studentId, {
        text: noteText,
        date: new Date().toISOString(),
        counselorId: state.user.id
      });
      setNoteText('');
      setShowNoteModal(false);
    }
  };
  
  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">{student.name}</h1>
            <p className="page-subtitle">Grade {student.grade} • {student.school}</p>
          </div>
          <button className="btn btn-outline" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </div>

      <div className="grid grid-2 mb-24">
        {/* Student Information Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Student Information</h3>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <strong>Email: </strong> {student.email}
            </div>
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <strong>Phone: </strong> {student.phone}
            </div>
            {student.dreamCareer && (
              <div style={{ marginBottom: 'var(--space-12)', padding: '8px 12px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <strong style={{ color: '#6366f1' }}><i className="fas fa-star" style={{ marginRight: '6px' }}></i>Dream Career: </strong> 
                <span style={{ fontWeight: '600', color: '#4f46e5' }}>{student.dreamCareer}</span>
              </div>
            )}
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <strong>District: </strong> {student.district}
            </div>
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <strong>Program: </strong> {PROGRAMS.find(p => p.id === student.program)?.name}
            </div>
          </div>
        </div>

        {/* Test Status Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Test Status</h3>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <strong>Aptitude: </strong>
              <span className={`badge ${getStatusBadge(student.aptitudeStatus).class}`}>
                {getStatusBadge(student.aptitudeStatus).label}
              </span>
            </div>
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <strong>Personality: </strong>
              <span className={`badge ${getStatusBadge(student.personalityStatus).class}`}>
                {getStatusBadge(student.personalityStatus).label}
              </span>
            </div>
            <div>
              <strong>Interest: </strong>
              <span className={`badge ${getStatusBadge(student.interestStatus).class}`}>
                {getStatusBadge(student.interestStatus).label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Results (Conditional) */}
      {student.aptitudeStatus === 'completed' && (
        <div className="card mb-24">
          <div className="card-header">
            <h3 className="card-title">Assessment Results</h3>
          </div>
          <div className="card-body">
            <p>Overall Aptitude Score: <strong>85%</strong></p>
            <p>Personality Type: <strong>Analytical</strong></p>
            <p>Top Interest: <strong>Investigative</strong></p>
            <button className="btn btn-outline mt-16">
              <i className="fas fa-download"></i> Download Full Report
            </button>
          </div>
        </div>
      )}

      {/* Counselor Notes */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="card-title">Counselor Notes</h3>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setShowNoteModal(true)}
            >
              <i className="fas fa-plus"></i> Add Note
            </button>
          </div>
        </div>
        <div className="card-body">
          {notes.length > 0 ? (
            notes.map((note, index) => (
              <div
                key={index}
                style={{
                  padding: 'var(--space-16)',
                  marginBottom: 'var(--space-12)',
                  background: 'var(--color-bg-1)',
                  borderRadius: 'var(--radius-base)'
                }}
              >
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
                  {formatDate(note.date)}
                </div>
                <p>{note.text}</p>
              </div>
            ))
          ) : (
            <EmptyState
              icon="📝"
              message="No notes yet"
              action={
                <button
                  className="btn btn-primary"
                  onClick={() => setShowNoteModal(true)}
                >
                  Add First Note
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <Modal
          title="Add Counselor Note"
          onClose={() => setShowNoteModal(false)}
          footer={
            <div className="flex gap-12">
              <button className="btn btn-outline" onClick={() => setShowNoteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddNote}>
                Save Note
              </button>
            </div>
          }
        >
          <textarea
            className="form-control"
            rows={6}
            placeholder="Enter your observations, recommendations, or notes about the student..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
          />
        </Modal>
      )}
    </div>
  );
}