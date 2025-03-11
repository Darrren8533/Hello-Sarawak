import React, { useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import './Modal.css';

const Modal = ({ isOpen, title, data, labels = {}, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!isOpen) return null;

    const hasMultipleImages = data.images && data.images.length > 1;

    const nextImage = () => {
        if (hasMultipleImages) {
            setCurrentImageIndex((currentImageIndex + 1) % data.images.length);
        }
    };

    const prevImage = () => {
        if (hasMultipleImages) {
            setCurrentImageIndex(
                (currentImageIndex - 1 + data.images.length) % data.images.length
            );
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content custom-modal">
                <h2 className="modal-title">{title}</h2>
                <div className="modal-body">
                    {data.images && data.images.length > 0 ? (
                        <div className="image-slideshow">
                            {hasMultipleImages && (
                                <button className="image-slideshow-button left" onClick={prevImage}>
                                    <FaArrowLeft />
                                </button>
                            )}
                            <img
                                src={`data:image/jpeg;base64,${data.images[currentImageIndex]}`}
                                alt={`${title} - Image ${currentImageIndex + 1}`}
                                className="image-slideshow-image"
                            />
                            {hasMultipleImages && (
                                <button className="image-slideshow-button right" onClick={nextImage}>
                                    <FaArrowRight />
                                </button>
                            )}
                        </div>
                    ) : data.images ? (
                        <p>No Image Available</p>
                    ) : null}

                    {Object.keys(data).map((key) =>
                        key !== 'images' ? (
                            <p key={key}>
                                <strong>{labels[key] || key.replace(/([A-Z])/g, ' $1')}: </strong>
                                {data[key]}
                            </p>
                        ) : null
                    )}
                </div>
                <button className="close-button" onClick={onClose}>X</button>
            </div>
        </div>
    );
};

export default Modal;
