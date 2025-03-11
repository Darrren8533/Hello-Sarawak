import React from 'react';
import './Dashboard.css'; 
import { FiHome } from 'react-icons/fi';  
import { NavLink } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div>
      <div className="header-container">
        <h1 className="dashboard-page-title">Dashboard</h1>
      </div>

      <div className="cards-wrapper">
        <div className="card">
          <h2>Customers</h2>
          <p>Recent customers activity</p>
          <div className="card-header">
            <h3>123456</h3>
            <FiHome className="card-icon" />
          </div>
          <NavLink className="btn-card-primary" to="/login/moderator_dashboard/customers">
            View Details
          </NavLink>
        </div>

        <div className="card">
          <h2>Reservations</h2>
          <p>Recent reservations activity</p>
          <div className="card-header">
            <h3>456789</h3>
            <FiHome className="card-icon" />
          </div>
          <NavLink className="btn-card-primary" to="/login/moderator_dashboard/reservations">
            View Details
          </NavLink>
        </div>

        <div className="card">
          <h2>Finances</h2>
          <p>Recent finances activity</p>
          <div className="card-header">
            <h3>999999$</h3>
            <FiHome className="card-icon" />
          </div>
          <NavLink className="btn-card-primary" to="/login/moderator_dashboard/finances">
            View Details
          </NavLink>
        </div>

        <div className="card">
          <h2>Analytics</h2>
          <p>Recent analytics activity</p>
          <div className="card-header">
            <h3>152</h3>
            <FiHome className="card-icon" />
          </div>
          <NavLink className="btn-card-primary" to="/login/moderator_dashboard/analytics">
            View Details
          </NavLink>
        </div>

        <div className="card">
          <h2>Communication Hub</h2>
          <p>Recent hub activity</p>
          <div className="card-header">
            <h3>32</h3>
            <FiHome className="card-icon" />
          </div>
          <NavLink className="btn-card-primary" to="/login/moderator_dashboard/communication-hub">
            View Details
          </NavLink>
        </div>

        <div className="card">
          <h2>Audit Trails</h2>
          <p>Recent audit logs activity</p>
          <div className="card-header">
            <h3>1234</h3>
            <FiHome className="card-icon" />
          </div>
          <NavLink className="btn-card-primary" to="/login/moderator_dashboard/audit-trails">
            View Details
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
