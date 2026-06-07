const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { registerPatientSchema, registerDoctorSchema } = require('../utils/validationSchemas');
const AppError = require('../utils/appError');

const router = express.Router();

const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'supersecret_refresh_key_2026', { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new patient
router.post('/register', validate(registerPatientSchema), async (req, res, next) => {
  const { name, email, password, dob, phone } = req.body;
  try {
    const [existingUsers] = await db.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return next(new AppError('User already exists', 400, 'VALIDATION_ERROR'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { v4: uuidv4 } = require('uuid');
    const userId = uuidv4();

    // Insert into Users table
    await db.query(
      'INSERT INTO Users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, name, 'patient']
    );

    // Insert into PatientProfiles table
    const patientProfileId = uuidv4();
    await db.query(
      'INSERT INTO PatientProfiles (id, user_id) VALUES (?, ?)',
      [patientProfileId, userId]
    );
    
    // Refresh Token Setup
    const refreshToken = generateRefreshToken(userId);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    await db.query(
      'INSERT INTO RefreshTokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, refreshToken, expiresAt]
    );

    res.status(201).json({
      user: { id: userId, name, email, role: 'patient' },
      token: generateAccessToken(userId, 'patient'),
      refreshToken: refreshToken
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/register/doctor
// @desc    Register a new doctor
router.post('/register/doctor', validate(registerDoctorSchema), async (req, res, next) => {
  const { name, email, password, specialty, license } = req.body;
  try {
    const [existingUsers] = await db.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return next(new AppError('User already exists', 400, 'VALIDATION_ERROR'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { v4: uuidv4 } = require('uuid');
    const userId = uuidv4();
    
    await db.query(
      'INSERT INTO Users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, name, 'doctor']
    );

    const doctorProfileId = uuidv4();
    await db.query(
      'INSERT INTO DoctorProfiles (id, user_id, specialization, license_file_path) VALUES (?, ?, ?, ?)',
      [doctorProfileId, userId, specialty, license || 'pending_upload']
    );

    // Refresh Token Setup
    const refreshToken = generateRefreshToken(userId);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    await db.query(
      'INSERT INTO RefreshTokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, refreshToken, expiresAt]
    );
    
    res.status(201).json({
      user: { id: userId, name, email, role: 'doctor' },
      token: generateAccessToken(userId, 'doctor'),
      refreshToken: refreshToken
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    const user = users[0];
    
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      // Refresh Token Setup
      const refreshToken = generateRefreshToken(user.id);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
      await db.query(
        'INSERT INTO RefreshTokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, refreshToken, expiresAt]
      );

      res.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token: generateAccessToken(user.id, user.role),
        refreshToken: refreshToken
      });
    } else {
      return next(new AppError('Invalid email or password', 401, 'UNAUTHORIZED'));
    }
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(new AppError('Refresh token required', 400, 'VALIDATION_ERROR'));
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'supersecret_refresh_key_2026');
    } catch (err) {
      return next(new AppError('Invalid refresh token signature', 401, 'UNAUTHORIZED'));
    }

    const [rows] = await db.query('SELECT * FROM RefreshTokens WHERE token = ?', [refreshToken]);
    if (rows.length === 0) {
      return next(new AppError('Refresh token revoked or invalid', 401, 'UNAUTHORIZED'));
    }
    const tokenRecord = rows[0];

    if (new Date(tokenRecord.expires_at) < new Date()) {
      await db.query('DELETE FROM RefreshTokens WHERE id = ?', [tokenRecord.id]);
      return next(new AppError('Refresh token expired', 401, 'UNAUTHORIZED'));
    }

    const [users] = await db.query('SELECT role FROM Users WHERE id = ?', [tokenRecord.user_id]);
    if (users.length === 0) {
      return next(new AppError('User not found', 401, 'UNAUTHORIZED'));
    }
    const userRole = users[0].role;

    // Rotate refresh token
    await db.query('DELETE FROM RefreshTokens WHERE id = ?', [tokenRecord.id]);

    const newAccessToken = generateAccessToken(tokenRecord.user_id, userRole);
    const newRefreshToken = generateRefreshToken(tokenRecord.user_id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    await db.query(
      'INSERT INTO RefreshTokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [tokenRecord.user_id, newRefreshToken, expiresAt]
    );

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
  const { refreshToken } = req.body;
  try {
    if (refreshToken) {
      await db.query('DELETE FROM RefreshTokens WHERE token = ?', [refreshToken]);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});


// @route   GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
  try {
    const [users] = await db.query('SELECT id, email, name, role, is_active FROM Users WHERE id = ?', [req.user.id]);
    const user = users[0];
    if (!user) {
      return next(new AppError('User not found', 404, 'NOT_FOUND'));
    }
    
    // Fetch related profile
    if (user.role === 'patient') {
      const [profiles] = await db.query('SELECT * FROM PatientProfiles WHERE user_id = ?', [user.id]);
      user.profile = profiles[0] || {};
    } else if (user.role === 'doctor') {
      const [profiles] = await db.query('SELECT * FROM DoctorProfiles WHERE user_id = ?', [user.id]);
      user.profile = profiles[0] || {};
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/auth/profile/patient
router.put('/profile/patient', protect, async (req, res, next) => {
  if (req.user.role !== 'patient') {
    return next(new AppError('Only patients can update this profile', 403, 'FORBIDDEN'));
  }
  const { 
    name, age, gender, smoking_status, diabetes, hypertension,
    prior_cancer, prior_brain_surgery, immunosuppressed, seizures,
    headache_severity, symptom_duration_weeks, functional_status, neurological_symptoms
  } = req.body;
  
  const functionalStatusMap = {
    'Independent': 'independent',
    'Some help': 'needs_some_help',
    'Significant help': 'needs_significant_help',
    'Bed-bound': 'fully_dependent'
  };
  const dbFunctionalStatus = functionalStatusMap[functional_status] || 'independent';

  const neurologicalSymptomsMap = {
    0: 'none',
    1: 'mild',
    2: 'moderate',
    3: 'severe'
  };
  const dbNeurologicalSymptoms = neurologicalSymptomsMap[neurological_symptoms] || 'none';

  const comorbiditiesStr = `Diabetes: ${diabetes ? 'Yes' : 'No'}, Hypertension: ${hypertension ? 'Yes' : 'No'}`;

  try {
    // Update name in Users table
    if (name) {
      await db.query('UPDATE Users SET name = ? WHERE id = ?', [name, req.user.id]);
    }

    await db.query(
      `UPDATE PatientProfiles SET 
        age = ?, 
        gender = ?, 
        smoking_status = ?, 
        diabetes = ?, 
        hypertension = ?, 
        family_cancer_history = ?, 
        previous_treatment = ?, 
        immunosuppressed = ?, 
        seizure_history = ?, 
        headache_severity = ?, 
        symptom_duration_weeks = ?, 
        functional_status = ?, 
        neurological_symptoms = ?, 
        comorbidities = ? 
      WHERE user_id = ?`,
      [
        age || null,
        gender || null,
        smoking_status || 'Never',
        diabetes ? 1 : 0,
        hypertension ? 1 : 0,
        prior_cancer ? 1 : 0,
        prior_brain_surgery ? 1 : 0,
        immunosuppressed ? 1 : 0,
        seizures ? 1 : 0,
        headache_severity || 5,
        symptom_duration_weeks || 4,
        dbFunctionalStatus,
        dbNeurologicalSymptoms,
        comorbiditiesStr,
        req.user.id
      ]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/auth/profile/doctor
router.put('/profile/doctor', protect, async (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return next(new AppError('Only doctors can update this profile', 403, 'FORBIDDEN'));
  }
  const { years_experience, license_file_path } = req.body;
  
  try {
    await db.query(
      'UPDATE DoctorProfiles SET years_experience = ?, license_file_path = ? WHERE user_id = ?',
      [years_experience, license_file_path, req.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/auth/reset-password
router.put('/reset-password', protect, async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const [users] = await db.query('SELECT password_hash FROM Users WHERE id = ?', [req.user.id]);
    const user = users[0];

    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      return next(new AppError('Invalid current password', 401, 'UNAUTHORIZED'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE Users SET password_hash = ? WHERE id = ?', [hashedPassword, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/auth/deactivate
router.delete('/deactivate', protect, async (req, res, next) => {
  try {
    await db.query('UPDATE Users SET is_active = false WHERE id = ?', [req.user.id]);
    res.json({ message: 'Account deactivated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
