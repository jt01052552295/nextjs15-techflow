import AccountForm from '@/components/auth/AccountForm';
import { Suspense } from 'react';
const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountForm />
    </Suspense>
  );
};

export default Page;
