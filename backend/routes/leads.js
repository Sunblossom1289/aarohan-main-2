const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// POST /leads/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, middleName, school, standard, phone, email } = req.body;

    // Create new lead
    const newLead = new Lead({
      firstName,
      lastName,
      middleName,
      school,
      standard,
      phone,
      email
    });

    await newLead.save();

    res.status(201).json({ message: 'Lead saved successfully', success: true });
  } catch (error) {
    console.error('Error saving lead:', error);
    res.status(500).json({ message: 'Server error', success: false });
  }
});

module.exports = router;