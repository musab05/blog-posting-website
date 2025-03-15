import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionManager } from '@/common/SessionManager';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = SessionManager.getItem('token');
    if (token) {
      setUser(token);
    }
  }, []);

  const login = token => {
    SessionManager.setItem('token', token);
    setUser(token);
    navigate('/');
  };

  const logout = () => {
    SessionManager.removeItem('token');
    setUser(null);
    navigate('/signin');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
