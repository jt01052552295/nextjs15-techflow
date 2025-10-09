import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import { getRouteUrl } from '@/utils/routes';
import PageHeader from '@/components/common/PageHeader';
import Breadcrumb from '@/components/common/Breadcrumb';
import ShowForm from '@/components/bbs/ShowForm';
import { showAction } from '@/actions/bbs/show';
import { listAction as commentsAction } from '@/actions/bbs/comments';
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import { bbsQK } from '@/lib/queryKeys/bbs';

type Props = {
  params: { language: LocaleType; uid: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('bbs.index', dictionary, language);

  return {
    title: metadata.name,
    description: metadata.desc,
    alternates: {
      languages: {
        ko: `/ko/bbs`,
        en: `/en/bbs`,
      },
    },
  };
}

export default async function Page({ params }: Props) {
  const { language, uid } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('bbs.index', dictionary, language);
  const url = getRouteUrl('bbs.index', language);

  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: bbsQK.detail(uid),
    queryFn: () => showAction(uid),
  });

  // 루트 댓글(첫 페이지만)
  const rootBase = {
    todoId: uid,
    sortBy: 'createdAt',
    order: 'desc',
    limit: 20,
  } as const;
  await qc.prefetchInfiniteQuery({
    queryKey: bbsQK.comments(rootBase),
    queryFn: ({ pageParam }) =>
      commentsAction({ ...rootBase, cursor: pageParam ?? null }),
    initialPageParam: null,
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
        <ShowForm uid={uid} />
      </HydrationBoundary>
    </div>
  );
}
