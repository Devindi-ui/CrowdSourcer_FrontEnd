import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainDashboard from './MainDashboard';

const MainDashboardWrapper = () => {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    console.log('Role selected:', role);
    // You can add any additional logic here
  };

  const handleLogout = () => {
    console.log('Logging out...');
    // Clear any additional data if needed
    localStorage.clear(); // Clear all localStorage
    navigate('/login');
  };

  return (
    <MainDashboard 
      onSelectRole={handleSelectRole}
      onLogout={handleLogout}
    />
  );
};

export default MainDashboardWrapper;