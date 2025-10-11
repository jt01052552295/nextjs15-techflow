'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faUserMinus,
  faFileLines,
  faComment,
  faEye,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import { getGraphData } from '@/actions/main/dashboard';
import { usePeriodStore } from '@/store/periodStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface ChartData {
  date: string;
  users: number;
  signouts: number;
  posts: number;
  comments: number;
  visitors: number;
}

const ChartPanel = () => {
  const { startDate, endDate } = usePeriodStore();
  const [rawData, setRawData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        const data = await getGraphData(startDate.toDate(), endDate.toDate());
        setRawData(data);
      } catch (error) {
        console.error('차트 데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [startDate, endDate]);

  // Chart.js 데이터 포맷으로 변환
  const prepareChartData = () => {
    if (!rawData || rawData.length === 0) return null;

    const labels = rawData.map((item) => item.date);
    const datasets = [];

    // 선택된 탭에 따라 데이터셋 추가
    if (activeTab === 'all' || activeTab === 'users') {
      datasets.push({
        label: '가입 회원',
        data: rawData.map((item) => item.users),
        borderColor: '#8884d8',
        backgroundColor:
          chartType === 'area' ? 'rgba(136, 132, 216, 0.6)' : '#8884d8',
        fill: chartType === 'area',
        tension: 0.4,
      });
    }

    if (activeTab === 'all' || activeTab === 'signouts') {
      datasets.push({
        label: '탈퇴 회원',
        data: rawData.map((item) => item.signouts),
        borderColor: '#ff7300',
        backgroundColor:
          chartType === 'area' ? 'rgba(255, 115, 0, 0.6)' : '#ff7300',
        fill: chartType === 'area',
        tension: 0.4,
      });
    }

    if (activeTab === 'all' || activeTab === 'posts') {
      datasets.push({
        label: '게시글',
        data: rawData.map((item) => item.posts),
        borderColor: '#0088fe',
        backgroundColor:
          chartType === 'area' ? 'rgba(0, 136, 254, 0.6)' : '#0088fe',
        fill: chartType === 'area',
        tension: 0.4,
      });
    }

    if (activeTab === 'all' || activeTab === 'comments') {
      datasets.push({
        label: '댓글',
        data: rawData.map((item) => item.comments),
        borderColor: '#00c49f',
        backgroundColor:
          chartType === 'area' ? 'rgba(0, 196, 159, 0.6)' : '#00c49f',
        fill: chartType === 'area',
        tension: 0.4,
      });
    }

    if (activeTab === 'all' || activeTab === 'visitors') {
      datasets.push({
        label: '방문자',
        data: rawData.map((item) => item.visitors),
        borderColor: '#ff8042',
        backgroundColor:
          chartType === 'area' ? 'rgba(255, 128, 66, 0.6)' : '#ff8042',
        fill: chartType === 'area',
        tension: 0.4,
      });
    }

    return { labels, datasets };
  };

  // 차트 옵션 - 타입 추가 및 리터럴 값 사용
  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index', // 명시적인 리터럴 값 사용
        intersect: false,
      },
    },
  };

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

  // 차트 데이터 준비
  const chartData = prepareChartData();

  // 차트 렌더링 함수
  const renderChart = () => {
    if (!chartData) {
      return (
        <div className="alert alert-info text-center">
          표시할 데이터가 없습니다.
        </div>
      );
    }

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} height={400} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} height={400} />;
      case 'area':
        // 영역 차트는 Line 차트에서 fill 옵션을 true로 설정
        return <Line data={chartData} options={chartOptions} height={400} />;
      default:
        return <Line data={chartData} options={chartOptions} height={400} />;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <FontAwesomeIcon icon={faChartLine} className="me-2" />
            통계 그래프
          </h5>

          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${chartType === 'line' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setChartType('line')}
            >
              선형
            </button>
            <button
              type="button"
              className={`btn btn-sm ${chartType === 'bar' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setChartType('bar')}
            >
              막대
            </button>
            <button
              type="button"
              className={`btn btn-sm ${chartType === 'area' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setChartType('area')}
            >
              영역
            </button>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* 탭 메뉴 */}
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <a
              className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('all');
              }}
            >
              <FontAwesomeIcon icon={faChartLine} className="me-1" />
              모든 통계
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
              <FontAwesomeIcon icon={faUser} className="me-1" />
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
              <FontAwesomeIcon icon={faUserMinus} className="me-1" />
              회원 탈퇴
            </a>
          </li>
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
              <FontAwesomeIcon icon={faComment} className="me-1" />
              댓글
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
              방문자
            </a>
          </li>
        </ul>

        {/* 차트 영역 */}
        <div className="chart-container" style={{ height: '400px' }}>
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default ChartPanel;
