// import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteUrl } from '@/utils/routes';
import Link from 'next/link';

type Props = {
  params: { language: LocaleType };
};

export default async function Page({ params }: Props) {
  const { language } = await params;
  //   const dictionary = await getDictionary(language);

  const url = getRouteUrl('main.index', language);

  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p>
        The page you are looking for does not exist. Please check the URL or go
        back.
      </p>
      <Link href={url} className="">
        Main
      </Link>
    </main>
  );
}
