import { getDictionary } from '@/locales';
import { ckLocale } from '@/lib/cookie';
import Main from '@/components/main/Main';
import { generateLocalizedRoutes } from '@/utils/routes';

export default async function MainPage() {
  const locale = await ckLocale();
  const dictionary = await getDictionary(locale);
  const routes = generateLocalizedRoutes(locale, dictionary);

  return (
    <div>
      <Main />
      <h1>{routes.main.index.name}</h1>
      <p>{routes.main.index.desc}</p>
    </div>
  );
}
