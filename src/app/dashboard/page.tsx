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

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text-title) mb-2">Tổng quan hệ thống</h1>
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
            <div className="text-2xl font-bold text-(--text-primary)] mb-1">{stat.value}</div>
            <div className="text-gray-600 text-sm">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Movies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-(--text-title)] mb-4">Phim mới nhất</h2>
          <div className="space-y-4">
            {recentMovies.map((movie, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-(--text-primary)]">{movie.title}</div>
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
      </div>
    </div>
  );
}