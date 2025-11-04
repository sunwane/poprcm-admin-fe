'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NavigationBar from './NavigationBar';
import ProtectedRoute from '@/components/feature/auth/ProtectedRoute';

interface ClientLayoutProps {
  children: React.ReactNode;
}

// ClientLayout component quản lý layout cho toàn bộ giao diện hiển thị phía client

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { loading } = useAuth();
  const isLoginPage = pathname === '/login';

  // Hiển thị loading khi đang kiểm tra trạng thái xác thực
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center animate-pulse">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-blue-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Nếu là trang đăng nhập, không bao bọc trong ProtectedRoute và ko có NavigationBar
  if (isLoginPage) {
    return (
      <div className="bg-white min-h-screen">
        {children}
      </div>
    );
  }

  // Bên trong sau khi đăng nhập thành công, 
  // ProtectedRoute dùng bao bọc các thông tin không được truy cập khi chưa xác thực
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <NavigationBar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}