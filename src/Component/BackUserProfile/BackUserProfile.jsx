import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGoogleUserData, fetchUserData, updateProfile, uploadAvatar } from '../../../Api/api';
import Toast from '../Toast/Toast';
import Loader from '../../Component/Loader/Loader';
import './BackUserProfile.css';
import { FaUser, FaLock, FaCamera, FaEye, FaEyeSlash } from 'react-icons/fa';
import { CountryDropdown } from 'react-country-region-selector';

const BackUserProfile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({});
    const [avatar, setAvatar] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState('');
    const [activeTab, setActiveTab] = useState('account');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const userid = localStorage.getItem('userid');
    const googleAccessToken = localStorage.getItem('googleAccessToken');

    const generateRandomNumber = () => Math.floor(100000 + Math.random() * 900000);

    useEffect(() => {
        const loadUserDetails = async () => {
            setIsLoading(true);
            if (!userid || isNaN(userid)) {
                displayToast('error', 'Invalid or missing user ID');
                setIsLoading(false);
                return;
            }

            try {
                const data = await fetchUserData(userid);

                if (!data.username) {
                    const randomNumber = generateRandomNumber();
                    data.username = data.ufirstname ? `${data.ufirstname}_${randomNumber}` : `user_${randomNumber}`;
                }

                if (data.udob) {
                    data.udob = new Date(data.udob).toISOString().split('T')[0];
                }

                let imageSrc = '../../public/avatar.png';
                if (data.uimage) {
                    imageSrc = data.uimage.startsWith('http') 
                        ? data.uimage 
                        : `data:image/jpeg;base64,${data.uimage}`;
                }

                // Set default "Not Provided" for empty fields
                const defaultData = {
                    ufirstname: data.ufirstname || 'Not Provided',
                    ulastname: data.ulastname || 'Not Provided',
                    uemail: data.uemail || 'Not Provided',
                    uphoneno: data.uphoneno || 'Not Provided',
                    uzipcode: data.uzipcode || 'Not Provided',
                    username: data.username || 'Not Provided',
                    ugender: data.ugender || 'Not Provided',
                    ...data
                };

                setUserData(defaultData);
                setPreviewAvatar(imageSrc);
            } catch (error) {
                displayToast('error', 'Error fetching user data');
            }
            setIsLoading(false);
        };

        if (googleAccessToken) {
            fetchGoogleUserData(googleAccessToken)
                .then((profile) => {
                    setUserData((prevUserData) => {
                        const randomNumber = generateRandomNumber();
                        const updatedUserData = {
                            ...prevUserData,
                            ufirstname: profile.given_name || 'Not Provided',
                            ulastname: profile.family_name || 'Not Provided',
                            uemail: profile.email || 'Not Provided',
                        };

                        if (!prevUserData.username || prevUserData.username === 'Not Provided') {
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
            [name]: value
        }));
    };

    const handleFocus = (e) => {
        const { name, value } = e.target;
        if (value === 'Not Provided') {
            setUserData((prevUserData) => ({
                ...prevUserData,
                [name]: ''
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (!value.trim()) {
            setUserData((prevUserData) => ({
                ...prevUserData,
                [name]: 'Not Provided'
            }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAvatar(file);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxSize = 200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                setPreviewAvatar(resizedBase64);
                setUserData((prevData) => ({ ...prevData, uimage: resizedBase64.split(',')[1] }));
            };
        };
    };

    const handleAvatarUpload = async () => {
        if (!avatar) {
            return displayToast('error', 'Please select an avatar to upload');
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            let base64String = reader.result.split(',')[1];

            try {
                const response = await uploadAvatar(userData.userid, base64String);
                if (response.success) {
                    displayToast('success', response.message);
                    setPreviewAvatar(`data:image/jpeg;base64,${response.data.uimage}`);
                    setUserData((prevData) => ({
                        ...prevData,
                        uimage: response.data.uimage,
                    }));
                }
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
        let updateMessage = 'Profile updated successfully';

        if (activeTab === 'account') {
            if (userData.ufirstname === 'Not Provided' || userData.ulastname === 'Not Provided') {
                throw new Error('First and last name cannot be empty');
            }
            if (!nameRegex.test(userData.ufirstname) || !nameRegex.test(userData.ulastname)) {
                throw new Error('Name should only contain letters and spaces');
            }
            if (userData.uphoneno && userData.uphoneno !== 'Not Provided' && !phoneRegex.test(userData.uphoneno)) {
                throw new Error('Phone number should contain 10-15 digits');
            }
            if (userData.uemail === 'Not Provided' || !emailRegex.test(userData.uemail)) {
                throw new Error('Please enter a valid email address');
            }
        } else if (activeTab === 'security') {
            if (userData.username === 'Not Provided' || !usernameRegex.test(userData.username)) {
                throw new Error('Username must be 6-15 characters (letters, numbers, underscores)');
            }
            if (userData.password && userData.password !== 'Not Provided' && !passwordRegex.test(userData.password)) {
                throw new Error('Password must be 8+ characters with at least 1 letter and 1 number');
            }
        }

        const payload = { ...userData, userid };
        const response = await updateProfile(payload);

        if (!response.success) {
            throw new Error(response.message || 'Failed to update profile');
        }

        // Determine the update message based on the updated fields
        if (userData.username !== 'Not Provided' || userData.password !== 'Not Provided') {
            updateMessage = 'Profile updated successfully. You need to log in again to reflect your changes';
            
            setTimeout(() => {    
                localStorage.clear();
                navigate('/login');
            }, 5000);
        }

        displayToast('success', updateMessage);

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
            {isLoading ? (
                <div className="loader-box">
                    <Loader />
                </div>
            ) : (
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
                                <h2>{userData.ufirstname === 'Not Provided' ? '' : userData.ufirstname} {userData.ulastname === 'Not Provided' ? '' : userData.ulastname}</h2>
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
                                        <input 
                                            type="text" 
                                            name="ufirstname" 
                                            value={userData.ufirstname || ''} 
                                            onChange={handleInputChange}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                        />
                                    </div>
                                    <div className="back-profile-form-group">
                                        <label>Last Name</label>
                                        <input 
                                            type="text" 
                                            name="ulastname" 
                                            value={userData.ulastname || ''} 
                                            onChange={handleInputChange}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                        />
                                    </div>
                                    <div className="back-profile-form-group">
                                        <label>Date of Birth</label>
                                        <input 
                                            type="date" 
                                            name="udob" 
                                            value={userData.udob || ''} 
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="back-profile-form-group">
                                        <label>Title</label>
                                        <select 
                                            name="utitle" 
                                            value={userData.utitle} 
                                            onChange={handleInputChange}
                                        >
                                            <option value="Mr.">Mr.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="Ms.">Ms.</option>
                                            <option value="Miss">Miss</option>
                                            <option value="Madam">Madam</option>
                                        </select>
                                    </div>
                                    <div className="back-profile-form-group">
                                        <label>Gender</label>
                                        <select 
                                            name="ugender" 
                                            value={userData.ugender || 'Not Provided'} 
                                            onChange={handleInputChange}
                                        >
                                            <option value="Not Provided">Not Provided</option>
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
                                            readOnly 
                                        />
                                    </div>
                                    <div className="back-profile-form-group">
                                        <label>Phone Number</label>
                                        <input 
                                            type="text" 
                                            name="uphoneno" 
                                            value={userData.uphoneno || ''} 
                                            onChange={handleInputChange}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                        />
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
                                        <input 
                                            type="text" 
                                            name="uzipcode" 
                                            value={userData.uzipcode || ''} 
                                            onChange={handleInputChange}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                        />
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
                                        <input 
                                            type="text" 
                                            name="username" 
                                            value={userData.username || ''} 
                                            onChange={handleInputChange}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                        />
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
            )}
        </div>
    );
};

export default BackUserProfile;
