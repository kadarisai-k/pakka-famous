import React from 'react';

const EmptyState = ({ icon = '📦', title = 'Nothing here yet', message = '', actionLabel, onAction }) => {
  return (
    <div className="text-center py-5">
      <div className="mb-3" style={{ fontSize: '3rem' }}>{icon}</div>
      <h5 className="fw-semibold">{title}</h5>
      {message && <p className="text-muted">{message}</p>}
      {actionLabel && onAction && (
        <button className="btn btn-danger mt-2" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
