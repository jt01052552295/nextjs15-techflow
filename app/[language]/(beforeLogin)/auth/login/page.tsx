import LoginForm from '@/components/auth/LoginForm';
import { __ts } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';

type Props = {
  params: { language: LocaleType };
};

async function LoginPage({ params }: Props) {
  const { language } = await params;

  const welcome = await __ts('common.welcome', {}, language);
  console.log('Welcome (dynamic):', welcome);
  return <LoginForm />;
}

export default LoginPage;
