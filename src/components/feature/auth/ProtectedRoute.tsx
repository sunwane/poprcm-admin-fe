'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// ProtectedRoute là component đảm bảo chỉ người dùng đã xác thực 
// mới có thể truy cập các thành phần con bên trong nó

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth(); //kiểm tra trạng thái xác thực từ useAuth hook
  const router = useRouter();

  useEffect(() => {
    // Chỉ redirect khi đã load xong và không được xác thực
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]); // Chạy khi loading hoặc isAuthenticated thay đổi

  // Hiển thị loading khi đang kiểm tra trạng thái xác thực
  if (loading) {
    return <div className="animate-pulse text-blue-600 flex items-center justify-center min-h-screen">Đang kiểm tra xác thực...</div>;
  }

  // Redirect khi không được xác thực
  if (!isAuthenticated) {
    return <div className="animate-pulse text-blue-600 flex items-center justify-center min-h-screen">Đang chuyển hướng...</div>;
  }

  return <>{children}</>;
}