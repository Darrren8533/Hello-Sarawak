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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userID, setUserID] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);

  useEffect(() => {
    const storedUserID = localStorage.getItem('userid');
    const storedLoginStatus = localStorage.getItem('isLoggedIn') === 'true';
    const storedUserAvatar = localStorage.getItem('userAvatar');

    if (storedUserID && storedLoginStatus) {
      setIsLoggedIn(true);
      setUserID(storedUserID);
      setUserAvatar(storedUserAvatar || null);
    }
  }, []);

  const login = (id, avatar) => {
    setIsLoggedIn(true);
    setUserID(id);
    setUserAvatar(avatar);
    
    localStorage.setItem('userid', id);
    localStorage.setItem('isLoggedIn', 'true');
    if (avatar) {
      localStorage.setItem('userAvatar', avatar);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserID(null);
    setUserAvatar(null);
    
    localStorage.removeItem('userid');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('googleAccessToken');
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
