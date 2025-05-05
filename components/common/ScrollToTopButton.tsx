'use client';

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 50,
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        cursor: 'pointer',
      }}
    >
      <FontAwesomeIcon icon={faArrowUp} />
    </button>
  );
};

export default ScrollToTopButton;
