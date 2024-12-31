import React, { useState, useEffect } from 'react';

const CustomAlert = ({ message, onClose, position }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000); 
      return () => clearTimeout(timer); 
    }
  }, [message]);

  return (
    <div
      className={`fixed ${position} p-2 mb-2 text-white bg-green-100 rounded-lg shadow-lg flex items-center justify-between alert ${isVisible ? 'show' : ''}`}
      style={{ zIndex: 9999 }}
    >
     <span className={'text-green-800'}
      >{message}</span>
      <button onClick={onClose} className="ml-4 text-xl text-green-800">×</button>
    </div>
  );
};

export default CustomAlert;
