const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./../models/UserSchema');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json('Email and password are required');
  }

  const user = await User.find({ email });
  if (user) {
    return res.status(400).json('User already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    new User({ email, password: passwordHash }).save();
  } catch {
    return res.status(500).json('Error while save. Please try again');
  }

  return res.status(200);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json('Email and password are required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json('User not found');
  }

  const isCorrectPassword = await bcrypt.compare(password, user.password);

  if (!isCorrectPassword) {
    return res.status(400).json('Password incorrect');
  }

  return res.status(200);
});

module.exports = router;
