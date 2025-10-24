import { User } from '@/types/User';
import { mockUsers } from '@/mocksData/mockUser';

export class UserService {
  private static users: User[] = [...mockUsers];

  static getAllUsers(): Promise<User[]> {
    //fake API call
    return Promise.resolve([...this.users]);

    //real API call example:
    // return fetch('/api/users')
    //   .then(response => response.json())
    //   .then(data => data as User[]);
  }

  static getUserById(id: string): Promise<User | null> {

    //fake API call
    const user = this.users.find(u => u.id === id);
    return Promise.resolve(user || null);

    //real API call example:
    // return fetch(`/api/users/${id}`)
    //   .then(response => {
    //     if (!response.ok) return null;
    //     return response.json();
    //   })
    //   .then(data => data as User);
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

  static updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    //fake API call
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.users[index] = { ...this.users[index], ...userData };
    return Promise.resolve(this.users[index]);

    //real API call example:
    // return fetch(`/api/users/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData),
    // })
    //   .then(response => {
    //     if (!response.ok) return null;
    //     return response.json();
    //   })
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
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.fullname.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
    return Promise.resolve(filteredUsers);

    //real API call example:
    // return fetch(`/api/users?search=${encodeURIComponent(query)}`)
    //   .then(response => response.json())
    //   .then(data => data as User[]);
  }
}