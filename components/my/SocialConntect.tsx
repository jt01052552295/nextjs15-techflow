'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faN } from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faGithub,
  faGoogle,
} from '@fortawesome/free-brands-svg-icons';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const SocialConnect = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') as string;

  // 사용자의 연결된 계정 목록
  const connectedAccounts = user?.accounts || [];

  // 이미 연결된 소셜 계정 확인
  const isConnected = (provider: string) => {
    return connectedAccounts.some((account) => account.provider === provider);
  };

  const onConnect = async (provider: string) => {
    setIsConnecting(provider);
    try {
      if (provider == 'naver') {
        window.location.href = '/api/oauth/request/naver?mode=connect';
      } else if (provider == 'kakao') {
        window.location.href = '/api/oauth/request/kakao?mode=connect';
      } else if (provider == 'github') {
        window.location.href = '/api/oauth/request/github?mode=connect';
      } else if (provider == 'google') {
        window.location.href = '/api/oauth/request/google?mode=connect';
      } else if (provider == 'facebook') {
        window.location.href = '/api/oauth/request/facebook?mode=connect';
      } else {
        setIsConnecting(null);
        console.log(provider, callbackUrl || '/main');
      }
    } catch (error) {
      console.error('소셜 계정 연결 오류:', error);
      toast.error(t('common.unknown_error'));
      setIsConnecting(null);
    }
  };

  const onDisconnect = async (provider: string) => {
    if (connectedAccounts.length <= 1) {
      toast.error(t('common.oauth.error.minimumAccountRequired'));
      return;
    }
    setIsConnecting(provider);
    const providerName = t(`common.oauth.provider.${provider}`);
    try {
      const response = await fetch(`/api/oauth/disconnect/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            t('common.oauth.error.revokeToken', {
              provider: providerName,
            }),
        );
      }

      toast.success(
        t('common.oauth.success.revokeToken', {
          provider: providerName,
        }),
      );
      // 페이지 새로고침하여 연결 상태 업데이트
      window.location.reload();
    } catch (error: any) {
      console.error('소셜 계정 연결 해제 오류:', error);
      toast.error(
        error.message ||
          t('common.oauth.error.unknown', {
            provider: providerName,
          }),
      );
    } finally {
      setIsConnecting(null);
    }
  };

  return (
    <div className="row text-center mb-3">
      <h6 className="text-start mb-2">
        {t('common.oauth.profile.socialAccounts')}
      </h6>
      <div className="d-flex justify-content-center gap-2">
        <button
          type="button"
          className={`btn ${isConnected('github') ? 'btn-outline-dark' : 'btn-dark'}`}
          onClick={() =>
            isConnected('github') ? onDisconnect('github') : onConnect('github')
          }
          disabled={isConnecting !== null}
        >
          <FontAwesomeIcon icon={faGithub} />
          &nbsp;
          {isConnected('github')
            ? `${t('common.oauth.provider.github')} ${t('common.oauth.profile.disconnect')}`
            : `${t('common.oauth.provider.github')} ${t('common.oauth.profile.connect')}`}
          {isConnecting === 'github' && (
            <span
              className="spinner-border spinner-border-sm ms-2"
              role="status"
              aria-hidden="true"
            ></span>
          )}
        </button>

        <button
          type="button"
          className={`btn ${isConnected('google') ? 'btn-outline-danger' : 'btn-danger'}`}
          onClick={() =>
            isConnected('google') ? onDisconnect('google') : onConnect('google')
          }
          disabled={isConnecting !== null}
        >
          <FontAwesomeIcon icon={faGoogle} />
          &nbsp;
          {isConnected('google')
            ? `${t('common.oauth.provider.google')} ${t('common.oauth.profile.disconnect')}`
            : `${t('common.oauth.provider.google')} ${t('common.oauth.profile.connect')}`}
          {isConnecting === 'google' && (
            <span
              className="spinner-border spinner-border-sm ms-2"
              role="status"
              aria-hidden="true"
            ></span>
          )}
        </button>

        <button
          type="button"
          className={`btn ${isConnected('kakao') ? 'btn-outline-warning' : 'btn-warning'}`}
          onClick={() =>
            isConnected('kakao') ? onDisconnect('kakao') : onConnect('kakao')
          }
          disabled={isConnecting !== null}
        >
          <FontAwesomeIcon icon={faComment} />
          &nbsp;
          {isConnected('kakao')
            ? `${t('common.oauth.provider.kakao')} ${t('common.oauth.profile.disconnect')}`
            : `${t('common.oauth.provider.kakao')} ${t('common.oauth.profile.connect')}`}
          {isConnecting === 'kakao' && (
            <span
              className="spinner-border spinner-border-sm ms-2"
              role="status"
              aria-hidden="true"
            ></span>
          )}
        </button>

        <button
          type="button"
          className={`btn ${isConnected('naver') ? 'btn-outline-success' : 'btn-success'}`}
          onClick={() =>
            isConnected('naver') ? onDisconnect('naver') : onConnect('naver')
          }
          disabled={isConnecting !== null}
        >
          <FontAwesomeIcon icon={faN} />
          &nbsp;
          {isConnected('naver')
            ? `${t('common.oauth.provider.naver')} ${t('common.oauth.profile.disconnect')}`
            : `${t('common.oauth.provider.naver')} ${t('common.oauth.profile.connect')}`}
          {isConnecting === 'naver' && (
            <span
              className="spinner-border spinner-border-sm ms-2"
              role="status"
              aria-hidden="true"
            ></span>
          )}
        </button>

        <button
          type="button"
          className={`btn ${isConnected('facebook') ? 'btn-outline-primary' : 'btn-primary'}`}
          onClick={() =>
            isConnected('facebook')
              ? onDisconnect('facebook')
              : onConnect('facebook')
          }
          disabled={isConnecting !== null}
        >
          <FontAwesomeIcon icon={faFacebook} />
          &nbsp;
          {isConnected('facebook')
            ? `${t('common.oauth.provider.facebook')} ${t('common.oauth.profile.disconnect')}`
            : `${t('common.oauth.provider.facebook')} ${t('common.oauth.profile.connect')}`}
          {isConnecting === 'facebook' && (
            <span
              className="spinner-border spinner-border-sm ms-2"
              role="status"
              aria-hidden="true"
            ></span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SocialConnect;
