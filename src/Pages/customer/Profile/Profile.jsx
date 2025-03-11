import React, { useState, useEffect } from 'react';
import Navbar from '../../../Component/Navbar/navbar';
import Footer from '../../../Component/Footer/footer';
import FrontUserProfile from '../../../Component/FrontUserProfile/FrontUserProfile';

const Profile = () => {
  return (
    <div>
      <Navbar />
      <br /><br /><br /><br /><br /><br />
        <FrontUserProfile />
        <br/>
      <Footer />
    </div>
  )
}

export default Profile