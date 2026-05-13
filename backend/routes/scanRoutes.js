const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, 'uploads/'); },
  filename(req, file, cb) { cb(null, `${Date.now()}-${file.originalname}`); }
});
const upload = multer({ storage });

// @route   POST /api/scans/upload
router.post('/upload', protect, upload.single('image'), async (req, res) => {
  try {
    const intakeData = JSON.parse(req.body.intakeData || '{}');
    const scanId = uuidv4();
    const imageUrl = `/uploads/${req.file.filename}`;

    // Get the patient profile id
    const [profiles] = await db.query('SELECT id FROM PatientProfiles WHERE user_id = ?', [req.user.id]);
    if (profiles.length === 0) return res.status(400).json({ message: 'Patient profile not found' });
    const patientProfileId = profiles[0].id;

    // Update Patient Profile with new intake data
    await db.query(`
      UPDATE PatientProfiles SET
        age = ?, gender = ?, family_cancer_history = ?, previous_treatment = ?,
        headache_severity = ?, seizure_history = ?, vision_problems = ?, cognitive_changes = ?,
        nausea_vomiting = ?
      WHERE id = ?
    `, [
      intakeData.age || null, 
      intakeData.gender || null, 
      intakeData.family_history || false, 
      intakeData.previous_treatment || false,
      intakeData.symptom_severity || 0,
      intakeData.seizures || false,
      intakeData.vision_changes || false,
      intakeData.cognitive_issues || false,
      intakeData.nausea || false,
      patientProfileId
    ]);

    // Create the scan record
    await db.query(
      'INSERT INTO Scans (id, patient_id, mri_file_path, status) VALUES (?, ?, ?, ?)',
      [scanId, patientProfileId, imageUrl, 'processing']
    );

    // MOCK AI PIPELINE TRIGGER
    setTimeout(async () => {
      const urgencyScore = intakeData.symptom_severity > 7 ? 90 : 40;
      let levelStr = 'routine';
      if (urgencyScore > 80) levelStr = 'emergency';
      else if (urgencyScore > 50) levelStr = 'urgent';

      await db.query(
        `UPDATE Scans SET 
          status = 'completed',
          tumor_type = 'Glioma',
          tumor_location = 'Frontal lobe, Left hemisphere',
          tumor_size_mm2 = 1240,
          classification_confidence = 0.873,
          treatment_plan = 'Surgery + Radiation',
          urgency_level = ?,
          triage_tier = ?
         WHERE id = ?`,
        [urgencyScore.toString(), levelStr, scanId]
      );
    }, 2000);

    res.status(201).json({ scanId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/scans/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const [scans] = await db.query('SELECT * FROM Scans WHERE id = ?', [req.params.id]);
    if (scans.length === 0) return res.status(404).json({ message: 'Scan not found' });
    const scan = scans[0];

    // For frontend mapping compatibility:
    const formattedData = {
      _id: scan.id,
      uploadDate: scan.created_at,
      results: {
        classification: scan.tumor_type,
        confidence: scan.classification_confidence ? scan.classification_confidence * 100 : 0,
        location: scan.tumor_location,
        area: scan.tumor_size_mm2,
        diameter: 39.7, // mock
        treatmentSuggestion: scan.treatment_plan,
        urgencyScore: parseInt(scan.urgency_level) || 0,
        triageTier: {
          level: scan.triage_tier === 'emergency' ? 1 : scan.triage_tier === 'urgent' ? 2 : 3,
          label: scan.triage_tier,
          color: scan.triage_tier === 'emergency' ? '#ef4444' : scan.triage_tier === 'urgent' ? '#f59e0b' : '#10b981'
        }
      }
    };

    res.json(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/scans/history/me
router.get('/history/me', protect, async (req, res) => {
  try {
    const [profiles] = await db.query('SELECT id FROM PatientProfiles WHERE user_id = ?', [req.user.id]);
    if (profiles.length === 0) return res.json([]);

    const [scans] = await db.query('SELECT * FROM Scans WHERE patient_id = ? ORDER BY created_at DESC', [profiles[0].id]);
    
    // Map to frontend expectation
    const formatted = scans.map(scan => ({
      _id: scan.id,
      uploadDate: scan.created_at,
      status: scan.status,
      results: {
        classification: scan.tumor_type || 'Processing',
        confidence: scan.classification_confidence ? scan.classification_confidence * 100 : 0
      }
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/scans/:id/share
// @desc    Generate a secure sharing link/token for a scan
router.post('/:id/share', protect, async (req, res) => {
  try {
    const [scans] = await db.query('SELECT id, patient_id FROM Scans WHERE id = ?', [req.params.id]);
    if (scans.length === 0) return res.status(404).json({ message: 'Scan not found' });
    
    // Validate ownership
    const [profiles] = await db.query('SELECT id FROM PatientProfiles WHERE user_id = ?', [req.user.id]);
    if (profiles.length === 0 || scans[0].patient_id !== profiles[0].id) {
      return res.status(403).json({ message: 'Not authorized to share this scan' });
    }

    const crypto = require('crypto');
    const shareToken = crypto.randomBytes(32).toString('hex');

    await db.query('UPDATE Scans SET share_token = ? WHERE id = ?', [shareToken, req.params.id]);
    res.json({ share_token: shareToken, url: `/shared/${shareToken}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/scans/shared/:token
// @desc    View a shared scan without needing auth (or specifically for doctors)
router.get('/shared/:token', async (req, res) => {
  try {
    const [scans] = await db.query('SELECT * FROM Scans WHERE share_token = ?', [req.params.token]);
    if (scans.length === 0) return res.status(404).json({ message: 'Invalid or expired share token' });
    
    const scan = scans[0];
    res.json({
      id: scan.id,
      created_at: scan.created_at,
      original_image_path: scan.mri_file_path,
      segmentation_mask_path: scan.segmentation_mask_path,
      tumor_type: scan.tumor_type,
      tumor_location: scan.tumor_location,
      classification_confidence: scan.classification_confidence,
      tumor_size_mm2: scan.tumor_size_mm2,
      treatment_plan: scan.treatment_plan
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
