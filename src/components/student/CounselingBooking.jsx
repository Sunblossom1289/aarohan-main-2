import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { api } from '../../services/api'; 
import './Counseling.css'; 

export function CounselingBooking({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('book');
  const [sessions, setSessions] = useState([]);
  const [credits, setCredits] = useState(0);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Get user ID (handles both _id and id)
  const getUserId = () => user?._id || user?.id || user?.studentId;

  // Check if all 3 tests are completed - use status fields or results objects
  const hasCompletedAllTests = () => {
    if (!user) return false;
    
    // Check status fields (primary method)
    const interestDone = user.interestStatus === 'completed' || user.interestResults?.completedAt;
    const personalityDone = user.personalityStatus === 'completed' || user.personalityResults?.completedAt;
    const aptitudeDone = user.aptitudeStatus === 'completed' || user.aptitudeResults?.completedAt;
    
    return interestDone && personalityDone && aptitudeDone;
  };

  const testsCompleted = hasCompletedAllTests();

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchCredits();
    if (testsCompleted) {
      fetchAvailableSeats();
    }
  }, [user, testsCompleted]);

  const fetchCredits = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const res = await api.get(`/sessions/credits?studentId=${userId}`);
      if (res.data.success) setCredits(res.data.credits);
    } catch (err) {
      console.error('Error fetching credits:', err);
    }
  };

  const fetchSessions = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const res = await api.get(`/sessions/my-sessions?studentId=${userId}`);
      if (res.data.success) setSessions(res.data.sessions);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvailableSeats = async () => {
    try {
      setLoadingSeats(true);
      const res = await api.get('/sessions/seats');
      if (res.data.success) {
        setAvailableSeats(res.data.seats);
      }
    } catch (err) {
      console.error('Error fetching seats:', err);
    } finally {
      setLoadingSeats(false);
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
      weekday: 'short', day: 'numeric', month: 'short' 
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

  const handleBook = async () => {
    const userId = getUserId();
    if (!userId) {
      alert("Please log in to book a session");
      return;
    }
    if (credits < 1) {
      alert("No credits available. Please upgrade your plan to book a session.");
      return;
    }
    if (!selectedSeat) {
      alert("Please select a time slot");
      return;
    }

    setLoading(true);
    try {
      const dateStr = getLocalDateStr(selectedSeat.date);
      
      const res = await api.post('/sessions/book', {
        studentId: userId,
        date: dateStr,
        startTime: selectedSeat.startTime,
        endTime: selectedSeat.endTime
      });

      if (res.data.success) {
        alert(`Session Booked! Your counselor is ${res.data.session.counselor?.name || 'assigned'}. Check your email for details.`);
        setSelectedSeat(null);
        fetchSessions();
        fetchCredits();
        fetchAvailableSeats();
        setActiveTab('history');
      } else {
        alert(res.data.error || "Booking failed");
      }
    } catch (err) {
      console.error("❌ Booking error:", err);
      alert(err.response?.data?.error || err.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  // Check if student already has an upcoming session
  const hasUpcomingSession = sessions.some(s => s.status === 'confirmed' && new Date(s.scheduledDate) >= new Date());

  // Group seats by date
  const seatsByDate = availableSeats.reduce((acc, seat) => {
    const dateKey = getLocalDateStr(seat.date);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(seat);
    return acc;
  }, {});

  // Get dates that have available slots
  const datesWithSlots = Object.keys(seatsByDate);

  // Get slots for selected date
  const selectedDateStr = getLocalDateStr(selectedDate);
  const slotsForSelectedDate = seatsByDate[selectedDateStr] || [];

  return (
    <div className="counseling-container">
      {pageLoading ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', gap: '24px'
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '64px', height: '64px', borderRadius: '50%',
              border: '4px solid rgba(99, 102, 241, 0.15)',
              borderTopColor: '#6366f1',
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ textAlign: 'center' }}
          >
            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 6px' }}>
              Setting up your career mentorship...
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Finding available sessions for you
            </p>
          </motion.div>
        </div>
      ) : (
      <>
      {/* Credits Display */}
      <div className="credits-banner">
        <div className="credits-icon">
          <i className="fas fa-ticket-alt"></i>
        </div>
        <div className="credits-info">
          <span className="credits-label">Mentorship Credits</span>
          <span className="credits-value">{credits}</span>
        </div>
        <div className="credits-description">
          <span>1 credit = 1 session (30 mins)</span>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('upgrade')}
          style={{
            marginLeft: 'auto',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#6366f1',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          <i className="fas fa-plus-circle"></i> Buy Credit
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-header">
        <button 
          className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`} 
          onClick={() => setActiveTab('book')}
        >
          <i className="fas fa-calendar-plus"></i> Book Session
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} 
          onClick={() => setActiveTab('history')}
        >
          <i className="fas fa-history"></i> My Sessions
        </button>
      </div>

      {/* Booking View */}
      {activeTab === 'book' && (
        <div>
          {/* Test Completion Check */}
          {!testsCompleted ? (
            <div className="card tests-required-card">
              <div className="tests-required-icon">📝</div>
              <h3>Complete All Tests First</h3>
              <p>You need to complete all 3 assessment tests before booking a career mentorship session.</p>
              
              <div className="tests-checklist">
                <div className={`test-item ${user?.interestStatus === 'completed' || user?.interestResults?.completedAt ? 'completed' : 'pending'}`}>
                  <i className={`fas ${user?.interestStatus === 'completed' || user?.interestResults?.completedAt ? 'fa-check-circle' : 'fa-circle'}`}></i>
                  <span>Interest Test (RIASEC)</span>
                </div>
                <div className={`test-item ${user?.personalityStatus === 'completed' || user?.personalityResults?.completedAt ? 'completed' : 'pending'}`}>
                  <i className={`fas ${user?.personalityStatus === 'completed' || user?.personalityResults?.completedAt ? 'fa-check-circle' : 'fa-circle'}`}></i>
                  <span>Personality Test (OCEAN)</span>
                </div>
                <div className={`test-item ${user?.aptitudeStatus === 'completed' || user?.aptitudeResults?.completedAt ? 'completed' : 'pending'}`}>
                  <i className={`fas ${user?.aptitudeStatus === 'completed' || user?.aptitudeResults?.completedAt ? 'fa-check-circle' : 'fa-circle'}`}></i>
                  <span>Aptitude Test</span>
                </div>
              </div>
              
              <p className="tests-note">
                <i className="fas fa-info-circle"></i> 
                Complete your pending tests from the Tests section to unlock mentorship session booking.
              </p>
            </div>
          ) : credits < 1 ? (
            <div className="card no-credits-card">
              <div className="no-credits-icon">🎫</div>
              <h3>No Credits Available</h3>
              <p>You need at least 1 credit to book a career mentorship session.</p>
              <p style={{ color: '#666', fontSize: '14px' }}>Please contact support or upgrade your plan to get more credits.</p>
            </div>
          ) : hasUpcomingSession ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
              <h3 style={{ margin: '0 0 8px 0' }}>Upcoming Session Scheduled</h3>
              <p style={{ color: '#666', margin: 0 }}>
                You already have a career mentorship session booked. 
                Please attend it before booking another.
              </p>
              <button 
                className="action-btn" 
                style={{ marginTop: '20px', maxWidth: '200px' }}
                onClick={() => setActiveTab('history')}
              >
                View My Sessions
              </button>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="info-banner">
                <i className="fas fa-info-circle"></i>
                <span>Select an available date and time slot to book your career mentorship session. You'll be assigned to an available counselor.</span>
              </div>

              {/* Calendar-Based Booking */}
              <div className="available-seats-section">
                <div className="section-header">
                  <h3><i className="fas fa-calendar-alt"></i> Select Your Session</h3>
                  <button className="refresh-btn" onClick={fetchAvailableSeats} disabled={loadingSeats}>
                    <i className={`fas fa-sync-alt ${loadingSeats ? 'fa-spin' : ''}`}></i>
                  </button>
                </div>

                {loadingSeats ? (
                  <div className="loading-state">
                    <i className="fas fa-spinner fa-spin"></i> Loading available slots...
                  </div>
                ) : datesWithSlots.length > 0 ? (
                  <div className="calendar-booking-layout">
                    {/* Calendar Widget */}
                    <div className="calendar-section">
                      <label><i className="fas fa-calendar-alt"></i> Pick a Date:</label>
                      <Calendar 
                        onChange={(date) => {
                          setSelectedDate(date);
                          setSelectedSeat(null); // Reset selection when date changes
                        }} 
                        value={selectedDate} 
                        minDate={new Date()}
                        maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                        tileDisabled={({ date }) => {
                          const dateStr = getLocalDateStr(date);
                          return !datesWithSlots.includes(dateStr);
                        }}
                        tileClassName={({ date }) => {
                          const dateStr = getLocalDateStr(date);
                          if (datesWithSlots.includes(dateStr)) {
                            return 'has-availability';
                          }
                          return null;
                        }}
                      />
                      <div className="calendar-legend">
                        <span className="legend-item">
                          <span className="legend-dot available"></span> Available
                        </span>
                        <span className="legend-item">
                          <span className="legend-dot unavailable"></span> Unavailable
                        </span>
                      </div>
                    </div>

                    {/* Time Slots for Selected Date */}
                    <div className="time-slots-section">
                      <label>
                        <i className="fas fa-clock"></i> Available Times for{' '}
                        {selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}:
                      </label>
                      
                      {slotsForSelectedDate.length > 0 ? (
                        <div className="time-slots-grid student-slots">
                          {slotsForSelectedDate
                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                            .map((seat, idx) => {
                              const isSelected = selectedSeat && 
                                getLocalDateStr(selectedSeat.date) === getLocalDateStr(seat.date) && 
                                selectedSeat.startTime === seat.startTime;
                              const isAvailable = seat.availableCount > 0;
                              
                              return (
                                <button
                                  key={idx}
                                  className={`time-slot-btn ${isSelected ? 'selected' : ''} ${!isAvailable ? 'fully-booked' : ''}`}
                                  onClick={() => isAvailable && setSelectedSeat(seat)}
                                  disabled={!isAvailable}
                                >
                                  <span className="slot-time">
                                    {formatTimeDisplay(seat.startTime)} - {formatTimeDisplay(seat.endTime)}
                                  </span>
                                  <span className="slot-seats">
                                    {isAvailable ? (
                                      <><i className="fas fa-chair"></i> {seat.availableCount} seat{seat.availableCount > 1 ? 's' : ''}</>
                                    ) : (
                                      <><i className="fas fa-times-circle"></i> Full</>
                                    )}
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="no-slots-message">
                          <i className="fas fa-calendar-times"></i>
                          <p>No slots available for this date. Please select a highlighted date on the calendar.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
                    <div className="empty-icon">📅</div>
                    <h4>No Available Slots</h4>
                    <p>There are no mentorship slots available at the moment. Please check back later.</p>
                    <button className="action-btn" onClick={fetchAvailableSeats}>
                      <i className="fas fa-sync-alt"></i> Refresh
                    </button>
                  </div>
                )}

                {/* Selected Slot Summary */}
                {selectedSeat && (
                  <div className="selected-slot-summary">
                    <div className="summary-header">
                      <i className="fas fa-check-circle"></i>
                      <span>Selected Slot</span>
                    </div>
                    <div className="summary-details">
                      <span className="summary-date">{formatDateDisplay(selectedSeat.date)}</span>
                      <span className="summary-time">
                        {formatTimeDisplay(selectedSeat.startTime)} - {formatTimeDisplay(selectedSeat.endTime)}
                      </span>
                    </div>
                    <button 
                      className="book-btn"
                      onClick={handleBook}
                      disabled={loading}
                    >
                      {loading ? (
                        <><i className="fas fa-spinner fa-spin"></i> Booking...</>
                      ) : (
                        <><i className="fas fa-calendar-check"></i> Confirm Booking (1 Credit)</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* History View */}
      {activeTab === 'history' && (
        <div>
          {sessions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <h3 style={{ margin: '0 0 8px 0' }}>No Sessions Yet</h3>
              <p style={{ color: '#666' }}>Book your first career mentorship session to get started!</p>
            </div>
          ) : (
            sessions.map(session => (
              <div key={session._id} className={`session-card status-${session.status}`}>
                <div className="session-header">
                  <span className={`status-badge ${session.status}`}>
                    {session.status === 'confirmed' && <><i className="fas fa-check-circle"></i> Confirmed</>}
                    {session.status === 'completed' && <><i className="fas fa-flag-checkered"></i> Completed</>}
                  </span>
                  <span className="session-duration">30 min session</span>
                </div>

                <div className="session-body">
                  {/* Session Date/Time */}
                  <div className="confirmed-slot">
                    <div className="confirmed-slot-icon">📅</div>
                    <div className="confirmed-slot-details">
                      <div className="confirmed-date">
                        {new Date(session.scheduledDate).toLocaleDateString('en-IN', { 
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                        })}
                      </div>
                      <div className="confirmed-time">
                        {formatTimeDisplay(session.scheduledTime)} - {formatTimeDisplay(session.scheduledEndTime)}
                      </div>
                    </div>
                  </div>

                  {/* Counselor info */}
                  {session.counselor && (
                    <div className="counselor-info">
                      <i className="fas fa-user-tie"></i>
                      <span>Counselor: <strong>{session.counselor.name}</strong></span>
                    </div>
                  )}

                  {/* Google Meet link */}
                  {session.status === 'confirmed' && (
                    <a 
                      href={session.meetLink || 'https://meet.google.com/new'} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="meet-link-btn"
                    >
                      <i className="fas fa-video"></i> Join Google Meet
                    </a>
                  )}

                  {/* Counselor notes for completed sessions */}
                  {session.status === 'completed' && session.counselorNotes && (
                    <div className="counselor-notes">
                      <h4><i className="fas fa-sticky-note"></i> Counselor's Notes:</h4>
                      <p>{session.counselorNotes}</p>
                    </div>
                  )}
                </div>

                <div className="session-footer">
                  <span className="created-date">
                    Booked: {new Date(session.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
}
