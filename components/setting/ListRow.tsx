'use client';

import React from 'react';
import type { ISetting, ListEditCell } from '@/types/setting';
import { useRouter } from 'next/navigation';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import EditableCell from './EditableCell';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import { useSearchParams } from 'next/navigation';
import UserProfileDisplay from '../common/UserProfileDisplay';
import { KEPCO_CONTRACTS } from '@/constants';

type Props = {
  row: ISetting;
  setSelectedRow: (row: ISetting) => void;
  isChecked: boolean;
  onCheck: (uid: string, checked: boolean) => void;
  onFieldSave: (
    uid: string,
    field: ListEditCell,
    newValue: string,
    onSuccess: (val: string) => void,
    onError: () => void,
  ) => void;
};

const ListRow = ({
  row,
  setSelectedRow,
  isChecked,
  onCheck,
  onFieldSave,
}: Props) => {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const editUrl = getRouteUrl('setting.edit', locale, { id: row.uid });

  const CONTRACTS = KEPCO_CONTRACTS[locale];

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
        <span className="badge text-bg-secondary">{row.uid}</span>
      </td>
      <td className="text-center">
        <div className="d-flex align-items-center gap-2">
          <UserProfileDisplay user={row.user} />
        </div>
      </td>
      <td className="text-center">
        <EditableCell
          value={row.gubun!}
          onSave={(newVal, onSuccess, onError) =>
            onFieldSave(row.uid, 'gubun', newVal, onSuccess, onError)
          }
        />
      </td>
      <td className="text-center">
        <span className="badge text-bg-primary">
          {row.kepcoContract && CONTRACTS[row.kepcoContract]}
        </span>
      </td>

      <td className="text-center">
        <span
          className={`badge ${row.pushPoint ? 'text-bg-primary' : 'text-bg-secondary'}`}
        >
          {row.pushPoint ? t('common.usage') : t('common.usageNone')}
        </span>
      </td>
      <td className="text-center">
        <span
          className={`badge ${row.pushBill ? 'text-bg-primary' : 'text-bg-secondary'}`}
        >
          {row.pushBill ? t('common.usage') : t('common.usageNone')}
        </span>
      </td>

      <td className="text-center">
        <div className="d-flex justify-content-center gap-1">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() =>
              handleNavigate(
                `${editUrl}${queryString ? `?${queryString}` : ''}`,
              )
            }
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ListRow;
