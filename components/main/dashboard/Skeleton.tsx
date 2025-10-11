'use client';

const Skeleton = () => {
  return (
    <div className="card" aria-hidden="true">
      <div className="card-body">
        <h5 className="card-title placeholder-glow">
          <span className="placeholder col-6"></span>
        </h5>
        <p className="card-text placeholder-glow">
          <span className="placeholder col-12 placeholder-lg"></span>
          <span className="placeholder col-7 placeholder-lg"></span>
          <span className="placeholder col-12 placeholder-lg"></span>
        </p>
      </div>
    </div>
  );
};

export default Skeleton;
