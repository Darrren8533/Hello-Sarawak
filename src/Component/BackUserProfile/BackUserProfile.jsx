import React, { useState, useEffect } from 'react';
import { fetchGoogleUserData, fetchUserData, updateProfile, uploadAvatar } from '../../../Api/api';
import Toast from '../Toast/Toast';
import './BackUserProfile.css';
import { FaUser, FaLock, FaCamera, FaEye, FaEyeSlash } from 'react-icons/fa';
import { CountryDropdown } from 'react-country-region-selector';

const BackUserProfile = () => {
    const [userData, setUserData] = useState({});
    const [avatar, setAvatar] = useState('');
    const [previewAvatar, setPreviewAvatar] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState('');
    const [activeTab, setActiveTab] = useState('account');
    const [showPassword, setShowPassword] = useState(false);

    const userid = localStorage.getItem('userid');
    const googleAccessToken = localStorage.getItem('googleAccessToken');

    const generateRandomNumber = () => Math.floor(100000 + Math.random() * 900000);

    useEffect(() => {
        const loadUserDetails = async () => {
            if (!userid || isNaN(userid)) {
                displayToast('error', 'Invalid or missing user ID');
                return;
            }

            try {
                const data = await fetchUserData(userid);

                // Assign a username if missing
                if (!data.username) {
                    const randomNumber = generateRandomNumber();
                    data.username = data.ufirstname ? `${data.ufirstname}_${randomNumber}` : `user_${randomNumber}`;
                }

                if (data.udob) {
                    data.udob = new Date(data.udob).toISOString().split('T')[0];
                }

                let imageSrc = '../../public/avatar.png';

                if (data.uimage) {
                    if (data.uimage.startsWith('http')) {
                        imageSrc = data.uimage;
                    } else {
                        imageSrc = `data:image/jpeg;base64,${data.uimage}`;
                    }
                }

                setUserData(data);
                setPreviewAvatar(imageSrc);
            } catch (error) {
                displayToast('error', 'Error fetching user data');
            }
        };

        if (googleAccessToken) {
            fetchGoogleUserData(googleAccessToken)
                .then((profile) => {
                    setUserData((prevUserData) => {
                        const randomNumber = generateRandomNumber();
                        const updatedUserData = {
                            ...prevUserData,
                            ufirstname: profile.given_name,
                            ulastname: profile.family_name,
                            uemail: profile.email,
                        };

                        if (!prevUserData.username) {
                            updatedUserData.username = profile.given_name
                                ? `${profile.given_name}_${randomNumber}`
                                : `user_${randomNumber}`;
                        }

                        if (!prevUserData.uimage) {
                            updatedUserData.uimage = profile.picture;
                            setPreviewAvatar(profile.picture);
                        }

                        return updatedUserData;
                    });
                })
                .catch(() => displayToast('error', 'Error fetching Google profile'));
        }

        loadUserDetails();
    }, [userid, googleAccessToken]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevUserData) => ({
            ...prevUserData,
            [name]: value,
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                setPreviewAvatar(reader.result);
                setUserData((prevData) => ({ ...prevData, uimage: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

   const handleAvatarUpload = async () => {
    if (!avatar) {
        return displayToast('error', 'Please select an avatar to upload');
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1]; 

        try {
            
            const data = await uploadAvatar(userData, base64String);
            displayToast('success', 'Avatar uploaded successfully');

            
            const updatedUserData = await fetchUserData(userData.userid);
            setUserData(updatedUserData);

            
            setPreviewAvatar(`data:image/jpeg;base64,${updatedUserData.uimage}`);
        } catch (error) {
            console.error('Avatar Upload Error:', error);
            displayToast('error', error.message || 'Failed to upload avatar');
        }
    };
    reader.readAsDataURL(avatar);
};


    const handleUpdate = async () => {
    const nameRegex = /^[A-Za-z\s]*$/;
    const usernameRegex = /^[a-zA-Z0-9_]{6,15}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; 
    const phoneRegex = /^[0-9]{10,15}$/; 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

    try {
        // Validate fields based on active tab
        if (activeTab === 'account') {
            // Name validation
            if (!userData.ufirstname?.trim() || !userData.ulastname?.trim()) {
                throw new Error('First and last name cannot be empty');
            }
            if (!nameRegex.test(userData.ufirstname) || !nameRegex.test(userData.ulastname)) {
                throw new Error('Name should only contain letters and spaces');
            }

            // Phone validation
            if (userData.uphoneno && !phoneRegex.test(userData.uphoneno)) {
                throw new Error('Phone number should contain 10-15 digits');
            }

            // Email validation
            if (!emailRegex.test(userData.uemail)) {
                throw new Error('Please enter a valid email address');
            }
        } else if (activeTab === 'security') {
            // Username validation
            if (!usernameRegex.test(userData.username)) {
                throw new Error('Username must be 6-15 characters (letters, numbers, underscores)');
            }

            // Password validation
            if (userData.password && !passwordRegex.test(userData.password)) {
                throw new Error('Password must be 8+ characters with at least 1 letter and 1 number');
            }
        }

        // Add userid to the payload
        const payload = { ...userData, userid };


        console.log('Update Payload:', payload);


        const response = await updateProfile(payload);
        if (!response.success) {
            throw new Error(response.message || 'Failed to update profile');
        }


        displayToast('success', 'Profile updated successfully');
    } catch (error) {
        console.error('Update Error:', error);
        displayToast('error', error.message);
    }
};

    const displayToast = (type, message) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const handleCountryChange = (val) => {
        setUserData((prevUserData) => ({
            ...prevUserData,
            ucountry: val,
        }));
    };

    return (
        <div className="back-profile-container">
            {showToast && <Toast type={toastType} message={toastMessage} />}

            <div className="back-profile-grid">
                <div className="back-profile-left-column">
                    <div className="back-profile-avatar-section">
                        <div className="back-profile-avatar-wrapper">
                            <img
                                src={previewAvatar || '/avatar.png'}
                                alt="User Avatar"
                                className="back-profile-avatar-image"
                            />
                            <label htmlFor="avatar-upload" className="back-profile-camera-icon">
                                <FaCamera />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                        <div className="back-user-name">
                            <h2>{userData.ufirstname || ''} {userData.ulastname || ''}</h2>
                        </div>
                        <button type="button" className="back-profile-save-avatar-button" onClick={handleAvatarUpload}>
                            Save Avatar
                        </button>
                    </div>
                </div>

                <div className="back-profile-right-column">
                    <div className="back-profile-tabs">
                        <button className={`back-profile-tab-button ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
                            <FaUser /> Account Settings
                        </button>
                        <button className={`back-profile-tab-button ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                            <FaLock /> Security
                        </button>
                    </div>

                    <div className="back-profile-tab-content">
                        {activeTab === 'account' && (
                            <form className="back-profile-form">
                                <div className="back-profile-form-group">
                                    <label>First Name</label>
                                    <input type="text" name="ufirstname" value={userData.ufirstname || ''} onChange={handleInputChange} />
                                </div>

                                <div className="back-profile-form-group">
                                    <label>Last Name</label>
                                    <input type="text" name="ulastname" value={userData.ulastname || ''} onChange={handleInputChange} />
                                </div>

                                <div className="back-profile-form-group">
                                    <label>Date of Birth</label>
                                    <input type="date" name="udob" value={userData.udob || ''} onChange={handleInputChange} />
                                </div>

                                <div className="back-profile-form-group">
                                    <label>Title</label>
                                    <input type="text" name="uTitle" value={userData.uTitle || ''} onChange={handleInputChange} />
                                </div>

                                <div className="back-profile-form-group">
                                    <label>Gender</label>
                                    <select name="uGender" value={userData.uGender || ''} onChange={handleInputChange}>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="back-profile-form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="uemail"
                                        value={userData.uemail || ''}
                                        onChange={handleInputChange}
                                        readOnly
                                    />
                                </div>

                                <div className="back-profile-form-group">
                                    <label>Phone Number</label>
                                    <input type="text" name="uphoneno" value={userData.uphoneno || ''} onChange={handleInputChange} />
                                </div>

                                <div className="back-profile-form-group">
                                    <label>Country</label>
                                    <CountryDropdown
                                        value={userData.ucountry || ''}
                                        onChange={handleCountryChange}
                                    />
                                </div>

                                <div className="back-profile-form-group">
                                    <label>Zip Code</label>
                                    <input type="text" name="uzipcode" value={userData.uzipcode || ''} onChange={handleInputChange} />
                                </div>

                                <button type="button" className="back-profile-update-button" onClick={handleUpdate}>
                                    Update Profile
                                </button>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <form className="back-profile-form">
                                <div className="back-profile-form-group">
                                    <label>Username</label>
                                    <input type="text" name="username" value={userData.username || ''} onChange={handleInputChange} />
                                </div>

                                <div className="back-profile-form-group">
                                    <label>Password</label>
                                    <div className="back-password-input-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={userData.password || ''}
                                            onChange={handleInputChange}
                                            className="back-password-input"
                                        />
                                        <span className="back-password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                                        </span>
                                    </div>
                                </div>

                                <button type="button" className="back-profile-update-button" onClick={handleUpdate}>
                                    Update Profile
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackUserProfile;
