// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { transactionsAPI } from '../utils/api';

const Dashboard = () => {
  const [summary, setSummary] = useState({ total: 0, byCategory: [] });
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const loadSummary = async () => {
    try {
      const res = await transactionsAPI.getSummary();
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.title) return;

    setLoading(true);
    try {
      await transactionsAPI.create({
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        notes: form.notes,
      });

      // clear inputs (keep today’s date)
      setForm((prev) => ({
        ...prev,
        title: '',
        amount: '',
        notes: '',
      }));

      // reload totals
      await loadSummary();
    } catch (err) {
      console.error(err);
      alert('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>

      {/* quick add expense form */}
      <h3>Add expense</h3>
      <form onSubmit={handleAdd} style={{ marginBottom: 20 }}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          style={{ marginRight: 8 }}
        />
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          style={{ marginRight: 8, width: 100 }}
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          style={{ marginRight: 8 }}
        >
          <option value="Food">Food</option>
          <option value="Rent">Rent</option>
          <option value="Transport">Transport</option>
          <option value="Other">Other</option>
        </select>
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          style={{ marginRight: 8 }}
        />
        <input
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
          style={{ marginRight: 8, width: 180 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add expense'}
        </button>
      </form>

      {/* summary */}
      <h3>Total expenses: {summary.total.toFixed(2)}</h3>

      <h4>By category</h4>
      <ul>
        {summary.byCategory.map((c) => (
          <li key={c._id}>
            {c._id}: {c.total.toFixed(2)}
          </li>
        ))}
        {summary.byCategory.length === 0 && <li>No data yet</li>}
      </ul>
    </div>
  );
};

export default Dashboard;
