import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaBars } from "react-icons/fa";
import { logoutUser, fetchUserData, fetchGoogleUserData } from '../../../Api/api';
import './navbar.css';
import DefaultAvatar from '../../../src/public/avatar.png';
import eventBus from '../EventBus/EventBus';

function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userAvatar, setUserAvatar] = useState(DefaultAvatar);
    const navigate = useNavigate();

    const userID = localStorage.getItem('userID');
    const googleAccessToken = localStorage.getItem('googleAccessToken');

    useEffect(() => {
        const checkLoginStatus = async () => {
            if (userID) {
                try {
                    const response = await fetch(`http://localhost:5000/checkStatus?userID=${userID}`);
                    const data = await response.json();

                    if (data.uStatus === 'login') {
                        setIsLoggedIn(true);

                        let avatarUrl;
                        if (googleAccessToken) {
                            const googleProfile = await fetchGoogleUserData(googleAccessToken);
                            avatarUrl = googleProfile.picture;
                        }

                        const userData = await fetchUserData(userID);
                        if (userData.uImage) {
                            avatarUrl = userData.uImage.startsWith('http') ? userData.uImage : `data:image/jpeg;base64,${userData.uImage}`;
                        } else if (!avatarUrl) {
                            avatarUrl = DefaultAvatar;
                        }

                        setUserAvatar(avatarUrl);
                    } else {
                        setIsLoggedIn(false);
                    }
                } catch (error) {
                    console.error('Error fetching user status:', error);
                }
            }
        };

        checkLoginStatus();
    }, [userID, googleAccessToken]);

    useEffect(() => {
 
        const handleAvatarUpdate = (newAvatar) => {
            setUserAvatar(newAvatar);
        };

        eventBus.on('avatarUpdated', handleAvatarUpdate);

        return () => {
            eventBus.off('avatarUpdated', handleAvatarUpdate);
        };
    }, []);

    const handleLogout = async () => {
        const userID = localStorage.getItem('userID');
        const googleToken = localStorage.getItem('googleAccessToken');

        try {
            if (googleToken) {
                await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${googleToken}`, { method: 'POST' });
            }

            const response = await logoutUser(userID);

            if (response.success) {
                localStorage.clear();
                setIsLoggedIn(false);
                navigate('/');
            } else {
                alert('Failed to logout');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const handleImageError = (e) => {
        e.target.src = DefaultAvatar;
        console.error('Avatar image load error:', e);
    };

    return (
        <div>
            <Helmet>
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/bootstrap/dist/css/bootstrap.min.css"
                />
                <script
                    src="https://cdn.jsdelivr.net/npm/bootstrap/dist/js/bootstrap.bundle.min.js"
                    defer
                />
            </Helmet>

            <nav className="navbar navbar-expand-lg fixed-top">
                <div className="container-fluid">
                    <h1 className="navbar-brand mx-4 mb-0" style={{ fontWeight: 500, color: '#fff', fontSize: '23px', transition: '0.3s color' }}>
                        Hello Sarawak
                    </h1>

                    <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                        <div className="offcanvas-body">
                            <ul className="navbar-nav justify-content-left flex-grow-1 pe-3">
                                <li className="nav-item mx-4">
                                    <Link className="nav-link mx-lg-2" to={isLoggedIn ? '/login/home' : '/'}>
                                        Home
                                    </Link>
                                </li>
                                <li className="nav-item mx-4">
                                    <Link className="nav-link mx-lg-2" to={isLoggedIn ? '/login/product' : '/product'}>
                                        Rooms
                                    </Link>
                                </li>
                                <li className="nav-item mx-4">
                                    <Link className="nav-link mx-lg-2" to={isLoggedIn ? '/login/Cart' : '/Cart'}>
                                        Cart
                                    </Link>
                                </li>
                                <li className="nav-item mx-4">
                                    <Link className="nav-link mx-lg-2" to={isLoggedIn ? '/login/about_us' : '/about_us'}>
                                        About Us
                                    </Link>
                                </li>
                                <li className="nav-item mx-4">
                                    <Link className="nav-link mx-lg-2" to={isLoggedIn ? '/login/about_sarawak' : '/about_sarawak'}>
                                        About Sarawak
                                    </Link>
                                </li>
                                
                                {/* Add the mobile login/profile/logout options */}
                                {isLoggedIn ? (
                                    <>
                                        <li className="nav-item mx-4 mobile-auth-item">
                                            <Link className="nav-link mx-lg-2" to="/login/profile">
                                                My Profile
                                            </Link>
                                        </li>
                                        <li className="nav-item mx-4 mobile-auth-item">
                                            <span 
                                                className="nav-link mx-lg-2 mobile-auth-link" 
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </span>
                                        </li>
                                    </>
                                ) : (
                                    <li className="nav-item mx-4 mobile-auth-item">
                                        <Link className="nav-link mx-lg-2" to="/login">
                                            Login
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end">
                        {isLoggedIn && (
                            <button
                                className="user-icon-button"
                                onClick={() => navigate('/login/profile')}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginRight: '20px' }}
                            >
                                <img
                                    src={userAvatar}
                                    alt="User Avatar"
                                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                    onError={handleImageError}
                                />
                            </button>
                        )}

                        {isLoggedIn ? (
                            <button onClick={handleLogout} className="logout-button">
                                Logout
                            </button>
                        ) : (
                            <Link to="/login" className="login-button">
                                Login
                            </Link>
                        )}

                        <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                            <FaBars size={30} color="#fff" />
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;
