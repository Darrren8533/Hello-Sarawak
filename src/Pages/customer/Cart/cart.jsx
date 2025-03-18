import React, { useState, useEffect } from 'react';
import Navbar from '../../../Component/Navbar/navbar';
import Footer from '../../../Component/Footer/footer';
import Back_To_Top_Button from '../../../Component/Back_To_Top_Button/Back_To_Top_Button';
import TawkMessenger from '../../../Component/TawkMessenger/TawkMessenger';
import Toast from '../../../Component/Toast/Toast';

import { fetchCart, removeReservation, updateReservationStatus } from '../../../../Api/api';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import './cart.css';

const Cart = () => {
  const [reservations, setReservations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('Latest');
  const [filterStatus, setFilterStatus] = useState('All status');
  const taxRate = 0.10; 

  // Toast Function
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('');

  useEffect(() => {
    const loadReservations = async () => {
      try {
        const fetchedReservations = await fetchCart();
        setReservations(fetchedReservations);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    };

    loadReservations();
  }, []);

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };  

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  // Handle pay for reservation
  const handlePaid = async (reservationID) => {
    try {
      await updateReservationStatus(reservationID, 'Paid');
      
      setReservations(prevReservations =>
        prevReservations.map(reservation =>
          reservation.reservationID === reservationID
            ? { ...reservation, reservationStatus: 'Paid' }
            : reservation
        )
      );

      displayToast('success', 'Your reservation has been paid.');
    } catch (error) {
      console.error('Error pay for reservation:', error);
    }
  };

  // Handle cancel reservation
  const handleCancel = async (reservationID) => {
    try {
      await updateReservationStatus(reservationID, 'Canceled');
      
      setReservations(prevReservations =>
        prevReservations.map(reservation =>
          reservation.reservationID === reservationID
            ? { ...reservation, reservationStatus: 'Canceled' }
            : reservation
        )
      );

      displayToast('success', 'Your reservation has been canceled.');
    } catch (error) {
      console.error('Error canceling reservation:', error);
    }
  };

  // Handle remove reservation
  const handleRemove = async (reservationID) => {
    try {
      await removeReservation(reservationID);
      setReservations(prevReservations =>
        prevReservations.filter(reservation => reservation.reservationID !== reservationID)
      );
    } catch (error) {
      console.error('Error removing reservation:', error);
    }
  };

  const handleCheckout = async () => {
    try {
      // Filter out the reservations that have a status of 'Booking'
      const bookingReservations = reservations.filter(reservation => reservation.reservationStatus === 'Booking');
  
      // Update each reservation status to 'Pending' via API
      await Promise.all(
        bookingReservations.map(async (reservation) => {
          await updateReservationStatus(reservation.reservationID, 'Pending');
        })
      );
  
      // Update local state to reflect the 'Pending' status for these reservations
      setReservations(prevReservations =>
        prevReservations.map(reservation =>
          reservation.reservationStatus === 'Booking'
            ? { ...reservation, reservationStatus: 'Pending' }
            : reservation
        )
      );
  
      displayToast('success', 'Your reservations have been checked out. Please wait for the response of the operators.');
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

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

  const sortedReservations =
    sortOrder === 'Latest' ? [...reservations].reverse() : reservations;

  const filteredReservations =
    filterStatus === 'All status'
      ? sortedReservations
      : sortedReservations.filter((reservation) => 
        reservation.reservationStatus !== 'Accepted' && reservation.reservationStatus === filterStatus
      );

  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = filteredReservations.slice(indexOfFirstReservation, indexOfLastReservation);

  const totalPages = Math.ceil(filteredReservations.length / reservationsPerPage);

  const subTotal = filteredReservations
    .filter((reservation) => reservation.reservationStatus === 'Accepted')
    .reduce((acc, reservation) => acc + reservation.totalPrice, 0);
  const tax = subTotal * taxRate;
  const total = subTotal + tax;

  return (
    <div>
      <Navbar />
      <br /><br /><br />
      <div className="cart-section">
        <div className="reservation-container">
          <h2>Your Cart</h2>
          <div className="cart-row">
            <div className="cart-container">
              {reservations.length > 0 ? (
                reservations
                  .filter((reservation) => reservation.reservationStatus === 'Accepted')
                  .map((reservation) => (
                    <div className="cart-item" key={reservation.reservationID}>
                      <div className="row align-items-center">
                        <div className="cart-image">
                          {reservation.propertyImage ? (
                            <img
                              src={`data:image/jpeg;base64,${reservation.propertyImage[0]}`}
                              alt={reservation.propertyName}
                            />
                          ) : (
                            <p>Image not available</p>
                          )}
                        </div>
                        <div className="col-md-6">
                          <h5>{reservation.propertyName}</h5>
                          <p>Arrival Date: {new Date(reservation.checkInDateTime).toLocaleDateString()}</p>
                          <p>Departure Date: {new Date(reservation.checkOutDateTime).toLocaleDateString()}</p>
                          <p>Status:    
                            <span className={`cart-status status-${(reservation.reservationStatus).toLowerCase()}`}>
                              {reservation.reservationStatus}
                            </span>
                          </p>
                        </div>
                        <div className="cart-price">
                          <p>${reservation.totalPrice.toFixed(2)}</p>
                          {reservation.reservationStatus === 'Accepted' && (
                            <button
                              className="remove-btn"
                              onClick={() => handleCancel(reservation.reservationID)}
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className='no_reservation_text'>No reservations available.</p>
              )}
            </div>

            <div className="total-container">
              <div className="cart-total">
                <h4>Cart Total</h4>
                <div className="cart-subtotal">
                  <span>Subtotal:</span>
                  <span>${subTotal.toFixed(2)}</span>
                </div>
                <div className="cart-tax">
                  <span>Tax (10%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <hr />
                <div className="cart-finaltotal">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button className="checkout-btn">Proceed to Checkout</button>
              </div>
            </div>
          </div>
        </div>
      </div>
  

      <div className="cart-section">
        <div className="reservation-container">
          <h2>Reservations</h2>
          <div className="cart-row">
            <div className="filter-cart">
              <div>
                <label htmlFor="sortOrder">Sort : </label>
                <select id="sortOrder" value={sortOrder} onChange={handleSortChange}>
                  <option value="Latest">Latest</option>
                  <option value="Oldest">Oldest</option>
                </select>
              </div>

              <div>
                <label htmlFor="filterStatus">Filter : </label>
                <select id="filterStatus" value={filterStatus} onChange={handleFilterChange}>
                  <option value="All status">All status</option>
                  <option value="Pending">Pending</option>
                  <option value="Canceled">Canceled</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="reservation-container">
              {currentReservations.length > 0 ? (
                currentReservations
                .filter((reservation) => reservation.reservationStatus !== 'Accepted')
                .map((reservation) => (
                  <div className="reservation-item" key={reservation.reservationID}>
                    <div className="reservation-content">
                      <div className="reservation-image">
                        {reservation.propertyImage ? (
                          <img
                            src={`data:image/jpeg;base64,${reservation.propertyImage[0]}`}
                            alt={reservation.propertyName}
                          />
                        ) : (
                          <p>Image not available</p>
                        )}
                      </div>
                      <div className="reservations-content">
                        <h5>{reservation.propertyName}</h5>
                        <p>Arrival Date:{new Date(reservation.checkInDateTime).toLocaleDateString()}</p>
                        <p>Departure Date:{new Date(reservation.checkOutDateTime).toLocaleDateString()}</p>
                        <p>Status:    
                          <span className={`cart-status status-${(reservation.reservationStatus).toLowerCase()}`}>
                            {reservation.reservationStatus}
                          </span>
                        </p>
                      </div>
                      <div className="reservation-total ">
                        <p>${(reservation.totalPrice).toFixed(2)}</p>
                        {reservation.reservationStatus !== 'Canceled' && reservation.reservationStatus !== 'Rejected' && (
                          <div className="reservation-btn">
                            <button
                              className="cancel-btn"
                              onClick={() => handleCancel(reservation.reservationID)}
                            >
                              Cancel Booking
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No reservations available.</p>
              )}
            </div>
          </div>

          {/* Pagination Controls */}
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
                return (
                  <button
                    key={index}
                    className={`pagination-button ${currentPage === pageNum ? 'disabled' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={currentPage === pageNum}
                  >
                    {pageNum}
                  </button>
                );
            })}
            <button
              className="pagination-button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <FaArrowRight/>
            </button>
          </div>
        </div>
      </div>
      <Back_To_Top_Button />
      <Footer />
      <TawkMessenger />
    </div>
  );
};

export default Cart;
