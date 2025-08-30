import api from "@/lib/axios";
import type {
    LoginRequest,
    RegisterRequest,
    UserResponse,
    ApiResponse,
} from "@/types/api";

export const authApi = {
    login: async (data: LoginRequest): Promise<ApiResponse<string>> => {
        const response = await api.post("/api/auth/login", data);
        return response.data;
    },

    register: async (
        data: RegisterRequest
    ): Promise<ApiResponse<UserResponse>> => {
        const response = await api.post("/api/auth/register", data);
        return response.data;
    },

    getCurrentUser: async (): Promise<ApiResponse<UserResponse>> => {
        const response = await api.get("/api/auth/me");
        return response.data;
    },

    logout: async (): Promise<ApiResponse<string>> => {
        const response = await api.post("/api/auth/logout");
        return response.data;
    },
};
