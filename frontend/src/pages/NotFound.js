// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div>
    <h1>404 - Page not found</h1>
    <p>
      Go back to <Link to="/">Dashboard</Link>
    </p>
  </div>
);

export default NotFound;

