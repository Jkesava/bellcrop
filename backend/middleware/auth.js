// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../db');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded.id is numeric userId
    db.get('SELECT id, email FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ msg: 'Invalid token user' });
      }
      req.user = user; // { id, email }
      next();
    });
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};
