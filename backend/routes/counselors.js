// routes/counselor.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Counselor = require('../models/Counselor');
const Student = require('../models/Student');
const { verifyToken, requireRole, requireOwnerOrRole } = require('../middleware/auth');

// Get all counselors
router.get('/', verifyToken, async (req, res) => {
  try {
    const counselors = await Counselor.find();
    res.json({ success: true, counselors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single counselor
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id);
    if (!counselor) {
      return res.status(404).json({ success: false, error: 'Counselor not found' });
    }
    const students = await Student.find({ assignedCounselor: req.params.id });
    res.json({ success: true, counselor, assignedStudents: students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update counselor profile (owner or admin)
router.put('/:id/profile', verifyToken, requireOwnerOrRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, profileCompleted: true };
    
    const counselor = await Counselor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // Returns updated document
    );
    
    if (!counselor) {
      return res.status(404).json({ 
        success: false, 
        error: 'Counselor not found' 
      });
    }
    
    res.json({ 
      success: true, 
      user: counselor  // ✅ Return complete user object
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Update verification status (admin only)
router.put('/:id/verify', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const counselor = await Counselor.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status },
      { new: true }
    );
    res.json({ success: true, counselor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Set admin access (admin only)
router.put('/:id/admin-access', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { hasAdminAccess } = req.body;
    const counselor = await Counselor.findByIdAndUpdate(
      req.params.id,
      { hasAdminAccess },
      { new: true }
    );
    res.json({ success: true, counselor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update auth details (owner or admin)
router.put('/:id/update-auth', verifyToken, requireOwnerOrRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password is required to update account details'
      });
    }

    const counselor = await Counselor.findById(id);
    if (!counselor) {
      return res.status(404).json({ success: false, error: 'Counselor not found' });
    }

    // Verify current password
    if (!counselor.password) {
      return res.status(400).json({
        success: false,
        error: 'Account not properly configured. Please contact admin.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, counselor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Check if new phone is already taken by another counselor
    if (phone && phone !== counselor.phone) {
      const existing = await Counselor.findOne({ phone, _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'This phone number is already registered to another account'
        });
      }
    }

    // Update fields
    if (name) counselor.name = name;
    if (email) counselor.email = email;
    if (phone) counselor.phone = phone;

    await counselor.save();

    res.json({ success: true, user: counselor, message: 'Account details updated successfully' });
  } catch (error) {
    console.error('Auth update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Change password (owner only)
router.put('/:id/change-password', verifyToken, requireOwnerOrRole(), async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    const counselor = await Counselor.findById(id);
    if (!counselor) {
      return res.status(404).json({ success: false, error: 'Counselor not found' });
    }

    // Verify current password
    if (!counselor.password) {
      return res.status(400).json({
        success: false,
        error: 'Account not properly configured. Please contact admin.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, counselor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    counselor.password = hashedPassword;
    await counselor.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;