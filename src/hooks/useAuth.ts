import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/AuthService';
import { LoginRequest } from '@/types/Auth';
import { User } from '@/types/User';

export const useAuth = () => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const token = AuthService.getToken();
    const userData = AuthService.getUser();

    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setLoginLoading(true);
    setLoginError('');
    
    try {
      const response = await AuthService.login(credentials);
      
      const user = response.user;

      // Chỉ cho phép admin đăng nhập
      if (user?.role !== 'ADMIN') {
        throw new Error('Chỉ quản trị viên mới có thể đăng nhập!');
      }
      
      AuthService.setAuth(response.token, user);
      setUser(user || null);
      setIsAuthenticated(true);
      
      // Reset login form
      setLoginForm({ email: '', password: '' });
      
      return response;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setLoginError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      throw error;
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    const token = AuthService.getToken();
    await AuthService.logout(token || undefined);
    setUser(null);
    setIsAuthenticated(false);
    setLoginForm({ email: '', password: '' });
    setLoginError('');
    router.push('/login');
  };



  // Login form handlers
  const updateLoginForm = (field: 'email' | 'password', value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  };

  const resetLoginForm = () => {
    setLoginForm({ email: '', password: '' });
    setLoginError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({
        email: loginForm.email,
        password: loginForm.password
      });
      
      // Chuyển hướng đến trang dashboard
      router.push('/dashboard');
    } catch (err: any) {
      // Error đã được xử lý trong login function
      console.error('Login submit error:', err);
    }
  };

  return {
    // Auth state
    user,
    setUser,
    loading,
    isAuthenticated,
    
    // Login form state
    loginForm,
    loginLoading,
    loginError,
    
    // Auth methods
    login,
    logout,
    isAdmin: () => AuthService.isAdmin(),
    
    // Login form methods
    updateLoginForm,
    resetLoginForm,
    handleLoginSubmit
  };
};