'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faUserPlus,
  faUserMinus,
  faFileLines,
  faComment,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { getActivities } from '@/actions/main/dashboard';
import { usePeriodStore } from '@/store/periodStore';
import dayjs from 'dayjs';

interface Activity {
  id: string;
  type: string;
  content: string;
  user: string;
  createdAt: Date;
  board?: string;
}

const ActivityTable = () => {
  const { t } = useLanguage();
  const { startDate, endDate } = usePeriodStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const data = await getActivities(
          startDate.toDate(),
          endDate.toDate(),
          100,
        );
        setActivities(data);
      } catch (error) {
        console.error('활동 데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [startDate, endDate]);

  // 활동 유형별 필터링
  const filteredActivities = activities.filter(
    (activity) => activity.type === getTypeByTab(activeTab),
  );

  // 탭 이름을 활동 유형으로 변환
  function getTypeByTab(tab: string): string {
    switch (tab) {
      case 'posts':
        return t('common.dashboard.activity.types.posts');
      case 'comments':
        return t('common.dashboard.activity.types.comments');
      case 'users':
        return t('common.dashboard.activity.types.users');
      case 'signouts':
        return t('common.dashboard.activity.types.signouts');
      case 'visitors':
        return t('common.dashboard.activity.types.visitors');
      default:
        return t('common.dashboard.activity.types.posts'); // 기본값 설정
    }
  }

  // 활동 유형에 따른 아이콘 반환
  function getActivityIcon(type: string) {
    switch (type) {
      case t('common.dashboard.activity.types.posts'):
        return <FontAwesomeIcon icon={faFileLines} className="text-primary" />;
      case t('common.dashboard.activity.types.comments'):
        return <FontAwesomeIcon icon={faComment} className="text-info" />;
      case t('common.dashboard.activity.types.users'):
        return <FontAwesomeIcon icon={faUser} className="text-success" />;
      case t('common.dashboard.activity.types.signouts'):
        return <FontAwesomeIcon icon={faUserMinus} className="text-danger" />;
      case t('common.dashboard.activity.types.visitors'):
        return <FontAwesomeIcon icon={faEye} className="text-secondary" />;
      default:
        return null;
    }
  }

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">
            {t('common.dashboard.activity.messages.loading')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-xl mb-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">
              {t('common.dashboard.activity.title')}
            </h5>
          </div>

          <div className="card-body">
            {/* 탭 메뉴 */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('posts');
                  }}
                >
                  <FontAwesomeIcon icon={faFileLines} className="me-1" />
                  {t('common.dashboard.activity.tabs.posts')}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('comments');
                  }}
                >
                  <FontAwesomeIcon icon={faComment} className="me-1" />
                  {t('common.dashboard.activity.tabs.comments')}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('users');
                  }}
                >
                  <FontAwesomeIcon icon={faUserPlus} className="me-1" />
                  {t('common.dashboard.activity.tabs.users')}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'signouts' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('signouts');
                  }}
                >
                  <FontAwesomeIcon icon={faUserMinus} className="me-1" />
                  {t('common.dashboard.activity.tabs.signouts')}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'visitors' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('visitors');
                  }}
                >
                  <FontAwesomeIcon icon={faEye} className="me-1" />
                  {t('common.dashboard.activity.tabs.visitors')}
                </a>
              </li>
            </ul>

            {/* 테이블 */}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>
                      {t('common.dashboard.activity.table.headers.type')}
                    </th>
                    <th style={{ width: '40%' }}>
                      {t('common.dashboard.activity.table.headers.content')}
                    </th>
                    <th style={{ width: '20%' }}>
                      {t('common.dashboard.activity.table.headers.user')}
                    </th>
                    <th style={{ width: '20%' }}>
                      {t('common.dashboard.activity.table.headers.date')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                      <tr key={activity.id}>
                        <td>
                          <span className="d-flex align-items-center">
                            {getActivityIcon(activity.type)}
                            <span className="ms-2">{activity.type}</span>
                          </span>
                        </td>
                        <td>{activity.content}</td>
                        <td>{activity.user}</td>
                        <td
                          title={dayjs(activity.createdAt).format(
                            'YYYY-MM-DD HH:mm:ss',
                          )}
                        >
                          {dayjs(activity.createdAt).format('YY.MM.DD HH:mm')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-3">
                        {t('common.dashboard.activity.table.noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTable;
