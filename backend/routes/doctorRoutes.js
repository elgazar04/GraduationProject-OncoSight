const express = require('express');
const db = require('../db');

const router = express.Router();

// @route   GET /api/doctors
// @desc    Get all verified doctors for patients to book
router.get('/', async (req, res, next) => {
  try {
    const [doctors] = await db.query(`
      SELECT d.id, d.specialization, d.years_experience, d.average_rating, u.name, u.email 
      FROM DoctorProfiles d 
      JOIN Users u ON d.user_id = u.id 
      WHERE d.verification_status = 'verified'
    `);
    res.json(doctors);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/doctors/:id
// @desc    Get a single verified doctor by profile ID
router.get('/:id', async (req, res, next) => {
  try {
    const [doctors] = await db.query(`
      SELECT d.id, d.specialization, d.years_experience, d.average_rating, u.name, u.email 
      FROM DoctorProfiles d 
      JOIN Users u ON d.user_id = u.id 
      WHERE d.id = ? AND d.verification_status = 'verified'
    `, [req.params.id]);
    
    if (doctors.length === 0) {
      const AppError = require('../utils/appError');
      return next(new AppError('Doctor not found', 404, 'NOT_FOUND'));
    }
    res.json(doctors[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
