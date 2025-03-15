export const SessionManager = {
  setItem: (key, value) => {
    try {
      const data = typeof value === 'object' ? JSON.stringify(value) : value;
      sessionStorage.setItem(key, data);
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  },

  getItem: key => {
    try {
      const data = sessionStorage.getItem(key);
      if (!data) return null;

      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error) {
      console.error('Error retrieving from sessionStorage:', error);
      return null;
    }
  },

  removeItem: key => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
    }
  },

  clear: () => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  },
};
