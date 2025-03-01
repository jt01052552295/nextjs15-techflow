'use client';
import { useEffect } from 'react';

const InstallBootstrap = () => {
  useEffect(() => {
    // @ts-expect-error: Dynamic import for Bootstrap JS
    import('bootstrap/dist/js/bootstrap.bundle.js');
  }, []);
  return <></>;
};

export default InstallBootstrap;
