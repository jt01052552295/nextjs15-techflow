import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import { showAction } from '@/actions/board/show';
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import { boardQK } from '@/lib/queryKeys/board';

type Props = {
  params: { language: LocaleType; uid: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('board.index', dictionary, language);

  return {
    title: metadata.name,
    description: metadata.desc,
    alternates: {
      languages: {
        ko: `/ko/board`,
        en: `/en/board`,
      },
    },
  };
}
// export default function ModalTest({ params }: { params: { uid: string } }) {
//   return (
//     <div
//       style={{
//         position: 'fixed',
//         inset: 0,
//         background: 'rgba(0,0,0,.4)',
//         display: 'grid',
//         placeItems: 'center',
//         zIndex: 9999,
//       }}
//     >
//       <div style={{ background: '#fff', padding: 24, borderRadius: 12 }}>
//         <b>Intercept OK</b>
//         <div>uid: {params.uid}</div>
//       </div>
//     </div>
//   );
// }
export default async function Page({ params }: Props) {
  const { uid } = await params;

  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: boardQK.detail(uid),
    queryFn: () => showAction(uid),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <div>Board Modal UID: {uid}</div>
    </HydrationBoundary>
  );
}
