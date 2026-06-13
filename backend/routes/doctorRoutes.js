const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { protect } = require('../middleware/authMiddleware');

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

// @route   GET /api/doctors/me/slots
// @desc    Get all slots (reserved or available) created by current doctor
router.get('/me/slots', protect, async (req, res, next) => {
  if (req.user.role !== 'doctor') {
    const AppError = require('../utils/appError');
    return next(new AppError('Only doctors can manage slots', 403, 'FORBIDDEN'));
  }
  try {
    const [profiles] = await db.query('SELECT id FROM DoctorProfiles WHERE user_id = ?', [req.user.id]);
    if (profiles.length === 0) {
      const AppError = require('../utils/appError');
      return next(new AppError('Doctor profile not found', 404, 'NOT_FOUND'));
    }
    const doctor_id = profiles[0].id;

    const [slots] = await db.query(
      'SELECT id, slot_date, slot_time, is_reserved FROM DoctorAvailabilitySlots WHERE doctor_id = ? ORDER BY slot_date ASC, slot_time ASC',
      [doctor_id]
    );
    res.json(slots);
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/doctors/me/slots
// @desc    Create a new availability slot
router.post('/me/slots', protect, async (req, res, next) => {
  if (req.user.role !== 'doctor') {
    const AppError = require('../utils/appError');
    return next(new AppError('Only doctors can manage slots', 403, 'FORBIDDEN'));
  }
  const { slot_date, slot_time } = req.body;
  if (!slot_date || !slot_time) {
    const AppError = require('../utils/appError');
    return next(new AppError('Date and time are required', 400, 'VALIDATION_ERROR'));
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!dateRegex.test(slot_date) || !timeRegex.test(slot_time)) {
    const AppError = require('../utils/appError');
    return next(new AppError('Invalid date or time format. Expected YYYY-MM-DD and HH:MM', 400, 'VALIDATION_ERROR'));
  }

  try {
    const [profiles] = await db.query('SELECT id FROM DoctorProfiles WHERE user_id = ?', [req.user.id]);
    if (profiles.length === 0) {
      const AppError = require('../utils/appError');
      return next(new AppError('Doctor profile not found', 404, 'NOT_FOUND'));
    }
    const doctor_id = profiles[0].id;

    const slotId = uuidv4();
    await db.query(
      'INSERT INTO DoctorAvailabilitySlots (id, doctor_id, slot_date, slot_time, is_reserved) VALUES (?, ?, ?, ?, false)',
      [slotId, doctor_id, slot_date, slot_time]
    );

    res.status(201).json({ message: 'Slot created successfully', id: slotId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const AppError = require('../utils/appError');
      return next(new AppError('This availability slot already exists', 400, 'DUPLICATE_ENTRY'));
    }
    next(err);
  }
});

// @route   PUT /api/doctors/me/slots/:id
// @desc    Update an availability slot
router.put('/me/slots/:id', protect, async (req, res, next) => {
  if (req.user.role !== 'doctor') {
    const AppError = require('../utils/appError');
    return next(new AppError('Only doctors can manage slots', 403, 'FORBIDDEN'));
  }
  const { slot_date, slot_time, is_reserved } = req.body;
  if (slot_date === undefined || slot_time === undefined || is_reserved === undefined) {
    const AppError = require('../utils/appError');
    return next(new AppError('Date, time, and reservation status are required', 400, 'VALIDATION_ERROR'));
  }

  try {
    const [profiles] = await db.query('SELECT id FROM DoctorProfiles WHERE user_id = ?', [req.user.id]);
    if (profiles.length === 0) {
      const AppError = require('../utils/appError');
      return next(new AppError('Doctor profile not found', 404, 'NOT_FOUND'));
    }
    const doctor_id = profiles[0].id;

    const [result] = await db.query(
      'UPDATE DoctorAvailabilitySlots SET slot_date = ?, slot_time = ?, is_reserved = ? WHERE id = ? AND doctor_id = ?',
      [slot_date, slot_time, is_reserved, req.params.id, doctor_id]
    );

    if (result.affectedRows === 0) {
      const AppError = require('../utils/appError');
      return next(new AppError('Slot not found or unauthorized', 404, 'NOT_FOUND'));
    }

    res.json({ message: 'Slot updated successfully' });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/doctors/me/slots/:id
// @desc    Delete an availability slot
router.delete('/me/slots/:id', protect, async (req, res, next) => {
  if (req.user.role !== 'doctor') {
    const AppError = require('../utils/appError');
    return next(new AppError('Only doctors can manage slots', 403, 'FORBIDDEN'));
  }

  try {
    const [profiles] = await db.query('SELECT id FROM DoctorProfiles WHERE user_id = ?', [req.user.id]);
    if (profiles.length === 0) {
      const AppError = require('../utils/appError');
      return next(new AppError('Doctor profile not found', 404, 'NOT_FOUND'));
    }
    const doctor_id = profiles[0].id;

    const [result] = await db.query(
      'DELETE FROM DoctorAvailabilitySlots WHERE id = ? AND doctor_id = ?',
      [req.params.id, doctor_id]
    );

    if (result.affectedRows === 0) {
      const AppError = require('../utils/appError');
      return next(new AppError('Slot not found or unauthorized', 404, 'NOT_FOUND'));
    }

    res.json({ message: 'Slot deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/doctors/:id/slots
// @desc    Get all available non-reserved slots for a doctor (optional date filter)
router.get('/:id/slots', async (req, res, next) => {
  const { date } = req.query;
  try {
    let query = 'SELECT id, slot_date, slot_time, is_reserved FROM DoctorAvailabilitySlots WHERE doctor_id = ? AND is_reserved = false';
    const params = [req.params.id];

    if (date) {
      query += ' AND slot_date = ?';
      params.push(date);
    }

    query += ' ORDER BY slot_date ASC, slot_time ASC';

    const [slots] = await db.query(query, params);
    res.json(slots);
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
