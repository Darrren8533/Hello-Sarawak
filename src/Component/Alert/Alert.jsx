// src/components/ConfirmDialog.js
import React from 'react';
import './Alert.css';
import { FaExclamationCircle } from 'react-icons/fa';

const Alert = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-dialog">
        <div className="alert-icon">
          <FaExclamationCircle />
        </div>
        <h2 className="alert-title">
          {title || 'Are you sure?'}
        </h2>
        <p className="alert-message">
          {message || 'Are you sure you want to proceed with this action?'}
        </p>
        <div className="alert-buttons">
          <button
            className="alert-button confirm"
            onClick={onConfirm}
          >
            Yes
          </button>
          <button
            className="alert-button cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
