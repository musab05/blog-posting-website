import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionManager } from '@/common/SessionManager';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Add axios configuration
  axios.defaults.baseURL = import.meta.env.VITE_SERVER_DOMAIN;
  axios.defaults.withCredentials = true;

  const verifyToken = async token => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + '/auth/verify',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.valid;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = SessionManager.getItem('token');
      const storedUser = SessionManager.getItem('user');

      if (storedToken && storedUser) {
        const isValid = await verifyToken(storedToken);
        if (isValid) {
          setToken(storedToken);
          setUser(storedUser);
          axios.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${storedToken}`;
        } else {
          // Clear invalid session
          SessionManager.removeItem('token');
          SessionManager.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (jwtToken, userData) => {
    SessionManager.setItem('token', jwtToken);
    SessionManager.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    navigate('/');
  };

  const logout = async () => {
    try {
      await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/auth/signout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      SessionManager.removeItem('token');
      SessionManager.removeItem('user');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      navigate('/signin');
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
