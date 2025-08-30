"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { statsApi, type StatsResponse } from "@/api/stats";
import { formatNumber, formatDuration, formatPercentage } from "@/lib/utils";
import { Activity, MousePointer } from "lucide-react";
import { useRouter } from "next/navigation";

interface StatsDashboardProps {
    websiteId: string;
    dateRange?: {
        startDate: string;
        endDate: string;
    };
}

export default function StatsDashboard({
    websiteId,
    dateRange,
}: StatsDashboardProps) {
    const router = useRouter();
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await statsApi.getWebsiteStats(
                websiteId,
                dateRange?.startDate,
                dateRange?.endDate
            );

            // Response is directly the StatsResponse data (no success wrapper)
            setStats(response);
        } catch (err) {
            setError("An error occurred while fetching stats");
            console.error("Stats fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [websiteId, dateRange]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {Array.from({ length: 8 }, (_, i) => (
                    <Card
                        key={`loading-${Date.now()}-${i}`}
                        className="p-6 animate-pulse"
                    >
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6 m-6">
                <div className="text-center text-red-600">
                    <h3 className="text-lg font-semibold mb-2">Error</h3>
                    <p>{error}</p>
                </div>
            </Card>
        );
    }

    if (!stats) {
        return (
            <Card className="p-6 m-6">
                <div className="text-center text-gray-600">
                    <h3 className="text-lg font-semibold mb-2">No Data</h3>
                    <p>No analytics data available for this website.</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="p-6">
                    <div className="text-sm font-medium text-gray-600">
                        Total Page Views
                    </div>
                    <div className="text-2xl font-bold">
                        {formatNumber(stats.summary.totalPageViews)}
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="text-sm font-medium text-gray-600">
                        Unique Visitors
                    </div>
                    <div className="text-2xl font-bold">
                        {formatNumber(stats.summary.uniqueVisitors)}
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="text-sm font-medium text-gray-600">
                        Total Sessions
                    </div>
                    <div className="text-2xl font-bold">
                        {formatNumber(stats.summary.totalSessions)}
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="text-sm font-medium text-gray-600">
                        Avg Session Duration
                    </div>
                    <div className="text-2xl font-bold">
                        {formatDuration(stats.summary.averageSessionDuration)}
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="text-sm font-medium text-gray-600">
                        Bounce Rate
                    </div>
                    <div className="text-2xl font-bold">
                        {stats.summary.bounceRate === 0 ? (
                            <span className="text-gray-400">N/A</span>
                        ) : (
                            formatPercentage(stats.summary.bounceRate)
                        )}
                    </div>
                    {stats.summary.bounceRate === 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                            Not enough data
                        </div>
                    )}
                </Card>
            </div>

            {/* Real-Time Stats Quick Access */}
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <Activity className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Real-Time Analytics
                            </h3>
                            <p className="text-sm text-gray-600">
                                See what&apos;s happening on your site right now
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() =>
                            router.push(
                                `/dashboard/sites/${websiteId}/realtime`
                            )
                        }
                        className="bg-green-600 hover:bg-green-700"
                    >
                        View Live Data
                    </Button>
                </div>
            </Card>

            {/* Events Quick Access */}
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                            <MousePointer className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Events Log
                            </h3>
                            <p className="text-sm text-gray-600">
                                Browse detailed analytics events and user
                                interactions
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() =>
                            router.push(`/dashboard/sites/${websiteId}/events`)
                        }
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        View Events
                    </Button>
                </div>
            </Card>

            {/* Time Series Chart */}
            {stats.timeSeries && stats.timeSeries.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        Page Views Over Time
                    </h3>
                    <div className="space-y-4">
                        {/* Aggregate duplicate dates */}
                        {(() => {
                            // Group by date and sum values
                            const aggregated = stats.timeSeries.reduce(
                                (acc, item) => {
                                    const date = item.date;
                                    if (!acc[date]) {
                                        acc[date] = {
                                            date,
                                            pageViews: 0,
                                            uniqueVisitors: 0,
                                            sessions: 0,
                                        };
                                    }
                                    acc[date].pageViews += item.pageViews;
                                    acc[date].uniqueVisitors +=
                                        item.uniqueVisitors;
                                    acc[date].sessions += item.sessions;
                                    return acc;
                                },
                                {} as Record<
                                    string,
                                    (typeof stats.timeSeries)[0]
                                >
                            );

                            const aggregatedData = Object.values(
                                aggregated
                            ).sort(
                                (a, b) =>
                                    new Date(a.date).getTime() -
                                    new Date(b.date).getTime()
                            );

                            return aggregatedData.map((item) => (
                                <div
                                    key={item.date}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">
                                            {new Date(
                                                item.date
                                            ).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex space-x-6 text-sm">
                                        <div>
                                            <span className="text-gray-500">
                                                Views:
                                            </span>
                                            <span className="font-semibold ml-1">
                                                {formatNumber(item.pageViews)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">
                                                Visitors:
                                            </span>
                                            <span className="font-semibold ml-1">
                                                {formatNumber(
                                                    item.uniqueVisitors
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">
                                                Sessions:
                                            </span>
                                            <span className="font-semibold ml-1">
                                                {formatNumber(item.sessions)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </Card>
            )}

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
                    <div className="space-y-3">
                        {stats.topPages.slice(0, 5).map((page) => (
                            <div
                                key={page.url}
                                className="flex justify-between items-center"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                        {(() => {
                                            try {
                                                const url = new URL(page.url);
                                                return url.pathname === "/"
                                                    ? "Home"
                                                    : url.pathname;
                                            } catch {
                                                return (
                                                    page.url.replace(
                                                        /^https?:\/\/[^\/]+/,
                                                        ""
                                                    ) || page.url
                                                );
                                            }
                                        })()}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {page.uniqueVisitors > 0
                                            ? `${formatNumber(
                                                  page.uniqueVisitors
                                              )} unique visitors`
                                            : `${formatNumber(
                                                  page.views
                                              )} total views`}
                                    </div>
                                </div>
                                <div className="text-sm font-bold">
                                    {formatNumber(page.views)}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Top Referrers */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        Top Referrers
                    </h3>
                    <div className="space-y-3">
                        {stats.topReferrers.length > 0 ? (
                            stats.topReferrers.slice(0, 5).map((referrer) => (
                                <div
                                    key={referrer.referrer}
                                    className="flex justify-between items-center"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">
                                            {referrer.referrer || "Direct"}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatPercentage(
                                                referrer.percentage
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold">
                                        {formatNumber(referrer.visits)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                <p className="text-sm">
                                    No referrer data available
                                </p>
                                <p className="text-xs">
                                    Most traffic appears to be direct
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Top Countries */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        Top Countries
                    </h3>
                    <div className="space-y-3">
                        {stats.topCountries.length > 0 ? (
                            stats.topCountries.slice(0, 5).map((country) => (
                                <div
                                    key={country.country}
                                    className="flex justify-between items-center"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium">
                                            {country.country}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatPercentage(
                                                country.percentage
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold">
                                        {formatNumber(country.visits)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                <p className="text-sm">
                                    No country data available
                                </p>
                                <p className="text-xs">
                                    IP geolocation data may not be configured
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Device/Browser Stats */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {stats.deviceStats.some((d) =>
                            ["Chrome", "Firefox", "Safari", "Edge"].includes(
                                d.deviceType
                            )
                        )
                            ? "Browser Types"
                            : "Device Types"}
                    </h3>
                    <div className="space-y-3">
                        {stats.deviceStats.map((device) => (
                            <div
                                key={device.deviceType}
                                className="flex justify-between items-center"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium">
                                        {device.deviceType}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatPercentage(device.percentage)}
                                    </div>
                                </div>
                                <div className="text-sm font-bold">
                                    {formatNumber(device.visits)}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Events */}
            {stats.topEvents && stats.topEvents.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Top Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.topEvents.slice(0, 6).map((event) => (
                            <div
                                key={event.eventName}
                                className="border rounded-lg p-4"
                            >
                                <div className="text-sm font-medium">
                                    {event.eventName}
                                </div>
                                <div className="text-lg font-bold">
                                    {formatNumber(event.count)}
                                </div>
                                {typeof event.additionalData
                                    ?.unique_sessions === "number" && (
                                    <div className="text-xs text-gray-500">
                                        {formatNumber(
                                            event.additionalData.unique_sessions
                                        )}{" "}
                                        unique sessions
                                    </div>
                                )}
                                {Object.keys(event.additionalData || {})
                                    .length > 0 && (
                                    <div className="text-xs text-gray-400 mt-2">
                                        {Object.entries(
                                            event.additionalData
                                        ).map(([key, value]) => (
                                            <div key={key}>
                                                {key}:{" "}
                                                {typeof value === "number"
                                                    ? formatNumber(value)
                                                    : String(value)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
