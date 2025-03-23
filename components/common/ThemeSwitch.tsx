'use client';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun } from '@fortawesome/free-regular-svg-icons';
import { faMoon } from '@fortawesome/free-solid-svg-icons';

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-light"
        onClick={() => setTheme('light')}
      >
        <FontAwesomeIcon icon={faSun} />
      </button>
      <button
        type="button"
        className="btn btn-dark"
        onClick={() => setTheme('dark')}
      >
        <FontAwesomeIcon icon={faMoon} />
      </button>
    </>
  );
};

export default ThemeSwitch;
