import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { IoIosArrowDown, IoIosArrowUp, IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { FaWifi, FaParking, FaSwimmingPool, FaHotTub, FaTv, FaUtensils, FaSnowflake, FaPaw, FaSmokingBan, FaFireExtinguisher, FaFirstAid, FaShower, FaCoffee, FaUmbrellaBeach, FaBath, FaWind, FaFan, FaCar, FaBicycle, FaBabyCarriage, FaKey, FaLock, FaBell, FaMapMarkerAlt, FaTree, FaMountain, FaCity } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import Navbar from '../../../Component/Navbar/navbar';
import Footer from '../../../Component/Footer/footer';
import Reviews from "../../../Component/Reviews/Reviews";
import './PropertyDetails.css';

import { createReservation, requestBooking } from '../../../../Api/api';

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
  const [currentSlide, setCurrentSlide] = useState(0);
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === propertyDetails?.propertyImage.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? propertyDetails?.propertyImage.length - 1 : prev - 1));
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
            <h1 className="property-title">{propertyDetails?.propertyaddress}</h1>
            <div className="gallery-section">

              <div className="mobile-slideshow">
                {propertyDetails?.propertyimage && propertyDetails.propertyimage.length > 0 && (
                  <>
                    <img 
                      src={`data:image/jpeg;base64,${propertyDetails.propertyimage[currentSlide]}`} 
                      alt={`slide ${currentSlide + 1}`}
                      onClick={handleImageClick}
                    />
                    <button className="slide-nav prev" onClick={prevSlide}>
                      <IoIosArrowBack/>
                    </button>
                    <button className="slide-nav next" onClick={nextSlide}>
                      <IoIosArrowForward/>
                    </button>
                    <div className="slide-indicators">
                      {propertyDetails?.propertyimage && propertyDetails.propertyimage.map((_, index) => (
                        <span 
                          key={index} 
                          className={`indicator ${index === currentSlide ? 'active' : ''}`}
                          onClick={() => setCurrentSlide(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <div className="gallery-grid">
                <div className="gallery-main">
                  {propertyDetails?.propertyimage && propertyDetails.propertyimage.length > 0 && (
                    <img 
                      src={`data:image/jpeg;base64,${propertyDetails.propertyimage[0]}`} 
                      alt="main image"
                      onClick={handleImageClick}
                    />
                  )}
                </div>
                <div className="gallery-secondary">
                  {propertyDetails?.propertyimage && 
                    propertyDetails.propertyimage.slice(1, 5).map((image, index) => (
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
  
            {!showAllPhotos && !isFullscreen && !showBookingForm && (
              <div className="mobile-booking-bar">
                <div className="mobile-booking-bar-content">
                  <div className="mobile-price-info">
                    <h3>${propertyDetails?.rateamount} <span>/night</span></h3>
                    <span>{propertyDetails?.propertyguestpaxno} guests max</span>
                  </div>
                  <button className="mobile-book-now-btn" onClick={handleBookNowClick}>
                    Book Now
                  </button>
                </div>
              </div>
            )}
  
            {isFullscreen && (
               <div className="fullscreen-overlay">
               <button className="fullscreen-close-btn" onClick={handleCloseFullscreen}>
                 ✕
               </button>
               <button 
                  className="fullscreen-nav-btn prev-btn"
                  onClick={() => setSelectedImageIndex((prev) => 
                    prev === 0 ? propertyDetails.propertyimage.length - 1 : prev - 1
                  )}
                >
                   <IoIosArrowBack/>
                </button>
  
                <img 
                  src={`data:image/jpeg;base64,${propertyDetails.propertyimage[selectedImageIndex]}`}
                  alt={`fullscreen image ${selectedImageIndex + 1}`}
                  className="fullscreen-image"
                />
  
                <button 
                  className="fullscreen-nav-btn next-btn"
                  onClick={() => setSelectedImageIndex((prev) => 
                    prev === propertyDetails.propertyimage.length - 1 ? 0 : prev + 1
                  )}
                >
                   <IoIosArrowForward/>
                </button>
             </div>
            )}
  
            <div className="content-section">
              <div className="left-content">
                <div className="property-features">
                  <h2>{propertyDetails?.nearbylocation}</h2>
                </div>
                <hr/>
                <div className="property-features">
                  <h2>{propertyDetails?.uimage && (
                    <img 
                    src={propertyDetails.uimage.startsWith('http') ? propertyDetails.uimage : `data:image/jpeg;base64,${propertyDetails.uimage}`} 
                    alt="Host Avatar"
                    className="front-avatar-image"
                    /> 
                    )}
                    Hosted by {propertyDetails?.username || "Unknown Host"}</h2>
                </div>
                <hr/>
                <div className="property-features">
                  <h2>Description</h2>
                  <p>{propertyDetails?.propertydescription}</p>
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
                    <h3>${propertyDetails?.rateamount} <span>/night</span></h3><br/>
                    <h6>Maximum Guest: {propertyDetails?.propertyguestpaxno} </h6>
                    <h6>Bed: {propertyDetails?.propertybedtype} Size</h6>
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
            {/* 预订模态框部分 */}
            <div className="booking-content">
              <div className="booking-left">
                {/* 左侧内容 */}
              </div>

              <div className="booking-right">
                <div className="property-card">
                  <img 
                    src={`data:image/jpeg;base64,${propertyDetails?.propertyimage[0]}`} 
                    alt={propertyDetails?.propertyaddress}
                  />
                  <div className="property-info">
                    <h3>{propertyDetails?.propertyaddress}</h3>
                  </div>
                </div>

                {totalNights > 0 && (
                <div className="price-details">
                  <h3>Price details</h3>
                  <div className="price-breakdown">
                    <div className="price-row">
                    <span>RM {propertyDetails?.rateamount} × {totalNights} night</span>
                    <span>RM{propertyDetails?.rateamount * totalNights}</span>
                    </div>
                    <div className="price-row">
                      <span>Taxes (10%)</span>
                      <span>RM{Math.floor(propertyDetails?.rateamount * totalNights * 0.1)}</span>
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
              {propertyDetails?.propertyimage?.map((image, index) => (
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
              {selectedImageIndex + 1} / {propertyDetails.propertyimage.length}
            </div>
            <div className="header-actions">
            </div>
          </div>

          <div className="fullscreen-content">
            <button 
              className="nav-btn prev-btn"
              onClick={() => setSelectedImageIndex((prev) => 
                prev === 0 ? propertyDetails.propertyimage.length - 1 : prev - 1
              )}
            >
              <IoIosArrowBack/>
            </button>

            <img 
              src={`data:image/jpeg;base64,${propertyDetails.propertyimage[selectedImageIndex]}`}
              alt={`fullscreen image ${selectedImageIndex + 1}`}
              className="fullscreen-image"
            />

            <button 
              className="nav-btn next-btn"
              onClick={() => setSelectedImageIndex((prev) => 
                prev === propertyDetails.propertyimage.length - 1 ? 0 : prev + 1
              )}
            >
              <IoIosArrowForward/>
            </button>
          </div>
        </div>
      )}
      
      {/* 设施覆盖层不变 */}
    </div>
  );
};

export default PropertyDetails;
