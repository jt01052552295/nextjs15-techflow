'use client';

import React, { useEffect, useState } from 'react';
import type {
  ICategory,
  ICategoryListRow,
  ListEditCell,
} from '@/types/category';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faPen,
  faTrash,
  faSquareCheck,
  faMinus,
  faAngleRight,
  faAnglesRight,
} from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import EditableCell from './EditableCell';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import { useSearchParams } from 'next/navigation';
import { getCategoryLevel } from '@/lib/category-utils';

type Props = {
  row: ICategoryListRow;
  setSelectedRow: (row: ICategory) => void;
  setModalType: (type: 'single') => void;
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
  setModalType,
  isChecked,
  onCheck,
  onFieldSave,
}: Props) => {
  const { locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const [categoryLevel, setCategoryLevel] = useState<number>(0);

  // row.code가 변경될 때마다 레벨 계산
  useEffect(() => {
    const level = getCategoryLevel(row.code);
    setCategoryLevel(level);
  }, [row.code]);

  const getSubMenuIcon = (level: number) => {
    switch (level) {
      case 1:
        return faMinus;
      case 2:
        return faAngleRight;
      case 3:
        return faAnglesRight;
      default:
        return faMinus;
    }
  };

  const editUrl = getRouteUrl('category.edit', locale, { id: row.uid });

  // console.log(showUrl);

  //  listMemory.save({ scrollY: window.scrollY, page, filters, items }); // ✅ 일괄 저장
  const handleNavigate = (href: string) => {
    if (!href || typeof href !== 'string') return; // 방어
    router.push(href, { scroll: false });
  };

  const handleCreate = (code: string) => {
    const baseUrl = getRouteUrl('category.create', locale);

    const params = new URLSearchParams(queryString);

    if (params.has('code')) {
      params.delete('code');
    }
    params.set('code', code);
    const url = `${baseUrl}?${params.toString()}`;
    router.push(url, { scroll: false });
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
      <td className="text-start">
        <div
          style={{
            paddingLeft: `${(categoryLevel - 1) * 5}px`,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {categoryLevel > 1 && (
            <FontAwesomeIcon
              icon={getSubMenuIcon(categoryLevel)}
              style={{ marginRight: '5px' }}
            />
          )}
          <span className="badge text-bg-primary">{row.code}</span>
        </div>
      </td>
      <td className="text-center">
        <EditableCell
          value={row.name}
          onSave={(newVal, onSuccess, onError) =>
            onFieldSave(row.uid, 'name', newVal, onSuccess, onError)
          }
        />
      </td>

      <td className="text-center">{row.createdAt}</td>
      <td className="text-center">{row.updatedAt}</td>

      <td className="text-center">
        <div className="d-flex justify-content-center gap-1">
          {categoryLevel < 3 && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleCreate(row.code)}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          )}

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
          <button
            type="button"
            className="btn btn-danger btn-sm"
            data-bs-toggle="modal"
            data-bs-target={`#confirmDeleteModal`}
            onClick={() => {
              setSelectedRow(row);
              setModalType('single');
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ListRow;
