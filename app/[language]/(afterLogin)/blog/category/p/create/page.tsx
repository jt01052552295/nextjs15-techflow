import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import { getRouteUrl } from '@/utils/routes';
import PageHeader from '@/components/common/PageHeader';
import Breadcrumb from '@/components/common/Breadcrumb';
import CreateForm from '@/components/blog/category/CreateForm';
import { getCategoryCode } from '@/lib/blog/category-utils';

type Props = {
  params: { language: LocaleType };
  searchParams: { code?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('blogCategory.index', dictionary, language);

  return {
    title: metadata.name,
    description: metadata.desc,
    alternates: {
      languages: {
        ko: `/ko/blog/category`,
        en: `/en/blog/category`,
      },
    },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { language } = await params;
  const { code } = await searchParams;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('blogCategory.index', dictionary, language);
  const url = getRouteUrl('blogCategory.index', language);

  const newCode = await getCategoryCode(code);

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
      <CreateForm newCode={newCode} />
    </div>
  );
}
