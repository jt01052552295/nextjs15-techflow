import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="page-load bg-light text-dark bg-opacity-50 d-flex justify-content-center align-items-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
