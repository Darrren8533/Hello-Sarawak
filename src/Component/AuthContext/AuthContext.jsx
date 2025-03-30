import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({
  isLoggedIn: false,
  userID: null,
  userAvatar: null,
  login: () => {},
  logout: () => {},
  updateAvatar: () => {}
});

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check both localStorage and sessionStorage
    return localStorage.getItem('isLoggedIn') === 'true' || 
           sessionStorage.getItem('persistentLogin') === 'true';
  });
  const [userID, setUserID] = useState(() => localStorage.getItem('userid'));
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('userAvatar'));

  useEffect(() => {
    if (isLoggedIn && userID) {
      // Use both localStorage and sessionStorage for redundancy
      localStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('persistentLogin', 'true');
      localStorage.setItem('userid', userID);
    }
  }, [isLoggedIn, userID]);

  const login = (id, avatar) => {
    setIsLoggedIn(true);
    setUserID(id);
    setUserAvatar(avatar);

    // Persist login across different pages and browser tabs
    localStorage.setItem('userid', id);
    localStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('persistentLogin', 'true');
    
    if (avatar) {
      localStorage.setItem('userAvatar', avatar);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserID(null);
    setUserAvatar(null);

    // Remove all login-related storage
    localStorage.removeItem('userid');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('googleAccessToken');
    
    // Remove session storage item
    sessionStorage.removeItem('persistentLogin');
  };

  const updateAvatar = (newAvatar) => {
    setUserAvatar(newAvatar);
    if (newAvatar) {
      localStorage.setItem('userAvatar', newAvatar);
    } else {
      localStorage.removeItem('userAvatar');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        userID, 
        userAvatar, 
        login, 
        logout, 
        updateAvatar 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
