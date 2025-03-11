import React, { useState } from 'react';

//Import Icon
import { FaLocationDot } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";

//Import Css
import './contact_us.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    
    try {
      const response = await fetch('http://localhost:5000/contact_us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      setStatus(result.message); // set status based on response message

      if (response.ok) {
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      setStatus('Failed to send message. Please try again later.');
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <section className='contact'>
        <div className='content'>
          <h2>Contact Us</h2>
        </div>

        <br/>

        <div className='container_contact_us'>
          <div className='google_map'>
            <iframe 
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.9586177612214!2d110.31007237509338!3d1.749442560160908!2m3
             !1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31faff9851a3becb%3A0xf308ff203e894002!2sDamai%20Beach!5e0!3m2!1sen!2smy!4v
             1731252464570!5m2!1sen!2smy"
             width="600" 
             height="450"
             style={{border: 0}}
             allowfullscreen=""
             loading="lazy"
             referrerpolicy="no-referrer-when-downgrade">
             </iframe>
          </div>

          <div className='contactForm'>
            <form onSubmit={handleSubmit}>
              <h2>Send Message</h2>

              <div className='inputBox'>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <span>Full Name</span>
              </div>

              <div className='inputBox'>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <span>Email</span>
              </div>

              <div className='inputBox'>
                <textarea
                  name='message'
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
                <span>Your Message Here</span>
              </div>

              <button type='submit' className='btn_submit'>
                <span>Send</span>
              </button>
              <p>{status}</p> {/* Display status message */}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
