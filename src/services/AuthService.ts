import { 
  AuthenticationRequest, 
  AuthResponse, 
  LoginRequest,
  ChangePasswordRequest 
} from '@/types/Auth';

class AuthService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      // Tạm thời mock response cho testing
      if (request.email === 'admin@poprcm.com' && request.password === 'admin123') {
        return {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: '1',
            username: 'admin',
            fullname: 'Admin User',
            email: 'admin@poprcm.com',
            role: 'admin',
            createdAt: new Date(),
            gender: 'male'
          },
          message: 'Đăng nhập thành công'
        };
      } else {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      // Real API call would be:
      // const response = await fetch(`${this.baseURL}/auth/login`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(request),
      // });

      // if (!response.ok) {
      //   throw new Error('Đăng nhập thất bại');
      // }

      // return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async changePassword(request: ChangePasswordRequest): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Đổi mật khẩu thất bại');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      console.log('Retrieved token:', token);
      return token;
    }
    return null;
  }

  getUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      console.log('Retrieved user:', userStr);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  setAuth(token: string, user: any) {
    if (typeof window !== 'undefined') {
      console.log('AuthService setAuth - Setting token:', token);
      console.log('AuthService setAuth - Setting user:', user);
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('AuthService setAuth - Data saved to localStorage');
    }
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }
}

export default new AuthService();
