import React from 'react';
import Link from 'next/link';
import { __ts } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteUrl } from '@/utils/routes';
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

  const title = await __ts('common.auth.error.title', {}, language);
  const invalidRequest = await __ts(
    'common.auth.error.invalidRequest',
    {},
    language,
  );
  const unauthorized = await __ts(
    'common.auth.error.unauthorized',
    {},
    language,
  );
  const conflict = await __ts('common.auth.error.conflict', {}, language);
  const serverError = await __ts('common.auth.error.serverError', {}, language);
  const errorCodeTxt = await __ts('common.auth.error.errorCode', {}, language);
  const backToLogin = await __ts('common.auth.error.backToLogin', {}, language);

  const defaultMessage = await __ts(
    'common.auth.error.defaultMessage',
    {},
    language,
  );

  const errorCode = code || '500';
  const errorMessage = msg || defaultMessage;

  // 에러 코드에 따른 제목 설정
  let errorTitle = title;
  if (errorCode === '400') {
    errorTitle = invalidRequest;
  } else if (errorCode === '401') {
    errorTitle = unauthorized;
  } else if (errorCode === '409') {
    errorTitle = conflict;
  } else if (errorCode === '500') {
    errorTitle = serverError;
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
                {errorCodeTxt}:{errorCode}
              </div>
            </div>

            <div className="d-grid gap-2">
              <Link
                href={getRouteUrl('auth.login', language)}
                className="btn btn-primary"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                {backToLogin}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
