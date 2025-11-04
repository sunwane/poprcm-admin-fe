import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/AuthService';
import { LoginRequest } from '@/types/Auth';
import { User } from '@/types/User';

export const useAuth = () => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = AuthService.getToken();
    const userData = AuthService.getUser();

    console.log('useAuth useEffect - Token from localStorage:', token);
    console.log('useAuth useEffect - User from localStorage:', userData);

    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
      console.log('useAuth useEffect - User authenticated successfully');
    } else {
      setUser(null);
      setIsAuthenticated(false);
      console.log('useAuth useEffect - User not authenticated');
    }
    setLoading(false);
    console.log('useAuth useEffect - Loading set to false');
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await AuthService.login(credentials);
      
      // Chỉ cho phép admin đăng nhập
      if (response.user.role !== 'admin') {
        throw new Error('Chỉ quản trị viên mới có thể đăng nhập!');
      }
      
      AuthService.setAuth(response.token, response.user);
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user) throw new Error('Người dùng chưa đăng nhập');
      
      const response = await AuthService.changePassword({
        userId: user.id,
        currentPassword,
        newPassword
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    changePassword,
    isAdmin: () => AuthService.isAdmin()
  };
};