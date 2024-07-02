const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const verifyToken = require('../middleware/auth');
const { Op } = require("sequelize")
const schedule = require('node-schedule');
require('dotenv').config();

// validate email domain
const validateEmail = (email) => {
  const domain = email.split('@')[1];
  return domain && domain.endsWith('.edu');
};

// generate a random verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// send verification email
const sendVerificationEmail = async (email, verificationCode) => {

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Email Verification',
    html: `Your verification code is <b>${verificationCode}</b>.`,
  };

  await transporter.sendMail(mailOptions);
};

// POST route for user signup
router.post('/signup', async (req, res) => {
  console.log('Received signup request');
  const { email, password, name } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email domain. Please use a .edu email.' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

//verification code expiration time
const expirationTimestamp = new Date(Date.now() + 60000)

    // Save user with verificationCode
    await User.create({ email, password: hashedPassword, name, verificationCode, expirationTimestamp, });

    User.emailVerified = false

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({ message: 'Signup successful. Verification code sent to your email.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Check verification code storage in database
router.get('/checkVerificationCode', async (req, res) => {

  try {
    const user = await User.findOne({ where: { email: 'bsa5@calvin.edu' } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    console.log('Verification code in database:', user.verificationCode);
    res.status(200).json({ verificationCode: user.verificationCode });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST route for email verification
router.post('/verify', async (req, res) => {
  console.log('Received verify request');

  const { email, code } = req.body;

  try {
    const user = await User.findOne({ where: { email, verificationCode: code } });
    if (!user) {
      return res.status(404).json({ error: 'Invalid verification code.' });
    }

  // verification code expiration check.
  const currentTime = new Date();
  console.log('Current time:',currentTime);
  console.log('Expiration time:', user.expirationTimestamp)
  if (user.expirationTimestamp < currentTime) {
    return res.status(400).json({ error: 'Verification code has expired.' });
  }


    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.verificationCode = null;
    user.emailVerified = true;
    await user.save();


    res.status(200).json({ token, message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Failed to verify email.' });
  }
});

// resend verification code
router.post('/resendverification', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email} });
    if (!user || user.emailVerified) {
      return res.status(400).json({ error: 'Invalid request or email already verified.' });
    }

    const verificationCode = generateVerificationCode();
    const expirationTimestamp = new Date(Date.now() + 60000);

    // Update user with new verification code and expiration time
    user.verificationCode = verificationCode;
    user.expirationTimestamp = expirationTimestamp;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Verification code resent successfully.' });
  } catch (error) {
    console.error('Error resending verification code:', error);
    res.status(500).json({ error: 'Failed to resend verification code.' });
  }
});

// Delete unverified users every minute
schedule.scheduleJob('*/10 * * * *', async () => {
  await User.destroy({
    where: {
      emailVerified: false,
      createdAt: { [Op.lt]: new Date(Date.now() - 600000) }
    }
  });
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


 // Check if the email is verified
 if (!user.emailVerified) {
  return res.status(401).json({ error: 'Email not verified' });
}

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return the token as JSON response
    res.status(200).json({ token, userId: user.id });
    console.log(user.id)
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET route for dashboard data
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    const dashboardData = {
      message: `Welcome to your dashboard, ${user.name}!`

    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  try{
    const user = await User.findByPk(userId);

    if(!user){
      return res.status(404).json({error: 'User not found'});
    }

    // return user data
    res.status(200).json(user);
  } catch (error){
    console.error('Error fetching user:', error);
    res.status(500).json({error: 'Internal server error'})
  }
})

//GET route for course data
router.get('/courses', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const coursesData = {
      message: `Welcome to your dashboard, ${user.name}!`

    };

    res.status(200).json(coursesData);
  } catch (error) {
    console.error('Courses fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//get route for mentorship
router.get('/mentorship', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    const mentorsData = {
      message: `Welcome to the mentorship page, ${user.name}!`

    };

    res.status(200).json(mentorsData);
  } catch (error) {
    console.error('Mentors fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
