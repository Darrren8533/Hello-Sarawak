import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext({
    isLoggedIn: false,
    userID: null,
    userAvatar: null,
    login: () => {},
    logout: () => {},
    updateAvatar: () => {},
});

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userID, setUserID] = useState(null);
    const [userAvatar, setUserAvatar] = useState(null);

    useEffect(() => {
        const storedUserID = localStorage.getItem("userid");
        const storedLoginStatus = localStorage.getItem("isLoggedIn") === "true";
        const storedUserAvatar = localStorage.getItem("userAvatar");

        if (storedLoginStatus && storedUserID) {
            setIsLoggedIn(true);
            setUserID(storedUserID);
            setUserAvatar(storedUserAvatar && storedUserAvatar !== "null" ? storedUserAvatar : null);
        }
    }, []);

    const login = (id, avatar) => {
        setIsLoggedIn(true);
        setUserID(id);
        setUserAvatar(avatar);
        localStorage.setItem("userid", id);
        localStorage.setItem("isLoggedIn", "true");
        avatar && localStorage.setItem("userAvatar", avatar);
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUserID(null);
        setUserAvatar(null);
        ["userid", "isLoggedIn", "userAvatar", "usergroup", "uactivation", "googleAccessToken"].forEach((key) => localStorage.removeItem(key));
    };

    const updateAvatar = (avatar) => {
        setUserAvatar(avatar);
        localStorage.setItem("userAvatar", avatar);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userID, userAvatar, login, logout, updateAvatar }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);