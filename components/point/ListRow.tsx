'use client';

import React from 'react';
import type { IPointListRow } from '@/types/point';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import { useSearchParams } from 'next/navigation';

type Props = {
  row: IPointListRow;
};

const ListRow = ({ row }: Props) => {
  const { locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const showUrl = getRouteUrl('point.show', locale, { id: row.idx as any });

  // console.log(showUrl);

  //  listMemory.save({ scrollY: window.scrollY, page, filters, items }); // ✅ 일괄 저장
  const handleNavigate = (href: string) => {
    if (!href || typeof href !== 'string') return; // 방어
    router.push(href, { scroll: false });
  };

  return (
    <tr key={row.idx}>
      <th scope="row" className="text-center">
        <span className="badge text-bg-secondary">{row.idx}</span>
      </th>
      <td className="text-center">
        <span className="badge text-bg-secondary">{row.userId}</span>
      </td>
      <td className="text-center">
        <span className="badge text-bg-secondary">{row.point}</span>
      </td>
      <td className="text-center">
        <span className="badge text-bg-secondary">{row.usePoint}</span>
      </td>
      <td className="text-center">{row.status}</td>
      <td className="text-center">{row.createdAt}</td>
      <td className="text-center">
        {row.expired ?? '-'} {row.expiredAt ?? '-'}
      </td>
      <td className="text-center">
        <div className="d-flex justify-content-center gap-1">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() =>
              handleNavigate(
                `${showUrl}${queryString ? `?${queryString}` : ''}`,
              )
            }
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ListRow;
