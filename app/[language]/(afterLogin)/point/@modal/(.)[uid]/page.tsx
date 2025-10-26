import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import ShowForm from '@/components/point/modal/ShowForm';
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
  const { idx } = await params;

  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: pointQK.detail(idx),
    queryFn: () => showAction(idx),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <ShowForm idx={idx} />
    </HydrationBoundary>
  );
}
