const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications for the current user
router.get('/', protect, async (req, res) => {
  try {
    const [notifications] = await db.query(
      'SELECT * FROM Notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE Notifications SET is_read = true WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
