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

interface UserGrowthChartProps {
  type?: 'line' | 'bar';
}

export default function UserGrowthChart({ type = 'bar' }: UserGrowthChartProps) {
  // Mock data cho số user mới theo ngày trong tháng
  const generateDailyUserData = () => {
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

  const { days, userData } = generateDailyUserData();

  const data = {
    labels: days,
    datasets: [
      {
        label: 'Người dùng mới',
        data: userData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: type === 'bar' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: type === 'line',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Số lượng người dùng mới theo ngày trong tháng',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#1e40af',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Số người dùng',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Ngày trong tháng',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const ChartComponent = type === 'line' ? Line : Bar;

  const totalNewUsers = userData.reduce((sum, users) => sum + users, 0);
  const averageDaily = Math.round(totalNewUsers / userData.length);
  const maxDaily = Math.max(...userData);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-blue-800">Tăng trưởng người dùng</h3>
          <p className="text-sm text-gray-600">Thống kê người dùng mới đăng ký</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{totalNewUsers}</div>
          <div className="text-xs text-gray-500">Tổng trong tháng</div>
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-blue-700">{averageDaily}</div>
          <div className="text-xs text-blue-600">Trung bình/ngày</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-green-700">{maxDaily}</div>
          <div className="text-xs text-green-600">Cao nhất/ngày</div>
        </div>
      </div>
      
      <div className="h-80">
        <ChartComponent data={data} options={options} />
      </div>
    </div>
  );
}