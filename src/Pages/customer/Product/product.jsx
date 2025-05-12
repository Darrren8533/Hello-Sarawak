import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import Components
import Navbar from '../../../Component/Navbar/navbar';
import Footer from '../../../Component/Footer/footer';
import Back_To_Top_Button from '../../../Component/Back_To_Top_Button/Back_To_Top_Button';
import Toast from '../../../Component/Toast/Toast';
import ImageSlider from '../../../Component/ImageSlider/ImageSlider';
import TawkMessenger from '../../../Component/TawkMessenger/TawkMessenger';
import { AuthProvider } from '../../../Component/AuthContext/AuthContext';
import Sorting from '../../../Component/Sorting/Sorting';

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allProperties, setAllProperties] = useState([]);
  const [loadedPropertyIds, setLoadedPropertyIds] = useState(new Set());
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortOrder, setSortOrder] = useState("none"); // "none", "asc", "desc"
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [selectedBookingOptions, setSelectedBookingOptions] = useState([]);
  const observer = useRef();

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
  
  const lastPropertyElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && entries[0].intersectionRatio === 1 && hasMore && !isLoadingMore) {
        const scrollPosition = window.innerHeight + window.pageYOffset;
        const documentHeight = document.documentElement.offsetHeight;
        
        if (documentHeight - scrollPosition < 50) {
          setIsLoadingMore(true);
          loadMoreProperties();
        }
      }
    }, {
      threshold: 1.0, 
      rootMargin: '0px 0px 50px 0px' 
    });
    
    if (node) observer.current.observe(node);
  }, [hasMore, isLoadingMore]);
  
  const navigate = useNavigate();

  // Use React Query to fetch properties
  const { data: fetchedProperties, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProduct,
  });

  // Set all properties when data is fetched
  useEffect(() => {
    if (fetchedProperties) {
      setAllProperties(fetchedProperties);
      setProperties([]);
      setLoadedPropertyIds(new Set());
      setPage(1);
      setHasMore(true);
      setIsLoadingMore(false);
    }
  }, [fetchedProperties]);

  // Load initial properties
  useEffect(() => {
    if (allProperties.length > 0 && properties.length === 0) {
      loadInitialProperties();
    }
  }, [allProperties, properties.length]);

  const loadInitialProperties = () => {
    const initialPropertyIds = new Set();
    const initialProperties = allProperties.slice(0, 8);
    
    initialProperties.forEach(prop => initialPropertyIds.add(prop.propertyid));
    
    setProperties(initialProperties);
    setLoadedPropertyIds(initialPropertyIds);
    setPage(2);
    setHasMore(allProperties.length > 8);
  };

  const loadMoreProperties = () => {
    const startIndex = (page - 1) * 8;
    const endIndex = page * 8;
    
    if (startIndex >= allProperties.length) {
      setHasMore(false);
      setIsLoadingMore(false);
      return;
    }
    
    const nextProperties = allProperties.slice(startIndex, endIndex);
    
    const currentLoadedIds = new Set([...loadedPropertyIds]);
    
    const filteredProperties = nextProperties.filter(
      property => !currentLoadedIds.has(property.propertyid)
    );
    
    if (filteredProperties.length === 0) {
      setHasMore(false);
      setIsLoadingMore(false);
      return;
    }
    
    const newPropertyIds = new Set(currentLoadedIds);
    filteredProperties.forEach(prop => newPropertyIds.add(prop.propertyid));
    
    setTimeout(() => {
      const uniqueProperties = [...properties];
      filteredProperties.forEach(property => {
        if (!uniqueProperties.some(p => p.propertyid === property.propertyid)) {
          uniqueProperties.push(property);
        }
      });
      
      setProperties(uniqueProperties);
      setLoadedPropertyIds(newPropertyIds);
      setPage(page + 1);
      setHasMore(endIndex < allProperties.length);
      setIsLoadingMore(false);
    }, 500);
  };

  // Show error toast if fetching fails
  useEffect(() => {
    if (error) {
      displayToast('error', 'Failed to load properties');
    }
  }, [error]);

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
      // Use the cached data from React Query when possible
      const fetchedProps = fetchedProperties || await queryClient.fetchQuery({
        queryKey: ['properties'],
        queryFn: fetchProduct
      });
  
      let availableProperties = fetchedProps.filter((property) => {
        const existingCheckin = new Date(property.checkindatetime);
        const existingCheckout = new Date(property.checkoutdatetime);
        const propertyPrice = parseFloat(property.rateamount);

        // Filter by price range if set
        if (propertyPrice < priceRange.min || propertyPrice > priceRange.max) return false;

        if (property.propertyguestpaxno < totalGuests) return false;
        
        if (checkIn < existingCheckout && checkOut > existingCheckin) return false; 
        
        if (selectedCluster && property.clustername !== selectedCluster) return false;
        
        // Filter by selected property types
        if (selectedPropertyTypes.length > 0 && !selectedPropertyTypes.includes(property.categoryname)) {
          return false;
        }
        
        // Filter by selected facilities
        if (selectedFacilities.length > 0) {
          const propertyFacilities = property.facilities ? 
            property.facilities.split(',').map(facility => facility.trim()) : [];
          
          // Check if property has all selected facilities
          for (const facility of selectedFacilities) {
            if (!propertyFacilities.includes(facility)) {
              return false;
            }
          }
        }

        return true; 
      });
      
      // Sort by price if requested
      if (sortOrder === "asc") {
        availableProperties.sort((a, b) => parseFloat(a.rateamount) - parseFloat(b.rateamount));
      } else if (sortOrder === "desc") {
        availableProperties.sort((a, b) => parseFloat(b.rateamount) - parseFloat(a.rateamount));
      }
  
      if (availableProperties.length === 0) {
        displayToast('error', 'No available properties match your criteria');
      } else {
        displayToast('success', `Found ${availableProperties.length} available properties`);
      }
  
      setAllProperties(availableProperties);
      setProperties([]);
      setLoadedPropertyIds(new Set());
      setPage(1);
      setHasMore(true);
      setIsLoadingMore(false);
      
      const initialProperties = availableProperties.slice(0, 8);
      const initialPropertyIds = new Set(initialProperties.map(prop => prop.propertyid));
      
      setProperties(initialProperties);
      setLoadedPropertyIds(initialPropertyIds);
      setPage(2);
      setHasMore(availableProperties.length > 8);
      setIsLoadingMore(false);
      
      // Close the filter overlay when search is complete
      setShowFilters(false);
      
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

  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore || !hasMore) return;
      
      const scrollPosition = window.innerHeight + window.pageYOffset;
      const documentHeight = document.documentElement.offsetHeight;
      
      if (documentHeight - scrollPosition < 50) {
        setIsLoadingMore(true);
        loadMoreProperties();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMore, page]);

  return (
    <div>
      <div className="Product_Main_Container">
        <AuthProvider>
        {!showFilters && <Navbar />}
        <br /><br /><br />
    
        <div className="property-container_for_product">
          {renderSearchSection()}
          <div className="header-container">
            <h2>Available Properties</h2>
            <Sorting
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            selectedFacilities={selectedFacilities}
            setSelectedFacilities={setSelectedFacilities}
            selectedPropertyTypes={selectedPropertyTypes}
            setSelectedPropertyTypes={setSelectedPropertyTypes}
            selectedBookingOptions ={selectedBookingOptions }
            setSelectedBookingOptions={setSelectedBookingOptions}
            handleCheckAvailability={handleCheckAvailability}
          />
          </div>
    
          {isLoading ? (
            <div className="scrollable-container_for_product">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <SkeletonPropertyCard key={`skeleton-${index}`} />
              ))}
            </div>
          ) : (
            <div className="scrollable-container_for_product">
              {properties.length > 0 ? (
                properties.map((property, index) => {
                  if (properties.length === index + 1) {
                    return (
                      <div 
                        ref={lastPropertyElementRef}
                        className="tour-property-item" 
                        key={property.propertyid} 
                        onClick={() => handleViewDetails(property)}
                      > 
                        <div className="tour-property-image-box">
                          {property.propertyimage && property.propertyimage.length > 0 ? (
                            <ImageSlider 
                              images={property.propertyimage}
                              onClick={(e) => {
                                e.stopPropagation();
                              }} 
                            />
                          ) : (
                            <p>No images available</p>
                          )}
                        </div>
                        <div className="tour-property-info">
                          <div className="property-location">
                            <h4>{property.propertyaddress}</h4>
                            <div className="tour-property-rating">
                              <span className="rating-number">{property.rating}</span>
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
                    );
                  } else {
                    return (
                      <div 
                        className="tour-property-item" 
                        key={property.propertyid} 
                        onClick={() => handleViewDetails(property)}
                      > 
                        <div className="tour-property-image-box">
                          {property.propertyimage && property.propertyimage.length > 0 ? (
                            <ImageSlider 
                              images={property.propertyimage}
                              onClick={(e) => {
                                e.stopPropagation();
                              }} 
                            />
                          ) : (
                            <p>No images available</p>
                          )}
                        </div>
                        <div className="tour-property-info">
                          <div className="property-location">
                            <h4>{property.propertyaddress}</h4>
                            <div className="tour-property-rating">
                              <span className="rating-number">{property.rating}</span>
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
                    );
                  }
                })
              ) : (
                <p className="no-properties-message">No properties available.</p>
              )}
              
              {isLoadingMore && hasMore && [1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <SkeletonPropertyCard key={`loading-more-skeleton-${index}`} />
              ))}
            </div>
          )}
          </div>
    
          {showToast && <Toast type={toastType} message={toastMessage} />}
          <br /><br /><br /><br /><br /><br />
        <Back_To_Top_Button />
        <TawkMessenger />
        <Footer />
        </AuthProvider>
        </div>
      </div>
    );
};

export default Product;
