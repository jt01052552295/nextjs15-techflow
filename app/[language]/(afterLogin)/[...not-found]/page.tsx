import { __ts } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteUrl } from '@/utils/routes';
import Link from 'next/link';

type Props = {
  params: { language: LocaleType };
};

export default async function Page({ params }: Props) {
  const { language } = await params;
  const notFound = await __ts('common.auth.error.notFound', {}, language);
  const defaultMessage = await __ts(
    'common.auth.error.defaultMessage',
    {},
    language,
  );

  const home = await __ts('common.home', {}, language);

  const url = getRouteUrl('main.index', language);

  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <h2 className="text-xl font-semibold">{notFound}</h2>
      <p>{defaultMessage}</p>
      <Link href={url} className="">
        {home}
      </Link>
    </main>
  );
}
