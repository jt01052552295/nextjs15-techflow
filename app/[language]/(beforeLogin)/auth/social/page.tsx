import SocialRegisterForm from '@/components/auth/SocialRegisterForm';
import { Suspense } from 'react';
const SocialPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SocialRegisterForm />
    </Suspense>
  );
};

export default SocialPage;
