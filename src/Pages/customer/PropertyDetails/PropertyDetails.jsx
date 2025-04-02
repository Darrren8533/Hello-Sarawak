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
    { name: "Wi-Fi", icon: <FaWifi className="facilities-icon"/> },
    { name: "Parking", icon: <FaParking className="facilities-icon"/> },
    { name: "Swimming Pool", icon: <FaSwimmingPool className="facilities-icon"/> },
    { name: "Hot Tub", icon: <FaHotTub className="facilities-icon"/> },
    { name: "TV", icon: <FaTv className="facilities-icon"/> },
    { name: "Kitchen", icon: <FaUtensils className="facilities-icon"/> },
    { name: "Air Conditioning", icon: <FaSnowflake className="facilities-icon"/> },
    { name: "Pets Allowed", icon: <FaPaw className="facilities-icon"/> },
    { name: "No Smoking", icon: <FaSmokingBan className="facilities-icon"/> },
    { name: "Fire Extinguisher", icon: <FaFireExtinguisher className="facilities-icon"/> },
    { name: "First Aid Kit", icon: <FaFirstAid className="facilities-icon"/> },
    { name: "Shower", icon: <FaShower className="facilities-icon"/> },
    { name: "Coffee Maker", icon: <FaCoffee className="facilities-icon"/> },
    { name: "Beach Access", icon: <FaUmbrellaBeach className="facilities-icon"/> },
    { name: "Bathtub", icon: <FaBath className="facilities-icon"/> },
    { name: "Heating", icon: <FaWind className="facilities-icon"/> },
    { name: "Ceiling Fan", icon: <FaFan className="facilities-icon"/> },
    { name: "Free Parking", icon: <FaCar className="facilities-icon"/> },
    { name: "Bicycle Rental", icon: <FaBicycle className="facilities-icon"/> },
    { name: "Baby Crib", icon: <FaBabyCarriage className="facilities-icon"/> },
    { name: "Keyless Entry", icon: <FaKey className="facilities-icon"/> },
    { name: "Safe", icon: <FaLock className="facilities-icon"/> },
    { name: "Security Alarm", icon: <FaBell className="facilities-icon"/> },
    { name: "Nearby Attractions", icon: <FaMapMarkerAlt className="facilities-icon"/> },
    { name: "Garden", icon: <FaTree className="facilities-icon"/> },
    { name: "Mountain View", icon: <FaMountain className="facilities-icon"/> },
    { name: "City View", icon: <FaCity className="facilities-icon"/> },
];

