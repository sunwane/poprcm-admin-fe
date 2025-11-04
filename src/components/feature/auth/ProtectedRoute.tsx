'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Chỉ redirect khi đã load xong và không được xác thực
    if (!loading && !isAuthenticated) {
      console.log('ProtectedRoute: Redirecting to login - not authenticated');
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Hiển thị loading khi đang kiểm tra trạng thái xác thực
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang kiểm tra xác thực...</div>;
  }

  // Redirect khi không được xác thực
  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Đang chuyển hướng...</div>;
  }

  return <>{children}</>;
}