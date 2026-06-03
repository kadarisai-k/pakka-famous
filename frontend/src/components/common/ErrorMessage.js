import React from 'react';

const ErrorMessage = ({ message = 'Something went wrong. Please try again.', onRetry }) => {
  return (
    <div className="text-center py-5">
      <div className="mb-3" style={{ fontSize: '3rem' }}>⚠️</div>
      <h5 className="text-danger">Oops!</h5>
      <p className="text-muted">{message}</p>
      {onRetry && (
        <button className="btn btn-outline-danger mt-2" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
