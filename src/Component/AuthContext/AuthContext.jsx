import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchUserData } from '../Api/api'; // Make sure this path is correct

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

  // This effect fetches the user data including avatar when component mounts or userID changes
  useEffect(() => {
    const fetchAvatar = async () => {
      if (isLoggedIn && userID) {
        try {
          const userData = await fetchUserData(userID);
          if (userData && userData.avatar) {
            updateAvatar(userData.avatar);
          }
        } catch (error) {
          console.error('Error fetching user avatar:', error);
        }
      }
    };
    
    fetchAvatar();
  }, [isLoggedIn, userID]);

  useEffect(() => {
    if (isLoggedIn && userID) {
      // Use both localStorage and sessionStorage for redundancy
      localStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('persistentLogin', 'true');
      localStorage.setItem('userid', userID);
    }
  }, [isLoggedIn, userID]);

  const login = async (id, avatar) => {
    setIsLoggedIn(true);
    setUserID(id);
    
    // Persist login across different pages and browser tabs
    localStorage.setItem('userid', id);
    localStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('persistentLogin', 'true');
    
    // If avatar is provided directly, use it
    if (avatar) {
      setUserAvatar(avatar);
      localStorage.setItem('userAvatar', avatar);
    } else {
      // Otherwise fetch the user data to get the avatar
      try {
        const userData = await fetchUserData(id);
        if (userData && userData.avatar) {
          updateAvatar(userData.avatar);
        }
      } catch (error) {
        console.error('Error fetching user avatar during login:', error);
      }
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
    if (newAvatar) {
      setUserAvatar(newAvatar);
      localStorage.setItem('userAvatar', newAvatar);
    } else {
      setUserAvatar(null);
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
