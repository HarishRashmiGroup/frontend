import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomCalendar from './components/Calendar';
import Login from './components/login';
function App() {
  return (
    <div className="App">
      {/* <CustomCalendar /> */}
      <Router>
      <Routes>
        <Route path="/login" element={<Login></Login>}></Route>
        <Route path="/" element={<CustomCalendar/>}></Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
