'use client';

import UserGrowthChart from '@/components/ui/UserGrowthChart';

export default function Dashboard() {
  const stats = [
    { name: 'Tổng số phim', value: '1,245', change: '+12%', icon: '🎬' },
    { name: 'Tổng số series', value: '342', change: '+8%', icon: '📺' },
    { name: 'Diễn viên', value: '856', change: '+5%', icon: '🎭' },
    { name: 'Người dùng', value: '12,487', change: '+23%', icon: '👥' },
  ];

  const recentMovies = [
    { title: 'Avatar: The Way of Water', category: 'Hành động', status: 'Đang chiếu' },
    { title: 'Black Panther: Wakanda Forever', category: 'Siêu anh hùng', status: 'Sắp chiếu' },
    { title: 'Top Gun: Maverick', category: 'Hành động', status: 'Đang chiếu' },
  ];

  const recentActivities = [
    { user: 'Nguyễn Văn A', action: 'đã đăng ký tài khoản', time: '2 phút trước' },
    { user: 'Trần Thị B', action: 'đã xem phim Avatar', time: '5 phút trước' },
    { user: 'Lê Văn C', action: 'đã bình luận phim', time: '10 phút trước' },
    { user: 'Phạm Thị D', action: 'đã thích phim mới', time: '15 phút trước' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tổng quan hệ thống</h1>
        <p className="text-gray-600">Xem tổng quan về tình hình hoạt động của hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{stat.icon}</div>
              <span className="text-green-500 text-sm font-medium">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold text-blue-800 mb-1">{stat.value}</div>
            <div className="text-gray-600 text-sm">{stat.name}</div>
          </div>
        ))}
      </div>

      {/* Charts and Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* User Growth Chart - Takes 2 columns */}
        <div className="xl:col-span-2">
          <UserGrowthChart type="bar" />
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-blue-600 text-xs font-bold">
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Movies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Phim mới nhất</h2>
          <div className="space-y-4">
            {recentMovies.map((movie, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-blue-800">{movie.title}</div>
                  <div className="text-sm text-gray-600">{movie.category}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  movie.status === 'Đang chiếu' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {movie.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Tình trạng hệ thống</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Server Status</span>
              </div>
              <span className="text-green-600 text-sm">Online</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Database</span>
              </div>
              <span className="text-blue-600 text-sm">Connected</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">API Response</span>
              </div>
              <span className="text-yellow-600 text-sm">120ms</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Storage</span>
              </div>
              <span className="text-green-600 text-sm">78% Used</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}