import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import '../../../../Component/MainContent/MainContent.css';
import DashboardCard from '../../../../Component/DashboardCard/DashboardCard';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import UserActivityCell from '../../../../Component/UserActivityCell/UserActivityCell';
import { FaBell, FaEye, FaCheck} from "react-icons/fa";
// import { suggestedReservations } from '../../../../../Api/api'; // Commented out for fake data

const Dashboard = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [pickupData, setPickupData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fake data for testing UI
  const getFakeData = () => {
    return [
      {
        id: 1,
        name: 'John Doe',
        image: '/api/placeholder/40/40',
        checkInDate: '2024-01-15',
        checkOutDate: '2024-01-18',
        status: 'Confirmed',
        email: 'john.doe@email.com',
        phoneNo: '+1234567890',
        propertyID: 'PROP001',
        totalPrice: 250.00,
        request: 'Early check-in requested'
      },
      {
        id: 2,
        name: 'Jane Smith',
        image: '/api/placeholder/40/40',
        checkInDate: '2024-01-16',
        checkOutDate: '2024-01-20',
        status: 'Pending',
        email: 'jane.smith@email.com',
        phoneNo: '+1987654321',
        propertyID: 'PROP002',
        totalPrice: 320.00,
        request: 'Late checkout requested'
      },
      {
        id: 3,
        name: 'Mike Johnson',
        image: '/api/placeholder/40/40',
        checkInDate: '2024-01-17',
        checkOutDate: '2024-01-19',
        status: 'Confirmed',
        email: 'mike.johnson@email.com',
        phoneNo: '+1122334455',
        propertyID: 'PROP003',
        totalPrice: 180.00,
        request: 'Ground floor room preferred'
      },
      {
        id: 4,
        name: 'Sarah Wilson',
        image: '/api/placeholder/40/40',
        checkInDate: '2024-01-18',
        checkOutDate: '2024-01-22',
        status: 'Cancelled',
        email: 'sarah.wilson@email.com',
        phoneNo: '+1556677889',
        propertyID: 'PROP004',
        totalPrice: 400.00,
        request: 'Pet-friendly room needed'
      },
      {
        id: 5,
        name: 'David Brown',
        image: '/api/placeholder/40/40',
        checkInDate: '2024-01-19',
        checkOutDate: '2024-01-21',
        status: 'Confirmed',
        email: 'david.brown@email.com',
        phoneNo: '+1998877665',
        propertyID: 'PROP005',
        totalPrice: 290.00,
        request: 'Airport shuttle required'
      },
      {
        id: 6,
        name: 'Emily Davis',
        image: '/api/placeholder/40/40',
        checkInDate: '2024-01-20',
        checkOutDate: '2024-01-23',
        status: 'Pending',
        email: 'emily.davis@email.com',
        phoneNo: '+1445566778',
        propertyID: 'PROP006',
        totalPrice: 350.00,
        request: 'Business center access needed'
      }
    ];
  };

  const getCurrentUserId = () => {
    return 1; // Placeholder - replace with actual logic
  };

  // Fetch pickup data on component mount
  useEffect(() => {
    fetchPickupData();
  }, []);

  const fetchPickupData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use fake data instead of API call
      const fakeData = getFakeData();
      setPickupData(fakeData);
      
      /* 
      // Original API call code - commented out
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }

      const data = await suggestedReservations(userId);
      
      // Transform the API response to match your component's expected format
      const transformedData = data.map((reservation, index) => ({
        id: reservation.reservationID,
        name: `${reservation.rcFirstName} ${reservation.rcLastName}`,
        image: '/api/placeholder/40/40',
        checkInDate: formatDate(reservation.checkInDateTime),
        checkOutDate: formatDate(reservation.checkOutDateTime),
        status: reservation.reservationStatus,
        email: reservation.rcEmail,
        phoneNo: reservation.rcPhoneNo,
        propertyID: reservation.propertyID,
        totalPrice: reservation.totalPrice,
        request: reservation.request
      }));

      setPickupData(transformedData);
      */
    } catch (err) {
      console.error('Error fetching pickup data:', err);
      setError(err.message || 'Failed to fetch pickup data');
      setPickupData([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    
    // Optionally refresh data when notifications are opened
    if (!showNotifications && pickupData.length === 0) {
      fetchPickupData();
    }
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  const handleAction = (action, pickup) => {
    console.log(`Action: ${action} for pickup:`, pickup);
    if (action === 'view') {
      console.log('Viewing pickup details:', pickup);
    } else if (action === 'pick') {
      console.log('Processing pickup for:', pickup.name);
      // Here you might want to call another API to update the reservation status
      // updateReservationStatus(pickup.id, 'picked_up');
    }
  };

  // Refresh data function (can be called from UI)
  const handleRefresh = () => {
    fetchPickupData();
  };

  const pickupDropdownItems = [
    { label: 'View Details', icon: <FaEye />, action: 'view' },
    { label: 'Pick Up', icon: <FaCheck />, action: 'pick' },
  ];

  const columns = [
    {
      header: 'Guest',
      accessor: 'guest',
      render: (pickup) => (
        <UserActivityCell 
          user={{
            username: pickup.name,
            uimage: pickup.image
          }} 
        />
      ),
    },
    { 
      header: 'Check In', 
      accessor: 'checkInDate',
      render: (pickup) => (
        <span className="date-cell">{pickup.checkInDate}</span>
      )
    },
    { 
      header: 'Check Out', 
      accessor: 'checkOutDate',
      render: (pickup) => (
        <span className="date-cell">{pickup.checkOutDate}</span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (pickup) => (
        <ActionDropdown
          items={pickupDropdownItems}
          onAction={(action) => handleAction(action, pickup)}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="header-container">
        <h1 className="dashboard-page-title">Dashboard</h1>
        <div className="notification-container">
          <div className="notification-badge">
            <FaBell 
              className='notification_icon'
              onClick={toggleNotifications}
            />
            {!loading && (
              <span className="badge-count">{pickupData.length}</span>
            )}
          </div>
          
          {showNotifications && (
            <div className="notification-overlay">
              <div className="notification-content">
                <div className="notification-header">
                  <h3>
                    Pickup Requests 
                    {loading ? ' (Loading...)' : ` (${pickupData.length})`}
                  </h3>
                  <div className="notification-actions">
                    <div className="form-close-button" onClick={closeNotifications}>×</div>
                  </div>
                </div>
                
                <div className="pickup-table-container">
                  {loading ? (
                    <div className="loading-state">
                      <p>Loading pickup requests...</p>
                    </div>
                  ) : error ? (
                    <div className="error-state">
                      <p className="error-message">Error: {error}</p>
                      <button 
                        className="retry-button" 
                        onClick={handleRefresh}
                      >
                        Try Again
                      </button>
                    </div>
                  ) : pickupData.length === 0 ? (
                    <div className="empty-state">
                      <p>No pickup requests found.</p>
                    </div>
                  ) : (
                    <PaginatedTable
                      data={pickupData}
                      columns={columns}
                      rowKey="id"
                      enableCheckbox={false}
                      itemsPerPage={5}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showNotifications && (
        <div 
          className="overlay-backdrop"
          onClick={closeNotifications}
        ></div>
      )}
      
      <DashboardCard />
    </div>
  );
};

export default Dashboard;
