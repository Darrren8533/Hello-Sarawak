import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from '../../Component/Sidebar/Sidebar';
import Dashboard from './Modules/Dashboard/Dashboard';
import PropertyListing from './Modules/Property Listing/PropertyListing';
import Reservations from './Modules/Reservations/Reseravtions';
import NoAccess from '../../Component/NoAccess/NoAccess';
import Profile from './Modules/Profile/Profile';
import Profile from './Modules/Audit Trails/AuditTrails';
import { FiCalendar, FiHome, FiUsers } from 'react-icons/fi';
import { CgProfile } from "react-icons/cg";
import { FaHotel } from 'react-icons/fa';
import { MdHistory } from "react-icons/md";
import '../../Component/MainContent/MainContent.css';

  const ModeratorDashboard = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [usergroup, setusergroup] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
    // Initial check
    checkAndRedirect();
  
    const checkInterval = setInterval(() => {
      checkAndRedirect();
    }, 3000); // Check every 3 seconds
  
    // Define the check function
    function checkAndRedirect() {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    const usergroupStatus = localStorage.getItem('usergroup');
    
    setIsLoggedIn(loggedInStatus === 'true');
    setusergroup(usergroupStatus);
    
    if (loggedInStatus !== 'true' || usergroupStatus !== 'Moderator') {
      navigate('/no-access');
    }
  }

      // Clean up interval on unmount
      return () => clearInterval(checkInterval);
  }, [navigate]);

  // Display a loading state until authentication is confirmed
  if (!isLoggedIn || usergroup !== 'Moderator') {
    return <div>Loading...</div>;
  }

  const links = [
    { path: '/moderator_dashboard/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { path: '/moderator_dashboard/property-listing', label: 'PropertyListing', icon: <FaHotel /> },
    { path: '/moderator_dashboard/reservations', label: 'Reservations', icon: <FiCalendar /> },
    { path: '/moderator_dashboard/audit-trails', label: 'AuditTrails', icon: <MdHistory /> },
    { path: '/moderator_dashboard/profile', label: 'Profile', icon: <CgProfile /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        title="Moderator"
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
          <Route path="reservations" element={<Reservations/>} />
          <Route path="audit-trails" element={<AuditTrails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NoAccess />} />
        </Routes>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
