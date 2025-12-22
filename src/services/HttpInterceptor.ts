import AuthService from './AuthService';

class HttpInterceptor {
  // Method để wrap fetch với automatic token refresh
  static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    // Ensure valid token trước khi gửi request
    const validToken = await AuthService.ensureValidToken();
    
    if (!validToken) {
      // Redirect to login if no valid token
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('No valid token available');
    }

    // Thêm Authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${validToken}`,
    };

    // Gửi request với token valid
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Nếu nhận được 401 (Unauthorized), thử refresh token
    if (response.status === 401) {
      console.log('Received 401, attempting token refresh...');
      
      const newToken = await AuthService.refreshToken();
      
      if (newToken) {
        // Retry request với token mới
        const retryHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
        };

        return await fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      } else {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Token refresh failed');
      }
    }

    return response;
  }
}

export default HttpInterceptor;
