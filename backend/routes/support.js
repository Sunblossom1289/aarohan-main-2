// backend/routes/support.js
// Student Support — receives the form data and sends it as email.
// No MongoDB saving — purely fire-and-forward.

const express = require('express');
const router  = express.Router();
const { sendSupportEmail } = require('../services/emailService');

router.post('/submit', async (req, res) => {
  try {
    const { studentName, studentEmail, studentPhone, category, subject, description, priority } = req.body;

    // --- Basic validation ---
    if (!studentName?.trim())   return res.status(400).json({ success: false, error: 'Student name is required' });
    if (!studentEmail?.trim())  return res.status(400).json({ success: false, error: 'Student email is required' });
    if (!category?.trim())      return res.status(400).json({ success: false, error: 'Category is required' });
    if (!subject?.trim())       return res.status(400).json({ success: false, error: 'Subject is required' });
    if (!description?.trim())   return res.status(400).json({ success: false, error: 'Description is required' });

    await sendSupportEmail({
      studentName:  studentName.trim(),
      studentEmail: studentEmail.trim(),
      studentPhone: studentPhone?.trim() || 'Not provided',
      category:     category.trim(),
      subject:      subject.trim(),
      description:  description.trim(),
      priority:     priority?.trim() || 'Medium',
      submittedAt:  new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    });

    return res.json({ success: true, message: 'Your support request has been submitted. We will get back to you soon!' });
  } catch (err) {
    console.error('❌ Support submit error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to send support request. Please try again.' });
  }
});

module.exports = router;
