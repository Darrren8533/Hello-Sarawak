import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Import Components
import Navbar from '../../../Component/Navbar/navbar';
import Footer from '../../../Component/Footer/footer';
import Back_To_Top_Button from '../../../Component/Back_To_Top_Button/Back_To_Top_Button';
import Toast from '../../../Component/Toast/Toast';
import ImageSlider from '../../../Component/ImageSlider/ImageSlider';
import Loader from '../../../Component/Loader/Loader';
import { AuthProvider } from '../../../Component/AuthContext/AuthContext';

// Import API
import { fetchProduct, fetchCart } from '../../../../Api/api';

// Import React Icons and CSS
import { FaStar, FaStarHalfAlt, FaSearch } from 'react-icons/fa';
import { HiUsers} from "react-icons/hi2";
import { CiCalendarDate } from "react-icons/ci";
import { IoLocationSharp } from "react-icons/io5";
import './product.css';

const Product = () => {
  const [properties, setProperties] = useState([]);
  const [rating] = useState(4.5);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('');
  const [bookingData, setBookingData] = useState({
    arrivalDate: '',
    departureDate: '',
    adults: 1,
    children: 0,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [activeTab, setActiveTab] = useState(null);
  const navigate = useNavigate();

  // Create refs for search segments
  const locationRef = useRef(null);
  const checkinRef = useRef(null);
  const checkoutRef = useRef(null);
  const guestsRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeTab && 
          !locationRef.current?.contains(event.target) && 
          !checkinRef.current?.contains(event.target) && 
          !checkoutRef.current?.contains(event.target) && 
          !guestsRef.current?.contains(event.target) &&
          !event.target.closest('.expanded-panel')) {
        setActiveTab(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeTab]);

  const displayToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      try {
        const fetchedProperties = await fetchProduct();
        setProperties(fetchedProperties);
      } 
      
      catch (error) {
        console.error('Error fetching properties:', error);
        displayToast('error', 'Failed to load properties');
      }
      
      finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, []);

  const handleViewDetails = (property) => {
    navigate(`/product/${property.propertyid}`, { 
      state: { propertyDetails: property }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  const handleCheckAvailability = async (e) => {
    if (e) e.stopPropagation();
  
    const arrivalDate = new Date(bookingData.arrivalDate);
    const departureDate = new Date(bookingData.departureDate);
    const totalGuests = bookingData.adults + bookingData.children;
  
    try {
      const allProperties = await fetchProduct(); // Always fetch fresh data
  
      const availableProperties = allProperties.filter((property) => {
        if (property.propertyguestpaxno < totalGuests) return false;
  
            const existingCheckin = new Date(property.checkindatetime);
            const existingCheckout = new Date(property.checkoutdatetime);
  
            // Fix overlapping logic
            if (
              (arrivalDate < existingCheckout && departureDate > existingCheckin) // Strict overlap check
            ) {
              return false; // Property is reserved for that period
            }

  
        return true; // Property is available
      });
  
      if (availableProperties.length === 0) {
        displayToast('error', 'No available properties match your criteria');
      } else {
        displayToast('success', `Found ${availableProperties.length} available properties`);
      }
  
      setProperties(availableProperties); // Update the displayed properties
    } catch (error) {
      console.error('Error fetching properties:', error);
      displayToast('error', 'Failed to load properties');
    }
  };  
  
  const handleTabClick = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const getPanelStyle = () => {
    if (!activeTab) return {};
    
    let ref;
    switch (activeTab) {
      case 'location': ref = locationRef.current; break;
      case 'checkin': ref = checkinRef.current; break;
      case 'checkout': ref = checkoutRef.current; break;
      case 'guests': ref = guestsRef.current; break;
      default: return {};
    }
    
    if (!ref) return {};
    
    const rect = ref.getBoundingClientRect();
    
    if (activeTab === 'guests') {
      return { right: '8px', left: 'auto' };
    }
    
    return { 
      left: `${ref.offsetLeft}px`,
      width: isMobile ? '90%' : `${Math.max(280, rect.width)}px`
    };
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" color="#FFD700" />);
    }

    return stars;
  };

  const renderSearchSection = () => {
    return (
      <section className="home" id="home">
        <div className="container_for_product">
          
          {/* Main search bar */}
          <div className="search-bar">
            <div 
              ref={locationRef}
              className={`search-segment ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => handleTabClick('location')}
            >
              <IoLocationSharp className='search_bar_icon'/>
              <div className="search-content">
                <span className="search-label">Where</span>
                <span className="search-value">Search destinations</span>
              </div>
            </div>
            
            <div className="search-divider"></div>
            
            <div 
              ref={checkinRef}
              className={`search-segment ${activeTab === 'checkin' ? 'active' : ''}`}
              onClick={() => handleTabClick('checkin')}
            >
              <CiCalendarDate className='search_bar_icon'/>
              <div className="search-content">
                <span className="search-label">Check in</span>
                <span className="search-value">
                  {bookingData.arrivalDate || 'Add dates'}
                </span>
              </div>
            </div>
            
            <div className="search-divider"></div>
            
            <div 
              ref={checkoutRef}
              className={`search-segment ${activeTab === 'checkout' ? 'active' : ''}`}
              onClick={() => handleTabClick('checkout')}
            >
              <CiCalendarDate className='search_bar_icon'/>
              <div className="search-content">
                <span className="search-label">Check out</span>
                <span className="search-value">
                  {bookingData.departureDate || 'Add dates'}
                </span>
              </div>
            </div>
            
            <div className="search-divider"></div>
            
            <div 
              ref={guestsRef}
              className={`search-segment ${activeTab === 'guests' ? 'active' : ''}`}
              onClick={() => handleTabClick('guests')}
            >
              <HiUsers className='search_bar_icon'/>
              <div className="search-content">
                <span className="search-label">Who</span>
                <span className="search-value">
                  {bookingData.adults + bookingData.children > 0 
                    ? `${bookingData.adults} adults, ${bookingData.children} children` 
                    : 'Add guests'}
                </span>
              </div>
              <button 
                className="search-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckAvailability(e);
                }}
              >
                <FaSearch className='Check_icon'/>
              </button>
            </div>
          </div>
          
          {/* Conditional expanded panel based on active tab */}
          {activeTab && (
            <div 
              className={`expanded-panel ${activeTab}-panel`}
              style={getPanelStyle()}
            >
              {activeTab === 'location' && (
                <div>
                  <h3>Popular destinations</h3>
                  <div className="destinations-grid">
                    {properties.slice(0, 4).map(property => (
                      <div 
                        key={property.ID} 
                        className="destination-item"
                        onClick={() => handleViewDetails(property)}
                      >
                        <span>{property.propertyaddress}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'checkin' && (
                <div>
                  <h3>Select check-in date</h3>
                  <input 
                    type="date" 
                    name="arrivalDate" 
                    value={bookingData.arrivalDate}
                    onChange={handleInputChange}
                    className="date-input"
                  />
                </div>
              )}
              
              {activeTab === 'checkout' && (
                <div>
                  <h3>Select check-out date</h3>
                  <input 
                    type="date" 
                    name="departureDate" 
                    value={bookingData.departureDate}
                    onChange={handleInputChange}
                    className="date-input"
                  />
                </div>
              )}
              
              {activeTab === 'guests' && (
                <div>
                  <h3>Who's coming?</h3>
                  <div className="guest-row">
                    <div className="guest-info">
                      <p className="title">Adults</p>
                      <p className="subtitle">Ages 13+</p>
                    </div>
                    <div className="counter-controls">
                      <button 
                        className="counter-button"
                        onClick={() => setBookingData({...bookingData, adults: Math.max(1, bookingData.adults - 1)})}
                      >
                        -
                      </button>
                      <span className="counter-value">{bookingData.adults}</span>
                      <button 
                        className="counter-button"
                        onClick={() => setBookingData({...bookingData, adults: bookingData.adults + 1})}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="guest-row">
                    <div className="guest-info">
                      <p className="title">Children</p>
                      <p className="subtitle">Ages 2-12</p>
                    </div>
                    <div className="counter-controls">
                      <button 
                        className="counter-button"
                        onClick={() => setBookingData({...bookingData, children: Math.max(0, bookingData.children - 1)})}
                      >
                        -
                      </button>
                      <span className="counter-value">{bookingData.children}</span>
                      <button 
                        className="counter-button"
                        onClick={() => setBookingData({...bookingData, children: bookingData.children + 1})}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <button 
                      className="check-button"
                      onClick={handleCheckAvailability}
                    >
                      Check Availability
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div>
      <AuthProvider>
      <Navbar />
      <br /><br /><br />

      {renderSearchSection()}

      <div className="property-container_for_product">
        <h2>Available Properties</h2>

        {isLoading ? (
          <div className="loader-box">
            <Loader />
          </div>
      ) : (
        <div className="scrollable-container_for_product">
          {properties.length > 0 ? (
            properties.map((property) => (
              <div className="tour-property-item" key={property.ID} onClick={() => handleViewDetails(property)}> 
                <div className="tour-property-image-box">
                  {property.propertyimage && property.propertyimage.length > 0 ? (
                     <ImageSlider images={property.propertyimage}
                    onClick={(e) => {
                      e.stopPropagation();
                    }} />
                  ) : (
                    <p>No images available</p>
                  )}
                </div>
                <div className="tour-property-info">
                  <h4>{property.propertyaddress}</h4>
                  <p>{property.nearbylocation}</p>
                  <div className="tour-property-rating">{renderStars(rating)}</div>
                  <h5>From ${property.rateamount}/night</h5>
                </div>
              </div>
            ))
          ) : (
            <p>No properties available.</p>
          )}
        </div>
      )}
      </div>

      {showToast && <Toast type={toastType} message={toastMessage} />}
      <br /><br /><br /><br /><br /><br />
      <Back_To_Top_Button />
      <Footer />
      </AuthProvider>
    </div>
  );
};

export default Product;
