import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from '../../Component/Sidebar/Sidebar';
import Dashboard from './Modules/Dashboard/Dashboard';
import PropertyListing from './Modules/Property Listing/PropertyListing';
import Administrators from './Modules/Administrators/Administrators';
import Moderators from './Modules/Moderators/Moderators';
import Customers from './Modules/Customers/Customers';
import Reservations from './Modules/Reservations/Reservations';
import BooknPayLog from './Modules/BooknPay Log/BooknPayLog';
import Finance from './Modules/Finance/Finances';
import NoAccess from '../../Component/NoAccess/NoAccess';
import Profile from './Modules/Profile/Profile';
import { FiHome, FiUsers, FiCalendar } from 'react-icons/fi';
import { GoLog } from "react-icons/go";
import { FaUserTie, FaHotel } from 'react-icons/fa';
import { FaBuildingUser } from "react-icons/fa6";
import { VscGraphLine } from "react-icons/vsc";
import { CgProfile } from "react-icons/cg";
import '../../Component/MainContent/MainContent.css';

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usergroup, setusergroup] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    const usergroupStatus = localStorage.getItem('usergroup');

    setIsLoggedIn(loggedInStatus === 'true');
    setusergroup(usergroupStatus);

    // Redirect to NoAccess page if not logged in or usergroup is not 'Administrator'
    if (loggedInStatus !== 'true' || usergroupStatus !== 'Administrator') {
      navigate('/no-access');
    }
  }, [navigate]);

  // Display a loading state until authentication is confirmed
  if (!isLoggedIn || usergroup !== 'Administrator') {
    return <div>Loading...</div>;
  }

  const links = [
    { path: '/login/administrator_dashboard/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { path: '/login/administrator_dashboard/customers', label: 'Customer', icon: <FiUsers /> },
    { path: '/login/administrator_dashboard/moderators', label: 'Moderator', icon: <FaBuildingUser  /> },
    { path: '/login/administrator_dashboard/administrators', label: 'Administrator', icon: <FaUserTie /> },
    { path: '/login/administrator_dashboard/property-listing', label: 'PropertyListing', icon: <FaHotel />},
    { path: '/login/administrator_dashboard/reservations', label: 'Reservation', icon: <FiCalendar /> },
    { path: '/login/administrator_dashboard/booknpay-log', label: 'BooknPayLog', icon: <GoLog /> },
    { path: '/login/administrator_dashboard/finance', label: 'Finance', icon: <VscGraphLine /> },
    { path: '/login/administrator_dashboard/profile', label: 'Profile', icon: <CgProfile /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        title="Administrator"
        links={links}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        handleLogout={handleLogout}
      />
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="property-listing" element={<PropertyListing />} />
          <Route path="administrators" element={<Administrators />} />
          <Route path="moderators" element={<Moderators />} />
          <Route path="customers" element={<Customers />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="booknpay-log" element={<BooknPayLog />} />
          <Route path="finance" element={<Finance />} />
          <Route path="profile" element={<Profile />} /> 
          <Route path="*" element={<NoAccess />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
