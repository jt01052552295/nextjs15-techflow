'use client';
import { useTodoListParams } from './hooks/useTodoListParams';
import Link from 'next/link';
import { getRouteUrl } from '@/utils/routes';
import { useLanguage } from '@/components/context/LanguageContext';

export default function EditForm() {
  const { locale } = useLanguage();
  const { queryString } = useTodoListParams();
  return (
    <div>
      EditForm{' '}
      <Link href={`${getRouteUrl('todos.index', locale)}?${queryString}`}>
        목록으로
      </Link>
    </div>
  );
}
