import React from 'react';
import './App.css';
import CustomCalendar from './components/Calendar';
import './index.css';  // or wherever you added the Tailwind CSS

function App() {
  return (
    <div className="App">
      <CustomCalendar />
    </div>
  );
}

export default App;