const PropertyDetails = () => {
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { propertyDetails } = location.state || {};
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
  });
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalNights, setTotalNights] = useState(0);
  const [totalprice, settotalprice] = useState(0);
  const [bookingForm, setBookingForm] = useState({
    title: 'Mr.',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    additionalRequests: ''
  });
  const navigate = useNavigate();

  const facilities = propertyDetails?.facilities
  ? propertyDetails.facilities.split(",") 
  : [];


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Ensure check-in is not greater than or equal to check-out
      if (
        (name === "checkIn" && new Date(value) >= new Date(prev.checkOut)) ||
        (name === "checkOut" && new Date(prev.checkIn) >= new Date(value))
      ) {
        updatedData.checkOut = "";
      }

      // Calculate total price if check-in or check-out changes
      if (name === "checkIn" || name === "checkOut") {
        calculatetotalprice(
          name === "checkIn" ? value : prev.checkIn,
          name === "checkOut" ? value : prev.checkOut
        );
      }

      return updatedData;
    });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === propertyDetails?.propertyimage.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? propertyDetails?.propertyimage.length - 1 : prev - 1));
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

  const calculatetotalprice = (arrival, departure) => {
    if (arrival && departure) {
      const start = new Date(arrival);
      const end = new Date(departure);
      const nights = Math.floor((end - start) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        setTotalNights(nights);
        const basePrice = propertyDetails?.rateamount * nights;
        const taxes = basePrice * 0.1;
        settotalprice(basePrice + taxes);
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

    const userid = localStorage.getItem('userid');
    
    if (!userid) {
      alert('Please Login First');
      return;
    }

    if (!bookingForm.firstName || !bookingForm.lastName || !bookingForm.email || !bookingForm.phoneNumber) {
      alert('Please Fill All Required Fields');
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
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
        propertyid: propertyDetails.propertyid,
        checkindatetime: bookingData.checkIn,
        checkoutdatetime: bookingData.checkOut,
        reservationblocktime: new Date(new Date(bookingData.checkIn) - 3 * 24 * 60 * 60 * 1000).toISOString(),
        request: bookingForm.additionalRequests || '',
        totalprice: totalprice,
        rcfirstname: bookingForm.firstName,
        rclastname: bookingForm.lastName,
        rcemail: bookingForm.email,
        rcphoneno: bookingForm.phoneNumber,
        rctitle: bookingForm.title,
        adults: bookingData.adults,
        children: bookingData.children,
        userid: parseInt(userid),
        reservationstatus: 'Pending'
      };


      const createdReservation = await createReservation(reservationData);

      if (!createdReservation || !createdReservation.reservationid) {
        throw new Error('Failed to create reservation: No valid reservation ID received');
      }

      await requestBooking(createdReservation.reservationid);
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
    const userid = localStorage.getItem('userid');
    if (!userid) return;

    try {
      const response = await fetch(`https://cams-backend.vercel.app/getUserInfo/${userid}`);
      if (!response.ok) {
        throw new Error('Failed to get user information');
      }

      const userData = await response.json();
      console.log('User information:', userData); 
      
      setBookingForm(prev => ({
        ...prev,
        title: userData.utitle || 'Mr.',
        firstName: userData.ufirstname || '',
        lastName: userData.ulastname || '',
        email: userData.uemail || '',
        phoneNumber: userData.uphoneno || '',
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
                  <h2 className="property-font">{propertyDetails?.nearbylocation}</h2>
                </div>
                <hr/>
                <div className="property-features">
                  <h2 className="property-font">{propertyDetails?.uimage && (
                    <img 
                    src={propertyDetails.uimage.startsWith('http') ? propertyDetails.uimage : `data:image/jpeg;base64,${propertyDetails.uimage}`} 
                    alt="Host Avatar"
                    className="product-avatar"
                    /> 
                    )}
                    Hosted by {propertyDetails?.username || "Unknown Host"}</h2>
                </div>
                <hr/>
                <div className="property-features">
                  <h2 className="property-font">Description</h2>
                  <p className="property-font1">{propertyDetails?.propertydescription}</p>
                </div>
                <hr/>
                <div className="property-features">
                  <h2 className="property-font">What this place offers</h2>
                  <div className="facilities-details">
                    {(showAllFacilities ? facilities : facilities.slice(0, 10)).map((facilityName, index) => {
                        const facility = facilities.find(f => f.name === facilityName.trim());
                        return (
                            <div key={index} className="facilities-item">
                                {facility ? facility.icon : null}
                                <span>{facilityName.trim()}</span>
                            </div>
                        );
                    })}
                  </div>
  
                  {facilities.length > 10 && (
                    <button className="show-all-facilities" onClick={() =>setShowAllFacilities(true)}>
                        Show All Facilities
                    </button>
                  )}

                  {showAllFacilities && (
                    <div className="facilities-overlay">
                      <div className="facilities-overlay-content">
                        <div className="facilities-overlay-header">
                          <h3>What this place offers</h3>
                          <button className="close-overlay" onClick={() => setShowAllFacilities(false)}>X</button>
                        </div>
                        <div className="full-facilities-list">
                          {facilities.map((facilityName, index) => {
                            const facility = facilities.find(f => f.name === facilityName.trim());
                            return (
                              <div key={index} className="facilities-item">
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
                          id="check-in"
                          type="date"
                          name="checkIn"
                          value={bookingData.checkIn}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split("T")[0]} // Disables past dates
                        />
                      </div>
                      <div className="input-group">
                        <label>CHECKOUT</label>
                        <input 
                          id="check-out"
                          type="date"
                          name="checkOut"
                          value={bookingData.checkOut}
                          onChange={handleInputChange}
                          min={bookingData.checkIn ? new Date(new Date(bookingData.checkIn).setDate(new Date(bookingData.checkIn).getDate() + 1)).toISOString().split("T")[0] : ""} // Minimum check-out date is check-in + 1
                          disabled={!bookingData.checkIn} // Disables field until check-in is selected
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
                            id="check-in"
                            type="date"
                            name="checkIn"
                            value={bookingData.checkIn}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split("T")[0]} // Disables past dates
                          />
                        </div>
                        <div className="date-input-group">
                          <label>Check-out</label>
                          <input 
                            type="date"
                            name="checkOut"
                            value={bookingData.checkOut}
                            onChange={handleInputChange}
                            min={bookingData.checkIn ? new Date(new Date(bookingData.checkIn).setDate(new Date(bookingData.checkIn).getDate() + 1)).toISOString().split("T")[0] : ""} // Minimum check-out date is check-in + 1
                            disabled={!bookingData.checkIn} // Disables field until check-in is selected
                          />
                        </div>
                      </div>
                    ) : (
                      <p>{bookingData.checkIn} - {bookingData.checkOut}</p>
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
                    src={`data:image/jpeg;base64,${propertyDetails?.propertyimage[0]}`} 
                    alt={propertyDetails?.propertyname}
                  />
                  <div className="property-info">
                    <h3>{propertyDetails?.propertyname}</h3>
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
                      <span>RM{totalprice}</span>
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
    </div>
  );
};

export default PropertyDetails;
