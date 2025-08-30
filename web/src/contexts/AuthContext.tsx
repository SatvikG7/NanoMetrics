"use client";

import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import type { UserResponse } from "@/types/api";

interface AuthContextType {
    user: UserResponse | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (data: {
        username: string;
        fname: string;
        lname: string;
        email: string;
        password: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();

    const { data: user, isLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            try {
                const response = await authApi.getCurrentUser();
                return response.data;
            } catch {
                return null;
            }
        },
        retry: false,
    });

    const loginMutation = useMutation({
        mutationFn: async ({
            username,
            password,
        }: {
            username: string;
            password: string;
        }) => {
            return await authApi.login({ username, password });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });

    const registerMutation = useMutation({
        mutationFn: async (data: {
            username: string;
            fname: string;
            lname: string;
            email: string;
            password: string;
        }) => {
            return await authApi.register(data);
        },
    });

    const logoutMutation = useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: () => {
            queryClient.setQueryData(["user"], null);
            queryClient.clear();
        },
    });

    const login = async (username: string, password: string) => {
        await loginMutation.mutateAsync({ username, password });
    };

    const register = async (data: {
        username: string;
        fname: string;
        lname: string;
        email: string;
        password: string;
    }) => {
        await registerMutation.mutateAsync(data);
    };

    const logout = async () => {
        await logoutMutation.mutateAsync();
    };

    return (
        <AuthContext.Provider
            value={{
                user: user || null,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
