const express = require('express');
const db = require('../db');

const router = express.Router();

// @route   GET /api/doctors
// @desc    Get all verified doctors for patients to book
router.get('/', async (req, res) => {
  try {
    const [doctors] = await db.query(`
      SELECT d.id, d.specialization, d.years_experience, d.average_rating, u.name, u.email 
      FROM DoctorProfiles d 
      JOIN Users u ON d.user_id = u.id 
      WHERE d.verification_status = 'verified'
    `);
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get a single verified doctor by profile ID
router.get('/:id', async (req, res) => {
  try {
    const [doctors] = await db.query(`
      SELECT d.id, d.specialization, d.years_experience, d.average_rating, u.name, u.email 
      FROM DoctorProfiles d 
      JOIN Users u ON d.user_id = u.id 
      WHERE d.id = ? AND d.verification_status = 'verified'
    `, [req.params.id]);
    
    if (doctors.length === 0) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctors[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
