// src/pages/Explorer.js
import React, { useContext } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TransactionContext } from '../context/TransactionContext';
import TransactionItem from '../components/explorer/TransactionItem';

const Explorer = () => {
  const {
    transactions,
    hasMore,
    loadMore,
    searchTerm,
    setSearchTerm,
    category,
    setCategory,
    loading,
  } = useContext(TransactionContext);

  return (
    <div>
      <h1>Transaction Explorer</h1>

      {/* search + filter */}
      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Search by title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Food">Food</option>
          <option value="Rent">Rent</option>
          <option value="Transport">Transport</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* list with infinite scroll */}
      <InfiniteScroll
        dataLength={transactions.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
      >
        {transactions.map((t) => (
          <TransactionItem key={t.id || t._id} transaction={t} />
        ))}
      </InfiniteScroll>

      {!loading && transactions.length === 0 && (
        <p>No transactions found.</p>
      )}
    </div>
  );
};

export default Explorer;
