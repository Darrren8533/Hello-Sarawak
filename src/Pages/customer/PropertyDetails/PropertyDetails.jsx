import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoIosArrowBack, IoIosArrowForward, IoIosBed } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { GiWashingMachine, GiClothesline, GiDesert  } from "react-icons/gi";
import { PiSecurityCamera } from "react-icons/pi";
import { SiLightning } from "react-icons/si";
import { TbPawFilled, TbPawOff } from "react-icons/tb";
import { MdLandscape, MdOutlineKingBed, MdFireplace, MdSmokingRooms, MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { FaStar, FaWifi, FaDesktop, FaDumbbell, FaWater, FaSkiing, FaChargingStation, FaParking, FaSwimmingPool, FaTv, FaUtensils, FaSnowflake, FaSmokingBan, FaFireExtinguisher, FaFirstAid, FaShower, FaCoffee, FaUmbrellaBeach, FaBath, FaWind, FaFan, FaCar, FaBicycle, FaBabyCarriage, FaKey, FaBell, FaTree, FaCity, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { AuthProvider } from '../../../Component/AuthContext/AuthContext';
import Navbar from '../../../Component/Navbar/navbar';
import Toast from '../../../Component/Toast/Toast';
import Footer from '../../../Component/Footer/footer';
import './PropertyDetails.css';
import { createReservation, requestBooking, getCoordinates, fetchUserData } from '../../../../Api/api';

const facilities = [
    { name: "Wi-Fi", icon: <FaWifi className="facilities-icon"/> },
    { name: "Kitchen", icon: <FaUtensils className="facilities-icon"/> },
    { name: "Washer", icon: <GiWashingMachine className="facilities-icon"/> },
    { name: "Dryer", icon: <GiClothesline className="facilities-icon"nowflake /> },
    { name: "Heating", icon: <FaWind className="facilities-icon"/> },
    { name: "Dedicated workspace", icon: <FaDesktop className="facilities-icon"/> },
    { name: "TV", icon: <FaTv className="facilities-icon"/> },
    { name: "Ceiling Fan", icon: <FaFan className="facilities-icon"/> },

    { name: "Free Parking", icon: <FaParking className="facilities-icon"/> },
    { name: "Swimming Pool", icon: <FaSwimmingPool className="facilities-icon"/> },
    { name: "Bathtub", icon: <FaBath className="facilities-icon"/> },
    { name: "Shower", icon: <FaShower className="facilities-icon"/> },
    { name: "EV charger", icon: <FaChargingStation className="facilities-icon"/> },
    { name: "Baby Crib", icon: <FaBabyCarriage className="facilities-icon"/> },
    { name: "King bed", icon: <MdOutlineKingBed className="facilities-icon"/> },
    { name: "Gym", icon: <FaDumbbell className="facilities-icon"/> },
    { name: "Breakfast", icon: <FaCoffee className="facilities-icon"/> },
    { name: "Indoor fireplace", icon: <MdFireplace className="facilities-icon"/> },
    { name: "Smoking allowed", icon: <MdSmokingRooms className="facilities-icon"/> },
    { name: "No Smoking", icon: <FaSmokingBan className="facilities-icon"/> },

    { name: "City View", icon: <FaCity className="facilities-icon"/> },
    { name: "Garden", icon: <FaTree className="facilities-icon"/> },
    { name: "Bicycle Rental", icon: <FaBicycle className="facilities-icon"/> },
    { name: "Beachfront", icon: <FaUmbrellaBeach className="facilities-icon"/> },
    { name: "Waterfront", icon: <FaWater className="facilities-icon"/> },
    { name: "Countryside", icon: <MdLandscape className="facilities-icon"/> },
    { name: "Ski-in/ski-out", icon: <FaSkiing className="facilities-icon"/> },
    { name: "Desert", icon: <GiDesert className="facilities-icon"/> },
    
    { name: "Security Alarm", icon: <FaBell className="facilities-icon"/> },
    { name: "Fire Extinguisher", icon: <FaFireExtinguisher className="facilities-icon"/> },
    { name: "First Aid Kit", icon: <FaFirstAid className="facilities-icon"/> },
    { name: "Security Camera", icon: <PiSecurityCamera className="facilities-icon"/> },

    { name: "Instant booking", icon: <SiLightning className="facilities-icon"/> },
    { name: "Self check-in", icon: <FaKey className="facilities-icon"/> },
    { name: "Pets Allowed", icon: <TbPawFilled className="facilities-icon"/> },
    { name: "No Pets", icon: <TbPawOff className="facilities-icon"/> }
];

const PropertyDetails = () => {
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('');
  const {propertyDetails} = location.state || {};
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
  });
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
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
  const [showDescriptionOverlay, setShowDescriptionOverlay] = useState(false);
  const [locationCoords, setLocationCoords] = useState({ lat: null, lng: null });

  const facilitiesArray = propertyDetails?.facilities
  ? propertyDetails.facilities.split(",") 
  : [];
  const description = propertyDetails?.propertydescription;
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        if (propertyDetails?.nearbylocation) {
          const coords = await getCoordinates(propertyDetails?.nearbylocation);
          setLocationCoords(coords);
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    };

    fetchCoordinates();
  }, [propertyDetails]);

  useEffect(() => {
    const currentLocationKey = location.key;
    const previousLocationKey = localStorage.getItem('previousLocationKey');
    
    if (currentLocationKey !== previousLocationKey) {
      localStorage.setItem('previousLocationKey', currentLocationKey);
      window.location.reload();
    }
  }, [location.key]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => {
      const updatedData = { ...prev, [name]: value };

      if (
        (name === "checkIn" && new Date(value) >= new Date(prev.checkOut)) ||
        (name === "checkOut" && new Date(prev.checkIn) >= new Date(value))
      ) {
        updatedData.checkOut = "";
      }

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
    setCurrentSlide(prev => 
      prev === propertyDetails.propertyimage.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide(prev => 
      prev === 0 ? propertyDetails.propertyimage.length - 1 : prev - 1
    );
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
    document.body.style.overflow = 'auto';
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
        displayToast('error', 'Please login first');
        return;
    }

    if (!bookingForm.firstName || !bookingForm.lastName || !bookingForm.email || !bookingForm.phoneNumber) {
        displayToast('error', 'Please fill all required fields');
        return;

    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
        displayToast('error', 'Please select Check-in and Check-out dates');
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

      displayToast('success', 'Reservation added to the cart');

        setTimeout(() => {
        setShowBookingForm(false);
        navigate('/cart');
      }, 5000);
        
    } catch (error) {
      displayToast('error', 'Failed to create reservation');
    }
  };

  const fetchUserInfo = async () => {
    const userid = localStorage.getItem('userid');
    if (!userid) return;

    try {
      const userData = await fetchUserData(userid);
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

  const displayToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  useEffect(() => {
    if (showBookingForm) {
      fetchUserInfo();
    }
  }, [showBookingForm]);

  const googleMapSrc = locationCoords.lat && locationCoords.lng
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyCe27HezKpItahXjMFcWXf3LwFcjI7pZFk&q=${encodeURIComponent(propertyDetails.nearbylocation)}&zoom=14`
    : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.9586177612214!2d110.31007237509338!3d1.749442560160908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31faff9851a3becb%3A0xf308ff203e894002!2sDamai%20Beach!5e0!3m2!1sen!2smy!4v1731252464570!5m2!1sen!2smy";

  return (
    <div>
      <div className="Property_Details_Main_Container">
        <AuthProvider>
        <Navbar />
        <div className="property-details-main-container">
          {!showAllPhotos && !showBookingForm}
          <div className="Main_Image_gallery_container">
            <div className="Image_gallery_card_1">
              <img 
                src={`data:image/jpeg;base64,${propertyDetails.propertyimage[0]}`} 
                onClick={() => setShowAllPhotos(true)}  
                className="main_gallery_image" 
                alt="Main Gallery" 
              />
            </div>

            <div className="Image_gallery_container">
              <div className="Image_gallery_card_2">
                <img 
                  src={`data:image/jpeg;base64,${propertyDetails.propertyimage[1]}`} 
                  onClick={() => setShowAllPhotos(true)}
                  className="second_gallery_image" 
                  alt="Second Gallery" 
                />
              </div>
              <div className="Image_gallery_card_2">
                <img 
                  src={`data:image/jpeg;base64,${propertyDetails.propertyimage[2]}`} 
                  onClick={() => setShowAllPhotos(true)} 
                  className="second_gallery_image" 
                  alt="Second Gallery" 
                />
              </div>
            </div>
          </div>

          {/* Mobile Slideshow */}
          <div className="mobile-slideshow">
            {propertyDetails?.propertyimage?.map((image, index) => (
              <div key={index} className={`slide ${currentSlide === index ? 'active' : ''}`} 
                  style={{transform: `translateX(${100 * (index - currentSlide)}%)`, transition: 'transform 0.3s'}}>
                <img 
                  src={`data:image/jpeg;base64,${image}`}
                  alt={`Property image ${index + 1}`}
                  onClick={() => setShowAllPhotos(true)} 
                />
              </div>
            ))}
            
            <button className="slide-nav prev" onClick={prevSlide} aria-label="Previous image">
              <IoIosArrowBack />
            </button>
            
            <button className="slide-nav next" onClick={nextSlide} aria-label="Next image">
              <IoIosArrowForward />
            </button>
            
            <div className="slide-indicators">
              {propertyDetails?.propertyimage?.map((_, index) => (
                <div 
                  key={index} 
                  className={`indicator ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to image ${index + 1}`}
                ></div>
              ))}
            </div>
          </div>

          {showAllPhotos && (
            <div className="all-photos-view">
              <div className="photos-header">
                <button className="back-button" onClick={() => setShowAllPhotos(false)}>
                  <span><IoReturnUpBackOutline /></span>
                </button>
              </div>
              
              <div className="photos-grid">
                <div className="photos-container">
                  {propertyDetails?.propertyimage?.map((image, index) => (
                    <div key={index} className="photo-section">
                      <img 
                        src={`data:image/jpeg;base64,${image}`} 
                        alt={`Property image ${index + 1}`}
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
                  <IoMdClose />
                </button>
                <div className="image-counter">
                  {selectedImageIndex + 1} / {propertyDetails.propertyimage.length}
                </div>
              </div>

              <div className="fullscreen-content">
                <button 
                  className="nav-btn prev-btn"
                  onClick={() => setSelectedImageIndex((prev) => 
                    prev === 0 ? propertyDetails.propertyimage.length - 1 : prev - 1
                  )}
                >
                  <IoIosArrowBack />
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
                  <IoIosArrowForward />
                </button>
              </div>
            </div>
          )}

          {/* Details Container */}
          <div className="Details_container">
            <div className="Description_container">
              <div className="first_container">
                <div className="Room_name_container">
                  <h2 className="Room_name">{propertyDetails?.propertyaddress}</h2>
                  <div className='Rating_Container'>
                    <p className="Rating_score">
                      4.8
                    </p>
                    <FaStar className='icon_star'/>
                  </div>
                </div>

                <div className="sub_details">
                  <div className="Room_location">
                    <FaMapMarkerAlt className="icon_location_room"/>
                    <p>{propertyDetails?.clustername}</p>
                  </div>

                  <div className="Room_location">
                      <IoIosBed className="icon_bed_room"/>
                    <p>{propertyDetails?.propertybedtype} Bed</p>
                  </div>

                  <div className="Room_location">
                      <FaUser className="icon_guest_room"/>
                    <p>{propertyDetails?.propertyguestpaxno} Guest</p>
                  </div>

                  <div className="profile_section">
                    <div className="profile_card_property">
                      <img src={propertyDetails.uimage.startsWith('http') ? propertyDetails.uimage : `data:image/jpeg;base64,${propertyDetails.uimage}`}
                          className="admin_profile"
                          alt="Admin" />
                      <p className="admin_name">
                        {propertyDetails?.username || "Unknown Host"}
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="custom-line" />

                <div className="Room_description_container">
                  <h2 className="About_text">About This Place</h2>
                  <p className="Room_description">
                    {description.length > 200 ? `${description.slice(0, 200)}...` : description}
                      {description.length > 200 && (
                        <button className="show-more-btn" onClick={() => setShowDescriptionOverlay(true)}>
                          Show more
                        </button>
                    )}
                  </p>

                {showDescriptionOverlay && (
                  <div className="description-overlay">
                    <div className="description-overlay-content">
                      <div className="overlay-header-About">
                        <h2 className="About_text">About This Place</h2>
                        <button 
                          className="close-overlay" 
                          onClick={() => setShowDescriptionOverlay(false)}
                          aria-label="Close description"
                        >
                          <IoMdClose />
                        </button>
                      </div>
                      <div className="full-description">
                        <p className="Room_description">{description}</p>
                      </div>
                    </div>
                  </div>
                )}
                </div>

                <div className="Facilities_Main_Container">
                  <h2 className="Facilities_text">What this place offers</h2>
                  <hr className="custom-line" />
                  <div className="Facilities_Icon_Container">
                    <div className="facilities-details">
                      {(facilitiesArray.slice(0, 9)).map((facilityName, index) => {
                          const facility = facilities.find(f => f.name === facilityName.trim());
                          return (
                            <div key={index} className="facilities-item">
                              {facility ? facility.icon : null}
                              <span>{facilityName.trim()}</span>
                            </div>
                          );
                      })}
                    </div>

                  {showAllFacilities && (
                    <div className="facilities-overlay" onClick={(e) => {
                      if (e.target === e.currentTarget) setShowAllFacilities(false);
                    }}>
                      <div className="facilities-overlay-content" role="dialog" aria-modal="true" aria-labelledby="facilities-title">
                        <div className="overlay-header-Offer">
                          <h3 id="facilities-title" className="Facilities_text">What this place offers</h3>
                          <button 
                            className="close-overlay" 
                            onClick={() => setShowAllFacilities(false)}
                            aria-label="Close facilities"
                          >
                            <IoMdClose />
                          </button>
                        </div>
                        <div className="full-facilities-list">
                          {facilitiesArray.length > 0 ? (
                            <div className="facilities-grid">
                              {facilitiesArray.map((facilityName, index) => {
                                const facility = facilities.find(f => f.name === facilityName.trim());
                                return (
                                  <div key={index} className="facilities-overlay-item">
                                    <div className="facility-icon">{facility ? facility.icon : null}</div>
                                    <span className="facility-name">{facilityName.trim()}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="no-facilities">No facilities available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                  <button className="More_button" onClick={() => setShowAllFacilities(true)}>More</button>
                </div>

                <div className="Location_Main_Container">
                  <h2 className="Location_text">Hotel Location</h2>
                  <hr className="custom-line" />

                  <div className="Google_map_container">
                    <iframe
                      src={googleMapSrc}
                      width="100%"
                      height="450"
                      style={{ border: 0, borderRadius: '5px' }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>

              <div className="second_container">
                <div className="booking_card">
                  <div className="price_section">
                    <span className="room_price">${propertyDetails?.rateamount}</span>
                    <span className="price_night">/night</span>
                  </div>

                  <div className="dates_section">
                    <div className="date_input">
                      <div className="date_label">CHECK-IN</div>
                      <input type="date" name="checkIn" className="date_picker" value={bookingData.checkIn} onChange={handleInputChange} min={new Date().toISOString().split("T")[0]}/>
                    </div>
                    <div className="date_input">
                      <div className="date_label">CHECK-OUT</div>
                      <input type="date" 
                            name="checkOut"
                            className="date_picker" 
                            value={bookingData.checkOut}
                            onChange={handleInputChange}
                            disabled={!bookingData.checkIn}
                            min={bookingData.checkIn ? new Date(new Date(bookingData.checkIn).setDate(new Date(bookingData.checkIn).getDate() + 1)).toISOString().split("T")[0] : ""} 
                      />
                    </div>
                  </div>

                  <div className="price_details">
                    <div className="price_item">
                      <div>${propertyDetails?.rateamount} × {totalNights} nights</div>
                      <div>${propertyDetails?.rateamount * totalNights}</div>
                    </div>
                    <div className="price_item">
                      <div>Cleaning fee (10%)</div>
                      <div>${Math.floor(propertyDetails?.rateamount * totalNights * 0.1)}</div>
                    </div>
                    <div className="price_item">
                      <div>Service fee (10%)</div>
                      <div>${Math.floor(propertyDetails?.rateamount * totalNights * 0.1)}</div>
                    </div>
                    <div className="price_total">
                      <div><strong>Total (MYR)</strong></div>
                      <div><strong>${totalprice}</strong></div>
                    </div>
                  </div>

                  <br /><br />
                  <button className="reserve_button" onClick={() => setShowBookingForm(true)}>Book Now</button>
                </div>
              </div>
            </div>
          </div>

          {showBookingForm && (
            <div className="booking-overlay">
              <div className="booking-modal">
                <div className="booking-header">
                  <button className="back-button" onClick={() => setShowBookingForm(false)}>
                    <span><IoReturnUpBackOutline/> Booking Information</span>
                  </button>
                </div>
                <div className="booking-content">
                  <div className="booking-left">
                    <div className="trip-section">
                      <h2>Your trip</h2>
                      <br />
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
                                min={new Date().toISOString().split("T")[0]}
                              />
                            </div>
                            <div className="date-input-group">
                              <label>Check-out</label>
                              <input 
                                type="date"
                                name="checkOut"
                                value={bookingData.checkOut}
                                onChange={handleInputChange}
                                min={bookingData.checkIn ? new Date(new Date(bookingData.checkIn).setDate(new Date(bookingData.checkIn).getDate() + 1)).toISOString().split("T")[0] : ""}
                                disabled={!bookingData.checkIn}
                              />
                            </div>
                          </div>
                        ) : (
                          <p>{bookingData.checkIn} - {bookingData.checkOut}</p>
                        )}
                      </div>
                      <br />
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
                      </div>
                      <br /><br />
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

                  {/*
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
                            <span>RM {propertyDetails?.rateamount * totalNights}</span>
                          </div>
                          <div className="price-row">
                            <span>Taxes (10%)</span>
                            <span>RM {Math.floor(propertyDetails?.rateamount * totalNights * 0.1)}</span>
                          </div>
                          <div className="price-total">
                            <span>Total (MYR)</span>
                            <span>RM {totalprice}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  */}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Booking Bar*/}
          <div className="mobile-booking-bar">
            <div className="mobile-booking-bar-content">
              <div className="mobile-price-info">
                <h3>${propertyDetails?.rateamount} <span>/night</span></h3>
                {totalNights > 0 && (
                  <span>Total: ${totalprice} for {totalNights} {totalNights === 1 ? 'night' : 'nights'}</span>
                )}
              </div>
              <button className="mobile-book-now-btn" onClick={() => setShowBookingForm(true)}>
                Book Now
              </button>
            </div>
          </div>

          {showToast && <Toast type={toastType} message={toastMessage} />}
        </div>
        <Footer />
        </AuthProvider>
      </div>
    </div>
  );
};

export default PropertyDetails;
