import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthProvider';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [hasNotification, setHasNotification] = useState(false);
  const { user, token } = useAuth();

  const fetchUserNotifications = async () => {
    try {
      if (!token) return;
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/notifications`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      const unreadNotifications = response.data.filter(n => !n.isRead);
      setHasNotification(unreadNotifications.length > 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchUserNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{ hasNotification, setHasNotification, fetchUserNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
