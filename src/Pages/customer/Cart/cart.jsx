import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaShoppingCart, FaHistory, FaTrash, FaCreditCard, FaCalendarAlt, FaFilter, FaSort, FaExclamationCircle } from 'react-icons/fa';
import { fetchCart, removeReservation, updateReservationStatus } from '../../../../Api/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthProvider } from '../../../Component/AuthContext/AuthContext';
import Navbar from '../../../Component/Navbar/navbar';
import Footer from '../../../Component/Footer/footer';
import Back_To_Top_Button from '../../../Component/Back_To_Top_Button/Back_To_Top_Button';
import TawkMessenger from '../../../Component/TawkMessenger/TawkMessenger';
import Toast from '../../../Component/Toast/Toast';
import './cart.css';

const Cart = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('Latest');
  const [filterStatus, setFilterStatus] = useState('All status');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const taxRate = 0.10;

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('');

  // Display toast message
  const displayToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        const fetchedReservations = await fetchCart();
        setReservations(fetchedReservations);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        displayToast('error', 'Failed to load your reservations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, []);

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };  

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Confirm action before proceeding
  const confirmAction = (action, reservationID) => {
    setActionToConfirm(action);
    setSelectedReservationId(reservationID);
    setShowConfirmModal(true);
  };

  // Execute the confirmed action
  const executeAction = async () => {
    if (!actionToConfirm || !selectedReservationId) return;
    
    try {
      switch(actionToConfirm) {
        case 'pay':
          await handlePaid(selectedReservationId);
          break;
        case 'cancel':
          await handleCancel(selectedReservationId);
          break;
        case 'remove':
          await handleRemove(selectedReservationId);
          break;
        case 'checkout':
          await handleCheckout();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error executing ${actionToConfirm} action:`, error);
    } finally {
      setShowConfirmModal(false);
      setActionToConfirm(null);
      setSelectedReservationId(null);
    }
  };

  // Handle pay for reservation
  const handlePaid = async (reservationID) => {
    try {
      await updateReservationStatus(reservationID, 'Paid');
      
      setReservations(prevReservations =>
        prevReservations.map(reservation =>
          reservation.reservationid === reservationID
            ? { ...reservation, reservationstatus: 'Paid' }
            : reservation
        )
      );

      displayToast('success', 'Your reservation has been paid.');
    } catch (error) {
      console.error('Error paying for reservation:', error);
      displayToast('error', 'Failed to process payment. Please try again.');
    }
  };

  // Handle cancel reservation
  const handleCancel = async (reservationID) => {
    try {
      await updateReservationStatus(reservationID, 'Canceled');
      
      setReservations(prevReservations =>
        prevReservations.map(reservation =>
          reservation.reservationid === reservationID
            ? { ...reservation, reservationstatus: 'Canceled' }
            : reservation
        )
      );

      displayToast('success', 'Your reservation has been canceled.');
    } catch (error) {
      console.error('Error canceling reservation:', error);
      displayToast('error', 'Failed to cancel reservation. Please try again.');
    }
  };

  // Handle remove reservation
  const handleRemove = async (reservationID) => {
    try {
      await removeReservation(reservationID);
      setReservations(prevReservations =>
        prevReservations.filter(reservation => reservation.reservationid !== reservationID)
      );
      displayToast('success', 'Reservation removed from your list.');
    } catch (error) {
      console.error('Error removing reservation:', error);
      displayToast('error', 'Failed to remove reservation. Please try again.');
    }
  };

  const handleCheckout = async () => {
    try {
      // Filter out the reservations that have a status of 'Booking'
      const bookingReservations = reservations.filter(reservation => 
        reservation.reservationstatus === 'Booking');
      
      if (bookingReservations.length === 0) {
        displayToast('info', 'No bookings to checkout.');
        return;
      }
  
      // Update each reservation status to 'Pending' via API
      await Promise.all(
        bookingReservations.map(async (reservation) => {
          await updateReservationStatus(reservation.reservationid, 'Pending');
        })
      );
  
      // Update local state to reflect the 'Pending' status for these reservations
      setReservations(prevReservations =>
        prevReservations.map(reservation =>
          reservation.reservationstatus === 'Booking'
            ? { ...reservation, reservationstatus: 'Pending' }
            : reservation
        )
      );
  
      displayToast('success', 'Your reservations have been checked out. Please wait for the response of the operators.');
    } catch (error) {
      console.error('Error during checkout:', error);
      displayToast('error', 'Checkout process failed. Please try again.');
    }
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const reservationsPerPage = 5;

  // Apply sorting
  const sortedReservations = (() => {
    const sorted = [...reservations];
    if (sortOrder === 'Latest') {
      return sorted.reverse();
    } else if (sortOrder === 'Price High to Low') {
      return sorted.sort((a, b) => b.totalprice - a.totalprice);
    } else if (sortOrder === 'Price Low to High') {
      return sorted.sort((a, b) => a.totalprice - b.totalprice);
    }
    return sorted;
  })();

  const filteredReservations =
    filterStatus === 'All status'
      ? sortedReservations
      : sortedReservations.filter((reservation) => 
        reservation.reservationstatus === filterStatus
      );

  // Pagination
  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = filteredReservations.slice(indexOfFirstReservation, indexOfLastReservation);
  const totalPages = Math.ceil(filteredReservations.length / reservationsPerPage);

  // Calculate cart totals
  const acceptedReservations = reservations.filter(reservation => 
    reservation.reservationstatus === 'Accepted');
  
  const subTotal = acceptedReservations.reduce((acc, reservation) => 
    acc + reservation.totalprice, 0);
  const tax = subTotal * taxRate;
  const total = subTotal + tax;
  
  // Calculate total nights booked
  const totalNights = acceptedReservations.reduce((acc, reservation) => {
    const checkIn = new Date(reservation.checkindatetime);
    const checkOut = new Date(reservation.checkoutdatetime);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return acc + days;
  }, 0);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusIcon = (status) => {
      switch(status.toLowerCase()) {
        case 'pending': return <FaCalendarAlt />;
        case 'canceled': return <FaTrash />;
        case 'rejected': return <FaExclamationCircle />;
        case 'paid': return <FaCreditCard />;
        case 'accepted': return <FaCalendarAlt />;
        default: return null;
      }
    };
    
    return (
      <span className={`status-badge status-${status.toLowerCase()}`}>
        {getStatusIcon(status)} {status}
      </span>
    );
  };

  // Skeleton loader for cart items
  const CartItemSkeleton = () => (
    <div className="cart-item skeleton">
      <div className="row align-items-center">
        <div className="cart-image skeleton-image"></div>
        <div className="col-md-6">
          <h5 className="skeleton-text"></h5>
          <p className="skeleton-text"></p>
          <p className="skeleton-text"></p>
          <p className="skeleton-text"></p>
        </div>
        <div className="cart-price">
          <p className="skeleton-text"></p>
          <div className="skeleton-button"></div>
        </div>
      </div>
    </div>
  );

  // Render confirmation modal
  const ConfirmationModal = () => {
    if (!showConfirmModal) return null;
    
    let title = '';
    let message = '';
    
    switch(actionToConfirm) {
      case 'pay':
        title = 'Confirm Payment';
        message = 'Are you sure you want to mark this reservation as paid?';
        break;
      case 'cancel':
        title = 'Confirm Cancellation';
        message = 'Are you sure you want to cancel this reservation? This action cannot be undone.';
        break;
      case 'remove':
        title = 'Confirm Removal';
        message = 'Are you sure you want to remove this reservation from your list?';
        break;
      case 'checkout':
        title = 'Confirm Checkout';
        message = 'Are you ready to proceed with checkout for all your booking reservations?';
        break;
      default:
        title = 'Confirm Action';
        message = 'Are you sure you want to proceed?';
    }
    
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>{title}</h3>
          <p>{message}</p>
          <div className="modal-actions">
            <button 
              className="modal-button modal-cancel" 
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </button>
            <button 
              className="modal-button modal-confirm" 
              onClick={executeAction}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CartItem = ({ reservation }) => (
    <div className="cart-item" key={reservation.reservationid}>
      <div className="row align-items-center">
        <div className="cart-image">
          {reservation.propertyimage ? (
            <img
              src={`data:image/jpeg;base64,${reservation.propertyimage[0]}`}
              alt={reservation.propertyname}
              loading="lazy"
            />
          ) : (
            <div className="placeholder-image">No Image</div>
          )}
        </div>
        <div className="col-md-6">
          <h5>{reservation.propertyname}</h5>
          <p>
            <FaCalendarAlt className="icon-inline" /> 
            Arrival: {new Date(reservation.checkindatetime).toLocaleDateString()}
          </p>
          <p>
            <FaCalendarAlt className="icon-inline" /> 
            Departure: {new Date(reservation.checkoutdatetime).toLocaleDateString()}
          </p>
          <p>Status: <StatusBadge status={reservation.reservationstatus} /></p>
        </div>
        <div className="cart-price">
          <p>${reservation.totalprice.toFixed(2)}</p>
          <button
            className="btn-action btn-cancel"
            onClick={() => confirmAction('cancel', reservation.reservationid)}
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <AuthProvider>
      <Navbar />
      <br /><br /><br />
      
      {/* Toast notification */}
      {showToast && <Toast message={toastMessage} type={toastType} />}
      
      {/* Confirmation Modal */}
      <ConfirmationModal />
      
      {/* Active Cart Section */}
      <div className="cart-section">
        <div className="reservation-container">
          <div className="section-header">
            <FaShoppingCart className="section-icon" />
            <h2>Your Cart</h2>
          </div>
          
          <div className="cart-row">
            <div className="cart-container">
              {loading ? (
                Array(2).fill().map((_, index) => <CartItemSkeleton key={index} />)
              ) : acceptedReservations.length > 0 ? (
                acceptedReservations.map((reservation) => (
                  <CartItem reservation={reservation} />
                ))
              ) : (
                <div className="empty-cart">
                  <div className="empty-cart-icon">
                    <FaShoppingCart />
                  </div>
                  <p className="empty-cart-text">Your cart is empty</p>
                  <p className="empty-cart-subtext">Add properties to your cart to see them here</p>
                  <Link to={'/product'}>
                    <button className="btn-browse">Browse Properties</button>
                  </Link>
                </div>
              )}
            </div>

            <div className="total-container">
              <div className="cart-total">
                <h4>Cart Summary</h4>
                <div className="cart-summary-item">
                  <span>Total Properties:</span>
                  <span>{acceptedReservations.length}</span>
                </div>
                <div className="cart-summary-item">
                  <span>Total Nights:</span>
                  <span>{totalNights}</span>
                </div>
                <div className="cart-subtotal">
                  <span>Subtotal:</span>
                  <span>${subTotal.toFixed(2)}</span>
                </div>
                <div className="cart-tax">
                  <span>Tax (10%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="cart-finaltotal">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button 
                  className={`checkout-btn ${acceptedReservations.length === 0 ? 'disabled' : ''}`}
                  disabled={acceptedReservations.length === 0}
                  onClick={() => confirmAction('checkout')}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reservations History Section */}
      <div className="cart-section">
        <div className="reservation-container">
          <div className="section-header">
            <FaHistory className="section-icon" />
            <h2>Reservations History</h2>
          </div>
          
          {/* Filter Controls */}
          <div className="filter-cart">
            <div className="filter-item">
              <label htmlFor="sortOrder">
                <FaSort className="filter-icon" /> Sort By:
              </label>
              <select id="sortOrder" value={sortOrder} onChange={handleSortChange}>
                <option value="Latest">Latest First</option>
                <option value="Oldest">Oldest First</option>
                <option value="Price High to Low">Price: High to Low</option>
                <option value="Price Low to High">Price: Low to High</option>
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="filterStatus">
                <FaFilter className="filter-icon" /> Filter By Status:
              </label>
              <select id="filterStatus" value={filterStatus} onChange={handleFilterChange}>
                <option value="All status">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Canceled">Canceled</option>
                <option value="Rejected">Rejected</option>
                <option value="Paid">Paid</option>
                <option value="Accepted">Accepted</option>
              </select>
            </div>
            
            <div className="filter-item">
              <label htmlFor="dateRange">
                <FaCalendarAlt className="filter-icon" /> Date Range:
              </label>
              <select id="dateRange" onChange={() => {}}>
                <option value="all">All Time</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Reservation List */}
          <div className="reservation-list">
            {loading ? (
              Array(3).fill().map((_, index) => <CartItemSkeleton key={index} />)
            ) : currentReservations.length > 0 ? (
              currentReservations.map((reservation) => (
                <div className="reservation-item" key={reservation.reservationid}>
                  <div className="reservation-content">
                    <div className="reservation-image">
                      {reservation.propertyimage ? (
                        <img
                          src={`data:image/jpeg;base64,${reservation.propertyimage[0]}`}
                          alt={reservation.propertyname}
                          loading="lazy"
                        />
                      ) : (
                        <div className="placeholder-image">No Image</div>
                      )}
                    </div>
                    <div className="reservations-content">
                      <h5>{reservation.propertyname}</h5>
                      <p>
                        <FaCalendarAlt className="icon-inline" /> 
                        Check-in: {new Date(reservation.checkindatetime).toLocaleDateString()}
                      </p>
                      <p>
                        <FaCalendarAlt className="icon-inline" /> 
                        Check-out: {new Date(reservation.checkoutdatetime).toLocaleDateString()}
                      </p>
                      <p>Status: <StatusBadge status={reservation.reservationstatus} /></p>
                    </div>
                    <div className="reservation-total">
                      <p>${(reservation.totalprice).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-reservations">
                <div className="empty-cart-icon">
                  <FaHistory />
                </div>
                <p className="empty-cart-text">No reservations found</p>
                <p className="empty-cart-subtext">
                  {filterStatus !== 'All status' 
                    ? `No reservations with status "${filterStatus}"`
                    : "You don't have any reservations yet"}
                </p>
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {currentReservations.length > 0 && (
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <FaArrowLeft/>
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;

                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={index}
                      className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={currentPage === pageNum}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  (pageNum === currentPage - 2 && currentPage > 3) ||
                  (pageNum === currentPage + 2 && currentPage < totalPages - 2)
                ) {
                  return <span key={index} className="pagination-ellipsis">...</span>;
                }
                return null;
              })}
              <button
                className="pagination-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <FaArrowRight/>
              </button>
            </div>
          )}
        </div>
      </div>
      <Back_To_Top_Button />
      <Footer />
      <TawkMessenger />
      </AuthProvider>
    </div>
  );
};

export default Cart;
