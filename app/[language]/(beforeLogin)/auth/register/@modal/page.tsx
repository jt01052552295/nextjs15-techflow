import React from 'react';
import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteUrl } from '@/utils/routes';
import Modal from '@/components/common/Modal';
import TermsComponent from '@/components/policy/terms';
import PrivacyComponent from '@/components/policy/privacy';

type Props = {
  params: { language: LocaleType };
  searchParams: { modal?: string };
};

export default async function PolicyModal({ params, searchParams }: Props) {
  const { language } = await params;
  const { modal } = await searchParams;
  const dictionary = await getDictionary(language);
  const { policy } = dictionary.common;
  const registerUrl = getRouteUrl('auth.register', language);

  // 모달 타입이 없거나 유효하지 않으면 기본 페이지로 리디렉션
  if (!modal || (modal !== 'terms' && modal !== 'privacy')) {
    return null;
  }

  // 이용약관 모달
  if (modal === 'terms') {
    return (
      <Modal title={policy.terms.title} returnHref={registerUrl}>
        <div className="modal-body">
          <TermsComponent />
        </div>
      </Modal>
    );
  }

  // 개인정보 처리방침 모달
  return (
    <Modal title={policy.privacy.title} returnHref={registerUrl}>
      <div className="modal-body">
        <PrivacyComponent />
      </div>
    </Modal>
  );
}
