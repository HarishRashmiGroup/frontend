import React, { createContext, useContext, useState } from 'react';
import CustomAlert from '../components/CustomAlert'; 

const AlertContext = createContext(undefined);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = (message, type = 'success', title = '') => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type, title }]);
  };

  const hideAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alerts.map(alert => (
        <CustomAlert
          key={alert.id}
          message={alert.message}
          type={alert.type}
          title={alert.title}
          onClose={() => hideAlert(alert.id)}
          position="top-right"
          duration={3000}
        />
      ))}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};