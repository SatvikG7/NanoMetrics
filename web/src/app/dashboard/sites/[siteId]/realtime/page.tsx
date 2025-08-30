"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { sitesApi } from "@/api/sites";
import { statsApi } from "@/api/stats";
import ProtectedRoute from "@/components/ProtectedRoute";
import SiteHeader from "@/components/SiteHeader";
import SiteNavigation from "@/components/SiteNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Users,
    Eye,
    Clock,
    Globe,
    Monitor,
    Activity,
    TrendingUp,
    RefreshCw,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

function SiteRealTimeContent() {
    const params = useParams();
    const router = useRouter();
    const siteId = params.siteId as string;
    const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const { data: siteResponse, isLoading: siteLoading } = useQuery({
        queryKey: ["site", siteId],
        queryFn: () => sitesApi.getSite(siteId),
        enabled: !!siteId,
    });

    const {
        data: realTimeStats,
        isLoading: realTimeLoading,
        error: realTimeError,
        refetch: refetchRealTimeStats,
    } = useQuery({
        queryKey: ["realTimeStats", siteId],
        queryFn: () => statsApi.getRealTimeStats(siteId),
        enabled: !!siteId,
        refetchInterval: refreshInterval,
        refetchIntervalInBackground: true,
    });

    const site = siteResponse?.data;

    // Update last refresh time when data updates
    useEffect(() => {
        if (realTimeStats) {
            setLastRefresh(new Date());
        }
    }, [realTimeStats]);

    const handleManualRefresh = () => {
        refetchRealTimeStats();
        setLastRefresh(new Date());
    };

    const toggleAutoRefresh = () => {
        setRefreshInterval(refreshInterval > 0 ? 0 : 5000);
    };

    if (siteLoading || realTimeLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!site) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="p-6 max-w-md mx-auto">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold mb-2">
                            Site Not Found
                        </h2>
                        <p className="text-gray-600 mb-4">
                            The requested site could not be found.
                        </p>
                        <Button onClick={() => router.push("/dashboard")}>
                            Back to Dashboard
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const dateRange = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <SiteHeader
                siteDomain={site.domain}
                pageTitle="Real-Time Analytics"
                pageSubtitle="Live Website Activity"
                dateRange={dateRange}
                onDateRangeChange={() => {}} // Real-time doesn't use date range
            />

            <SiteNavigation siteId={siteId} currentPage="realtime" />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium">
                                {refreshInterval > 0
                                    ? "Auto-refreshing"
                                    : "Manual refresh"}
                            </span>
                            {refreshInterval > 0 && (
                                <span className="text-xs text-gray-500">
                                    every {refreshInterval / 1000}s
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500">
                            Last updated: {lastRefresh.toLocaleTimeString()}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleAutoRefresh}
                        >
                            {refreshInterval > 0
                                ? "Pause Auto-refresh"
                                : "Enable Auto-refresh"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleManualRefresh}
                            disabled={realTimeLoading}
                        >
                            <RefreshCw
                                className={`h-4 w-4 mr-1 ${
                                    realTimeLoading ? "animate-spin" : ""
                                }`}
                            />
                            Refresh
                        </Button>
                    </div>
                </div>

                {realTimeError ? (
                    <Card className="p-6">
                        <div className="text-center text-red-600">
                            <h3 className="text-lg font-semibold mb-2">
                                Error
                            </h3>
                            <p>Failed to load real-time data</p>
                        </div>
                    </Card>
                ) : !realTimeStats ? (
                    <Card className="p-6">
                        <div className="text-center text-gray-600">
                            <h3 className="text-lg font-semibold mb-2">
                                No Data
                            </h3>
                            <p>No real-time data available for this website.</p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-600 mb-1">
                                            Active Users
                                        </div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {formatNumber(
                                                realTimeStats.activeUsers
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Currently online
                                        </div>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-600 mb-1">
                                            Page Views (Last Hour)
                                        </div>
                                        <div className="text-3xl font-bold text-blue-600">
                                            {formatNumber(
                                                realTimeStats.pageViewsLastHour
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            In the past 60 minutes
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Eye className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-600 mb-1">
                                            Activity Level
                                        </div>
                                        <div className="text-3xl font-bold text-purple-600">
                                            {realTimeStats.activeUsers > 50
                                                ? "High"
                                                : realTimeStats.activeUsers > 20
                                                ? "Medium"
                                                : realTimeStats.activeUsers > 0
                                                ? "Low"
                                                : "None"}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Current activity level
                                        </div>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Recent Page Views */}
                        <Card className="p-6">
                            <div className="flex items-center mb-4">
                                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                                <h3 className="text-lg font-semibold">
                                    Recent Page Views
                                </h3>
                                <span className="ml-2 text-sm text-gray-500">
                                    ({realTimeStats.recentPageViews.length}{" "}
                                    recent views)
                                </span>
                            </div>

                            {realTimeStats.recentPageViews.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                    <p>No recent page views</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {realTimeStats.recentPageViews.map(
                                        (pageView, index) => (
                                            <div
                                                key={`${pageView.url}-${pageView.timestamp}-${index}`}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="text-sm font-medium text-gray-900 truncate">
                                                            {pageView.pageTitle ||
                                                                "Untitled Page"}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-blue-600 truncate">
                                                        {pageView.url}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                    <div className="flex items-center space-x-1">
                                                        <Globe className="h-3 w-3" />
                                                        <span>
                                                            {pageView.country}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Monitor className="h-3 w-3" />
                                                        <span>
                                                            {pageView.browser}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        {new Date(
                                                            pageView.timestamp
                                                        ).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </Card>

                        {/* Top Pages Real-Time */}
                        <Card className="p-6">
                            <div className="flex items-center mb-4">
                                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                                <h3 className="text-lg font-semibold">
                                    Top Pages (Real-Time)
                                </h3>
                            </div>

                            {realTimeStats.topPagesRealTime.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                    <p>No popular pages right now</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {realTimeStats.topPagesRealTime.map(
                                        (page, index) => (
                                            <div
                                                key={`top-page-${page.replace(
                                                    /[^a-zA-Z0-9]/g,
                                                    "-"
                                                )}-${index}`}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
                                                        {index + 1}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {page}
                                                    </div>
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    Popular now
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </Card>

                        {/* Real-Time Activity Indicator */}
                        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">
                                    Real-time data • Updates automatically
                                </span>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function SiteRealTimePage() {
    return (
        <ProtectedRoute>
            <SiteRealTimeContent />
        </ProtectedRoute>
    );
}
