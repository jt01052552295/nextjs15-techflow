'use client';

import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faN } from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faGithub,
  faGoogle,
} from '@fortawesome/free-brands-svg-icons';

const SocialButton = () => {
  const { t } = useLanguage();

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') as string;

  const onOauth = async (provider: string) => {
    if (provider == 'naver') {
      window.location.href = '/api/oauth/request/naver';
    } else if (provider == 'kakao') {
      window.location.href = '/api/oauth/request/kakao';
    } else if (provider == 'github') {
      window.location.href = '/api/oauth/request/github';
    } else if (provider == 'google') {
      window.location.href = '/api/oauth/request/google';
    } else if (provider == 'facebook') {
      window.location.href = '/api/oauth/request/facebook';
    } else {
      console.log(provider, callbackUrl || '/main');
    }
  };

  return (
    <div className="row text-center mb-3">
      <p>- OR -</p>
      <p className="text-start">{t('common.auth.login.snsPrompt')}</p>
      <div className="d-grid gap-2">
        <button
          type="button"
          className="btn btn-dark"
          onClick={() => onOauth('github')}
        >
          <FontAwesomeIcon icon={faGithub} />
          &nbsp; {t('common.auth.login.loginWithGithub')}
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onOauth('google')}
        >
          <FontAwesomeIcon icon={faGoogle} />
          &nbsp; {t('common.auth.login.loginWithGoogle')}
        </button>
        <button
          type="button"
          className="btn btn-warning"
          onClick={() => onOauth('kakao')}
        >
          <FontAwesomeIcon icon={faComment} />
          &nbsp; {t('common.auth.login.loginWithKakao')}
        </button>
        <button
          type="button"
          className="btn btn-success"
          disabled={false}
          onClick={() => onOauth('naver')}
        >
          <FontAwesomeIcon icon={faN} />
          &nbsp; {t('common.auth.login.loginWithNaver')}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={false}
          onClick={() => onOauth('facebook')}
        >
          <FontAwesomeIcon icon={faFacebook} />
          &nbsp; {t('common.auth.login.loginWithFacebook')}
        </button>
      </div>
    </div>
  );
};

export default SocialButton;
