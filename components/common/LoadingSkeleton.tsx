'use client';

const LoadingSkeleton = () => {
  return (
    <div className="z-9999 position-fixed top-0 start-0 bg-light text-dark bg-opacity-50 w-100 h-100 d-flex justify-content-center align-items-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
