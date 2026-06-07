const express = require('express');
const db = require('../db');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/doctors/pending
// @desc    Get all doctors awaiting verification
router.get('/doctors/pending', async (req, res, next) => {
  try {
    const [doctors] = await db.query(`
      SELECT d.id, d.specialization, d.license_file_path, u.name, u.email 
      FROM DoctorProfiles d 
      JOIN Users u ON d.user_id = u.id 
      WHERE d.verification_status = 'pending'
    `);
    res.json(doctors);
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/admin/doctors/:id/verify
// @desc    Approve or reject a doctor
router.put('/doctors/:id/verify', async (req, res, next) => {
  const { status } = req.body; // 'verified' or 'rejected'
  try {
    const [result] = await db.query(
      'UPDATE DoctorProfiles SET verification_status = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      const AppError = require('../utils/appError');
      return next(new AppError('Doctor not found', 404, 'NOT_FOUND'));
    }
    res.json({ message: `Doctor successfully ${status}` });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/admin/stats
// @desc    Get system-wide statistics
router.get('/stats', async (req, res, next) => {
  try {
    const [[patientCount]] = await db.query("SELECT COUNT(*) as count FROM Users WHERE role = 'patient'");
    const [[doctorCount]] = await db.query("SELECT COUNT(*) as count FROM DoctorProfiles WHERE verification_status = 'verified'");
    const [[scanCount]] = await db.query("SELECT COUNT(*) as count FROM Scans");

    res.json({
      patients: patientCount.count,
      verifiedDoctors: doctorCount.count,
      totalScansProcessed: scanCount.count
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for management
router.get('/users', async (req, res, next) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, is_active, created_at FROM Users ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user active status (activate/deactivate)
router.put('/users/:id', async (req, res, next) => {
  const { is_active } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE Users SET is_active = ? WHERE id = ?',
      [is_active, req.params.id]
    );
    if (result.affectedRows === 0) {
      const AppError = require('../utils/appError');
      return next(new AppError('User not found', 404, 'NOT_FOUND'));
    }
    res.json({ message: `User status updated to ${is_active}` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
