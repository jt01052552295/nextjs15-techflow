import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import ShowForm from '@/components/shop/order/modal/ShowForm';
import { showAction } from '@/actions/shop/order/show';
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import { shopOrderQK } from '@/lib/queryKeys/shop/order';

type Props = {
  params: { language: LocaleType; uid: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('shopOrder.index', dictionary, language);

  return {
    title: metadata.name,
    description: metadata.desc,
    alternates: {
      languages: {
        ko: `/ko/shop/order`,
        en: `/en/shop/order`,
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
    queryKey: shopOrderQK.detail(uid),
    queryFn: () => showAction(uid),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <ShowForm uid={uid} />
    </HydrationBoundary>
  );
}
