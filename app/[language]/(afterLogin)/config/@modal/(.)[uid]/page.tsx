import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import ShowForm from '@/components/practice/modal/ShowForm';
import { showAction } from '@/actions/practice/show';
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import { practiceQK } from '@/lib/queryKeys/practice';

type Props = {
  params: { language: LocaleType; uid: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('practice.index', dictionary, language);

  return {
    title: metadata.name,
    description: metadata.desc,
    alternates: {
      languages: {
        ko: `/ko/practice`,
        en: `/en/practice`,
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
    queryKey: practiceQK.detail(uid),
    queryFn: () => showAction(uid),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <ShowForm uid={uid} />
    </HydrationBoundary>
  );
}
