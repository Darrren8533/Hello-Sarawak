const API_URL = "https://cams-backend.vercel.app";

//Register
export const signupUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    return response;
  } catch (error) {
    console.error('API error:', error);
    throw error; 
  }
};

// Login
export const loginUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    return response;
  } catch (error) {
    console.error('API error:', error);
    throw error; 
  }
};

export const checkstatus = async (userID) => {
  try {
    const response = await fetch(`${API_URL}/checkStatus?userid=${userID}`, {
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error('API error:', error);
    throw error; 
  }
};

// Logout
export const logoutUser = async (userID) => {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userID }),
    });

    const responseData = await response.json();
    return responseData;
  }catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Properties Listing
export const propertiesListing = async (propertyData) => {
  try {
    const response = await fetch(`${API_URL}/propertiesListing`, {
      method: 'POST',
      body: propertyData,
    });

    if(!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create property');
    }

    const responseData = await response.json();
    return responseData;
  }catch (error) {
    console.error('API error: ', error);
    throw error;
  }
};

// Fetch Properties (Product)
export const fetchProduct = async () => {
  try {
    const response = await fetch(`${API_URL}/product`);

    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }
    const data = await response.json();
    return data; 
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error; 
  }
};

// Fetch Properties (Dashboard)
export const fetchPropertiesListingTable = async () => {

  const username = localStorage.getItem('username'); 
  try {
    const response = await fetch(`${API_URL}/propertiesListingTable?username=${username}`);

    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error('Error fetching properties', error);
    throw error;
  }
};

