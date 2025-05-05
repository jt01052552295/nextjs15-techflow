'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { ITodos, ITodosFilterType } from '@/types/todos';
import { listAction } from '@/actions/todos/list';
import SearchForm from './SearchForm';
import ListRow from './ListRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretUp,
  faCaretDown,
  faSquareCheck,
  faTrash,
  faArrowUpWideShort,
  faArrowUp,
  faArrowDown,
  faArrowDownWideShort,
} from '@fortawesome/free-solid-svg-icons';
import ScrollToTopButton from '../common/ScrollToTopButton';
import DeleteConfirmModal from './DeleteConfirmModal';
import { useRouter } from 'next/navigation';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'sonner';
import { listUpdateAction } from '@/actions/todos/list/update';
import { listSortAction } from '@/actions/todos/list/sort';

const ListForm = () => {
  const router = useRouter();
  const [items, setItems] = useState<ITodos[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<ITodosFilterType | null>(null);
  const loader = useRef(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState<keyof ITodos | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTodo, setSelectedTodo] = useState<ITodos | null>(null);
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const isSingleSelected = selectedUids.length === 1;
  const [checkAll, setCheckAll] = useState(false);
  const [modalType, setModalType] = useState<'single' | 'bulk'>('single');

  const applySort = (field: keyof ITodos, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortOrder(direction);

    setItems([]);
    setPage(1);
    setHasMore(true);

    setFilters((prev) => ({
      ...(prev ?? {}),
      orderBy: field,
      order: direction,
    }));
  };

  const fetchMore = useCallback(
    async (reset = false) => {
      if (loading) return;
      if (!hasMore && !reset) return;

      const nextPage = reset ? 1 : page + 1;

      setLoading(true);
      const data = await listAction(nextPage, filters ?? undefined);

      if (data) {
        setItems((prev) => {
          const combined = reset ? data.items : [...prev, ...data.items];
          const deduped = combined.filter(
            (todo, index, self) =>
              self.findIndex((t) => t.idx === todo.idx) === index,
          );
          return deduped;
        });
        setPage(data.page);
        setHasMore(data.hasMore);
        setTotalCount(data.totalCount);

        if (reset) {
          setPage(1);
        }
      }

      setLoading(false);
    },
    [
      loading,
      hasMore,
      page,
      filters,
      setItems,
      setPage,
      setHasMore,
      setLoading,
    ],
  );

  useEffect(() => {
    fetchMore(true); // 첫 로딩
  }, [filters]);

  useEffect(() => {
    if (!loader.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore) {
        fetchMore();
      }
    });

    observer.observe(loader.current);
    return () => observer.disconnect();
  }, [hasMore, page]);

  const handleCheck = (uid: string, checked: boolean) => {
    setSelectedUids((prev) =>
      checked ? [...prev, uid] : prev.filter((id) => id !== uid),
    );
  };

  const handleCheckAll = (checked: boolean) => {
    setCheckAll(checked);
    if (checked) {
      setSelectedUids(items.map((item) => item.uid));
    } else {
      setSelectedUids([]);
    }
  };

  const handleFieldSave = async (
    uid: string,
    field: 'name' | 'email',
    newValue: string,
    onSuccess: (val: string) => void,
    onError: () => void,
  ) => {
    const res = await listUpdateAction({ uid, [field]: newValue });

    if (res.status === 'success') {
      toast.success(res.message);
      setItems((prev) =>
        prev.map((item) =>
          item.uid === uid ? { ...item, [field]: newValue } : item,
        ),
      );
      onSuccess(newValue);
    } else {
      toast.error(res.message);
      onError();
    }
  };

  const handleMove = async (direction: 'up' | 'down' | 'top' | 'bottom') => {
    if (selectedUids.length !== 1) {
      toast.warning('정렬은 하나의 항목만 선택해주세요.');
      return;
    }

    const selectedUid = selectedUids[0];
    const res = await listSortAction(selectedUid, direction);
    console.log(res);
    if (res.status === 'success') {
      toast.success(res.message);
      fetchMore(true);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <SearchForm
        onSearch={(f) => {
          setItems([]);
          setPage(1);
          setHasMore(true);
          setFilters(f);
        }}
        totalCount={totalCount}
      />

      <div className="col-12">
        <div className="row mb-3">
          <div className="col-12">
            <div className="row justify-content-between align-items-center">
              <div className="col-auto ">
                <div className="mailbox-controls">
                  <div className="btn-group">
                    <input
                      className="btn-check"
                      type="checkbox"
                      id="checkAll"
                      autoComplete="off"
                      onChange={(e) => handleCheckAll(e.target.checked)}
                    />
                    <label className="btn border-0  p-1" htmlFor="checkAll">
                      <FontAwesomeIcon
                        icon={checkAll ? faSquareCheck : faSquare}
                      />{' '}
                      전체선택
                    </label>
                  </div>

                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-default btn-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#confirmDeleteModal"
                      onClick={() => {
                        setSelectedTodo(null);
                        setModalType('bulk');
                      }}
                      disabled={selectedUids.length === 0}
                    >
                      <FontAwesomeIcon icon={faTrash} /> 선택삭제
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <button
                  type="button"
                  className="btn border-0  p-1"
                  onClick={() => handleMove('top')}
                  disabled={!isSingleSelected}
                >
                  <FontAwesomeIcon icon={faArrowUpWideShort} title="맨 위로" />
                </button>
                <button
                  type="button"
                  className="btn border-0  p-1"
                  onClick={() => handleMove('up')}
                  disabled={!isSingleSelected}
                >
                  <FontAwesomeIcon icon={faArrowUp} title="위로 이동" />
                </button>
                <button
                  type="button"
                  className="btn border-0  p-1"
                  onClick={() => handleMove('down')}
                  disabled={!isSingleSelected}
                >
                  <FontAwesomeIcon icon={faArrowDown} title="아래로 이동" />
                </button>
                <button
                  type="button"
                  className="btn border-0  p-1"
                  onClick={() => handleMove('bottom')}
                  disabled={!isSingleSelected}
                >
                  <FontAwesomeIcon
                    icon={faArrowDownWideShort}
                    title="맨 아래로"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th className="text-center">UID</th>
              <th className="text-center">
                이름
                <span className="ms-2">
                  <FontAwesomeIcon
                    icon={faCaretUp}
                    onClick={() => applySort('name', 'asc')}
                    className={`me-1 ${sortField === 'name' && sortOrder === 'asc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    onClick={() => applySort('name', 'desc')}
                    className={`${sortField === 'name' && sortOrder === 'desc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                </span>
              </th>
              <th className="text-center">
                이메일
                <span className="ms-2">
                  <FontAwesomeIcon
                    icon={faCaretUp}
                    onClick={() => applySort('email', 'asc')}
                    className={`me-1 ${sortField === 'email' && sortOrder === 'asc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    onClick={() => applySort('email', 'desc')}
                    className={`${sortField === 'email' && sortOrder === 'desc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                </span>
              </th>
              <th className="text-center">
                생성일
                <span className="ms-2">
                  <FontAwesomeIcon
                    icon={faCaretUp}
                    onClick={() => applySort('createdAt', 'asc')}
                    className={`me-1 ${sortField === 'createdAt' && sortOrder === 'asc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    onClick={() => applySort('createdAt', 'desc')}
                    className={`${sortField === 'createdAt' && sortOrder === 'desc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                </span>
              </th>
              <th className="text-center">
                수정일
                <span className="ms-2">
                  <FontAwesomeIcon
                    icon={faCaretUp}
                    onClick={() => applySort('updatedAt', 'asc')}
                    className={`me-1 ${sortField === 'updatedAt' && sortOrder === 'asc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    onClick={() => applySort('updatedAt', 'desc')}
                    className={`${sortField === 'updatedAt' && sortOrder === 'desc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                </span>
              </th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((todo) => (
              <ListRow
                key={todo.idx}
                todo={todo}
                setSelectedTodo={setSelectedTodo}
                isChecked={selectedUids.includes(todo.uid)}
                onCheck={handleCheck}
                onFieldSave={handleFieldSave}
              />
            ))}
          </tbody>
        </table>
        {loading && <p className="text-center py-3">로딩 중...</p>}
        <div ref={loader} className="h-10" />
        {!hasMore && (
          <p className="text-center py-3">모든 항목을 불러왔습니다.</p>
        )}
      </div>

      <DeleteConfirmModal
        todo={modalType === 'single' ? selectedTodo : null}
        uids={modalType === 'bulk' ? selectedUids : []}
        onDeleted={() => {
          location.reload();
        }}
      />

      <ScrollToTopButton />
    </div>
  );
};

export default ListForm;
