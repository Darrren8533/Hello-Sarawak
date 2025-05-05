import React, { useState, useEffect } from 'react';
import { fetchGoogleUserData } from '../../../Api/api';
import './UserActivityCell.css';

const UserActivityCell = ({ user }) => {
    const [avatarSrc, setAvatarSrc] = useState(null);
    const googleAccessToken = localStorage.getItem('googleAccessToken');

    const statusMap = {
        'online': 'status-online',
        'offline': 'status-offline',
        'registered': 'status-registered',
    };

    useEffect(() => {
        const fetchAvatar = async () => {
            try {

                if (user.uimage && user.uimage.length > 0) {
                    setAvatarSrc(`data:image/jpeg;base64,${user.uimage}`);
                    console.log('Using base64 uimage:', user.uimage);
                }

                else if (googleAccessToken) {
                    console.log('Fetching Google avatar with token:', googleAccessToken);
                    const googleData = await fetchGoogleUserData(googleAccessToken);
                    if (googleData && googleData.picture) {
                        setAvatarSrc(googleData.picture);
                        console.log('Google avatar fetched:', googleData.picture);
                    } else {
                        console.warn('No picture in Google data:', googleData);
                        setAvatarSrc('/public/avatar.png');
                    }
                }

                else {
                    console.log('No uimage or Google token, using default avatar');
                    setAvatarSrc('/public/avatar.png');
                }
            } catch (error) {
                console.error('Error fetching avatar:', error);
                setAvatarSrc('/public/avatar.png');
            }
        };

        fetchAvatar();
    }, [user.uimage, googleAccessToken]);


    const statusClass = statusMap[user.ustatus?.toLowerCase()] || 'status-offline';

    return (
        <div className="user-container">
            <div className="avatar-container">
                <img
                    src={avatarSrc}
                    alt={user.username || 'Avatar'}
                    className="table-user-avatar"
                    onError={(e) => {
                        console.error(`Failed to load avatar for user ${user.userid}:`, avatarSrc, e);
                        e.target.src = '/public/avatar.png';
                    }}
                />
                <span className={`status-dot ${statusClass}`} />
            </div>
            <span className="table-user-username">{user.username || 'N/A'}</span>
        </div>
    );
};

export default UserActivityCell;