// Update Property
export const updateProperty = async (propertyData, propertyID) => {
  try {
    const response = await fetch(`${API_URL}/propertiesListing/${propertyID}`, {
      method: 'PUT',
      body: propertyData, // Ensure this is FormData to handle images properly
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update property');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Update property status
export const updatePropertyStatus = async (propertyID, status) => {
  try {
    const response = await fetch(`${API_URL}/updatePropertyStatus/${propertyID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyStatus: status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update property status');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Delete Property
export const deleteProperty = async (propertyID) => {
  try {
    const response = await fetch(`${API_URL}/propertiesListing/${propertyID}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete property');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Fetch Customers
export const fetchCustomers = async () => {
  try {
    const response = await fetch(`${API_URL}/users/customers`);

    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

//Fetch Owners
export const fetchOwners = async () => {
  try {
    const response = await fetch(`${API_URL}/users/owners`);

    if (!response.ok) {
      throw new Error('Failed to fetch owners');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

//Fetch Moderators
export const fetchModerators = async () => {
  try {
    const response = await fetch(`${API_URL}/users/moderators`);

    if (!response.ok) {
      throw new Error('Failed to fetch moderators');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

//Fetch Operators
export const fetchOperators = async () => {
  try {
    const response = await fetch(`${API_URL}/users/operators`);

    if (!response.ok) {
      throw new Error('Failed to fetch operators');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

//Fetch Administrator
export const fetchAdministrators = async () => {
  try {
    const response = await fetch(`${API_URL}/users/administrators`);

    if (!response.ok) {
      throw new Error('Failed to fetch administrators');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Create Moderator
export const createModerator = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/users/createModerator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to create moderator');
    }

    return response;
  } catch (error) {
    console.error('API error:', error);
    throw error; 
  }
};

// Update User
export const updateUser = async (userData, userID) => {
  try {
    const response = await fetch(`${API_URL}/users/updateUser/${userID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update user');
      } catch {
          throw new Error('Failed to update user (non-JSON error response)');
      }
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Remove User
export const removeUser = async (userID) => {
  try {
    const response = await fetch(`${API_URL}/users/removeUser/${userID}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Suspend User
export const suspendUser = async (userID) => {
  try {
    const response = await fetch(`${API_URL}/users/suspendUser/${userID}`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to suspend user');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Activate User
export const activateUser = async (userID) => {
  try {
    const response = await fetch(`${API_URL}/users/activateUser/${userID}`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to activate user');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Nodemailer For Contact Us
export const sendContactEmail = async (emailData) => {
  try {
    const response = await fetch(`${API_URL}/contact_us`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    return response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Booking Request Notification
export const requestBooking = async (reservationID) => {
  try {
    const response = await fetch(`${API_URL}/requestBooking/${reservationID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if(!response) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send booking request');
    }

    return await response.json();
  }catch (error) {
    console.error('API error: ', error);
    throw error;
  }
};

// Booking Accepted Notification
export const acceptBooking = async (reservationID) => {
  try {
    const response = await fetch(`${API_URL}/accept_booking/${reservationID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to accept booking');
    }

    return await response.json();
  }catch (error) {
    console.error('API error: ', error);
    throw error;
  }
};

// Suggest New Room
export const suggestNewRoom = async (propertyID, reservationID) => {
  try {
    const response = await fetch(`${API_URL}/suggestNewRoom/${propertyID}/${reservationID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if(!response) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to suggest new room');
    }

    return await response.json();
  } catch (error) {
    console.error('API error: ', error);
    throw error;
  }
};

// Property Listing Request Notification
export const propertyListingRequest = async (propertyID) => {
  try {
    const response = await fetch(`${API_URL}/propertyListingRequest/${propertyID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if(!response) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send property listing request');
    }

    return await response.json();
  }catch (error) {
    console.error('API error: ', error);
    throw error;
  }
};

// Property Listing Request Accepted Notification
export const propertyListingAccept = async (propertyID) => {
  try {
    const response = await fetch(`${API_URL}/propertyListingAccept/${propertyID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if(!response) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send property listing request accepted notification');
    }

    return await response.json();
  }catch (error) {
    console.error('API error: ', error);
    throw error;
  }
};

// Property Listing Request Notification
export const propertyListingReject = async (propertyID) => {
  try {
    const response = await fetch(`${API_URL}/propertyListingReject/${propertyID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if(!response) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send property listing request rejected notification');
    }

    return await response.json();
  }catch (error) {
    console.error('API error: ', error);
    throw error;
  }
};

// Send Suggest Notification 
export const sendSuggestNotification = async (reservationID, selectedOperators) => {
  try {
    const response = await fetch(`${API_URL}/sendSuggestNotification/${reservationID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userIDs: selectedOperators,  
    }),
    });

    if(!response) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send suggest notification');
    }

    return await response.json();
  } catch (error) {
    console.error('API error: ', error);
    throw error;
  }
};

// Store Reservation Data
export const createReservation = async (reservationData) => {
  try {
    const userID = localStorage.getItem('userid');
    console.log('user id is ' , userID);
    if (!userID) {
      throw new Error('User not logged in. Please log in to create a reservation.');
    }

    const reservationWithUserID = { ...reservationData, userID };
    const response = await fetch(`${API_URL}/reservation/${userID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationWithUserID),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create reservation');
    }

    const result = await response.json();
    if (!result || !result.reservationid) {
      throw new Error('No valid reservation ID received from server');
    }

    return result;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Fetch all Reservations
export const fetchReservation = async () => {
  try {
    // Retrieve the username from localStorage
    const username = localStorage.getItem('username');

    if (!username) {
      throw new Error('Username is not found in localStorage. Please log in.');
    }

    const response = await fetch(`${API_URL}/reservationTable?username=${encodeURIComponent(username)}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.reservations;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Update reservation status
export const updateReservationStatus = async (reservationID, status) => {
  try {
    const response = await fetch(`${API_URL}/updateReservationStatus/${reservationID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationStatus: status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update reservation status');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

//Cart
export const fetchCart = async () => {
  try {
      const userID = localStorage.getItem('userID');
      const response = await fetch(`${API_URL}/cart?userID=${userID}`);
      if (!response.ok) {
          throw new Error('Failed to fetch reservations');
      }

      const data = await response.json();
      console.log('Fetched reservations:', data);
      return data.reservations;
  } catch (error) {
      console.error('API error:', error);
      throw error;
  }
};

// Cancel a reservation
export const cancelReservation = async (reservationID) => {
  try {
    const response = await fetch(`${API_URL}/cancelReservation/${reservationID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel reservation');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Remove Reservation
export const removeReservation = async (reservationID) => {
  try {
    const response = await fetch(`${API_URL}/removeReservation/${reservationID}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete reservation');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

//Booking Log
export const fetchBookLog = async () => {
  try {
    const response = await fetch(`${API_URL}/users/booklog`);

    if (!response.ok) {
      throw new Error('Failed to fetch book logs');
    }

    const data = await response.json();


    return data; 
  } catch (error) {
    console.error('API error fetching book logs:', error);
    throw error;
  }
};

export const fetchFinance = async () => {
  try {
      const response = await fetch(`${API_URL}/users/finance`);
      const data = await response.json();
      return data; 
  } catch (error) {
      console.error('API error:', error);
      throw error;
  }
};

// Get Properties Of Administrator For "Suggest"
export const getOperatorProperties = async (userID) => {
  try {
    const response = await fetch(`${API_URL}/operatorProperties/${userID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if(!response) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get properties');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API error: ', error);
    throw error;
  }
};

// fetch normal user data
export const fetchUserData = async (userId) => {
  try {
      const response = await fetch(`${API_URL}/users/${userId}`);
      if (!response.ok) {
          throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('API error:', error);
      throw error;
  }
};

// fetch google user data
export const fetchGoogleUserData = async (accessToken) => {
  try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`, {
          headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
          },
      });

      if (!response.ok) {
          throw new Error('Failed to fetch Google user data');
      }

      const profile = await response.json();
      return profile;
  } catch (error) {
      console.error("Error fetching Google user data:", error);
      return null;
  }
};

// Update user profile
export const updateProfile = async (userData) => {
    try {
        // Validate user ID
        if (!userData.userid) {
            throw new Error('User ID is missing');
        }
      
        const response = await fetch(`${API_URL}/users/updateProfile/${userData.userid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user profile');
        }

        return await response.json();
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
};

//Upload Avatar
export const uploadAvatar = async (userid, base64String) => {
  try {
    if (!userid) {
      throw new Error('User ID is missing');
    }

    const response = await fetch(`${API_URL}/users/uploadAvatar/${userid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uimage: base64String }), 
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload avatar');
    }

    return data; 
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};



