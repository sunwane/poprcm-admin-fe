import { User } from '@/types/User';
import { mockUsers } from '@/mocksData/mockUser';
import ServiceChecker from './ServiceChecker';

interface APIUserResponse {
  code?: number;
  message: string;
  result?: User;
}

export class UserService {
  private static users: User[] = [...mockUsers];
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api/users';

  static getAllUsers(): Promise<User[]> {
    //fake API call
    return Promise.resolve([...this.users]);

    //real API call example:
    // return fetch('/api/users')
    //   .then(response => response.json())
    //   .then(data => data as User[]);
  }

  static async getUserById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  /**
   * Lấy thông tin user hiện tại (GET /api/users/me)
   */
  static async getCurrentUser(token: string): Promise<User | null> {
    // Kiểm tra service availability trước
    const isServiceAvailable = await ServiceChecker.checkServiceAvailability();

    if (!isServiceAvailable) {
      console.log('Using mock data for getCurrentUser');
      // Fallback về mock data
      return this.getCurrentUserFromMock(token);
    }

    try {
      console.log('Attempting to call real API for getCurrentUser...');
      const response = await fetch(`${this.baseURL}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data: APIUserResponse = await response.json();
      console.log('✅ getCurrentUser successful with real API');
      return data.result || null;
      
    } catch (error: any) {
      console.warn('❌ API getCurrentUser failed, falling back to mock data:', error.message);
      // Fallback về mock data nếu API thất bại
      return this.getCurrentUserFromMock(token);
    }
  }

  /**
   * Mock implementation cho getCurrentUser
   */
  private static getCurrentUserFromMock(token: string): User | null {
    // Trong mock, chúng ta sẽ extract userId từ token hoặc dùng admin user mặc định
    if (token.startsWith('mock-jwt-token-')) {
      const adminUser = mockUsers.find(user => user.userName === 'admin');
      return adminUser || null;
    }
    return null;
  }

  static addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    //fake API call
    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return Promise.resolve(newUser);

    //real API call example:
    // return fetch('/api/users', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(user),
    // })
    //   .then(response => response.json())
    //   .then(data => data as User);
  }

  static deleteUser(id: string): Promise<boolean> {
    //fake API call
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return Promise.resolve(false);
    
    this.users.splice(index, 1);
    return Promise.resolve(true);

    //real API call example:
    // return fetch(`/api/users/${id}`, {
    //   method: 'DELETE',
    // })
    //   .then(response => response.ok);
  }

  static searchUsers(query: string): Promise<User[]> {
    //fake API call
    const filteredUsers = this.users.filter(user => 
      user.userName.toLowerCase().includes(query.toLowerCase()) ||
      user.fullName.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
    return Promise.resolve(filteredUsers);

    //real API call example:
    // return fetch(`/api/users?search=${encodeURIComponent(query)}`)
    //   .then(response => response.json())
    //   .then(data => data as User[]);
  }

  static updateProfile(userId: string, updatedData: Partial<User>): Promise<User | null> {
    if (localStorage.getItem('serviceAvailable') === 'true') {
      try {
        console.log('Attempting to call real API for updateProfile...');
        return fetch(`${this.baseURL}/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data: APIUserResponse) => {
          console.log('✅ updateProfile successful with real API');
          return data.result || null;
        });
      } catch (error: any) {
        console.warn('❌ API updateProfile failed:', error.message);
        return Promise.resolve(null);
      }
    }
    return Promise.resolve(null); // Default return statement
  }
}
