'use client';

import React, { useEffect, useState } from 'react';
import type {
  IBlogPostComment,
  IBlogPostCommentListRow,
  ListEditCell,
} from '@/types/blog/comment';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPen,
  faTrash,
  faSquareCheck,
} from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';

import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import { useSearchParams } from 'next/navigation';
import UserProfileDisplay from '@/components/common/UserProfileDisplay';
import { getPostCommentStatusOptions } from '@/constants';

type Props = {
  row: IBlogPostCommentListRow;
  setSelectedRow: (row: IBlogPostComment) => void;
  setModalType: (type: 'single') => void;
  isChecked: boolean;
  onCheck: (uid: string, checked: boolean) => void;
};

const ListRow = ({
  row,
  setSelectedRow,
  setModalType,
  isChecked,
  onCheck,
}: Props) => {
  const { locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const editUrl = getRouteUrl('blogComment.edit', locale, { id: row.uid });
  const statusOptions = getPostCommentStatusOptions(locale);

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
        <span className="badge text-bg-secondary">{row.uid}</span>
      </td>
      <td className="text-start">
        <UserProfileDisplay user={row.user} />
      </td>
      <td className="text-center">{row.content}</td>
      <td className="text-center">
        {statusOptions.find((option) => option.value === row.status)?.label ??
          row.status}
      </td>
      <td className="text-center">{row.createdAt}</td>
      <td className="text-center">{row.updatedAt}</td>
      <td className="text-center">{row._count?.replies ?? 0}</td>

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
