import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import { getRouteUrl } from '@/utils/routes';
import PageHeader from '@/components/common/PageHeader';
import Breadcrumb from '@/components/common/Breadcrumb';
import ShowForm from '@/components/setting/ShowForm';
import { showAction } from '@/actions/setting/show';
import { listAction as commentsAction } from '@/actions/setting/comments';
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import { settingQK } from '@/lib/queryKeys/setting';

type Props = {
  params: { language: LocaleType; uid: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('setting.index', dictionary, language);

  return {
    title: metadata.name,
    description: metadata.desc,
    alternates: {
      languages: {
        ko: `/ko/setting`,
        en: `/en/setting`,
      },
    },
  };
}

export default async function Page({ params }: Props) {
  const { language, uid } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('setting.index', dictionary, language);
  const url = getRouteUrl('setting.index', language);

  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: settingQK.detail(uid),
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
    queryKey: settingQK.comments(rootBase),
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
