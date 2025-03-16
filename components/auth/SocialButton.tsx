'use client';
import { useEffect, useState } from 'react';
import { cookies } from 'next/headers';

import { useSearchParams } from 'next/navigation';
// import { signInWithGitHub, signInWithNaver } from '@/actions/auth';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faN } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';

const SocialButton = () => {
  const { dictionary, locale } = useLanguage();

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') as string;

  const onOauth = async (provider: string) => {
    if (provider == 'naver') {
      window.location.href = '/api/oauth/request/naver';
    } else {
      console.log(provider);
    }
  };

  // const onOauth = (provider: string) => {
  //   // oauthSignIn(provider, callbackUrl || '/main')
  // }

  return (
    <div className="row text-center mb-3">
      <p>- OR -</p>
      <p className="text-start">{dictionary.common.auth.login.snsPrompt}</p>
      <div className="d-grid gap-2">
        <button
          type="button"
          className="btn btn-dark"
          onClick={() => onOauth('github')}
        >
          <FontAwesomeIcon icon={faGithub} />
          &nbsp; {dictionary.common.auth.login.loginWithGithub}
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onOauth('google')}
        >
          <FontAwesomeIcon icon={faGoogle} />
          &nbsp; {dictionary.common.auth.login.loginWithGoogle}
        </button>
        <button
          type="button"
          className="btn btn-warning"
          onClick={() => onOauth('kakao')}
        >
          <FontAwesomeIcon icon={faComment} />
          &nbsp; {dictionary.common.auth.login.loginWithKakao}
        </button>
        <button
          type="button"
          className="btn btn-success"
          disabled={false}
          onClick={() => onOauth('naver')}
        >
          <FontAwesomeIcon icon={faN} />
          &nbsp; {dictionary.common.auth.login.loginWithNaver}
        </button>
      </div>
    </div>
  );
};

export default SocialButton;
