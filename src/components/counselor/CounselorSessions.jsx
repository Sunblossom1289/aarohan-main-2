import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { api } from '../../services/api';
import { ResultsDashboard } from '../student/ResultsDashboard';
import '../student/Counseling.css';

export function CounselorSessions({ state }) {
  const user = state?.user;
  const [activeTab, setActiveTab] = useState('availability');
  const [myAvailability, setMyAvailability] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [loading, setLoading] = useState(false);

  // For adding availability
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimes, setSelectedTimes] = useState([]);
  
  // For viewing student results popup
  const [viewingStudent, setViewingStudent] = useState(null);
  const [studentResults, setStudentResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const getUserId = () => user?._id || user?.id;

  useEffect(() => {
    if (activeTab === 'availability') {
      fetchMyAvailability();
    } else {
      fetchMySessions();
    }
  }, [activeTab]);

  const fetchMyAvailability = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      setLoading(true);
      const res = await api.get(`/sessions/availability?counselorId=${userId}`);
      if (res.data.success) setMyAvailability(res.data.slots);
    } catch (err) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  const fetchMySessions = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      setLoading(true);
      const res = await api.get(`/sessions/counselor-sessions?counselorId=${userId}`);
      if (res.data.success) setMySessions(res.data.sessions);
    } catch (err) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  // Time slots (8 AM to 10 PM, 30-min slots)
  const timeSlots = [];
  for (let hour = 8; hour < 22; hour++) {
    timeSlots.push({
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${hour.toString().padStart(2, '0')}:30`
    });
    timeSlots.push({
      startTime: `${hour.toString().padStart(2, '0')}:30`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
    });
  }

  const toggleTimeSlot = (slot) => {
    const key = `${slot.startTime}-${slot.endTime}`;
    setSelectedTimes(prev => {
      if (prev.some(s => `${s.startTime}-${s.endTime}` === key)) {
        return prev.filter(s => `${s.startTime}-${s.endTime}` !== key);
      }
      return [...prev, slot];
    });
  };

  const handleAddAvailability = async () => {
    if (!selectedDate || selectedTimes.length === 0) {
      alert("Please select a date and at least one time slot");
      return;
    }

    const userId = getUserId();
    if (!userId) {
      alert("Session error - please refresh");
      return;
    }

    try {
      setLoading(true);
      // Use local date format to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const slots = selectedTimes.map(t => ({
        date: dateStr,
        startTime: t.startTime,
        endTime: t.endTime
      }));

      const res = await api.post('/sessions/availability', {
        counselorId: userId,
        slots
      });

      if (res.data.success) {
        alert(`Added ${res.data.created} availability slots!`);
        if (res.data.errors?.length) {
          console.warn("Some slots failed:", res.data.errors);
        }
        setSelectedTimes([]);
        fetchMyAvailability();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add availability");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Delete this availability slot?")) return;
    
    const userId = getUserId();
    try {
      await api.delete(`/sessions/availability/${slotId}`, {
        data: { counselorId: userId }
      });
      fetchMyAvailability();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete slot");
    }
  };

  const handleViewStudentResults = async (studentId, studentName) => {
    setViewingStudent({ id: studentId, name: studentName });
    setLoadingResults(true);
    try {
      const res = await api.get(`/sessions/student-results/${studentId}`);
      if (res.data.success) {
        setStudentResults(res.data.student);
      }
    } catch (err) {
      console.error("Failed to fetch student results:", err);
      setStudentResults(null);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleComplete = async (sessionId) => {
    const notes = prompt("Enter session notes for the student (this will be sent to them):");
    if (!notes) return;
    
    setLoading(true);
    try {
      await api.post(`/sessions/${sessionId}/complete`, { notes });
      alert("Session marked as complete!");
      fetchMySessions();
    } catch (err) { 
      console.error(err);
      alert("Failed to complete session");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeDisplay = (time) => {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
    });
  };

  // Helper to get local date string (YYYY-MM-DD) without timezone issues
  const getLocalDateStr = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Group availability by date
  const groupedAvailability = myAvailability.reduce((acc, slot) => {
    const dateKey = getLocalDateStr(slot.date);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  // Filter sessions
  const upcomingSessions = mySessions.filter(s => s.status === 'confirmed');
  const completedSessions = mySessions.filter(s => s.status === 'completed');

  // Student Results Popup - Full Results Dashboard
  const StudentResultsPopup = () => {
    if (!viewingStudent) return null;

    return (
      <div className="modal-overlay" onClick={() => setViewingStudent(null)}>
        <div className="modal-content student-results-modal full-dashboard" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2><i className="fas fa-chart-bar"></i> Full Report: {viewingStudent.name}</h2>
            <button className="close-btn" onClick={() => setViewingStudent(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="modal-body results-dashboard-wrapper">
            {loadingResults ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i> Loading results...
              </div>
            ) : studentResults ? (
              <ResultsDashboard user={studentResults} />
            ) : (
              <div className="empty-results">
                <i className="fas fa-exclamation-circle"></i>
                <p>No test results available for this student yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="counseling-container counselor-view">
      {/* Tab Navigation */}
      <div className="tab-header">
        <button 
          onClick={() => setActiveTab('availability')} 
          className={`tab-btn ${activeTab === 'availability' ? 'active' : ''}`}
        >
          <i className="fas fa-calendar-plus"></i> My Availability
        </button>
        <button 
          onClick={() => setActiveTab('sessions')} 
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
        >
          <i className="fas fa-calendar-check"></i> My Sessions
          {upcomingSessions.length > 0 && (
            <span className="tab-badge">{upcomingSessions.length}</span>
          )}
        </button>
      </div>

      {/* Availability Tab */}
      {activeTab === 'availability' && (
        <div className="availability-tab">
          {/* Add Availability Section */}
          <div className="add-availability-section">
            <h3><i className="fas fa-plus-circle"></i> Add Availability</h3>
            
            <div className="calendar-and-slots-grid">
              {/* Calendar Widget */}
              <div className="calendar-section">
                <label><i className="fas fa-calendar-alt"></i> Select Date:</label>
                <Calendar 
                  onChange={setSelectedDate} 
                  value={selectedDate} 
                  minDate={new Date()}
                  maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days ahead
                  tileClassName={({ date }) => {
                    // Highlight dates that already have availability
                    const dateStr = getLocalDateStr(date);
                    const hasSlots = myAvailability.some(slot => 
                      getLocalDateStr(slot.date) === dateStr
                    );
                    return hasSlots ? 'has-availability' : null;
                  }}
                />
                <div className="selected-date-display">
                  📅 {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="time-slots-section">
                <label><i className="fas fa-clock"></i> Select Time Slots:</label>
                <div className="time-slots-grid counselor-slots">
                  {timeSlots.map((slot, idx) => {
                    const isSelected = selectedTimes.some(
                      s => s.startTime === slot.startTime && s.endTime === slot.endTime
                    );
                    // Check if this slot already exists for selected date
                    const dateStr = getLocalDateStr(selectedDate);
                    const alreadyExists = myAvailability.some(
                      s => getLocalDateStr(s.date) === dateStr && 
                           s.startTime === slot.startTime
                    );
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`time-slot-btn ${isSelected ? 'selected' : ''} ${alreadyExists ? 'already-added' : ''}`}
                        onClick={() => !alreadyExists && toggleTimeSlot(slot)}
                        disabled={alreadyExists}
                        title={alreadyExists ? 'Already added for this date' : ''}
                      >
                        {formatTimeDisplay(slot.startTime)}
                        {alreadyExists && <span className="slot-exists-marker">✓</span>}
                      </button>
                    );
                  })}
                </div>
                
                {selectedTimes.length > 0 && (
                  <div className="selected-summary">
                    <p><i className="fas fa-check-circle"></i> Selected {selectedTimes.length} slot(s) for {selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    <button 
                      className="add-slots-btn"
                      onClick={handleAddAvailability}
                      disabled={loading}
                    >
                      {loading ? (
                        <><i className="fas fa-spinner fa-spin"></i> Adding...</>
                      ) : (
                        <><i className="fas fa-plus"></i> Add {selectedTimes.length} Slot(s)</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Availability */}
          <div className="current-availability-section">
            <h3><i className="fas fa-calendar-alt"></i> Your Availability</h3>
            
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i> Loading...
              </div>
            ) : Object.keys(groupedAvailability).length > 0 ? (
              <div className="availability-list">
                {Object.entries(groupedAvailability)
                  .sort(([a], [b]) => new Date(a) - new Date(b))
                  .map(([date, slots]) => (
                    <div key={date} className="availability-date-group">
                      <h4>{formatDateDisplay(date)}</h4>
                      <div className="slots-list">
                        {slots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => (
                          <div 
                            key={slot._id} 
                            className={`availability-slot ${slot.isBooked ? 'booked' : 'available'}`}
                          >
                            <span className="slot-time">
                              {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                            </span>
                            {slot.isBooked ? (
                              <span className="booked-by">
                                <i className="fas fa-user"></i> {slot.bookedBy?.name || 'Student'}
                              </span>
                            ) : (
                              <button 
                                className="delete-slot-btn"
                                onClick={() => handleDeleteSlot(slot._id)}
                                title="Delete slot"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h4>No Availability Added</h4>
                <p>Add your available time slots above so students can book sessions with you.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="sessions-tab">
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i> Loading sessions...
            </div>
          ) : mySessions.length > 0 ? (
            <>
              {/* Upcoming Sessions */}
              {upcomingSessions.length > 0 && (
                <div className="sessions-section">
                  <h3><i className="fas fa-calendar-check"></i> Upcoming Sessions ({upcomingSessions.length})</h3>
                  <div className="sessions-list">
                    {upcomingSessions.map(session => (
                      <div key={session._id} className="session-card confirmed">
                        <div className="session-card-header">
                          <span className="status-badge confirmed">
                            <i className="fas fa-check-circle"></i> Confirmed
                          </span>
                          <span className="session-date">
                            {formatDateDisplay(session.scheduledDate)} • {formatTimeDisplay(session.scheduledTime)}
                          </span>
                        </div>
                        
                        <div className="session-card-body">
                          <div className="student-info">
                            <div className="student-avatar">
                              <i className="fas fa-user-graduate"></i>
                            </div>
                            <div className="student-details">
                              <span className="student-name">{session.student?.name || 'Student'}</span>
                              <span className="student-meta">
                                {session.student?.age && `${session.student.age} yrs • `}
                                Grade {session.student?.grade} • {session.student?.school || 'School N/A'}
                              </span>
                              <span className="student-location">
                                <i className="fas fa-map-marker-alt"></i> {session.student?.city || 'N/A'}
                              </span>
                              {session.student?.dreamCareer && (
                                <span className="student-dream-career" style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '6px',
                                  marginTop: '4px',
                                  color: '#6366f1',
                                  fontSize: '0.85rem',
                                  fontWeight: '500'
                                }}>
                                  <i className="fas fa-star"></i> Dream: {session.student.dreamCareer}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button 
                            className="view-results-btn"
                            onClick={() => handleViewStudentResults(session.student?._id, session.student?.name)}
                          >
                            <i className="fas fa-chart-bar"></i> View Test Results
                          </button>
                        </div>

                        <div className="session-card-footer">
                          <a 
                            href={session.meetLink || 'https://meet.google.com/new'} 
                            target="_blank" 
                            rel="noreferrer"
                            className="join-meet-btn"
                          >
                            <i className="fas fa-video"></i> Join Google Meet
                          </a>
                          <button 
                            onClick={() => handleComplete(session._id)} 
                            className="complete-btn"
                            disabled={loading}
                          >
                            <i className="fas fa-check-circle"></i> Mark Complete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Sessions */}
              {completedSessions.length > 0 && (
                <div className="sessions-section">
                  <h3><i className="fas fa-check-double"></i> Completed Sessions ({completedSessions.length})</h3>
                  <div className="sessions-list">
                    {completedSessions.map(session => (
                      <div key={session._id} className="session-card completed">
                        <div className="session-card-header">
                          <span className="status-badge completed">
                            <i className="fas fa-check-double"></i> Completed
                          </span>
                          <span className="session-date">
                            {formatDateDisplay(session.scheduledDate)}
                          </span>
                        </div>
                        
                        <div className="session-card-body">
                          <div className="student-info">
                            <div className="student-avatar">
                              <i className="fas fa-user-graduate"></i>
                            </div>
                            <div className="student-details">
                              <span className="student-name">{session.student?.name || 'Student'}</span>
                              <span className="student-meta">Grade {session.student?.grade}</span>
                              {session.student?.dreamCareer && (
                                <span style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '6px',
                                  marginTop: '2px',
                                  color: '#6366f1',
                                  fontSize: '0.85rem',
                                  fontWeight: '500'
                                }}>
                                  <i className="fas fa-star"></i> {session.student.dreamCareer}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {session.counselorNotes && (
                            <div className="session-notes">
                              <h5><i className="fas fa-sticky-note"></i> Your Notes:</h5>
                              <p>{session.counselorNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No Sessions Yet</h3>
              <p>Once students book your available slots, their sessions will appear here.</p>
              <button onClick={() => setActiveTab('availability')} className="action-btn">
                <i className="fas fa-calendar-plus"></i> Add Availability
              </button>
            </div>
          )}
        </div>
      )}

      {/* Student Results Popup */}
      <StudentResultsPopup />
    </div>
  );
}
