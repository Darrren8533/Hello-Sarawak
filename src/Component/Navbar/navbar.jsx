import React, { useEffect, useState } from 'react';
 import { Link, useNavigate } from 'react-router-dom';
 import { Helmet } from 'react-helmet';
 import { FaBars, FaTimes } from "react-icons/fa";
 import { logoutUser, fetchUserData } from '../../../Api/api';
 import DefaultAvatar from '../../../src/public/avatar.png';
 import eventBus from '../EventBus/Eventbus';
 import { useAuth } from '../AuthContext/AuthContext';
 import './navbar.css';
 
 function Navbar() {
     const navigate = useNavigate();
     const { isLoggedIn, userAvatar, userID, logout, updateAvatar } = useAuth();
     const [isCustomer, setIsCustomer] = useState(false);
 
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
         };
 
         eventBus.on('avatarUpdated', handleAvatarUpdate);
 
         return () => {
             eventBus.off('avatarUpdated', handleAvatarUpdate);
         };
     }, [updateAvatar]);
 
     useEffect(() => {
         const checkUserGroup = async () => {
             try {
                 const userData = await fetchUserData(userID);
                 // Check if the user group is exactly "Customer"
                 setIsCustomer(userData.usergroup === "Customer");
             } catch (error) {
                 console.error('Error fetching user data:', error);
                 setIsCustomer(false);
             }
         };
 
         // Only check user group if logged in
         if (isLoggedIn) {
             checkUserGroup();
         }
     }, [isLoggedIn, userID]);
 
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
                     <h1 className="navbar_brand mx-4 mb-0">Hello Sarawak</h1>
 
                     <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                         <div className="offcanvas-header">
                             <h2 className="offcanvas-title" id="offcanvasNavbarLabel">Hello Sarawak</h2>
                             <button type="button" className="close-btn" data-bs-dismiss="offcanvas" aria-label="Close">
                                 <FaTimes className="icon_close"/>
                             </button>
                         </div>
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
 
                                 {/* Mobile login/profile/logout options */}
                                 
                                 {isLoggedIn && isCustomer ? (
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
                         
                         {isLoggedIn && isCustomer &&(
                             <button
                                 className="user-icon-button"
                                 onClick={() => navigate('/login/profile')}
                                 style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginRight: '20px' }}
                             >
                                 <img
                                     src={userAvatar || DefaultAvatar}
                                     alt="User Avatar"
                                     style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                     onError={handleImageError}
                                 />
                             </button>
                         )}
 
                         
                         {isLoggedIn && isCustomer ? (
                             <button onClick={handleLogout} className="logout-button">
                                 Logout
                             </button>
                         ) : (
                             <Link to="/login" className="login-button">
                                 Login
                             </Link>
                         )}
 
                         <button 
                             className="navbar-toggler" 
                             type="button" 
                             data-bs-toggle="offcanvas" 
                             data-bs-target="#offcanvasNavbar" 
                             aria-controls="offcanvasNavbar" 
                             style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
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