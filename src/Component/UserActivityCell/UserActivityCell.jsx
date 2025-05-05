import React, { useState, useEffect } from 'react';
import { fetchGoogleUserData } from '../../../Api/api';
import './UserActivityCell.css';

const UserActivityCell = ({ user }) => {
    const [avatarSrc, setAvatarSrc] = useState(null);
    const [hasFallback, setHasFallback] = useState(false); // Track fallback attempts
    const googleAccessToken = localStorage.getItem('googleAccessToken');

    const statusMap = {
        'online': 'status-online',
        'offline': 'status-offline',
        'registered': 'status-registered',
    };

    // Validate Base64 string
    const isValidBase64 = (str) => {
        try {
            return typeof str === 'string' && /^[A-Za-z0-9+/=]+$/.test(str) && atob(str);
        } catch (e) {
            console.warn('Invalid Base64 string:', str, e);
            return false;
        }
    };

    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                setHasFallback(false); // Reset fallback state

                // Case 1: Use uimage if it starts with http (e.g., Google URL)
                if (user.uimage && user.uimage.length > 0 && user.uimage.startsWith('http')) {
                    console.log('Using uimage as URL:', user.uimage);
                    setAvatarSrc(user.uimage);
                    return;
                }

                // Case 2: Use Base64 image if valid
                if (user.uimage && user.uimage.length > 0 && isValidBase64(user.uimage)) {
                    const base64Src = `data:image/jpeg;base64,${user.uimage}`;
                    console.log('Using base64 uimage:', base64Src);
                    setAvatarSrc(base64Src);
                    return;
                }

                // Case 3: Fetch Google avatar if token exists
                if (googleAccessToken) {
                    console.log('Fetching Google avatar with token:', googleAccessToken);
                    const googleData = await fetchGoogleUserData(googleAccessToken);
                    if (googleData && googleData.picture && googleData.picture.startsWith('http')) {
                        console.log('Google avatar URL fetched:', googleData.picture);
                        setAvatarSrc(googleData.picture);
                        return;
                    } else {
                        console.warn('No valid picture URL in Google data:', googleData);
                    }
                }

                // Case 4: Fallback to default avatar
                console.log('No uimage or Google token, using default avatar');
                setAvatarSrc('/public/avatar.png');
            } catch (error) {
                console.error('Error fetching avatar:', error);
                setAvatarSrc('/public/avatar.png');
            }
        };

        fetchAvatar();
    }, [user.uimage, googleAccessToken]);

    const handleImageError = (e) => {
        if (!hasFallback) {
            console.error(`Failed to load avatar for user ${user.userid}:`, avatarSrc, e);
            setHasFallback(true);
            e.target.src = '/public/avatar.png'; // Attempt fallback
        } else {
            console.error('Default avatar failed to load, using placeholder:', e);
            e.target.src = 'https://via.placeholder.com/40?text=User'; // Final fallback
        }
    };

    const statusClass = statusMap[user.ustatus?.toLowerCase()] || 'status-offline';

    return (
        <div className="user-container">
            <div className="avatar-container">
                <img
                    src={avatarSrc || 'https://via.placeholder.com/40?text=User'} // Initial placeholder
                    alt={user.username || 'Avatar'}
                    className="table-user-avatar"
                    onError={handleImageError}
                />
                <span className={`status-dot ${statusClass}`} />
            </div>
            <span className="table-user-username">{user.username || 'N/A'}</span>
        </div>
    );
};

export default UserActivityCell;
