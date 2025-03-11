import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { IoIosArrowDown, IoIosArrowUp, IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import Navbar from '../../../Component/Navbar/navbar';
import Footer from '../../../Component/Footer/footer';
import Reviews from "../../../Component/Reviews/Reviews";
import { createReservation, requestBooking } from '../../../../Api/api';
import './PropertyDetails.css';
import { FaWifi, FaParking, FaSwimmingPool, FaHotTub, FaTv, FaUtensils, FaSnowflake, FaPaw, FaSmokingBan, FaFireExtinguisher, FaFirstAid, FaShower, FaCoffee, FaUmbrellaBeach, FaBath, FaWind, FaFan, FaCar, FaBicycle, FaBabyCarriage, FaKey, FaLock, FaBell, FaMapMarkerAlt, FaTree, FaMountain, FaCity } from "react-icons/fa";

const facilities = [
    { name: "Wi-Fi", icon: <FaWifi /> },
    { name: "Parking", icon: <FaParking /> },
    { name: "Swimming Pool", icon: <FaSwimmingPool /> },
    { name: "Hot Tub", icon: <FaHotTub /> },
    { name: "TV", icon: <FaTv /> },
    { name: "Kitchen", icon: <FaUtensils /> },
    { name: "Air Conditioning", icon: <FaSnowflake /> },
    { name: "Pets Allowed", icon: <FaPaw /> },
    { name: "No Smoking", icon: <FaSmokingBan /> },
    { name: "Fire Extinguisher", icon: <FaFireExtinguisher /> },
    { name: "First Aid Kit", icon: <FaFirstAid /> },
    { name: "Shower", icon: <FaShower /> },
    { name: "Coffee Maker", icon: <FaCoffee /> },
    { name: "Beach Access", icon: <FaUmbrellaBeach /> },
    { name: "Bathtub", icon: <FaBath /> },
    { name: "Heating", icon: <FaWind /> },
    { name: "Ceiling Fan", icon: <FaFan /> },
    { name: "Free Parking", icon: <FaCar /> },
    { name: "Bicycle Rental", icon: <FaBicycle /> },
    { name: "Baby Crib", icon: <FaBabyCarriage /> },
    { name: "Keyless Entry", icon: <FaKey /> },
    { name: "Safe", icon: <FaLock /> },
    { name: "Security Alarm", icon: <FaBell /> },
    { name: "Nearby Attractions", icon: <FaMapMarkerAlt /> },
    { name: "Garden", icon: <FaTree /> },
    { name: "Mountain View", icon: <FaMountain /> },
    { name: "City View", icon: <FaCity /> },
];

const PropertyDetails = () => {
  const location = useLocation();
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { propertyID } = useParams();
  const { propertyDetails } = location.state || {};
  const [bookingData, setBookingData] = useState({
    arrivalDate: '',
    departureDate: '',
    adults: 1,
    children: 0,
  });
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isEditingGuests, setIsEditingGuests] = useState(false);
  const [totalNights, setTotalNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingForm, setBookingForm] = useState({
    title: 'Mr.',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    additionalRequests: ''
  });
  const navigate = useNavigate();

  const facilitiesArray = propertyDetails?.facilities
  ? propertyDetails.facilities.split(",") 
  : [];


  const toggleFacilities = () => {
    setShowAllFacilities(!showAllFacilities);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'arrivalDate' || name === 'departureDate') {
      calculateTotalPrice(
        name === 'arrivalDate' ? value : bookingData.arrivalDate,
        name === 'departureDate' ? value : bookingData.departureDate
      );
    }
  };

  const handleGuestChange = (type, operation) => {
    setBookingData(prev => ({
      ...prev,
      [type]: operation === 'add' 
        ? prev[type] + 1 
        : Math.max(type === 'adults' ? 1 : 0, prev[type] - 1)
    }));
  };

  const getTotalGuests = () => {
    const { adults, children } = bookingData;
    let guestText = `${adults + children} pax`;
    return guestText;
  };

  const handleImageClick = () => {
    setShowAllPhotos(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
    document.body.style.overflow = 'auto';
  };

  const handleShowAllPhotos = () => {
    setShowAllPhotos(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseAllPhotos = () => {
    setShowAllPhotos(false);
    document.body.style.overflow = 'auto';
  };

  const handleBookNowClick = (e) => {
    e.preventDefault();
    setShowBookingForm(true);
  };

  const handlePhotoClick = (index) => {
    setSelectedImageIndex(index);
    setIsFullscreen(true);
    document.body.style.overflow = 'hidden';
  };

  const calculateTotalPrice = (arrival, departure) => {
    if (arrival && departure) {
      const start = new Date(arrival);
      const end = new Date(departure);
      const nights = Math.floor((end - start) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        setTotalNights(nights);
        const basePrice = propertyDetails?.rateAmount * nights;
        const taxes = basePrice * 0.1;
        setTotalPrice(basePrice + taxes);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    console.log('Starting...');

    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please Login First');
      return;
    }

    if (!bookingForm.firstName || !bookingForm.lastName || !bookingForm.email || !bookingForm.phoneNumber) {
      alert('Please Fill All Required Fields');
      return;
    }

    if (!bookingData.arrivalDate || !bookingData.departureDate) {
      alert('Please Select Check-in and Check-out Dates');
      return;
    }

    try {
      console.log('...', {
        bookingForm,
        bookingData,
        propertyDetails
      });

      const reservationData = {
        propertyID: propertyDetails.propertyID,
        checkInDateTime: bookingData.arrivalDate,
        checkOutDateTime: bookingData.departureDate,
        reservationBlockTime: new Date(new Date(bookingData.arrivalDate) - 3 * 24 * 60 * 60 * 1000).toISOString(),
        request: bookingForm.additionalRequests || '',
        totalPrice: totalPrice,
        rcFirstName: bookingForm.firstName,
        rcLastName: bookingForm.lastName,
        rcEmail: bookingForm.email,
        rcPhoneNo: bookingForm.phoneNumber,
        rcTitle: bookingForm.title,
        adults: bookingData.adults,
        children: bookingData.children,
        userID: parseInt(userID),
        //reservationPaxNo: parseInt(bookingData.adults) + parseInt(bookingData.children),
        reservationStatus: 'Pending'
      };


      const createdReservation = await createReservation(reservationData);

      if (!createdReservation || !createdReservation.reservationID) {
        throw new Error('Failed to create reservation: No valid reservation ID received');
      }

      await requestBooking(createdReservation.reservationID);
      console.log('Booking request sent');

      alert('Reservation added to cart');
      setShowBookingForm(false);
      navigate('/cart');
    } catch (error) {
      console.error('Reservation error:', error);
      alert(`Failed to add to cart: ${error.message}`);
    }
  };

  const fetchUserInfo = async () => {
    const userID = localStorage.getItem('userID');
    if (!userID) return;

    try {
      const response = await fetch(`http://localhost:5000/getUserInfo/${userID}`);
      if (!response.ok) {
        throw new Error('Failed to get user information');
      }

      const userData = await response.json();
      console.log('User information:', userData); 
      
      setBookingForm(prev => ({
        ...prev,
        title: userData.uTitle || 'Mr.',
        firstName: userData.uFirstName || '',
        lastName: userData.uLastName || '',
        email: userData.uEmail || '',
        phoneNumber: userData.uPhoneNo || '',
        additionalRequests: '' 
      }));
    } catch (error) {
      console.error('Failed to get user information:', error);
    }
  };

  useEffect(() => {
    if (showBookingForm) {
      fetchUserInfo();
    }
  }, [showBookingForm]);

  return (
    <div className="property-details-page">
      {!showAllPhotos && !isFullscreen && !showBookingForm ? (
        <>
          <Navbar />
          <div className="property-details-container">
            <h1 className="property-title">{propertyDetails?.propertyName}</h1>
            <div className="gallery-section">
              <div className="gallery-grid">
                <div className="gallery-main">
                  {propertyDetails?.propertyImage && propertyDetails.propertyImage.length > 0 && (
                    <img 
                      src={`data:image/jpeg;base64,${propertyDetails.propertyImage[0]}`} 
                      alt="main image"
                      onClick={handleImageClick}
                    />
                  )}
                </div>
                <div className="gallery-secondary">
                  {propertyDetails?.propertyImage && 
                    propertyDetails.propertyImage.slice(1, 5).map((image, index) => (
                      <div key={index} className="gallery-item">
                        <img 
                          src={`data:image/jpeg;base64,${image}`} 
                          alt={`${index + 1}`}
                          onClick={handleImageClick}
                        />
                        {index === 3 && (
                          <button 
                            className="show-all-photos"
                            onClick={handleShowAllPhotos}
                          >
                            <span className="show-all-photos-icon">
                              <svg viewBox="0 0 16 16" width="16" height="16">
                                <path d="M1 3h14v10H1V3zm1 1v8h12V4H2zm1 1h4v3H3V5zm0 4h4v3H3V9zm5-4h4v3H8V5zm0 4h4v3H8V9z" fill="currentColor"/>
                              </svg>
                            </span>
                            Show all photos
                          </button>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            {isFullscreen && (
               <div className="fullscreen-overlay">
               <button className="fullscreen-close-btn" onClick={handleCloseFullscreen}>
                 ✕
               </button>
               <button 
                  className="fullscreen-nav-btn prev-btn"
                  onClick={() => setSelectedImageIndex((prev) => 
                    prev === 0 ? propertyDetails.propertyImage.length - 1 : prev - 1
                  )}
                >
                  ❮
                </button>

                <img 
                  src={`data:image/jpeg;base64,${propertyDetails.propertyImage[selectedImageIndex]}`}
                  alt={`fullscreen image ${selectedImageIndex + 1}`}
                  className="fullscreen-image"
                />

                <button 
                  className="fullscreen-nav-btn next-btn"
                  onClick={() => setSelectedImageIndex((prev) => 
                    prev === propertyDetails.propertyImage.length - 1 ? 0 : prev + 1
                  )}
                >
                  ❯
                </button>
             </div>
            )}

            <div className="content-section">
              <div className="left-content">
                <div className="property-features">
                  <h2>{propertyDetails?.propertyLocation}</h2>
                  <h2>{propertyDetails?.propertyGuestPaxNo}  -  {propertyDetails?.propertyBedType} bed</h2>
                </div>
                <hr/>
                <div className="property-features">
                  <h2>Hosted by {propertyDetails?.username || "Unknown Host"}</h2>
                </div>
                <hr/>
                <div className="property-features">
                  <h2>Description</h2>
                  <p>{propertyDetails?.propertyDescription}</p>
                </div>
                <hr/>
                <div className="property-features">
                  <h2>What this place offers</h2>
                  <div className="facilities-list">
                    {(showAllFacilities ? facilitiesArray : facilitiesArray.slice(0, 10)).map((facilityName, index) => {
                        const facility = facilities.find(f => f.name === facilityName.trim());
                        return (
                            <div key={index} className="facility-item">
                                {facility ? facility.icon : null}
                                <span>{facilityName.trim()}</span>
                            </div>
                        );
                    })}
                  </div>

                  {facilitiesArray.length > 10 && (
                    <button className="show-all-Facilities" onClick={toggleFacilities}>
                        {showAllFacilities ? "Show Less" : "Show All Facilities"}
                    </button>
                  )}
                </div>
              </div>

              <div className="right-content">
                <div className="booking-section">
                  <h2>Booking Information</h2>
                  <div className="price-info">
                    <h3>${propertyDetails?.rateAmount} <span>/night</span></h3>
                  </div>
                  
                  <form className="booking-form" onSubmit={handleBookNowClick}>
                    <div className="date-inputs">
                      <div className="input-group">
                        <label>CHECK-IN</label>
                        <input 
                          type="date" 
                          name="arrivalDate"
                          value={bookingData.arrivalDate}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="input-group">
                        <label>CHECKOUT</label>
                        <input 
                          type="date" 
                          name="departureDate"
                          value={bookingData.departureDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    

                    <button type="submit" className="book-now-btn">
                      Book Now
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <hr/>
            <div classname="content-section">
              <Reviews />
            </div>
            <hr/>
          </div>

          <Footer />
        </>
      ) : (
        <div className="booking-overlay">
          <div className="booking-modal">
            <div className="booking-header">
              <button className="back-button" onClick={() => setShowBookingForm(false)}>
                <span><IoReturnUpBackOutline/></span> Request to book
              </button>
            </div>

            <div className="booking-content">
              <div className="booking-left">
                <div className="trip-section">
                  <h2>Your trip</h2>

                  <br/>
                  
                  <div className="trip-dates">
                    <div className="section-header">
                      <h3>Dates</h3>
                      <button 
                        className="edit-button"
                        onClick={() => setIsEditingDates(!isEditingDates)}
                      >
                        Edit
                      </button>
                    </div>
                    {isEditingDates ? (
                      <div className="dates-editor">
                        <div className="date-input-group">
                          <label>Check-in</label>
                          <input 
                            type="date" 
                            value={bookingData.arrivalDate}
                            onChange={handleInputChange}
                            name="arrivalDate"
                          />
                        </div>
                        <div className="date-input-group">
                          <label>Check-out</label>
                          <input 
                            type="date" 
                            value={bookingData.departureDate}
                            onChange={handleInputChange}
                            name="departureDate"
                          />
                        </div>
                      </div>
                    ) : (
                      <p>{bookingData.arrivalDate} - {bookingData.departureDate}</p>
                    )}
                  </div>

                  <br/>

                  
                </div>

                <div className="login-section">
                <div className="guest-details-section">
                  <h2>Guest details</h2>
                  <div className="form-grid">
                    <div className="form-group title-group">
                      <label>Title</label>
                      <div className="title-options">
                        <label className="radio-label">
                          <input 
                            type="radio" 
                            name="title" 
                            value="Mr." 
                            checked={bookingForm.title === 'Mr.'} 
                            onChange={handleFormChange}
                          />
                          <span>Mr.</span>
                        </label>
                        <label className="radio-label">
                          <input 
                            type="radio" 
                            name="title" 
                            value="Mrs." 
                            checked={bookingForm.title === 'Mrs.'} 
                            onChange={handleFormChange}
                          />
                          <span>Mrs.</span>
                        </label>
                        <label className="radio-label">
                          <input 
                            type="radio" 
                            name="title" 
                            value="Ms." 
                            checked={bookingForm.title === 'Ms.'} 
                            onChange={handleFormChange}
                          />
                          <span>Ms.</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>First name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={bookingForm.firstName}
                        onChange={handleFormChange}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Last name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={bookingForm.lastName}
                        onChange={handleFormChange}
                        placeholder="Enter your last name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={bookingForm.email}
                        onChange={handleFormChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={bookingForm.phoneNumber}
                        onChange={handleFormChange}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Additional requests</label>
                      <textarea
                        name="additionalRequests"
                        value={bookingForm.additionalRequests}
                        onChange={handleFormChange}
                        placeholder="Any special requests?"
                        rows="4"
                      />
                    </div>
                  </div>
                </div><br/><br/>
                <button className="continue-button" onClick={handleAddToCart}>Add to Cart</button>

                <div className="divider">or</div>

                <div className="social-buttons">
                  <button className="social-button google">
                    <FcGoogle />
                    Continue with Google
                  </button>
                </div>
              </div>
              </div>

              <div className="booking-right">
                <div className="property-card">
                  <img 
                    src={`data:image/jpeg;base64,${propertyDetails?.propertyImage[0]}`} 
                    alt={propertyDetails?.propertyName}
                  />
                  <div className="property-info">
                    <h3>{propertyDetails?.propertyName}</h3>
                  </div>
                </div>

                {totalNights > 0 && (
                <div className="price-details">
                  <h3>Price details</h3>
                  <div className="price-breakdown">
                    <div className="price-row">
                    <span>RM {propertyDetails?.rateAmount} × {totalNights} night</span>
                    <span>RM{propertyDetails?.rateAmount * totalNights}</span>
                    </div>
                    <div className="price-row">
                      <span>Taxes (10%)</span>
                      <span>RM{Math.floor(propertyDetails?.rateAmount * totalNights * 0.1)}</span>
                    </div>
                    <div className="price-total">
                      <span>Total (MYR)</span>
                      <span>RM{totalPrice}</span>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAllPhotos && (
        <div className="all-photos-view">
          <div className="photos-header">
            <button className="back-button" onClick={handleCloseAllPhotos}>
              <span><IoReturnUpBackOutline/></span>
            </button>
            <div className="header-actions">
            </div>
          </div>
          
          <div className="photos-grid">

            <div className="photos-container">
              {propertyDetails?.propertyImage?.map((image, index) => (
                <div key={index} className="photo-section">
                  <img src={`data:image/jpeg;base64,${image}`} alt={`Property image ${index + 1}`}
                    onClick={() => handlePhotoClick(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isFullscreen && (
        <div className="fullscreen-overlay">
          <div className="fullscreen-header">
            <button className="close-btn" onClick={handleCloseFullscreen}>
              X 
            </button>
            <div className="image-counter">
              {selectedImageIndex + 1} / {propertyDetails.propertyImage.length}
            </div>
            <div className="header-actions">
            </div>
          </div>

          <div className="fullscreen-content">
            <button 
              className="nav-btn prev-btn"
              onClick={() => setSelectedImageIndex((prev) => 
                prev === 0 ? propertyDetails.propertyImage.length - 1 : prev - 1
              )}
            >
              <IoIosArrowBack/>
            </button>

            <img 
              src={`data:image/jpeg;base64,${propertyDetails.propertyImage[selectedImageIndex]}`}
              alt={`fullscreen image ${selectedImageIndex + 1}`}
              className="fullscreen-image"
            />

            <button 
              className="nav-btn next-btn"
              onClick={() => setSelectedImageIndex((prev) => 
                prev === propertyDetails.propertyImage.length - 1 ? 0 : prev + 1
              )}
            >
              <IoIosArrowForward/>
            </button>
          </div>
        </div>
      )}

      {showAllFacilities && (
                <div className="Facilities-overlay">
                    <div className="Facilities-overlay-content">
                        <div className="Facilities-overlay-header">
                            <h3>What this place offers</h3>
                            <button className="close-overlay" onClick={toggleFacilities}>X</button>
                        </div>
                        <div className="full-Facilities-list">
                            {facilitiesArray.map((facilityName, index) => {
                                const facility = facilities.find(f => f.name === facilityName.trim());
                                return (
                                    <div key={index} className="facility-item">
                                        {facility ? facility.icon : null}
                                        <span>{facilityName.trim()}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
    </div>
  );
};

export default PropertyDetails;