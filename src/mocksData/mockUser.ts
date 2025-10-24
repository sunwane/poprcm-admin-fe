import { User, RoleResponse, PermissionResponse } from '@/types/User';

export const mockRoles: RoleResponse[] = [
  {
    name: 'Admin',
  },
  {
    name: 'User',
  }
];

export const mockUsers: User[] = [
  { 
    id: '1', 
    username: 'admin',
    fullname: 'Admin', 
    email: 'poprcm@gmail.com',
    gender: 'male',
    createdAt: new Date('2023-01-15'),
    role: mockRoles[0],
  },
  { 
    id: '2', 
    username: 'tranthibinh',
    fullname: 'Trần Thị Bình', 
    email: 'tranthibinh@gmail.com',
    gender: 'female',
    avatarUrl: 'https://guchat.vn/wp-content/uploads/2025/04/avatar-vo-tri-cute-37.jpg',
    createdAt: new Date('2023-03-20'),
    role: mockRoles[1],
  },
  { 
    id: '3', 
    username: 'lehoangcuong',
    fullname: 'Lê Hoàng Cường', 
    email: 'lehoangcuong@gmail.com',
    gender: 'male',
    createdAt: new Date('2023-05-10'),
    role: mockRoles[1],
  },
  { 
    id: '4', 
    username: 'phamthidung',
    fullname: 'Phạm Thị Dung', 
    email: 'phamthidung@gmail.com',
    avatarUrl: 'https://aic.com.vn/wp-content/uploads/2024/10/anh-avatar-vo-tri-22.jpg',
    gender: 'female',
    createdAt: new Date('2023-07-05'),
    role: mockRoles[1],
  },
  { 
    id: '5', 
    username: 'vominhtuan',
    fullname: 'Võ Minh Tuấn', 
    email: 'vominhtuan@gmail.com',
    avatarUrl: 'https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-16.jpg',
    gender: 'male',
    createdAt: new Date('2025-10-12'),
    role: mockRoles[1],
  },
  { 
    id: '6', 
    username: 'hoangthilinh',
    fullname: 'Hoàng Thị Linh', 
    email: 'hoangthilinh@gmail.com',
    gender: 'female',
    avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTd7aj0A7Etvk0C8N_aYp4n-sjwOgers-xGQQ&s',
    createdAt: new Date('2023-11-08'),
    role: mockRoles[1],
  },
];