import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import { getRouteUrl } from '@/utils/routes';
import PageHeader from '@/components/common/PageHeader';
import Breadcrumb from '@/components/common/Breadcrumb';
import ShowForm from '@/components/point/ShowForm';
import { showAction } from '@/actions/point/show';
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import { pointQK } from '@/lib/queryKeys/point';

type Props = {
  params: { language: LocaleType; idx: number };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('point.index', dictionary, language);

  return {
    title: metadata.name,
    description: metadata.desc,
    alternates: {
      languages: {
        ko: `/ko/point`,
        en: `/en/point`,
      },
    },
  };
}

export default async function Page({ params }: Props) {
  const { language, idx } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('point.index', dictionary, language);
  const url = getRouteUrl('point.index', language);

  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: pointQK.detail(idx),
    queryFn: () => showAction(idx),
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
    <div className="container-flidx">
      <div className="row flex-column-reverse flex-md-row align-items-md-center mb-3">
        <PageHeader meta={metadata} />
        <Breadcrumb paths={breadcrumbPaths} />
      </div>
      <HydrationBoundary state={dehydrate(qc)}>
        <ShowForm idx={idx} />
      </HydrationBoundary>
    </div>
  );
}
