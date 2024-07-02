const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');
const courseRoutes = require('./routes/course');
const mentorshipRoutes = require('./routes/mentorship');
const postRoutes = require('./routes/post');
const verifyToken = require('./middleware/auth');
const { sequelize } = require('./models');
const friendRoutes = require('./routes/friends')

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '2000mb' }));
app.use(bodyParser.urlencoded({ limit: '2000mb', extended: true }));
// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Routes
app.use('/auth', authRoutes);
app.use('/profile', verifyToken, profileRoutes);
app.use('/dashboard', verifyToken, dashboardRoutes);
app.use('/course', verifyToken, courseRoutes);
app.use('/mentorship', verifyToken, mentorshipRoutes);
app.use('/post', verifyToken, postRoutes);
app.use('/friends', friendRoutes)

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Sync models with database and start server
sequelize.sync()
  .then(() => {
    console.log('Database synced.');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Database sync failed:', error);
  });
