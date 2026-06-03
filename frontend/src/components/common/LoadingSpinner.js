import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center"
           style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">{message}</p>
      </div>
    );
  }
  return (
    <div className="text-center py-4">
      <div className="spinner-border text-danger" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted mt-2 mb-0 small">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
