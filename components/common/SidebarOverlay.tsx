'use client';
import React from 'react';
import { useCollapseStore } from '@/store/sidebar';

const SidebarOverlay = () => {
  const { setCollapse } = useCollapseStore();

  const handleOverlayClick = () => {
    setCollapse(false);
  };
  return <div className="sidebar-overlay" onClick={handleOverlayClick}></div>;
};

export default SidebarOverlay;
