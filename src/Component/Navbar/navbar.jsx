import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import { logoutUser, fetchUserData } from '../../../Api/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DefaultAvatar from '../../../src/public/avatar.png';
import eventBus from '../EventBus/Eventbus';
import { useAuth } from '../AuthContext/AuthContext';
import './navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const location = useLocation();
    const { isLoggedIn, userAvatar, userID, logout, updateAvatar } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    
    // React Query for user data
    const { data: userData, isLoading: isUserLoading } = useQuery({
        queryKey: ['userData', userID],
        queryFn: () => fetchUserData(userID),
        enabled: !!isLoggedIn && !!userID,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });
    
    // Derived state
    const isCustomer = userData?.usergroup === "Customer";

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const offcanvasElement = document.getElementById('offcanvasNavbar');
      
        if (!offcanvasElement) return;
      
        const handleShow = () => {
            // Storing Scroll Position
            const currentPosition = window.pageYOffset;
            setScrollPosition(currentPosition);
            
            // Add No Scroll
            document.body.classList.add('no-scroll');
            
            document.body.style.top = `-${currentPosition}px`;
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        };
      
        //Remove No Scroll When Close The Menu
        const handleHide = () => {
            const savedPosition = scrollPosition;
            
            document.body.classList.remove('no-scroll');
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            
            window.scrollTo(0, savedPosition);
        };
      
        offcanvasElement.addEventListener('show.bs.offcanvas', handleShow);
        offcanvasElement.addEventListener('hide.bs.offcanvas', handleHide);
      
        return () => {
            offcanvasElement.removeEventListener('show.bs.offcanvas', handleShow);
            offcanvasElement.removeEventListener('hide.bs.offcanvas', handleHide);
        };
    }, [scrollPosition]);
      
    useEffect(() => {
        const initOffcanvas = () => {
            if (typeof bootstrap !== 'undefined') {
                const offcanvasElement = document.getElementById('offcanvasNavbar');
                if (offcanvasElement) {
                    const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement, {
                        backdrop: true,
                        scroll: false
                    });
                }
            }
        };

        const bootstrapReady = setInterval(() => {
            if (typeof bootstrap !== 'undefined') {
                initOffcanvas();
                clearInterval(bootstrapReady);
            }
        }, 100);

        return () => clearInterval(bootstrapReady);
    }, []);

    useEffect(() => {
        const handleAvatarUpdate = (newAvatar) => {
            updateAvatar(newAvatar);
            queryClient.invalidateQueries(['userData', userID]);
        };

        eventBus.on('avatarUpdated', handleAvatarUpdate);

        return () => {
            eventBus.off('avatarUpdated', handleAvatarUpdate);
        };
    }, [updateAvatar, userID, queryClient]);

    useEffect(() => {
        if (userData?.uimage) {
            const avatarUrl = `data:image/jpeg;base64,${userData.uimage}`;
            updateAvatar(avatarUrl);
        }
    }, [userData, updateAvatar]);

    const handleLogout = async () => {
        try {
            const googleToken = localStorage.getItem('googleAccessToken');

            if (googleToken) {
                await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${googleToken}`, { method: 'POST' });
            }

            const response = await logoutUser(userID);

            if (response.success) {
                logout();
                navigate('/');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const handleImageError = (e) => {
        e.target.src = DefaultAvatar;
    };

    const closeOffcanvas = () => {
        if (typeof bootstrap !== 'undefined') {
            const offcanvasElement = document.getElementById('offcanvasNavbar');
            if (offcanvasElement) {
                const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                if (bsOffcanvas) bsOffcanvas.hide();
            }
        }
    };

    // Check if the current path matches the nav link
    const isActive = (path) => {
        return location.pathname === path;
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

            <nav className={`navbar navbar-expand-lg fixed-top`}>
                <div className="container_navbar">
                    <Link to="/" className="navbar-brand-link">
                        <h1 className="navbar_brand">Hello Sarawak</h1>
                    </Link>

                    <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                        <div className="offcanvas-header">
                            <h2 className="offcanvas-title" id="offcanvasNavbarLabel">Hello Sarawak</h2>
                            <button type="button" className="close-btn" data-bs-dismiss="offcanvas" aria-label="Close">
                                <FaTimes className="icon_close"/>
                            </button>
                        </div>
                        <div className="offcanvas-body">
                            <ul className="navbar-nav">
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive(isLoggedIn ? '/home' : '/') ? 'active' : ''}`} 
                                        to={isLoggedIn ? '/home' : '/'} 
                                        onClick={closeOffcanvas}
                                    >
                                        Home
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/product') ? 'active' : ''}`} 
                                        to="/product" 
                                        onClick={closeOffcanvas}
                                    >
                                        Rooms
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/Cart') ? 'active' : ''}`} 
                                        to="/Cart" 
                                        onClick={closeOffcanvas}
                                    >
                                        Cart
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/about_us') ? 'active' : ''}`} 
                                        to="/about_us" 
                                        onClick={closeOffcanvas}
                                    >
                                        About Us
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        className={`nav-link ${isActive('/about_sarawak') ? 'active' : ''}`} 
                                        to="/about_sarawak" 
                                        onClick={closeOffcanvas}
                                    >
                                        About Sarawak
                                    </Link>
                                </li>

                                {/* Mobile login/profile/logout options */}
                                {isLoggedIn && isCustomer ? (
                                    <>
                                        <li className="nav-item mobile-auth-item">
                                            <Link 
                                                className={`nav-link ${isActive('/profile') ? 'active' : ''}`} 
                                                to="/profile"
                                                onClick={closeOffcanvas}
                                            >
                                                My Profile
                                            </Link>
                                        </li>
                                        <li className="nav-item mobile-auth-item">
                                            <span 
                                                className="nav-link mobile-auth-link" 
                                                onClick={() => {
                                                    closeOffcanvas();
                                                    handleLogout();
                                                }}
                                            >
                                                Logout
                                            </span>
                                        </li>
                                    </>
                                ) : (
                                    <li className="nav-item mobile-auth-item">
                                        <Link 
                                            className={`nav-link ${isActive('/login') ? 'active' : ''}`} 
                                            to="/login"
                                            onClick={closeOffcanvas}
                                        >
                                            Login
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="nav-actions">
                        {isLoggedIn && isCustomer && !isUserLoading ? (
                            <button
                                className="user-icon-button"
                                onClick={() => navigate('/profile')}
                                aria-label="User Profile"
                            >
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt="User Avatar"
                                        onError={handleImageError}
                                        key={userAvatar}
                                    />
                                ) : (
                                    <FaUserCircle className="default-avatar" />
                                )}
                            </button>
                        ) : null}
                        
                        {isLoggedIn && isCustomer ? (
                            <button onClick={handleLogout} className="auth-button logout-button">
                                Logout
                            </button>
                        ) : (
                            <Link to="/login" className="auth-button login-button">
                                Login
                            </Link>
                        )}

                        <button 
                            className="navbar-toggler" 
                            type="button" 
                            data-bs-toggle="offcanvas" 
                            data-bs-target="#offcanvasNavbar" 
                            aria-controls="offcanvasNavbar" 
                            aria-label="Toggle navigation"
                        >
                            <FaBars className="icon_navbar"/>
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;
