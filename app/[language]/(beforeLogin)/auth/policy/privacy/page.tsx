import React from 'react';
import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import PageHeader from '@/components/common/PageHeader';
import PrivacyComponent from '@/components/policy/privacy';

type Props = {
  params: { language: LocaleType };
};

export default async function PrivacyPolicyPage({ params }: Props) {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('policy.privacy', dictionary, language);
  //   const url = getRouteUrl('main.index', language);

  return (
    <>
      <div className="row flex-column-reverse flex-md-row align-items-md-center mb-3">
        <PageHeader meta={metadata} />
      </div>
      <PrivacyComponent />
    </>
  );
}
