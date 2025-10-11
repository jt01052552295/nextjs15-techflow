'use server';

import { stat01, stat02, stat03, stat04 } from '@/services/main.service';

/**
 * 대시보드에 필요한 모든 통계 데이터를 한 번에 가져오는 함수
 */
export async function getDashboardStats(startDate: Date, endDate: Date) {
  try {
    // 병렬로 모든 통계 데이터를 가져옴
    const [cardStats, graphData, activities, visitorStats] = await Promise.all([
      stat01(startDate, endDate),
      stat02(startDate, endDate),
      stat03(startDate, endDate),
      stat04(startDate, endDate),
    ]);

    return {
      cardStats,
      graphData,
      activities,
      visitorStats,
    };
  } catch (error) {
    console.error('대시보드 데이터 가져오기 오류:', error);
    throw new Error('대시보드 데이터를 가져오는 중 오류가 발생했습니다.');
  }
}

/**
 * 상단 카드 통계 데이터만 가져오는 함수
 */
export async function getCardStats(startDate: Date, endDate: Date) {
  try {
    const stats = await stat01(startDate, endDate);
    return stats;
  } catch (error) {
    console.error('카드 통계 데이터 가져오기 오류:', error);
    throw new Error('카드 통계 데이터를 가져오는 중 오류가 발생했습니다.');
  }
}

/**
 * 그래프 데이터만 가져오는 함수
 */
export async function getGraphData(startDate: Date, endDate: Date) {
  try {
    const graphData = await stat02(startDate, endDate);
    return graphData;
  } catch (error) {
    console.error('그래프 데이터 가져오기 오류:', error);
    throw new Error('그래프 데이터를 가져오는 중 오류가 발생했습니다.');
  }
}

/**
 * 최근 활동 목록 데이터만 가져오는 함수
 */
export async function getActivities(
  startDate: Date,
  endDate: Date,
  limit: number = 10,
) {
  try {
    const activities = await stat03(startDate, endDate, limit);
    return activities;
  } catch (error) {
    console.error('최근 활동 데이터 가져오기 오류:', error);
    throw new Error('최근 활동 데이터를 가져오는 중 오류가 발생했습니다.');
  }
}

/**
 * 방문자 통계 데이터만 가져오는 함수
 */
export async function getVisitorStats(startDate: Date, endDate: Date) {
  try {
    const visitorStats = await stat04(startDate, endDate);
    return visitorStats;
  } catch (error) {
    console.error('방문자 통계 데이터 가져오기 오류:', error);
    throw new Error('방문자 통계 데이터를 가져오는 중 오류가 발생했습니다.');
  }
}

/**
 * 날짜 범위를 생성하는 유틸리티 함수 (클라이언트에서 사용 가능)
 */
export async function getDateRange(
  period: 'today' | 'week' | 'month' | 'year',
) {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(endDate.getMonth() - 1); // 기본값: 1개월
  }

  return { startDate, endDate };
}
