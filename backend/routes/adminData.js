// backend/routes/adminData.js
// Direct MongoDB queries for Admin Dashboard tabs (replaces Google Sheets pull)

const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Session = require('../models/Session');
const CounselorAvailability = require('../models/CounselorAvailability');

// ─────────────────────────────────────────────
// 1. Student Journey Data (from MongoDB)
// ─────────────────────────────────────────────
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find()
      .select('name phone email school grade profileCompleted aptitudeStatus personalityStatus interestStatus program createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    // Get session counts per student in one aggregation
    const sessionCounts = await Session.aggregate([
      { $group: { _id: '$student', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    sessionCounts.forEach(s => { countMap[String(s._id)] = s.count; });

    const headers = [
      'Student ID', 'Name', 'Phone', 'Email', 'School', 'Grade',
      'Registered', 'Registration Date', 'Profile Completed',
      'Aptitude Test', 'Personality Test', 'Interest Test',
      'Sessions Booked', 'Program', 'Last Updated'
    ];

    const rows = students.map(s => [
      String(s._id),
      s.name || '',
      s.phone || '',
      s.email || '',
      s.school || '',
      s.grade != null ? String(s.grade) : '',
      'Yes',
      s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '',
      s.profileCompleted ? 'Yes' : 'No',
      formatTestStatus(s.aptitudeStatus),
      formatTestStatus(s.personalityStatus),
      formatTestStatus(s.interestStatus),
      String(countMap[String(s._id)] || 0),
      String(s.program || 1),
      s.updatedAt ? new Date(s.updatedAt).toLocaleString('en-IN') : (s.createdAt ? new Date(s.createdAt).toLocaleString('en-IN') : ''),
    ]);

    res.json({ success: true, headers, rows, total: students.length });
  } catch (error) {
    console.error('Admin data /students error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────
// 2. Sessions + Availability Data (from MongoDB)
// ─────────────────────────────────────────────
router.get('/sessions', async (req, res) => {
  try {
    // Sessions
    const sessions = await Session.find()
      .populate('student', 'name email phone grade school')
      .populate('counselor', 'name email phone')
      .sort({ scheduledDate: -1 })
      .lean();

    const sessionHeaders = [
      'Session ID', 'Status', 'Scheduled Date', 'Start Time', 'End Time',
      'Counselor Name', 'Counselor Email', 'Counselor Phone',
      'Student Name', 'Student Email', 'Student Phone', 'Student Grade', 'Student School',
      'Meet Link', 'Counselor Notes', 'Booked At', 'Completed At', 'Last Updated'
    ];

    const sessionRows = sessions.map(s => [
      String(s._id),
      statusEmoji(s.status),
      s.scheduledDate ? formatDate(s.scheduledDate) : '',
      formatTime(s.scheduledTime),
      formatTime(s.scheduledEndTime),
      s.counselor?.name || '',
      s.counselor?.email || '',
      s.counselor?.phone || '',
      s.student?.name || '',
      s.student?.email || '',
      s.student?.phone || '',
      s.student?.grade != null ? String(s.student.grade) : '',
      s.student?.school || '',
      s.meetLink || '',
      s.counselorNotes || '',
      s.createdAt ? formatDateTime(s.createdAt) : '',
      s.completedAt ? formatDateTime(s.completedAt) : '',
      formatDateTime(new Date()),
    ]);

    // Availability
    const slots = await CounselorAvailability.find()
      .populate('counselor', 'name email')
      .populate('bookedBy', 'name')
      .sort({ date: -1, startTime: 1 })
      .lean();

    const availabilityHeaders = [
      'Slot ID', 'Counselor Name', 'Counselor Email', 'Date',
      'Start Time', 'End Time', 'Is Booked', 'Booked By (Student)', 'Session ID', 'Created At'
    ];

    const availabilityRows = slots.map(slot => [
      String(slot._id),
      slot.counselor?.name || '',
      slot.counselor?.email || '',
      slot.date ? formatDate(slot.date) : '',
      formatTime(slot.startTime),
      formatTime(slot.endTime),
      slot.isBooked ? '✅ Yes' : '❌ No',
      slot.bookedBy?.name || '',
      slot.session ? String(slot.session) : '',
      slot.createdAt ? formatDateTime(slot.createdAt) : '',
    ]);

    res.json({
      success: true,
      sessions: { headers: sessionHeaders, rows: sessionRows, total: sessions.length },
      availability: { headers: availabilityHeaders, rows: availabilityRows, total: slots.length },
    });
  } catch (error) {
    console.error('Admin data /sessions error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Formatting helpers ──

function formatTestStatus(status) {
  switch (status) {
    case 'completed': return '✅ Completed';
    case 'in_progress': return '🔄 In Progress';
    default: return '❌ Not Started';
  }
}

function statusEmoji(status) {
  switch (status) {
    case 'confirmed': return '✅ Confirmed';
    case 'completed': return '🏁 Completed';
    case 'cancelled': return '❌ Cancelled';
    default: return status || '';
  }
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function formatDateTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

function formatTime(t) {
  if (!t) return '';
  const [hour, minute] = t.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h}:${String(minute).padStart(2, '0')} ${period}`;
}

module.exports = router;
