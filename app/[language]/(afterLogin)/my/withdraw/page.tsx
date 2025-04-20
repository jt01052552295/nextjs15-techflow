import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import { getRouteMetadata } from '@/utils/routes';
import { getRouteUrl } from '@/utils/routes';
import PageHeader from '@/components/common/PageHeader';
import Breadcrumb from '@/components/common/Breadcrumb';
import WithdrawForm from '@/components/my/WithdrawForm';

type Props = {
  params: { language: LocaleType };
};

export default async function Page({ params }: Props) {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const metadata = getRouteMetadata('my.withdraw', dictionary, language);

  const breadcrumbPaths = [
    {
      name: metadata.name,
      url: getRouteUrl('my.withdraw', language),
    },
  ];

  return (
    <div className="container-fluid">
      <div className="row flex-column-reverse flex-md-row align-items-md-center mb-3">
        <PageHeader meta={metadata} />
        <Breadcrumb paths={breadcrumbPaths} dictionary={dictionary} />
      </div>
      <WithdrawForm />
    </div>
  );
}
