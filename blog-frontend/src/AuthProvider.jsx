import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionManager } from '@/common/SessionManager';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = SessionManager.getItem('token');
    const storedUser = SessionManager.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
     setIsLoading(false);
  }, []);

  const login = (jwtToken, userData) => {
    SessionManager.setItem('token', jwtToken);
    SessionManager.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    navigate('/');
  };

  const logout = () => {
    SessionManager.removeItem('token');
    SessionManager.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/signin');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
