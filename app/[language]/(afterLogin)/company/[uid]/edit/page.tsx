import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import { getRouteUrl } from '@/utils/routes';
import PageHeader from '@/components/common/PageHeader';
import Breadcrumb from '@/components/common/Breadcrumb';
import EditForm from '@/components/company/EditForm';
import { showAction } from '@/actions/company/show';
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import { companyQK } from '@/lib/queryKeys/company';

type Props = {
  params: { language: LocaleType; uid: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('company.index', dictionary, language);

  return {
    title: metadata.name,
    description: metadata.desc,
    alternates: {
      languages: {
        ko: `/ko/company`,
        en: `/en/company`,
      },
    },
  };
}

export default async function Page({ params }: Props) {
  const { language, uid } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('company.index', dictionary, language);
  const url = getRouteUrl('company.index', language);

  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: companyQK.detail(uid),
    queryFn: () => showAction(uid),
  });

  const breadcrumbPaths = [
    {
      name: metadata.name,
      url: url,
    },
    // {
    //   name: dictionary.menu?.members || '회원 관리',
    //   url: '#',
    // },
  ];

  return (
    <div className="container-fluid">
      <div className="row flex-column-reverse flex-md-row align-items-md-center mb-3">
        <PageHeader meta={metadata} />
        <Breadcrumb paths={breadcrumbPaths} />
      </div>
      <HydrationBoundary state={dehydrate(qc)}>
        <EditForm uid={uid} />
      </HydrationBoundary>
    </div>
  );
}
