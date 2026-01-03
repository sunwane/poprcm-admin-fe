'use client';

import UserGrowthChart from '@/components/ui/UserGrowthChart';
import { useDashboard } from '@/hooks/useDashboard';
import { getStatusColor, getStatusText } from '@/utils/movieUtils';

export default function Dashboard() {
  const {
    loading,
    error,
    dashboardStats,
    refreshStats,
  } = useDashboard();

  // Show loading state
  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !dashboardStats) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Lỗi tải dữ liệu</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      name: 'Tổng số phim', 
      value: dashboardStats?.totalMovies?.toLocaleString() || '0'
    },
    { 
      name: 'Tổng số series', 
      value: dashboardStats?.totalSeries?.toLocaleString() || '0'
    },
    { 
      name: 'Diễn viên', 
      value: dashboardStats?.totalActors?.toLocaleString() || '0'
    },
    { 
      name: 'Người dùng', 
      value: dashboardStats?.totalUsers?.toLocaleString() || '0'
    },
  ];

  const recentMovies = dashboardStats?.latestMovies?.slice(0, 3).map(movie => ({
    title: movie.title || 'Phim không tên',
    category: movie.genres?.map((g: any) => g.genresName || g.name)?.join(', ') || 'Chưa phân loại',
    status: movie.status?.join(', ') || 'Không xác định'
  })) || [
    { title: 'Đang tải...', category: '', status: '' },
    { title: 'Đang tải...', category: '', status: '' },
    { title: 'Đang tải...', category: '', status: '' },
  ];

  // Function to format activity action based on type
  const formatActivityAction = (activity: any) => {
    switch (activity.type?.toUpperCase()) {
      case 'WATCH':
        return `đã xem ${activity.episodeTitle ? 'tập' : 'phim'} "${activity.movieTitle || 'Nội dung không xác định'}"${activity.episodeTitle ? ` - ${activity.episodeTitle}` : ''}`;
      
      case 'FAVORITE':
        return `đã yêu thích phim "${activity.movieTitle || 'Phim không xác định'}"`;
      
      case 'COMMENT':
        return `đã bình luận về phim "${activity.movieTitle || 'Phim không xác định'}"${activity.content ? `: "${activity.content.substring(0, 30)}${activity.content.length > 30 ? '...' : ''}"` : ''}`;
      
      case 'RATING':
        return `đã đánh giá phim "${activity.movieTitle || 'Phim không xác định'}"`;
      
      case 'BOOKMARK':
        return `đã lưu phim "${activity.movieTitle || 'Phim không xác định'}" vào danh sách`;
      
      case 'REGISTER':
        return `đã đăng ký tài khoản`;
      
      case 'REVIEW':
        return `đã viết review cho phim "${activity.movieTitle || 'Phim không xác định'}"`;
      
      default:
        return `đã thực hiện 1 hoạt động không xác định "${activity.movieTitle || 'nội dung không xác định'}"`;
    }
  };

  const recentActivities = dashboardStats?.recentActivities?.slice(0, 4).map(activity => ({
    user: activity.userName || 'Người dùng ẩn danh',
    action: formatActivityAction(activity),
    time: activity.timestamp ? new Date(activity.timestamp).toLocaleString('vi-VN') : 'Vừa xong',
    type: activity.type || 'UNKNOWN'
  })) || [
    { user: 'Đang tải...', action: 'dữ liệu hoạt động', time: 'mới nhất', type: 'LOADING' },
    { user: 'Đang tải...', action: 'dữ liệu hoạt động', time: 'mới nhất', type: 'LOADING' },
    { user: 'Đang tải...', action: 'dữ liệu hoạt động', time: 'mới nhất', type: 'LOADING' },
    { user: 'Đang tải...', action: 'dữ liệu hoạt động', time: 'mới nhất', type: 'LOADING' },
  ];

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            Tổng quan hệ thống
          </h1>
          <p className="text-gray-500">Xem tổng quan về tình hình hoạt động của hệ thống</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Refresh Button */}
          <button
            onClick={refreshStats}
            disabled={loading}
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:bg-gray-400 flex items-center space-x-2 shadow-lg"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Đang tải...' : 'Làm mới'}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="text-amber-600">⚠️</div>
            <div className="ml-3">
              <p className="text-amber-800 font-medium">Cảnh báo: {error}</p>
              <p className="text-amber-700 text-sm">Hiển thị dữ liệu dự phòng</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-blue-200 to-transparent rounded-bl-full opacity-100"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 bg-linear-to-tl from-blue-100 to-transparent rounded-tl-full opacity-100"></div>

            <div className="relative">
              <div className="text-3xl font-bold text-blue-800 mb-2">
                {stat.value}
              </div>
              <div className="text-blue-600 text-sm font-medium">{stat.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* User Growth Chart - Takes 2 columns */}
        <div className="xl:col-span-2">
          <UserGrowthChart 
            type="line" 
            userDailyStats={dashboardStats?.userDailyStats || []}
          />
        </div>

        {/* Recent Activities */}
        <div className="bg-linear-to-b from-blue-700 to-blue-200 rounded-2xl shadow-lg border border-blue-100 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Hoạt động gần đây
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0 w-fit">
                  <p className="text-sm text-gray-900 line-clamp-2 max-w-full">
                    <span className="font-semibold text-blue-700">{activity.user}</span>{' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Movies */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <h2 className="text-xl font-bold bg-linear-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent mb-6">
            Phim mới nhất
          </h2>
          <div className="space-y-4">
            {recentMovies.map((movie, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div>
                  <div className="font-semibold text-blue-800">{movie.title}</div>
                  <div className="text-sm text-gray-600">{movie.category}</div>
                </div>
                <span className={`px-4 py-2 rounded-full text-xs font-semibold shadow-sm ${
                  getStatusColor(movie.status)
                }`}>
                  {getStatusText(movie.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <h2 className="text-xl font-bold bg-linear-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent mb-6">
            Tình trạng hệ thống
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* API Server */}
            <div className="flex flex-col justify-between h-36 min-w-[120px] bg-linear-to-br from-blue-100 via-emerald-100 to-emerald-200 rounded-xl border border-emerald-200 shadow-md p-4">
              <div className="flex items-center space-x-3">
                <div className="shrink-0 w-3 h-3 bg-emerald-500 rounded-full shadow-lg"></div>
                <span className="text-xl font-semibold text-gray-700">API Server</span>
              </div>
              <span className="text-emerald-700 text-lg font-bold mt-4">
                {localStorage.getItem('serviceAvailable') === "true" ? "Online" : "Offline"}
              </span>
            </div>
            {/* Database */}
            <div className="flex flex-col justify-between h-36 min-w-[120px] bg-linear-to-br from-blue-100 via-sky-100 to-blue-200 rounded-xl border border-sky-200 shadow-md p-4">
              <div className="flex items-center space-x-3">
                <div className="shrink-0 w-3 h-3 bg-sky-500 rounded-full shadow-lg"></div>
                <span className="text-xl font-semibold text-gray-700">Database</span>
              </div>
              <span className="text-sky-700 text-lg font-bold mt-4">
                {localStorage.getItem('serviceAvailable') === "true" ? "Connected" : "Not Connected"}
              </span>
            </div>
            {/* Sync Service */}
            <div className="flex flex-col justify-between h-36 min-w-[120px] bg-linear-to-br from-yellow-100 via-amber-100 to-amber-200 rounded-xl border border-amber-200 shadow-md p-4">
              <div className="flex items-center space-x-3">
                <div className="shrink-0 w-3 h-3 bg-amber-500 rounded-full shadow-lg"></div>
                <span className="text-xl font-semibold text-gray-700">Sync Service</span>
              </div>
              <span className="text-amber-700 text-lg font-bold mt-4">
                {dashboardStats?.moviesSyncedToday || 0} phim hôm nay
              </span>
            </div>
            {/* Episodes Update */}
            <div className="flex flex-col justify-between h-36 min-w-[120px] bg-linear-to-br from-indigo-100 via-violet-100 to-purple-200 rounded-xl border border-violet-200 shadow-md p-4">
              <div className="flex items-center space-x-3">
                <div className="shrink-0 w-3 h-3 bg-violet-500 rounded-full shadow-lg"></div>
                <span className="text-xl font-semibold text-gray-700">Episodes Update</span>
              </div>
              <span className="text-violet-700 text-lg font-bold mt-4">
                {dashboardStats?.episodesUpdatedToday || 0} tập hôm nay
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}