import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import { getRouteUrl } from '@/utils/routes';
import PageHeader from '@/components/common/PageHeader';
import Breadcrumb from '@/components/common/Breadcrumb';

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
  const url = getRouteUrl('main.index', language);

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

  // const url = getRouteUrl('user.show', language, { id: '1' });

  // const url2 = getRouteUrl('company.edit', language, {
  //   id: '123',
  //   section: 'profile',
  // });

  // console.log(dictionary);
  // console.log(routes.main.index);

  return (
    <div className="container-fluid">
      <div className="row flex-column-reverse flex-md-row align-items-md-center mb-3">
        <PageHeader meta={metadata} />
        <Breadcrumb paths={breadcrumbPaths} />
      </div>
    </div>
  );
}
