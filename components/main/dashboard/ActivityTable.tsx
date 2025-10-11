'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
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
        return '게시글';
      case 'comments':
        return '댓글';
      case 'users':
        return '가입회원';
      case 'signouts':
        return '탈퇴회원';
      case 'visitors':
        return '방문자';
      default:
        return '게시글'; // 기본값 설정
    }
  }

  // 활동 유형에 따른 아이콘 반환
  function getActivityIcon(type: string) {
    switch (type) {
      case '게시글':
        return <FontAwesomeIcon icon={faFileLines} className="text-primary" />;
      case '댓글':
        return <FontAwesomeIcon icon={faComment} className="text-info" />;
      case '가입회원':
        return <FontAwesomeIcon icon={faUser} className="text-success" />;
      case '탈퇴회원':
        return <FontAwesomeIcon icon={faUserMinus} className="text-danger" />;
      case '방문자':
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
          <span className="visually-hidden">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">최근 활동</h5>
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
              게시글
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
              댓글
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
              회원 가입
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
              회원 탈퇴
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
              방문자
            </a>
          </li>
        </ul>

        {/* 테이블 */}
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>유형</th>
                <th style={{ width: '40%' }}>내용</th>
                <th style={{ width: '20%' }}>사용자</th>
                <th style={{ width: '20%' }}>일시</th>
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
                    데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityTable;
