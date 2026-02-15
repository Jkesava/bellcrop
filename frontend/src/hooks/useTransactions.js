import { useState, useEffect, useCallback } from 'react';
import { transactionsAPI } from '../utils/api';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadTransactions = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const res = await transactionsAPI.getAll({ ...filters, page, limit: 20 });
      setTransactions(prev => page === 1 ? res.data.transactions : [...prev, ...res.data.transactions]);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [page]);

  const refresh = () => {
    setPage(1);
    loadTransactions({});
  };

  return { transactions, loadTransactions, refresh, loading, hasMore };
};

