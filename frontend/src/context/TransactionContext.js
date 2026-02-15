import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { transactionsAPI } from '../utils/api';

export const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
  // data
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);

  // pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // filters
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');

  // ui
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const buildParams = useCallback(
    (override = {}) => ({
      page,
      limit: 20,
      search: searchTerm || undefined,
      category: category || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      minAmount: minAmount || undefined,
      ...override,
    }),
    [page, searchTerm, category, dateFrom, dateTo, minAmount]
  );

  const fetchTransactions = useCallback(
    async (overrideParams = {}) => {
      setLoading(true);
      setError('');
      try {
        const params = buildParams(overrideParams);
        const res = await transactionsAPI.getAll(params);
        const { transactions: list, total: count, hasMore: more } = res.data;

        if (params.page === 1 || overrideParams.reset) {
          setTransactions(list);
        } else {
          setTransactions((prev) => [...prev, ...list]);
        }

        setTotal(count);
        setHasMore(more);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.msg || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    },
    [buildParams]
  );

  // initial load
  useEffect(() => {
    fetchTransactions({ page: 1, reset: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // reload when filters change
  useEffect(() => {
    setPage(1);
    fetchTransactions({ page: 1, reset: true });
  }, [searchTerm, category, dateFrom, dateTo, minAmount]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchTransactions({ page: nextPage });
  };

  // CRUD
  const addTransaction = async (data) => {
    const res = await transactionsAPI.create(data);
    setTransactions((prev) => [res.data, ...prev]);
    setTotal((prev) => prev + 1);
  };

  const updateTransaction = async (id, data) => {
    const res = await transactionsAPI.update(id, data);
    setTransactions((prev) =>
      prev.map((t) => (t.id === id || t._id === id ? res.data : t))
    );
  };

  const deleteTransaction = async (id) => {
    await transactionsAPI.delete(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id && t._id !== id));
    setTotal((prev) => Math.max(prev - 1, 0));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        total,
        page,
        hasMore,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        category,
        setCategory,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        minAmount,
        setMinAmount,
        clearFilters,
        fetchTransactions,
        loadMore,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
