import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import { getRouteUrl } from '@/utils/routes';
import PageHeader from '@/components/common/PageHeader';
import Breadcrumb from '@/components/common/Breadcrumb';
import EditForm from '@/components/todos/EditForm';
import { showAction } from '@/actions/todos/show';

type Props = {
  params: { language: LocaleType; uid: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('todos.index', dictionary, language);

  return {
    title: metadata.name,
    description: metadata.desc,
    alternates: {
      languages: {
        ko: `/ko/todos`,
        en: `/en/todos`,
      },
    },
  };
}

export default async function Page({ params }: Props) {
  const { language, uid } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('todos.index', dictionary, language);
  const url = getRouteUrl('todos.index', language);
  const data = await showAction(uid);

  if (!data) {
    return <p>{dictionary.common.failed_data}</p>;
  }

  const showProps = {
    rs: data ?? [],
  };

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
      <EditForm {...showProps} />
    </div>
  );
}
