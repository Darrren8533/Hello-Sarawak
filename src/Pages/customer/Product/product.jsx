import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import Components
import Navbar from '../../../Component/Navbar/navbar';
import Footer from '../../../Component/Footer/footer';
import Back_To_Top_Button from '../../../Component/Back_To_Top_Button/Back_To_Top_Button';
import Toast from '../../../Component/Toast/Toast';
import ImageSlider from '../../../Component/ImageSlider/ImageSlider';
import { AuthProvider } from '../../../Component/AuthContext/AuthContext';

// Import API
import { fetchProduct } from '../../../../Api/api';

// Import React Icons and CSS
import { FaStar, FaStarHalfAlt, FaSearch } from 'react-icons/fa';
import { HiUsers} from "react-icons/hi2";
import { CiCalendarDate } from "react-icons/ci";
import { IoLocationSharp } from "react-icons/io5";
import './product.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const Product = () => {
  const [properties, setProperties] = useState([]);
  const [rating] = useState(4.5);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('');
  const [selectedCluster, setSelectedCluster] = useState("");
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [activeTab, setActiveTab] = useState(null);
  const navigate = useNavigate();
  
  // Ref for intersection observer
  const loadMoreRef = useRef(null);

  // Use React Query's useInfiniteQuery for pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['product'],
    queryFn: async ({ pageParam = 1 }) => {
      console.log(`Fetching page ${pageParam}`);
      const items = await fetchProduct({ pageParam });
      
      // Return both the data and a nextPage parameter
      return {
        items: items,
        nextPage: items.length === 8 ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  // Set properties when data is fetched
  useEffect(() => {
    if (data) {
      console.log('Data pages:', data.pages.length);
      
      // Correctly flatten the pages structure
      const allProperties = data.pages.flatMap(page => page.items);
      console.log('Total properties after flatten:', allProperties.length);
      setProperties(allProperties);
    }
  }, [data]);

  // Update the intersection observer implementation
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
  
    const observer = new IntersectionObserver(
      entries => {
        // Log intersection for debugging
        console.log("Intersection detected:", entries[0].isIntersecting);
        if (entries[0].isIntersecting && hasNextPage) {
          console.log("Fetching next page");
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Show error toast if fetching fails
  useEffect(() => {
    if (error) {
      displayToast('error', 'Failed to load properties');
    }
  }, [error]);

  const clusters = [
    "Kuching",
    "Miri",
    "Sibu",
    "Bintulu",
    "Limbang",
    "Sarikei",
    "Sri Aman",
    "Kapit",
    "Mukah",
    "Betong",
    "Samarahan",
    "Serian",
    "Lundu",
    "Lawas",
    "Marudi",
    "Simunjan",
    "Tatau",
    "Belaga",
    "Debak",
    "Kabong",
    "Pusa",
    "Sebuyau",
    "Saratok",
    "Selangau",
    "Tebedu",
  ];

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

  const handleViewDetails = (property) => {
    navigate(`/product/${property.propertyid}`, { 
      state: { propertyDetails: property }
    });
  };

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

      return updatedData;
    });
  };

  const handleCheckAvailability = async (e) => {
    if (e) e.stopPropagation();
  
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const totalGuests = bookingData.adults + bookingData.children;
  
    try {
      // Reset and refetch with filters - Using queryClient to invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      
      // For filtering, you'll need to adjust your API to accept filtering parameters
      // For now, we'll filter the client-side data
      if (data) {
        const allProperties = data.pages.flatMap(page => page);
        
        const availableProperties = allProperties.filter((property) => {
          const existingCheckin = new Date(property.checkindatetime);
          const existingCheckout = new Date(property.checkoutdatetime);

          if (property.propertyguestpaxno < totalGuests) return false;
          
          if (checkIn < existingCheckout && checkOut > existingCheckin) return false; 
          
          if (property.clustername !== selectedCluster) return false;
    
          return true; 
        });
    
        if (availableProperties.length === 0) {
          displayToast('error', 'No available properties match your criteria');
        } else {
          displayToast('success', `Found ${availableProperties.length} available properties`);
        }
    
        setProperties(availableProperties); // Update the displayed properties
      }
    } catch (error) {
      console.error('Error filtering properties:', error);
      displayToast('error', 'Failed to filter properties');
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
                <span className="search-value">
                  {selectedCluster || 'Search destinations'}
                </span>
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
                  {bookingData.checkIn || 'Add dates'}
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
                  {bookingData.checkOut || 'Add dates'}
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
                  <ClusterSelector 
                    selectedCluster={selectedCluster}
                    setSelectedCluster={setSelectedCluster}
                    clusters={clusters}
                  />
                </div>
              )}
              
              {activeTab === 'checkin' && (
                <div>
                  <h3>Select check-in date</h3>
                  <input 
                    id="check-in"
                    type="date"
                    name="checkIn"
                    value={bookingData.checkIn}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]} // Disables past dates
                    className="date-input"
                  />
                </div>
              )}
              
              {activeTab === 'checkout' && (
                <div>
                  <h3>Select check-out date</h3>
                  <input 
                    id="check-out"
                    type="date"
                    name="checkOut"
                    value={bookingData.checkOut}
                    onChange={handleInputChange}
                    min={bookingData.checkIn ? new Date(new Date(bookingData.checkIn).setDate(new Date(bookingData.checkIn).getDate() + 1)).toISOString().split("T")[0] : ""} // Minimum check-out date is check-in + 1
                    disabled={!bookingData.checkIn} // Disables field until check-in is selected
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

  const ClusterSelector = ({ selectedCluster, setSelectedCluster, clusters }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <div className="cluster-selector">
        <div 
          className="cluster-selector-header"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="cluster-label">
            {selectedCluster || "Select Your Destination"}
          </span>
          <i className="cluster-icon">
            {isOpen ? "↑" : "↓"}
          </i>
        </div>
        
        {isOpen && (
          <div className="cluster-options">
            {clusters.map((cluster, index) => (
              <div
                key={index}
                className={`cluster-option ${selectedCluster === cluster ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedCluster(cluster);
                  setIsOpen(false);
                }}
              >
                <span className="cluster-name">{cluster}</span>
                {selectedCluster === cluster && (
                  <span className="check-icon">✓</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const SkeletonPropertyCard = () => {
    return (
      <div className="tour-property-item skeleton-item"> 
        <div className="tour-property-image-box skeleton-image-box">
          <div className="skeleton-pulse"></div>
        </div>
        <div className="tour-property-info">
          <div className="property-location skeleton-location">
            <div className="skeleton-pulse skeleton-title"></div>
            <div className="tour-property-rating skeleton-rating">
              <div className="skeleton-pulse skeleton-rating-pill"></div>
            </div>
          </div>
          <div className="skeleton-pulse skeleton-cluster"></div>
          <div className="property-details-row">
            <div className="property-price skeleton-price">
              <div className="skeleton-pulse skeleton-price-amount"></div>
            </div>
          </div>
        </div>
      </div>
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
          <div className="scrollable-container_for_product">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <SkeletonPropertyCard key={`skeleton-${index}`} />
            ))}
          </div>
        ) : (
          <div className="scrollable-container_for_product">
            {properties.length > 0 ? (
              <>
                {properties.map((property) => (
                  <div className="tour-property-item" key={property.propertyid} property={property} onClick={() => handleViewDetails(property)}> 
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
                      <div className="property-location">
                        <h4>{property.propertyaddress}</h4>
    
                        <div className="tour-property-rating">
                          <span className="rating-number">{rating}</span>
                          <FaStar />
                        </div>
                      </div>
                      <span className="property-cluster">{property.clustername}</span>
                      <div className="property-details-row">
                        <div className="property-price">
                          <span className="price-amount">${property.rateamount}</span>
                          <span className="price-period">/night</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading reference element - when visible, it triggers loading more */}
                <div ref={loadMoreRef} className="loading-more">
                  {isFetchingNextPage && (
                    <div className="loading-spinner-container">
                      <div className="loading-spinner"></div>
                      <p>Loading more properties...</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="no-properties-message">No properties available.</p>
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
