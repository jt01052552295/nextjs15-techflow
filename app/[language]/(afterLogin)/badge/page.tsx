import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import { getRouteUrl } from '@/utils/routes';
import PageHeader from '@/components/common/PageHeader';
import Breadcrumb from '@/components/common/Breadcrumb';
import ListForm from '@/components/badge/ListForm';
import type { SortBy, SortOrder } from '@/types/badge';

import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import { badgeQK, type BadgeBaseParams } from '@/lib/queryKeys/badge';
import { listAction } from '@/actions/badge/list';

type Props = {
  params: { language: LocaleType };
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('badge.index', dictionary, language);

  return {
    title: metadata.name,
    description: metadata.desc,
    alternates: {
      languages: {
        ko: `/ko/badge`,
        en: `/en/badge`,
      },
    },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('badge.index', dictionary, language);
  const url = getRouteUrl('badge.index', language);
  const sp = await searchParams;

  const breadcrumbPaths = [
    {
      name: metadata.name,
      url: url,
    },
  ];

  // string | string[] | undefined → string | undefined 로 정규화
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const baseParams: BadgeBaseParams = {
    q: one(sp.q) || undefined,
    dateType: one(sp.dateType) as 'createdAt' | 'updatedAt' | undefined,
    startDate: one(sp.startDate) || undefined,
    endDate: one(sp.endDate) || undefined,
    isUse: one(sp.isUse) === undefined ? undefined : one(sp.isUse) === 'true',
    isVisible:
      one(sp.isVisible) === undefined
        ? undefined
        : one(sp.isVisible) === 'true',
    sortBy: (one(sp.sortBy) as SortBy) ?? 'idx',
    order: (one(sp.order) as SortOrder) ?? 'desc',
    limit: Number(one(sp.limit) ?? 20),
  };

  const qc = new QueryClient();
  await qc.prefetchInfiniteQuery({
    queryKey: badgeQK.list(baseParams),
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    initialPageParam: undefined,
  });

  return (
    <div className="container-fluid">
      <div className="row flex-column-reverse flex-md-row align-items-md-center mb-3">
        <PageHeader meta={metadata} />
        <Breadcrumb paths={breadcrumbPaths} />
      </div>
      <HydrationBoundary state={dehydrate(qc)}>
        <ListForm baseParams={baseParams} />
      </HydrationBoundary>
    </div>
  );
}
