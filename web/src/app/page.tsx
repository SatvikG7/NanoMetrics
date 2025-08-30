"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BarChart3, Globe, Users, Zap } from "lucide-react";

export default function Home() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return null; // Will redirect to dashboard
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                NanoMetrics
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/login">
                                <Button
                                    variant="outline"
                                    analyticsEvent="homepage_signin_click"
                                    analyticsData={{ location: "header" }}
                                >
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button
                                    analyticsEvent="homepage_get_started_click"
                                    analyticsData={{ location: "header" }}
                                >
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Powerful Website
                        <span className="text-blue-600 block">Analytics</span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Track, analyze, and optimize your website performance
                        with real-time insights and comprehensive analytics
                        dashboards.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register">
                            <Button size="lg" className="w-full sm:w-auto">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                View Demo
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <BarChart3 className="h-6 w-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg">
                                Real-time Analytics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Monitor your website traffic and user behavior
                                in real-time with detailed insights.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Globe className="h-6 w-6 text-green-600" />
                            </div>
                            <CardTitle className="text-lg">
                                Multiple Sites
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Track multiple websites from a single dashboard
                                with comprehensive reporting.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <CardTitle className="text-lg">
                                User Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Understand your audience with detailed user
                                demographics and behavior patterns.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                                <Zap className="h-6 w-6 text-orange-600" />
                            </div>
                            <CardTitle className="text-lg">
                                Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Optimize your website speed and performance with
                                actionable recommendations.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>

                {/* CTA Section */}
                <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        Ready to get started?
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                        Join thousands of businesses already using NanoMetrics
                        to grow their online presence.
                    </p>
                    <Link href="/register">
                        <Button size="lg">Create Your Account Today</Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}

