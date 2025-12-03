import LoginForm from '@/components/auth/LoginForm';
import { Suspense } from 'react';
async function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

export default LoginPage;
