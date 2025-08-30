export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    fname: string;
    lname: string;
    email: string;
    password: string;
}

export interface UserResponse {
    id: string;
    username: string;
    fname: string;
    lname: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface SiteResponse {
    id: string;
    domain: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}
