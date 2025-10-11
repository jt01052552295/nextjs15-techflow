'use client';

import { usePeriodStore } from '@/store/periodStore';
import dayjs from 'dayjs';

const Period = () => {
  const { startDate, endDate, preset, setStartDate, setEndDate, setDateRange } =
    usePeriodStore();

  // 시작일 변경 핸들러
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = dayjs(e.target.value);
    if (newDate.isValid()) {
      setStartDate(newDate);
    }
  };

  // 종료일 변경 핸들러
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = dayjs(e.target.value);
    if (newDate.isValid()) {
      setEndDate(newDate);
    }
  };

  // 프리셋 변경 핸들러
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDateRange(value);
  };

  // 적용 버튼 클릭 핸들러
  const handleApply = () => {
    console.log('적용된 날짜 범위:', {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
    });
    // 여기에 데이터 로딩 로직 추가 가능
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="card-title mb-0">기간 필터</h5>
      </div>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* 기간 프리셋 선택 */}
          <div className="col-md-3">
            <select
              className="form-select"
              value={preset}
              onChange={handlePresetChange}
              aria-label="기간 선택"
            >
              <option value="today">오늘</option>
              <option value="week">최근 1주일</option>
              <option value="month">최근 1개월</option>
              <option value="year">최근 1년</option>
              <option value="custom">직접 지정</option>
            </select>
          </div>

          {/* 시작일 선택 */}
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text">시작일</span>
              <input
                type="date"
                className="form-control"
                value={startDate.format('YYYY-MM-DD')}
                onChange={handleStartDateChange}
              />
            </div>
          </div>

          {/* 종료일 선택 */}
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text">종료일</span>
              <input
                type="date"
                className="form-control"
                value={endDate.format('YYYY-MM-DD')}
                onChange={handleEndDateChange}
              />
            </div>
          </div>

          {/* 적용 버튼 */}
          <div className="col-md-3">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={handleApply}
            >
              적용
            </button>
          </div>
        </div>

        {/* 현재 선택된 기간 표시 */}
        <div className="mt-3">
          <p className="text-muted mb-0">
            <small>
              선택된 기간: {startDate.format('YYYY년 MM월 DD일')} ~{' '}
              {endDate.format('YYYY년 MM월 DD일')}
            </small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Period;
