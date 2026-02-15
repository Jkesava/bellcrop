import React, { useState, useContext } from 'react';
import Modal from '../common/Modal';
import { TransactionContext } from '../../context/TransactionContext';

const TransactionItem = ({ transaction }) => {
  const { updateTransaction, deleteTransaction } = useContext(TransactionContext);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [form, setForm] = useState({
    title: transaction.title,
    amount: transaction.amount,
    category: transaction.category,
    date: transaction.date.slice(0, 10),
    notes: transaction.notes || '',
  });

  const id = transaction.id || transaction._id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateTransaction(id, {
      ...form,
      amount: Number(form.amount),
    });
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this transaction?')) return;
    await deleteTransaction(id);
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: 8,
        marginBottom: 8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <div><strong>{transaction.title}</strong></div>
        <div>Amount: {transaction.amount}</div>
        <div>Category: {transaction.category}</div>
        <div>Date: {transaction.date}</div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setIsViewOpen(true)}>View</button>
        <button onClick={() => setIsEditOpen(true)}>Edit</button>
        <button onClick={handleDelete}>Delete</button>
      </div>

      {/* View modal (read‑only) */}
      <Modal
        isOpen={isViewOpen}
        title="Transaction details"
        onClose={() => setIsViewOpen(false)}
      >
        <p><strong>Title:</strong> {transaction.title}</p>
        <p><strong>Amount:</strong> {transaction.amount}</p>
        <p><strong>Category:</strong> {transaction.category}</p>
        <p><strong>Date:</strong> {transaction.date}</p>
        {transaction.notes && <p><strong>Notes:</strong> {transaction.notes}</p>}
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={isEditOpen}
        title="Edit transaction"
        onClose={() => setIsEditOpen(false)}
      >
        <form onSubmit={handleSave}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            style={{ display: 'block', marginBottom: 8, width: '100%' }}
          />
          <input
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            style={{ display: 'block', marginBottom: 8, width: '100%' }}
          />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
            style={{ display: 'block', marginBottom: 8, width: '100%' }}
          />
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            style={{ display: 'block', marginBottom: 8, width: '100%' }}
          />
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Notes"
            style={{ display: 'block', marginBottom: 8, width: '100%' }}
          />
          <button type="submit" style={{ marginRight: 8 }}>
            Save
          </button>
          <button type="button" onClick={() => setIsEditOpen(false)}>
            Cancel
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TransactionItem;

