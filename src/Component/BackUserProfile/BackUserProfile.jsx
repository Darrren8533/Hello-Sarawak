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

    const userID = localStorage.getItem('userID');
    const googleAccessToken = localStorage.getItem('googleAccessToken');

    const generateRandomNumber = () => Math.floor(100000 + Math.random() * 900000);

    useEffect(() => {
        const loadUserDetails = async () => {
            if (!userID || isNaN(userID)) {
                displayToast('error', 'Invalid or missing user ID');
                return;
            }

            try {
                const data = await fetchUserData(userID);

                // Assign a username if missing
                if (!data.username) {
                    const randomNumber = generateRandomNumber();
                    data.username = data.uFirstName ? `${data.uFirstName}_${randomNumber}` : `user_${randomNumber}`;
                }

                if (data.uDOB) {
                    data.uDOB = new Date(data.uDOB).toISOString().split('T')[0];
                }

                let imageSrc = '../../public/avatar.png';

                if (data.uImage) {
                    if (data.uImage.startsWith('http')) {
                        imageSrc = data.uImage;
                    } else {
                        imageSrc = `data:image/jpeg;base64,${data.uImage}`;
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
                            uFirstName: profile.given_name,
                            uLastName: profile.family_name,
                            uEmail: profile.email,
                        };

                        if (!prevUserData.username) {
                            updatedUserData.username = profile.given_name
                                ? `${profile.given_name}_${randomNumber}`
                                : `user_${randomNumber}`;
                        }

                        if (!prevUserData.uImage) {
                            updatedUserData.uImage = profile.picture;
                            setPreviewAvatar(profile.picture);
                        }

                        return updatedUserData;
                    });
                })
                .catch(() => displayToast('error', 'Error fetching Google profile'));
        }

        loadUserDetails();
    }, [userID, googleAccessToken]);

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
                setUserData((prevData) => ({ ...prevData, uImage: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatar) return displayToast('error', 'Please select an avatar to upload');

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result.split(',')[1]; // Extract Base64 data

            try {
                const data = await uploadAvatar(userID, base64String); // Send Base64 string
                displayToast('success', 'Avatar uploaded successfully');

                const updatedUserData = await fetchUserData(userID);
                setUserData(updatedUserData);
                setPreviewAvatar(`data:image/jpeg;base64,${updatedUserData.uImage}`);
            } catch (error) {
                console.error("Avatar Upload Error:", error);
                displayToast('error', error.message || 'Failed to upload avatar');
            }
        };
        reader.readAsDataURL(avatar); // Convert image to Base64
    };

    const handleUpdate = async () => {
        const nameRegex = /^[A-Za-z\s]*$/;
        const usernameRegex = /^[a-zA-Z0-9]*$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        const phoneRegex = /^[0-9]*$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        try {
            // Validate fields based on active tab
            if (activeTab === 'account') {
                // Name validation
                if (!userData.uFirstName?.trim() || !userData.uLastName?.trim()) {
                    throw new Error('First and last name cannot be empty');
                }
                if (!nameRegex.test(userData.uFirstName) || !nameRegex.test(userData.uLastName)) {
                    throw new Error('Name should only contain letters and spaces');
                }

                // Phone validation
                if (userData.uPhoneNo && !phoneRegex.test(userData.uPhoneNo)) {
                    throw new Error('Phone number should contain only numbers');
                }

                // Email validation
                if (!emailRegex.test(userData.uEmail)) {
                    throw new Error('Please enter a valid email address');
                }
            } else if (activeTab === 'security') {
                // Username validation
                if (!usernameRegex.test(userData.username)) {
                    throw new Error('Username must be 6-15 characters (letters, numbers, underscores)');
                }

                // Password validation
                if (userData.password && !passwordRegex.test(userData.password)) {
                    throw new Error('Password must be 6-20 characters with at least 1 letter and 1 number');
                }
            }

            // Update profile
            const response = await updateProfile(userData);
            if (!response.success) throw new Error('Failed to update profile');
            displayToast('success', 'Profile updated successfully');
        } catch (error) {
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
            uCountry: val,
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
                            <h2>{userData.uFirstName || ''} {userData.uLastName || ''}</h2>
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
                                    <input type="text" name="uFirstName" value={userData.uFirstName || ''} onChange={handleInputChange} />
                                </div>

                                <div className="back-profile-form-group">
                                    <label>Last Name</label>
                                    <input type="text" name="uLastName" value={userData.uLastName || ''} onChange={handleInputChange} />
                                </div>

                                <div className="back-profile-form-group">
                                    <label>Date of Birth</label>
                                    <input type="date" name="uDOB" value={userData.uDOB || ''} onChange={handleInputChange} />
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
                                        name="uEmail"
                                        value={userData.uEmail || ''}
                                        onChange={handleInputChange}
                                        readOnly
                                    />
                                </div>

                                <div className="back-profile-form-group">
                                    <label>Phone Number</label>
                                    <input type="text" name="uPhoneNo" value={userData.uPhoneNo || ''} onChange={handleInputChange} />
                                </div>

                                <div className="back-profile-form-group">
                                    <label>Country</label>
                                    <CountryDropdown
                                        value={userData.uCountry || ''}
                                        onChange={handleCountryChange}
                                    />
                                </div>

                                <div className="back-profile-form-group">
                                    <label>Zip Code</label>
                                    <input type="text" name="uZipCode" value={userData.uZipCode || ''} onChange={handleInputChange} />
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