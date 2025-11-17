export interface User {
    id: string;
    userName: string;
    fullName: string;
    email: string;
    gender: string;
    avatarUrl?: string;
    createdAt: Date;
    role?: String;
}

export type FilterGender = 'ALL' | 'MALE' | 'FEMALE';
export type FilterRole = 'ALL' | 'ADMIN' | 'USER';