import React from 'react';
import Link from 'next/link';
import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteUrl } from '@/utils/routes';
import { useParams, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';

type Props = {
  params: { language: LocaleType };
  searchParams: { code?: string; msg?: string };
};

export default async function Page({ params, searchParams }: Props) {
  const { language } = await params;
  const { code, msg } = await searchParams;
  const dictionary = await getDictionary(language);

  const errorCode = code || '500';
  const errorMessage = msg || '알 수 없는 오류가 발생했습니다.';

  console.log(dictionary.common.auth);

  // 에러 코드에 따른 제목 설정
  let errorTitle = dictionary.common.auth.error.title || '오류가 발생했습니다';
  if (errorCode === '400') {
    errorTitle =
      dictionary.common.auth.error.invalidRequest || '유효하지 않은 요청';
  } else if (errorCode === '401') {
    errorTitle = dictionary.common.auth.error.unauthorized || '인증 오류';
  } else if (errorCode === '409') {
    errorTitle = dictionary.common.auth.error.conflict || '계정 충돌';
  } else if (errorCode === '500') {
    errorTitle = dictionary.common.auth.error.serverError || '서버 오류';
  }

  return (
    <div>
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div
          className="card shadow-sm"
          style={{ maxWidth: '500px', width: '100%' }}
        >
          <div className="card-body p-4 text-center">
            <div className="text-danger mb-4">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                style={{ fontSize: '3rem' }}
              />
            </div>

            <h2 className="card-title mb-3">{errorTitle}</h2>

            <div className="card-text mb-4">
              <p>{decodeURIComponent(errorMessage)}</p>
              <div className="text-muted small">
                {dictionary.common.auth.error.errorCode}:{errorCode}
              </div>
            </div>

            <div className="d-grid gap-2">
              <Link
                href={getRouteUrl('auth.login', language)}
                className="btn btn-primary"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                {dictionary.common.auth.error.backToLogin ||
                  '로그인 페이지로 돌아가기'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
