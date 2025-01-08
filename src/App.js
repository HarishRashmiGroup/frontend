import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import { AlertProvider } from './context/AlertContext';
import CalendarWrapper from './components/CalendarWrapper';

function App() {
  return (
    <AlertProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<CalendarWrapper />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </div>
    </AlertProvider>
  );
}

export default App;