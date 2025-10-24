export interface User {
    id: string;
    username: string;
    fullname: string;
    email: string;
    gender: string;
    avatarUrl?: string;
    createdAt: Date;
    role?: RoleResponse;
}

export interface RoleResponse {
    name: string;
    permissions?: PermissionResponse[];
}

export interface PermissionResponse {
    name: string;
}

export type FilterGender = 'all' | 'male' | 'female';