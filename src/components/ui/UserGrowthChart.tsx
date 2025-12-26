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
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // blue-500, nhạt hơn
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBorderWidth: 2,
        pointBorderColor: '#ffffff',
        pointBackgroundColor: 'rgb(59, 130, 246)', // blue-500
        pointHoverBackgroundColor: 'rgb(59, 130, 246)',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const ChartComponent = Line; // Always use Line chart for smooth curve

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
        <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
          <div className="text-lg font-semibold text-blue-700">{averageDaily}</div>
          <div className="text-xs text-blue-600">Trung bình/ngày</div>
        </div>
        <div className="bg-sky-50 rounded-lg p-3 text-center border border-sky-100">
          <div className="text-lg font-semibold text-sky-700">{maxDaily}</div>
          <div className="text-xs text-sky-600">Cao nhất/ngày</div>
        </div>
      </div>
      
      <div className="h-80">
        <ChartComponent data={data}/>
      </div>
    </div>
  );
}