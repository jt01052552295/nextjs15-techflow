'use client';

import { useEffect, useState } from 'react';
import StatCard from './StatCard';
import { getCardStats } from '@/actions/main/dashboard';
import { usePeriodStore } from '@/store/periodStore';

interface StatsData {
  totalUsers: number;
  signoutUsers: number;
  totalPosts: number;
  totalComments: number;
  totalVisitors: number;
}

const DashboardCards = () => {
  const { startDate, endDate } = usePeriodStore();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [prevStats, setPrevStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // 현재 기간 통계
        const currentStats = await getCardStats(
          startDate.toDate(),
          endDate.toDate(),
        );

        // 이전 기간 통계 (비교용)
        const duration = endDate.diff(startDate, 'day');
        const prevStartDate = startDate.subtract(duration, 'day');
        const prevEndDate = startDate.subtract(1, 'day');
        const previousStats = await getCardStats(
          prevStartDate.toDate(),
          prevEndDate.toDate(),
        );

        setStats(currentStats);
        setPrevStats(previousStats);
      } catch (error) {
        console.error('통계 데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [startDate, endDate]);

  // 증감률 계산 함수
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return (
    <div className="row">
      <div className="col-sm-6 col-md-4 col-xl mb-4">
        <StatCard
          title="가입 회원"
          value={stats?.totalUsers || 0}
          icon="person"
          color="primary"
          change={
            prevStats
              ? calculateChange(
                  stats?.totalUsers || 0,
                  prevStats?.totalUsers || 1,
                )
              : undefined
          }
          isLoading={isLoading}
        />
      </div>
      <div className="col-sm-6 col-md-4 col-xl mb-4">
        <StatCard
          title="탈퇴 회원"
          value={stats?.signoutUsers || 0}
          icon="person-x"
          color="danger"
          change={
            prevStats
              ? calculateChange(
                  stats?.signoutUsers || 0,
                  prevStats?.signoutUsers || 1,
                )
              : undefined
          }
          isLoading={isLoading}
        />
      </div>
      <div className="col-sm-6 col-md-4 col-xl mb-4">
        <StatCard
          title="게시글"
          value={stats?.totalPosts || 0}
          icon="file-text"
          color="info"
          change={
            prevStats
              ? calculateChange(
                  stats?.totalPosts || 0,
                  prevStats?.totalPosts || 1,
                )
              : undefined
          }
          isLoading={isLoading}
        />
      </div>
      <div className="col-sm-6 col-md-4 col-xl mb-4">
        <StatCard
          title="댓글"
          value={stats?.totalComments || 0}
          icon="chat"
          color="warning"
          change={
            prevStats
              ? calculateChange(
                  stats?.totalComments || 0,
                  prevStats?.totalComments || 1,
                )
              : undefined
          }
          isLoading={isLoading}
        />
      </div>
      <div className="col-sm-6 col-md-4 col-xl mb-4">
        <StatCard
          title="방문자"
          value={stats?.totalVisitors || 0}
          icon="eye"
          color="success"
          change={
            prevStats
              ? calculateChange(
                  stats?.totalVisitors || 0,
                  prevStats?.totalVisitors || 1,
                )
              : undefined
          }
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default DashboardCards;
