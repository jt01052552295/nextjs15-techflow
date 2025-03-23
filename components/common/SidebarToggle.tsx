'use client';
import { useState, useEffect } from 'react';
import { useCollapseStore } from '@/store/sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarsStaggered } from '@fortawesome/free-solid-svg-icons';

const SidebarToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { toggleCollapse } = useCollapseStore();
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      className="btn btn-default"
      type="button"
      onClick={() => toggleCollapse()}
    >
      <FontAwesomeIcon icon={faBarsStaggered} />
    </button>
  );
};

export default SidebarToggle;
