'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
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
  const { t } = useLanguage();
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
        label: t('common.dashboard.chart.datasets.users'),
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
        label: t('common.dashboard.chart.datasets.signouts'),
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
        label: t('common.dashboard.chart.datasets.posts'),
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
        label: t('common.dashboard.chart.datasets.comments'),
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
        label: t('common.dashboard.chart.datasets.visitors'),
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
          <span className="visually-hidden">
            {t('common.dashboard.chart.messages.loading')}
          </span>
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
          {t('common.dashboard.chart.messages.noData')}
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
    <div className="row">
      <div className="col-xl mb-4">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                {t('common.dashboard.chart.title')}
              </h5>

              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${chartType === 'line' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setChartType('line')}
                >
                  {t('common.dashboard.chart.chartTypes.line')}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${chartType === 'bar' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setChartType('bar')}
                >
                  {t('common.dashboard.chart.chartTypes.bar')}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${chartType === 'area' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setChartType('area')}
                >
                  {t('common.dashboard.chart.chartTypes.area')}
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
                  {t('common.dashboard.chart.tabs.all')}
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
                  {t('common.dashboard.chart.tabs.users')}
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
                  {t('common.dashboard.chart.tabs.signouts')}
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
                  {t('common.dashboard.chart.tabs.posts')}
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
                  {t('common.dashboard.chart.tabs.comments')}
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
                  {t('common.dashboard.chart.tabs.visitors')}
                </a>
              </li>
            </ul>

            {/* 차트 영역 */}
            <div className="chart-container" style={{ height: '400px' }}>
              {renderChart()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPanel;
