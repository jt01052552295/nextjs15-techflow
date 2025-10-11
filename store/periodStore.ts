import { create } from 'zustand';
import dayjs from 'dayjs';

interface PeriodState {
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  preset: string;
  setStartDate: (date: dayjs.Dayjs) => void;
  setEndDate: (date: dayjs.Dayjs) => void;
  setPreset: (preset: string) => void;
  setDateRange: (preset: string) => void;
}

export const usePeriodStore = create<PeriodState>((set) => ({
  startDate: dayjs().subtract(1, 'month'),
  endDate: dayjs(),
  preset: 'month',

  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  setPreset: (preset) => set({ preset }),

  setDateRange: (preset) => {
    let startDate;
    const endDate = dayjs();

    switch (preset) {
      case 'today':
        startDate = dayjs().startOf('day');
        break;
      case 'week':
        startDate = dayjs().subtract(1, 'week');
        break;
      case 'month':
        startDate = dayjs().subtract(1, 'month');
        break;
      case 'year':
        startDate = dayjs().subtract(1, 'year');
        break;
      default:
        startDate = dayjs().subtract(1, 'month');
    }

    set({ startDate, endDate, preset });
  },
}));

/*
* 예시

import { usePeriodStore } from '@/store/periodStore';

const StatCard = () => {
  const { startDate, endDate } = usePeriodStore();
  
  useEffect(() => {
    // startDate와 endDate가 변경될 때마다 데이터 로드
    loadData(startDate.toDate(), endDate.toDate());
  }, [startDate, endDate]);
  
  return (
    // 컴포넌트 렌더링
  );
};

*/
