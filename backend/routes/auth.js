const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// helper to find user by email
const findUserByEmail = (email) =>
  new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

// helper to create user
const createUser = (email, hashedPassword) =>
  new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    db.run(
      'INSERT INTO users (email, password, createdAt) VALUES (?, ?, ?)',
      [email, hashedPassword, now],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, email, createdAt: now });
      }
    );
  });

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ msg: 'User exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser(email, hashed);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
