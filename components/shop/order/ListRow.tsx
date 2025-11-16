'use client';

import React from 'react';
import type { IShopOrder, IShopOrderListRow } from '@/types/shop/order';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faTrash,
  faSquareCheck,
} from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import { useSearchParams } from 'next/navigation';
import { formatKrw } from '@/lib/util';
import {
  getOrderStatusLabel,
  getOrderCancelStatusLabel,
} from '@/lib/shop/status-utils';

type Props = {
  row: IShopOrderListRow;
  setSelectedRow: (row: IShopOrder) => void;
  isChecked: boolean;
  onCheck: (uid: string, checked: boolean) => void;
};

const ListRow = ({ row, setSelectedRow, isChecked, onCheck }: Props) => {
  const { locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const showUrl = getRouteUrl('shopOrder.show', locale, { id: row.uid });

  // console.log(showUrl);

  //  listMemory.save({ scrollY: window.scrollY, page, filters, items }); // ✅ 일괄 저장
  const handleNavigate = (href: string) => {
    if (!href || typeof href !== 'string') return; // 방어
    router.push(href, { scroll: false });
  };

  return (
    <tr key={row.idx}>
      <th scope="row">
        <input
          className="btn-check"
          type="checkbox"
          id={`checkedRow${row.idx}`}
          autoComplete="off"
          checked={isChecked}
          onChange={(e) => onCheck(row.uid, e.target.checked)}
        />
        <label className="btn border-0 p-0" htmlFor={`checkedRow${row.idx}`}>
          <FontAwesomeIcon icon={isChecked ? faSquareCheck : faSquare} />
          &nbsp;
          {row.idx}
        </label>
      </th>
      <td className="text-center">
        <span className="badge text-bg-primary">{row.uid}</span>
      </td>
      <td className="text-center">
        <span className="badge text-bg-secondary">{row.ordNo}</span>
      </td>
      <td className="text-center">
        <span className="badge text-bg-secondary">{row.name}</span>
      </td>

      <td className="text-center">{formatKrw(row.payPrice)}</td>
      <td className="text-center">
        {getOrderStatusLabel(row.orderStatus, locale)}
      </td>
      <td className="text-center">
        {getOrderCancelStatusLabel(row.cancelStatus, locale)}
      </td>
      <td className="text-center">{row.createdAt}</td>
      <td className="text-center">
        {row._count?.ShopReview ?? 0} {row._count?.ShopOrderItem ?? 0}{' '}
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

          <button
            type="button"
            className="btn btn-danger btn-sm"
            data-bs-toggle="modal"
            data-bs-target={`#confirmDeleteModal`}
            onClick={() => setSelectedRow(row)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ListRow;
