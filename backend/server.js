const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/scans', require('./routes/scanRoutes'));
app.use('/api/consultations', require('./routes/consultationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.send('BrainScanAI MySQL API is running...');
});

// Database Connection check
const PORT = process.env.PORT || 5000;
db.query('SELECT 1')
  .then(() => {
    console.log('MySQL Database Connected Successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MySQL Database connection failed. Please ensure MySQL is running and the database exists.', err);
    process.exit(1);
  });
