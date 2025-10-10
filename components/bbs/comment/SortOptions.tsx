'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSort,
  faSortUp,
  faSortDown,
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@/components/context/LanguageContext';

type SortBy = 'createdAt' | 'replyCount' | 'likeCount';
type SortOrder = 'asc' | 'desc';

interface SortOptionsProps {
  sort: {
    by: SortBy;
    order: SortOrder;
  };
  onSortChange: (sortType: SortBy) => void;
  onOrderChange?: (order: SortOrder) => void;
}
const SortOptions = ({
  sort,
  onSortChange,
  onOrderChange,
}: SortOptionsProps) => {
  const { t } = useLanguage();

  // 정렬 방향 아이콘 선택
  const getSortIcon = (sortType: SortBy) => {
    if (sortType !== sort.by) return faSort;
    return sort.order === 'asc' ? faSortUp : faSortDown;
  };

  // 정렬 방향 토글 (현재는 기본값으로 항상 desc 사용)
  //   const handleOrderToggle = () => {
  //     if (onOrderChange) {
  //       const newOrder = sort.order === 'asc' ? 'desc' : 'asc';
  //       onOrderChange(newOrder);
  //     }
  //   };

  return (
    <div className="d-flex justify-content-end mb-3">
      <div className="btn-group">
        <button
          type="button"
          className={`btn btn-sm ${sort.by === 'createdAt' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onSortChange('createdAt')}
        >
          <FontAwesomeIcon icon={getSortIcon('createdAt')} />{' '}
          {t('columns.bbsComment.createdAt')}
        </button>
        <button
          type="button"
          className={`btn btn-sm ${sort.by === 'replyCount' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onSortChange('replyCount')}
        >
          <FontAwesomeIcon icon={getSortIcon('replyCount')} />{' '}
          {t('columns.bbsComment.replyCount')}
        </button>
        <button
          type="button"
          className={`btn btn-sm ${sort.by === 'likeCount' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onSortChange('likeCount')}
        >
          <FontAwesomeIcon icon={getSortIcon('likeCount')} />{' '}
          {t('columns.bbsComment.likeCount')}
        </button>
      </div>
    </div>
  );
};

export default SortOptions;
