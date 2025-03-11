import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../../Component/Toast/Toast';
import ImageSlider from '../../../Component/ImageSlider/ImageSlider';

// Import Components
import Navbar from '../../../Component/Navbar/navbar';
import Footer from '../../../Component/Footer/footer';
import Back_To_Top_Button from '../../../Component/Back_To_Top_Button/Back_To_Top_Button';

// Import API
import { fetchProduct} from '../../../../../Backend/Api/api';

// Import React Icons and CSS
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import './product.css';

const Product = () => {
  const [properties, setProperties] = useState([]);
  const [rating] = useState(4.5);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('');
  const [bookingData, setBookingData] = useState({
    arrivalDate: '',
    departureDate: '',
    firstname: '',
    lastname: '',
    email: '',
    phonenumber: '',
    rcTitle: 'Mr.',
    request: '',
    adults: 1,
    children: 0,
  });
  const navigate = useNavigate();

  const displayToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const fetchedProperties = await fetchProduct();
        setProperties(fetchedProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    loadProperties();
  }, []);

  const handleViewDetails = (property) => {
    navigate(`/product/${property.propertyID}`, { 
      state: { propertyDetails: property }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
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

  return (
    <div>
      {<Navbar />}
      <br /><br /><br />

      <section className="home" id="home">
        <div className="container">
          <div className="content grid">
            <div className="box">
              <span>ARRIVAL DATE</span> <br />
              <input type="date" name="arrivalDate" onChange={handleInputChange} />
            </div>
            <div className="box">
              <span>DEPARTURE DATE</span> <br />
              <input type="date" name="departureDate" onChange={handleInputChange} />
            </div>
            <div className="box">
              <span>ADULTS</span> <br />
              <input type="number" name="adults" onChange={handleInputChange} placeholder="1" />
            </div>
            <div className="box">
              <span>CHILDREN</span> <br />
              <input type="number" name="children" onChange={handleInputChange} placeholder="0" />
            </div>
            <div className="box">
              <button className="view_button_availability">
                Check Availability
                <i className="fas fa-arrow-circle-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="property-container">
        <h2>Available Properties</h2>
        <div className="scrollable-container">
          {properties.length > 0 ? (
            properties.map((property) => (
              <div className="tour-property-item" key={property.ID} onClick={() => handleViewDetails(property)}> 
                <div className="tour-property-image-container">
                  {property.propertyImage ? (
                    <ImageSlider images={property.propertyImage}
                    onClick={(e) => {
                      e.stopPropagation();
                    }} />
                  ) : (
                    <p>No images available</p>
                  )}
                </div>
                <div className="tour-property-info">
                  <h4>{property.categoryName}</h4>
                  <div className="tour-property-rating">{renderStars(rating)}</div>
                  <h5>From ${property.rateAmount}/night</h5>
                </div>
              </div>
            ))
          ) : (
            <p>No properties available.</p>
          )}
        </div>
      </div>

      {showToast && <Toast type={toastType} message={toastMessage} />}
      <br /><br />
      <Back_To_Top_Button />
      <Footer />
    </div>
  );
};

export default Product;