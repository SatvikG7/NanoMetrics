import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if user is trying to access protected routes
    const protectedRoutes = ["/dashboard"];
    const authRoutes = ["/login", "/register"];

    const token = request.cookies.get("authToken");

    // If accessing protected route without token, redirect to login
    if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // If accessing auth routes with token, redirect to dashboard
    if (authRoutes.some((route) => pathname.startsWith(route)) && token) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};
