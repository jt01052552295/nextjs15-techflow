import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { Metadata } from 'next';
import ShowForm from '@/components/todos/modal/ShowForm';
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
  const data = await showAction(uid);

  if (!data) {
    return <p>{dictionary.common.failed_data}</p>;
  }

  const showProps = {
    rs: data ?? [],
  };

  return <ShowForm {...showProps} />;
}
