const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Counselor = require('../models/Counselor');
const { generateToken } = require('../middleware/auth');

// backend/routes/auth.js

router.post('/studentlogin', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    // Find existing student
    const student = await Student.findOne({ phone });

    // Use generic message to prevent user enumeration
    if (!student) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please check your phone number and password.'
      });
    }

    // Password is always required
    if (!password) {
      return res.status(401).json({
        success: false,
        error: 'Password required',
        needsPassword: true
      });
    }

    // Verify password (DOB format: DDMMYYYY)
    const dobPassword = formatDOBToPassword(student.dateOfBirth);
    if (!dobPassword || password !== dobPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please check your phone number and password.'
      });
    }

    // Success - Full Login
    student.lastLogin = new Date();
    await student.save();

    const token = generateToken(student, 'student');

    return res.json({
      success: true,
      token,
      user: student,
      isNewUser: false,
      needsProfileCompletion: !student.profileCompleted
    });

  } catch (error) {
    console.error('Student login error:', error);
    return res.status(500).json({ success: false, error: 'An internal server error occurred.' });
  }
});


// ✅ COUNSELOR LOGIN (Login-only: no registration here)
router.post('/counselorlogin', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    // Find existing counselor
    const counselor = await Counselor.findOne({ phone });

    // ❌ If not found -> must register first
    if (!counselor) {
      return res.status(404).json({
        success: false,
        error: 'Account not found. Please contact admin to create your account.'
      });
    }

    // Password is always required for counselors
    if (!password) {
      return res.status(401).json({
        success: false,
        error: 'Password required',
        needsPassword: true
      });
    }

    // Verify password using bcrypt
    if (!counselor.password) {
      return res.status(401).json({
        success: false,
        error: 'Account not properly configured. Please contact admin.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, counselor.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password'
      });
    }

    // Success
    counselor.lastLogin = new Date();
    await counselor.save();

    // If counselor has admin access, issue token with 'admin' role
    // so they can access /admin-data and /sheets routes
    const tokenRole = counselor.hasAdminAccess ? 'admin' : 'counselor';
    const token = generateToken(counselor, tokenRole);

    return res.json({
      success: true,
      token,
      user: counselor,
      isNewUser: false,
      needsProfileCompletion: !counselor.profileCompleted,
      hasAdminAccess: counselor.hasAdminAccess || false
    });
  } catch (error) {
    console.error('Counselor login error:', error);
    return res.status(500).json({ success: false, error: 'An internal server error occurred.' });
  }
});

// ✅ ADMIN LOGIN (Counselor who hasAdminAccess=true)
router.post('/adminlogin', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    const counselor = await Counselor.findOne({ phone, hasAdminAccess: true });

    if (!counselor) {
      return res.status(403).json({ success: false, error: 'Not authorized as admin' });
    }

    if (!password) {
      return res.status(401).json({
        success: false,
        error: 'Password required',
        needsPassword: true
      });
    }

    // Verify password using bcrypt
    if (!counselor.password) {
      return res.status(401).json({
        success: false,
        error: 'Account not properly configured. Please contact support.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, counselor.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password'
      });
    }

    counselor.lastLogin = new Date();
    await counselor.save();

    const token = generateToken(counselor, 'admin');

    return res.json({
      success: true,
      token,
      user: counselor,
      isAdmin: true,
      hasAdminAccess: true
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, error: 'An internal server error occurred.' });
  }
});

// ✅ Helper function to format DOB to password (DDMMYYYY)
function formatDOBToPassword(dateOfBirth) {
  if (!dateOfBirth) return null;

  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return null;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}${month}${year}`;
}

module.exports = router;
