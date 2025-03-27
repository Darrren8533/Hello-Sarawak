import React, { useState, useEffect } from 'react';
import Navbar from '../../../Component/Navbar/navbar';
import Footer from '../../../Component/Footer/footer';
import FrontUserProfile from '../../../Component/FrontUserProfile/FrontUserProfile';
import { AuthProvider } from '../../../Component/AuthContext/AuthContext';

const Profile = () => {
  return (
    <div>
      <AuthProvider>
      <Navbar />
      <FrontUserProfile />
      <Footer />
      </AuthProvider>
    </div>
  )
}

export default Profile
