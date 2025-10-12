'use client';

import { FC } from 'react';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faUserPlus,
  faUserMinus,
  faFileLines,
  faComment,
  faEye,
  faArrowUp,
  faArrowDown,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  change?: number;
  isLoading?: boolean;
}

const getIconByName = (iconName: string): IconDefinition => {
  switch (iconName) {
    case 'person':
      return faUserPlus;
    case 'person-x':
      return faUserMinus;
    case 'file-text':
      return faFileLines;
    case 'chat':
      return faComment;
    case 'eye':
      return faEye;
    default:
      return faUser; // 기본 아이콘
  }
};

const StatCard: FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  change,
  isLoading = false,
}) => {
  const { t } = useLanguage();

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div className={`bg-${color} text-white p-2 rounded me-3`}>
            <FontAwesomeIcon icon={getIconByName(icon)} className="fs-5" />
          </div>
          <h5 className="card-title mb-0">{title}</h5>
        </div>

        {isLoading ? (
          <div className="placeholder-glow">
            <span className="placeholder col-6"></span>
          </div>
        ) : (
          <h2 className="mb-1">{value.toLocaleString()}</h2>
        )}

        {change !== undefined && !isLoading && (
          <div
            className={`small ${change >= 0 ? 'text-success' : 'text-danger'}`}
          >
            <FontAwesomeIcon
              icon={change >= 0 ? faArrowUp : faArrowDown}
              className="me-1"
            />
            {Math.abs(change)}%
            <span className="text-muted">
              {' '}
              {t('common.dashboard.statCard.comparison')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
