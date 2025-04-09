
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPages';
import UsersPage from './pages/UserPage';

const App = () => {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/users" element={token ? <UsersPage /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
