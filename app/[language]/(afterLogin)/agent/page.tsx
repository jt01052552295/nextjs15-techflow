import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import { getRouteUrl } from '@/utils/routes';
import PageHeader from '@/components/common/PageHeader';
import Breadcrumb from '@/components/common/Breadcrumb';
import ListForm from '@/components/agent/ListForm';
import type { SortBy, SortOrder } from '@/types/agent';

import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import { agentQK, type AgentBaseParams } from '@/lib/queryKeys/agent';
import { listAction } from '@/actions/agent/list';

type Props = {
  params: { language: LocaleType };
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('agent.index', dictionary, language);

  return {
    title: metadata.name,
    description: metadata.desc,
    alternates: {
      languages: {
        ko: `/ko/agent`,
        en: `/en/agent`,
      },
    },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('agent.index', dictionary, language);
  const url = getRouteUrl('agent.index', language);
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

  const baseParams: AgentBaseParams = {
    q: one(sp.q) || undefined,
    dateType: one(sp.dateType) as 'createdAt' | undefined,
    startDate: one(sp.startDate) || undefined,
    endDate: one(sp.endDate) || undefined,
    sortBy: (one(sp.sortBy) as SortBy) ?? 'idx',
    order: (one(sp.order) as SortOrder) ?? 'desc',
    limit: Number(one(sp.limit) ?? 20),
  };

  const qc = new QueryClient();
  await qc.prefetchInfiniteQuery({
    queryKey: agentQK.list(baseParams),
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
