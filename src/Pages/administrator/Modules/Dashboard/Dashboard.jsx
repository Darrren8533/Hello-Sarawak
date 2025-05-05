import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { FiUsers, FiCalendar, FiDollarSign, FiActivity, FiArrowRight } from 'react-icons/fi';
import { FaBuilding, FaChartLine, FaRegCreditCard, FaChartBar } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  fetchCustomers,
  fetchModerators,
  fetchAdministrators,
  fetchProduct,
  fetchReservation,
  fetchFinance,
  fetchOccupancyRate,
  fetchRevPAR,
  fetchGuestSatisfactionScore
} from '../../../../../Api/api';
import Loader from '../../../../Component/Loader/Loader';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalReservations: 0,
    totalRevenue: 0,
  });

  const [userid, setUserid] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userid');
    if (storedUserId) {
      setUserid(storedUserId);
    }
  }, []);

  // Fetch customers
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  // Fetch moderators
  const { data: moderators = [], isLoading: moderatorsLoading } = useQuery({
    queryKey: ['moderators'],
    queryFn: fetchModerators,
  });

  // Fetch administrators
  const { data: administrators = [], isLoading: administratorsLoading } = useQuery({
    queryKey: ['administrators'],
    queryFn: fetchAdministrators,
  });

  // Fetch properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProduct,
  });

  // Fetch reservations
  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: fetchReservation,
  });

  // Fetch finance data
  const { data: finance = { totalRevenue: 0 }, isLoading: financeLoading } = useQuery({
    queryKey: ['finance', userid],
    queryFn: () => fetchFinance(userid),
    enabled: !!userid,
  });

  // Fetch occupancy rate
  const { data: occupancyRate = { rate: 0 }, isLoading: occupancyRateLoading } = useQuery({
    queryKey: ['occupancyRate', userid],
    queryFn: () => fetchOccupancyRate(userid),
    enabled: !!userid,
  });

  // Fetch RevPAR
  const { data: revPAR = { rate: 0 }, isLoading: revPARLoading } = useQuery({
    queryKey: ['revPAR', userid],
    queryFn: () => fetchRevPAR(userid),
    enabled: !!userid,
  });

  // Fetch guest satisfaction score
  const { data: guestSatisfactionScore = { score: 0 }, isLoading: guestSatisfactionScoreLoading } = useQuery({
    queryKey: ['guestSatisfactionScore', userid],
    queryFn: () => fetchGuestSatisfactionScore(userid),
    enabled: !!userid,
  });

  useEffect(() => {
    if (!customersLoading && !moderatorsLoading && !administratorsLoading && !propertiesLoading && !reservationsLoading && !financeLoading) {
      // Calculate total users
      const totalUsers = (Array.isArray(customers) ? customers.length : 0) + 
                         (Array.isArray(moderators) ? moderators.length : 0) + 
                         (Array.isArray(administrators) ? administrators.length : 0);

      // Set calculated statistics
      setStats({
        totalUsers,
        totalProperties: Array.isArray(properties) ? properties.length : 0,
        totalReservations: Array.isArray(reservations) ? reservations.length : 0,
        totalRevenue: finance?.totalRevenue || 0,
      });
    }
  }, [
    customers, moderators, administrators, properties, reservations, finance,
    customersLoading, moderatorsLoading, administratorsLoading, propertiesLoading, reservationsLoading, financeLoading
  ]);

  console.log(finance);
  console.log(occupancyRate);

  const isLoading = customersLoading || moderatorsLoading || administratorsLoading || 
                   propertiesLoading || reservationsLoading || financeLoading ||
                   occupancyRateLoading || revPARLoading || guestSatisfactionScoreLoading;

  // Format currency for display
  const formatCurrency = (amount) => {
    return `MYR ${amount.toFixed(2)}`;
  };

  // Format percentage for display
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Navigation handlers
  const navigateToDetails = (path) => {
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Overview of your property management system</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span>Total Users</span>
            <div className="stat-icon user-icon">
              <FiUsers />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalUsers}</div>
          <button 
            className="view-details-btn" 
            onClick={() => navigateToDetails('/administrator_dashboard/customers')}
          >
            View Details <FiArrowRight />
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Total Properties</span>
            <div className="stat-icon property-icon">
              <FaBuilding />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalProperties}</div>
          <button 
            className="view-details-btn" 
            onClick={() => navigateToDetails('/administrator_dashboard/property-listing')}
          >
            View Details <FiArrowRight />
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Total Reservations</span>
            <div className="stat-icon reservation-icon">
              <FiCalendar />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalReservations}</div>
          <button 
            className="view-details-btn" 
            onClick={() => navigateToDetails('/administrator_dashboard/reservations')}
          >
            View Details <FiArrowRight />
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Occupancy Rate</span>
            <div className="stat-icon occupancy-icon">
              <FaChartLine />
            </div>
          </div>
          <div className="stat-card-value">{formatPercentage(occupancyRate?.rate || 0)}</div>
          <button 
            className="view-details-btn" 
            onClick={() => navigateToDetails('/administrator_dashboard/finance')}
          >
            View Details <FiArrowRight />
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>RevPAR</span>
            <div className="stat-icon revpar-icon">
              <FaRegCreditCard />
            </div>
          </div>
          <div className="stat-card-value">{formatCurrency(revPAR?.rate || 0)}</div>
          <button 
            className="view-details-btn" 
            onClick={() => navigateToDetails('/administrator_dashboard/finance')}
          >
            View Details <FiArrowRight />
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Total Revenue</span>
            <div className="stat-icon revenue-icon">
              <FiDollarSign />
            </div>
          </div>
          <div className="stat-card-value">{formatCurrency(stats.totalRevenue)}</div>
          <button 
            className="view-details-btn" 
            onClick={() => navigateToDetails('/administrator_dashboard/finance')}
          >
            View Details <FiArrowRight />
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Satisfaction Score</span>
            <div className="stat-icon satisfaction-icon">
              <FaChartBar />
            </div>
          </div>
          <div className="stat-card-value">{guestSatisfactionScore?.score?.toFixed(1) || "0.0"}/5.0</div>
          <button 
            className="view-details-btn" 
            onClick={() => navigateToDetails('/administrator_dashboard/finance')}
          >
            View Details <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
