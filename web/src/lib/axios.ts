import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
    withCredentials: true, // This will include cookies in requests
    headers: {
        "Content-Type": "application/json",
    },
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login if unauthorized
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
