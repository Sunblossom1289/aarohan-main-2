// backend/routes/sessions.js
const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const Session = require('../models/Session');
const Student = require('../models/Student');
const Counselor = require('../models/Counselor');
const CounselorAvailability = require('../models/CounselorAvailability');
const { createMeeting, deleteEvent } = require('../services/googleCalendar');
const { sendSessionEmail } = require('../services/emailService');
// Sheet sync moved to cron job — no longer called inline
// const { syncStudentToSheet } = require('../middleware/sheetsSync');
// const { syncSessionBackground, syncAvailabilityBackground } = require('../services/sessionsSheet');

// ═══════════════════════════════════════════════════════════════════════════
// STUDENT ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// 0. Get Student Credits (returns both mentorship and test credits)
router.get('/credits', verifyToken, async (req, res) => {
  try {
    const studentId = req.query.studentId;
    if (!studentId) return res.status(400).json({ error: "Student ID required" });
    
    const student = await Student.findById(studentId).select('counselingCredits testCredits');
    if (!student) return res.status(404).json({ error: "Student not found" });
    
    res.json({ 
      success: true, 
      credits: student.counselingCredits ?? 0,
      testCredits: student.testCredits ?? 0
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1. Get My Sessions (Student)
router.get('/my-sessions', verifyToken, async (req, res) => {
  try {
    const studentId = req.query.studentId; 
    const sessions = await Session.find({ student: studentId })
      .populate('counselor', 'name photo email')
      .sort({ scheduledDate: -1 });
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get Available Seats (Compiled from all counselors' availability)
router.get('/seats', verifyToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all available (not booked) slots from today onwards
    const availableSlots = await CounselorAvailability.find({
      date: { $gte: today },
      isBooked: false
    })
    .populate('counselor', 'name photo')
    .sort({ date: 1, startTime: 1 });

    // Group by date+time to create "seats"
    const seatsMap = new Map();
    
    for (const slot of availableSlots) {
      const key = `${slot.date.toISOString().split('T')[0]}_${slot.startTime}_${slot.endTime}`;
      
      if (!seatsMap.has(key)) {
        seatsMap.set(key, {
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          availableCount: 0,
          counselors: [] // List of available counselors for this slot
        });
      }
      
      const seat = seatsMap.get(key);
      seat.availableCount++;
      seat.counselors.push({
        id: slot.counselor._id,
        name: slot.counselor.name,
        photo: slot.counselor.photo,
        slotId: slot._id
      });
    }

    // Convert to array
    const seats = Array.from(seatsMap.values());
    
    res.json({ success: true, seats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Book Session - Student picks ONE slot, auto-assigned to available counselor
router.post('/book', verifyToken, async (req, res) => {
  try {
    const { studentId, date, startTime, endTime } = req.body;
    
    console.log("📥 Booking request:", { studentId, date, startTime, endTime });
    
    // Validate input
    if (!studentId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get student
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });
    
    // Check credits
    if (!student.counselingCredits || student.counselingCredits < 1) {
      return res.status(400).json({ error: "No mentorship credits available. Please upgrade your plan." });
    }

    // Check if student already has an upcoming session
    const existingSession = await Session.findOne({ 
      student: studentId, 
      status: 'confirmed',
      scheduledDate: { $gte: new Date() }
    });
    if (existingSession) {
      return res.status(400).json({ error: "You already have an upcoming session booked." });
    }

    // Parse date for query - set to noon to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const slotDate = new Date(year, month - 1, day, 12, 0, 0, 0);
    
    // Find an available counselor slot (ATOMIC - first one available)
    const availableSlot = await CounselorAvailability.findOneAndUpdate(
      {
        date: slotDate,
        startTime: startTime,
        endTime: endTime,
        isBooked: false
      },
      {
        $set: {
          isBooked: true,
          bookedBy: studentId
        }
      },
      { new: true }
    ).populate('counselor', 'name email photo');

    if (!availableSlot) {
      return res.status(409).json({ error: "This slot is no longer available. Please choose another." });
    }

    console.log("✅ Slot claimed:", availableSlot._id, "Counselor:", availableSlot.counselor.name);

    // Create Meet link
    // Pass times as local IST strings (not UTC) — Calendar API uses timeZone: Asia/Kolkata
    const startIST = `${date}T${startTime}:00`;
    const endIST = `${date}T${endTime}:00`;

    let meetingData = { meetLink: null, eventId: null };
    try {
      meetingData = await createMeeting(
        startIST,
        endIST,
        `Career Mentorship Session - ${student.name}`,
        `Student: ${student.name || 'Anonymous'} (Grade ${student.grade || 'N/A'})\nCounselor: ${availableSlot.counselor.name}`,
        [student.email, availableSlot.counselor.email]
      );
      console.log("✅ Meet link created:", meetingData.meetLink);
    } catch (meetError) {
      console.error("Meeting creation failed:", meetError.message);
    }

    // Create the session
    const session = new Session({
      student: studentId,
      counselor: availableSlot.counselor._id,
      availabilitySlot: availableSlot._id,
      scheduledDate: slotDate,
      scheduledTime: startTime,
      scheduledEndTime: endTime,
      meetLink: meetingData.meetLink,
      calendarEventId: meetingData.eventId,
      status: 'confirmed'
    });

    await session.save();

    // Update availability slot with session reference
    availableSlot.session = session._id;
    await availableSlot.save();

    // Deduct credit
    await Student.findByIdAndUpdate(studentId, {
      $inc: { counselingCredits: -1 }
    });
    console.log("✅ Credit deducted from student:", studentId);

    // Update counselor stats
    await Counselor.findByIdAndUpdate(availableSlot.counselor._id, {
      $inc: { assignedStudents: 1 }
    });

    // Send email notifications
    try {
      if (student.email) {
        await sendSessionEmail(student.email, 'booked', {
          name: student.name,
          counselorName: availableSlot.counselor.name,
          date: slotDate,
          time: startTime,
          meetLink: meetingData.meetLink
        });
      }
      
      if (availableSlot.counselor.email) {
        await sendSessionEmail(availableSlot.counselor.email, 'counselor_new_booking', {
          name: availableSlot.counselor.name,
          studentName: student.name,
          studentGrade: student.grade,
          date: slotDate,
          time: startTime,
          meetLink: meetingData.meetLink
        });
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    // Populate for response
    const populatedSession = await Session.findById(session._id)
      .populate('counselor', 'name photo email')
      .populate('student', 'name grade');

    res.json({ success: true, session: populatedSession });

  } catch (err) {
    console.error("❌ Booking error:", err.message, err.stack);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// COUNSELOR ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// 4. Add Availability Slots (Counselor)
router.post('/availability', verifyToken, async (req, res) => {
  try {
    const { counselorId, slots } = req.body;
    
    if (!counselorId || !slots || !slots.length) {
      return res.status(400).json({ error: "Counselor ID and slots required" });
    }

    const counselor = await Counselor.findById(counselorId);
    if (!counselor) return res.status(404).json({ error: "Counselor not found" });

    const createdSlots = [];
    const errors = [];

    for (const slot of slots) {
      // Parse the date string directly (YYYY-MM-DD format)
      // Set to noon to avoid timezone shift issues
      const [year, month, day] = slot.date.split('-').map(Number);
      const slotDate = new Date(year, month - 1, day, 12, 0, 0, 0);
      
      // Validate: Time between 8 AM - 10 PM
      const [hour] = slot.startTime.split(':').map(Number);
      if (hour < 8 || hour >= 22) {
        errors.push(`${slot.date} ${slot.startTime}: Time must be between 8:00 AM - 10:00 PM`);
        continue;
      }

      // Check for duplicate
      const existing = await CounselorAvailability.findOne({
        counselor: counselorId,
        date: slotDate,
        startTime: slot.startTime
      });

      if (existing) {
        errors.push(`${slot.date} ${slot.startTime}: Slot already exists`);
        continue;
      }

      // Create slot
      const newSlot = new CounselorAvailability({
        counselor: counselorId,
        date: slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime
      });

      await newSlot.save();
      // Populate counselor for sheet sync
      await newSlot.populate('counselor', 'name email');
      createdSlots.push(newSlot);
    }

    res.json({ 
      success: true, 
      created: createdSlots.length,
      slots: createdSlots,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Get My Availability (Counselor)
router.get('/availability', verifyToken, async (req, res) => {
  try {
    const { counselorId } = req.query;
    if (!counselorId) return res.status(400).json({ error: "Counselor ID required" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = await CounselorAvailability.find({
      counselor: counselorId,
      date: { $gte: today }
    })
    .populate('bookedBy', 'name grade school')
    .sort({ date: 1, startTime: 1 });

    res.json({ success: true, slots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Delete Availability Slot (only if not booked)
router.delete('/availability/:id', verifyToken, async (req, res) => {
  try {
    const slotId = req.params.id;
    const { counselorId } = req.body;

    const slot = await CounselorAvailability.findById(slotId);
    if (!slot) return res.status(404).json({ error: "Slot not found" });

    // Verify ownership
    if (slot.counselor.toString() !== counselorId) {
      return res.status(403).json({ error: "Not authorized to delete this slot" });
    }

    // Cannot delete if already booked
    if (slot.isBooked) {
      return res.status(400).json({ error: "Cannot delete a booked slot. A student has already registered." });
    }

    await CounselorAvailability.findByIdAndDelete(slotId);
    res.json({ success: true, message: "Slot deleted" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Counselor My Sessions
router.get('/counselor-sessions', verifyToken, requireRole('counselor', 'admin'), async (req, res) => {
  try {
    const { counselorId } = req.query;
    const sessions = await Session.find({ counselor: counselorId })
      .populate('student', 'name age gender grade school city email phone')
      .sort({ scheduledDate: 1 });
    
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Get Student Test Results (for counselor to view - returns full student data for ResultsDashboard)
router.get('/student-results/:studentId', verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Return full student data needed for ResultsDashboard
    const student = await Student.findById(studentId)
      .select('-password -__v')
      .populate('lastInterestResult lastPersonalityResult lastAptitudeResult');
    
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Return student as-is for ResultsDashboard compatibility
    res.json({ 
      success: true, 
      student: student.toObject()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Complete Session & Add Notes (counselor/admin only)
router.post('/:id/complete', verifyToken, requireRole('counselor', 'admin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'completed', 
        counselorNotes: notes,
        completedAt: new Date()
      },
      { new: true }
    ).populate('student counselor');
    
    if (!session) return res.status(404).json({ error: "Session not found" });

    // Send completion email to student
    if (session.student?.email) {
      try {
        await sendSessionEmail(session.student.email, 'completed', {
          name: session.student.name,
          counselorName: session.counselor?.name,
          notes: notes
        });
      } catch (emailError) {
        console.error("Completion email failed:", emailError);
      }
    }

    // Update counselor stats
    if (session.counselor) {
      await Counselor.findByIdAndUpdate(session.counselor._id, {
        $inc: { sessionsCompleted: 1 }
      });
    }

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
