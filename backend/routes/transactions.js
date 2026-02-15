const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();
router.use(auth);

// helper to run all
const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

// helper to run get
const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

// helper to run insert/update/delete
const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

// GET /api/transactions?page=1&limit=20&category=Food&search=...
router.get('/', async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    search,
    dateFrom,
    dateTo,
    minAmount,
  } = req.query;

  const offset = (page - 1) * limit;

  let where = 'WHERE userId = ?';
  const params = [req.user.id];

  if (category && category !== 'All') {
    where += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    where += ' AND LOWER(title) LIKE ?';
    params.push(`%${search.toLowerCase()}%`);
  }
  if (dateFrom) {
    where += ' AND date >= ?';
    params.push(dateFrom);
  }
  if (dateTo) {
    where += ' AND date <= ?';
    params.push(dateTo);
  }
  if (minAmount) {
    where += ' AND amount >= ?';
    params.push(parseFloat(minAmount));
  }

  try {
    const totalRow = await getAsync(
      `SELECT COUNT(*) as count FROM transactions ${where}`,
      params
    );
    const total = totalRow?.count || 0;

    const data = await allAsync(
      `SELECT * FROM transactions ${where} ORDER BY date DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const hasMore = total > page * limit;

    res.json({ transactions: data, total, hasMore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/transactions/summary
router.get('/summary', async (req, res) => {
  try {
    const totalRow = await getAsync(
      'SELECT SUM(amount) as total FROM transactions WHERE userId = ?',
      [req.user.id]
    );
    const total = totalRow?.total || 0;

    const byCategory = await allAsync(
      'SELECT category as _id, SUM(amount) as total FROM transactions WHERE userId = ? GROUP BY category ORDER BY total DESC',
      [req.user.id]
    );

    res.json({ total, byCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  const { title, amount, category, date, notes } = req.body;
  const now = new Date().toISOString();

  try {
    const result = await runAsync(
      `INSERT INTO transactions
       (userId, title, amount, category, date, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, amount, category, date, notes || null, now, now]
    );

    const inserted = await getAsync(
      'SELECT * FROM transactions WHERE id = ?',
      [result.lastID]
    );
    res.json(inserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  const { title, amount, category, date, notes } = req.body;
  const { id } = req.params;
  const now = new Date().toISOString();

  try {
    const result = await runAsync(
      `UPDATE transactions
       SET title = ?, amount = ?, category = ?, date = ?, notes = ?, updatedAt = ?
       WHERE id = ? AND userId = ?`,
      [title, amount, category, date, notes || null, now, id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ msg: 'Not found' });
    }

    const updated = await getAsync(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await runAsync(
      'DELETE FROM transactions WHERE id = ? AND userId = ?',
      [id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ msg: 'Not found' });
    }

    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
