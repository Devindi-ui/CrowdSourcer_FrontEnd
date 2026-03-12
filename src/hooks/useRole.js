import { useLocation } from 'react-router-dom';

const useRole = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Get role from URL path
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/passenger')) return 'passenger';
  if (path.startsWith('/driver')) return 'driver';
  if (path.startsWith('/owner')) return 'owner';
  
  // Fallback to localStorage
  return localStorage.getItem('role') || 'passenger';
};

export default useRole;