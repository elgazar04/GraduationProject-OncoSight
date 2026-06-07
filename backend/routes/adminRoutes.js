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
// @desc    Update user account details and status
router.put('/users/:id', async (req, res, next) => {
  const { name, email, role, is_active } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM Users WHERE id = ?', [req.params.id]);
    if (users.length === 0) {
      const AppError = require('../utils/appError');
      return next(new AppError('User not found', 404, 'NOT_FOUND'));
    }

    const user = users[0];
    const newName = name !== undefined ? name : user.name;
    const newEmail = email !== undefined ? email : user.email;
    const newRole = role !== undefined ? role : user.role;
    const newIsActive = is_active !== undefined ? is_active : user.is_active;

    await db.query(
      'UPDATE Users SET name = ?, email = ?, role = ?, is_active = ? WHERE id = ?',
      [newName, newEmail, newRole, newIsActive, req.params.id]
    );

    if (newRole === 'patient') {
      const [profiles] = await db.query('SELECT id FROM PatientProfiles WHERE user_id = ?', [req.params.id]);
      if (profiles.length === 0) {
        await db.query('INSERT INTO PatientProfiles (id, user_id) VALUES (UUID(), ?)', [req.params.id]);
      }
    } else if (newRole === 'doctor') {
      const [profiles] = await db.query('SELECT id FROM DoctorProfiles WHERE user_id = ?', [req.params.id]);
      if (profiles.length === 0) {
        await db.query(
          "INSERT INTO DoctorProfiles (id, user_id, specialization, years_experience, license_file_path, verification_status) VALUES (UUID(), ?, 'General', 5, 'pending_upload', 'verified')",
          [req.params.id]
        );
      }
    }

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user account
router.delete('/users/:id', async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM Users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      const AppError = require('../utils/appError');
      return next(new AppError('User not found', 404, 'NOT_FOUND'));
    }
    res.json({ message: 'User account successfully deleted' });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/admin/scans
// @desc    Get all scans for management
router.get('/scans', async (req, res, next) => {
  try {
    const [scans] = await db.query(`
      SELECT s.*, u.name as patient_name, u.email as patient_email
      FROM Scans s
      JOIN PatientProfiles p ON s.patient_id = p.id
      JOIN Users u ON p.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    res.json(scans);
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/admin/scans/:id
// @desc    Update scan parameters
router.put('/scans/:id', async (req, res, next) => {
  const {
    tumor_type,
    tumor_location,
    tumor_size_mm2,
    hemisphere,
    classification_confidence,
    treatment_plan,
    urgency_level,
    triage_tier,
    status
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE Scans 
       SET tumor_type = ?, 
           tumor_location = ?, 
           tumor_size_mm2 = ?, 
           hemisphere = ?, 
           classification_confidence = ?, 
           treatment_plan = ?, 
           urgency_level = ?, 
           triage_tier = ?, 
           status = ? 
       WHERE id = ?`,
      [
        tumor_type,
        tumor_location,
        tumor_size_mm2,
        hemisphere,
        classification_confidence ? classification_confidence / 100 : null, // Convert from percentage back to decimal
        treatment_plan,
        urgency_level,
        triage_tier,
        status,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      const AppError = require('../utils/appError');
      return next(new AppError('Scan not found', 404, 'NOT_FOUND'));
    }

    res.json({ message: 'Scan details updated successfully' });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/admin/scans/:id
// @desc    Delete a scan and clean up files
router.delete('/scans/:id', async (req, res, next) => {
  const path = require('path');
  const fs = require('fs');

  try {
    const [scans] = await db.query('SELECT mri_file_path, segmentation_mask_path FROM Scans WHERE id = ?', [req.params.id]);
    if (scans.length === 0) {
      const AppError = require('../utils/appError');
      return next(new AppError('Scan not found', 404, 'NOT_FOUND'));
    }

    const scan = scans[0];

    // Clean up MRI file on disk
    if (scan.mri_file_path) {
      // Remove leading slash if it exists
      const cleanPath = scan.mri_file_path.startsWith('/') ? scan.mri_file_path.slice(1) : scan.mri_file_path;
      const mriPath = path.join(__dirname, '..', cleanPath);
      if (fs.existsSync(mriPath)) {
        try { fs.unlinkSync(mriPath); } catch (e) { console.error('Failed to delete MRI file:', e); }
      }
    }

    // Clean up mask file on disk
    if (scan.segmentation_mask_path) {
      const cleanMaskPath = scan.segmentation_mask_path.startsWith('/') ? scan.segmentation_mask_path.slice(1) : scan.segmentation_mask_path;
      const maskPath = path.join(__dirname, '..', cleanMaskPath);
      if (fs.existsSync(maskPath)) {
        try { fs.unlinkSync(maskPath); } catch (e) { console.error('Failed to delete mask file:', e); }
      }
    }

    // Delete scan record (Cascade deletes related tables like Consultations)
    await db.query('DELETE FROM Scans WHERE id = ?', [req.params.id]);

    res.json({ message: 'Scan successfully deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

