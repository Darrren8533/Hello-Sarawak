import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchUserData } from '../../../Api/api';

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

    return localStorage.getItem('isLoggedIn') === 'true' || 
           sessionStorage.getItem('persistentLogin') === 'true';
  });
  const [userID, setUserID] = useState(() => localStorage.getItem('userid'));
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('userAvatar'));
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);

  // This effect fetches the user data including avatar when component mounts or userID changes
  useEffect(() => {
    const fetchAvatar = async () => {
      if (isLoggedIn && userID && !isLoadingAvatar) {
        setIsLoadingAvatar(true);
        try {
          const userData = await fetchUserData(userID);
          if (userData && userData.avatar) {
            updateAvatar(userData.avatar);
          }
        } catch (error) {
          console.error('Error fetching user avatar:', error);
        } finally {
          setIsLoadingAvatar(false);
        }
      }
    };
    
    fetchAvatar();
  }, [isLoggedIn, userID]);

  useEffect(() => {
    if (isLoggedIn && userID) {
      localStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('persistentLogin', 'true');
      localStorage.setItem('userid', userID);
    }
  }, [isLoggedIn, userID]);

  const login = async (id, avatar = null) => {
    setIsLoggedIn(true);
    setUserID(id);
    
    localStorage.setItem('userid', id);
    localStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('persistentLogin', 'true');
    
    setIsLoadingAvatar(true);
    try {
      const userData = await fetchUserData(id);
      if (userData && userData.avatar) {
        updateAvatar(userData.avatar);
      } 
      
      else if (avatar) {
        updateAvatar(avatar);
      }
    } catch (error) {
      console.error('Error fetching user avatar during login:', error);
      if (avatar) {
        updateAvatar(avatar);
      }
    } finally {
      setIsLoadingAvatar(false);
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
        updateAvatar,
        isLoadingAvatar
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
