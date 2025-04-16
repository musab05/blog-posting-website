export const SessionManager = {
  setItem: (key, value) => {
    try {
      const data = typeof value === 'object' ? JSON.stringify(value) : value;
      localStorage.setItem(key, data);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  getItem: key => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;

      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error) {
      console.error('Error retrieving from localStorage:', error);
      return null;
    }
  },
  
  removeItem: key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};
