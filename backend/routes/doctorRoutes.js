const express = require('express');
const db = require('../db');

const router = express.Router();

// @route   GET /api/doctors
// @desc    Get all verified doctors for patients to book
router.get('/', async (req, res, next) => {
  try {
    const [doctors] = await db.query(`
      SELECT d.id, d.specialization, d.years_experience, d.average_rating, d.bio, u.name, u.email 
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
      SELECT d.id, d.specialization, d.years_experience, d.average_rating, d.bio, u.name, u.email 
      FROM DoctorProfiles d 
      JOIN Users u ON d.user_id = u.id 
      WHERE d.id = ? AND d.verification_status = 'verified'
    `, [req.params.id]);
    
    if (doctors.length === 0) {
      const AppError = require('../utils/appError');
      return next(new AppError('Doctor not found', 404, 'NOT_FOUND'));
    }

    const [reviews] = await db.query(`
      SELECT dr.id, dr.rating, dr.review_text, dr.created_at, pu.name as patient_name
      FROM DoctorRatings dr
      JOIN PatientProfiles p ON dr.patient_id = p.id
      JOIN Users pu ON p.user_id = pu.id
      WHERE dr.doctor_id = ?
      ORDER BY dr.created_at DESC
    `, [req.params.id]);

    res.json({
      ...doctors[0],
      reviews: reviews
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
