'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DailyUserStat {
  date: string;
  newUsers: number;
}

interface UserGrowthChartProps {
  type?: 'line' | 'bar';
  userDailyStats?: DailyUserStat[];
}

export default function UserGrowthChart({ 
  type = 'line', // Changed default to line for smooth curve
  userDailyStats = [] 
}: UserGrowthChartProps) {
  // Xử lý dữ liệu từ API hoặc fallback về mock data
  const processUserData = () => {
    if (userDailyStats && userDailyStats.length > 0) {
      // Sử dụng dữ liệu thật từ API
      const days = userDailyStats.map(stat => {
        const date = new Date(stat.date);
        return date.getDate().toString();
      });
      const userData = userDailyStats.map(stat => stat.newUsers);
      return { days, userData };
    }
    
    // Fallback về mock data nếu không có dữ liệu từ API
    const days = [];
    const userData = [];
    
    // Tạo dữ liệu cho 30 ngày gần nhất
    for (let i = 30; i >= 1; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.getDate().toString());
      
      // Random số user mới từ 5-50 người/ngày với xu hướng tăng cuối tháng
      const baseUsers = Math.floor(Math.random() * 30) + 10;
      const weekendBonus = [0, 6].includes(date.getDay()) ? Math.floor(Math.random() * 15) : 0;
      const endOfMonthBonus = date.getDate() > 25 ? Math.floor(Math.random() * 20) : 0;
      
      userData.push(baseUsers + weekendBonus + endOfMonthBonus);
    }
    
    return { days, userData };
  };

  const { days, userData } = processUserData();

  const data = {
    labels: days,
    datasets: [
      {
        label: 'Người dùng mới',
        data: userData,
        borderColor: 'rgb(34, 197, 94)', // Emerald green
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // Semi-transparent emerald
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBorderWidth: 2,
        pointBorderColor: '#ffffff',
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointHoverBackgroundColor: 'rgb(34, 197, 94)',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        // Gradient fill
        gradient: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#374151',
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      title: {
        display: true,
        text: 'Số lượng người dùng mới theo ngày trong tháng',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#1e40af',
        padding: 20,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Số người dùng',
          font: {
            size: 12,
            weight: '500' as const,
          },
          color: '#6b7280',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: 'Ngày trong tháng',
          font: {
            size: 12,
            weight: '500' as const,
          },
          color: '#6b7280',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      line: {
        borderJoinStyle: 'round' as const,
        borderCapStyle: 'round' as const,
      },
      point: {
        hoverBorderWidth: 4,
      },
    },
  };

  const ChartComponent = Line; // Always use Line chart for smooth curve

  const totalNewUsers = userData.reduce((sum, users) => sum + users, 0);
  const averageDaily = Math.round(totalNewUsers / userData.length);
  const maxDaily = Math.max(...userData);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-emerald-800">Tăng trưởng người dùng</h3>
          <p className="text-sm text-gray-600">Thống kê người dùng mới đăng ký</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600">{totalNewUsers}</div>
          <div className="text-xs text-gray-500">Tổng trong tháng</div>
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
          <div className="text-lg font-semibold text-emerald-700">{averageDaily}</div>
          <div className="text-xs text-emerald-600">Trung bình/ngày</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
          <div className="text-lg font-semibold text-green-700">{maxDaily}</div>
          <div className="text-xs text-green-600">Cao nhất/ngày</div>
        </div>
      </div>
      
      <div className="h-80">
        <ChartComponent data={data}/>
      </div>
    </div>
  );
}