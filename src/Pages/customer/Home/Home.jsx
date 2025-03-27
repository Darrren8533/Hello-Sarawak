import React from 'react';
import Navbar from '../../../Component/Navbar/navbar';
import Slider from '../../../Component/Slider/slider';
import Destination from '../../../Component/Destination/Destination';
import Footer from '../../../Component/Footer/footer';
import Contact from '../../../Component/Contact Us/contact_us';
import Back_To_Top_Button from '../../../Component/Back_To_Top_Button/Back_To_Top_Button';
import TawkMessenger from '../../../Component/TawkMessenger/TawkMessenger';
import { AuthProvider } from '../../../Component/AuthContext/AuthContext';

const Customer_HomePage = () => {
  return (
    <div>
      <AuthProvider>
      <Navbar />
      <Slider />
      <Destination />
      <Contact />
      <Back_To_Top_Button />
      <Footer />
      <TawkMessenger />
      </AuthProvider>
    </div>
  );
};

export default Customer_HomePage;
