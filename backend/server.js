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
  res.send('OncoSight MySQL API is running...');
});

// Error handling middleware
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Database Connection check
const PORT = process.env.PORT || 5000;
db.query('SELECT 1')
  .then(async () => {
    console.log('MySQL Database Connected Successfully');
    
    // Auto-create RefreshTokens table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS RefreshTokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        token VARCHAR(255) CHARACTER SET ascii NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);
    console.log('RefreshTokens DB table checked/created successfully');
    
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MySQL Database connection failed. Please ensure MySQL is running and the database exists.', err);
    process.exit(1);
  });
