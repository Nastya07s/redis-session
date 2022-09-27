const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const User = require('./../models/UserSchema');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json('Email and password are required');
  }

  const regExpForEmail = new RegExp(/\w+@\w+\.\w+/, 'ig');
  if (!regExpForEmail.test(email)) {
    return res.status(400).json('Email incorrect');
  }

  const regExpForPassword = new RegExp(/.{6}/, 'ig');
  if (!regExpForPassword.test(password)) {
    return res.status(400).json('Password must be at least 6 symbols');
  }

  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).json('User already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    new User({ email, password: passwordHash }).save();
  } catch {
    return res.status(500).json('Error while save. Please try again');
  }

  return res.status(200).json('Register success');
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

  const hash = crypto
    .createHash('sha256')
    .update(email + password + new Date())
    .digest('hex');

  const session = req.session;
  session.sessionId = hash;

  res.setHeader('Set-Cookie', `sessionId=${hash}`);

  return res.status(200).json('Login success');
});

router.get('/logout', async (req, res) => {
  req.session.destroy(function (err) {
    return res.status(200).json('Destroyed session');
  });
});

module.exports = router;
