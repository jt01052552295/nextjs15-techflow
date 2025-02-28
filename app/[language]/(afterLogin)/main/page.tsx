import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import Main from '@/components/main/Main';
import { getRouteUrl } from '@/utils/routes';

type Props = {
  params: { language: LocaleType };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('main.index', dictionary, language);

  return {
    title: metadata.name, // "대시보드"
    description: metadata.desc, // "메인페이지"
    alternates: {
      languages: {
        ko: `/ko/main`,
        en: `/en/main`,
      },
    },
  };
}

export default async function Page({ params }: Props) {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('main.index', dictionary, language);

  const url = getRouteUrl('user.show', language, { id: '1' });

  const url2 = getRouteUrl('company.edit', language, {
    id: '123',
    section: 'profile',
  });

  // console.log(dictionary);
  // console.log(routes.main.index);

  return (
    <div>
      <header>
        <h1>{metadata.name}</h1>
        {metadata.desc && <p className="page-description">{metadata.desc}</p>}
      </header>
      <Main />
      <h1>{dictionary.common.AppName}</h1>
      <p>{dictionary.common.AppDesc}</p>
      <p>{url}</p>
      <p>{url2}</p>
    </div>
  );
}
