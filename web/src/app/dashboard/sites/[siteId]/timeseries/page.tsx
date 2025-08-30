"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { sitesApi } from "@/api/sites";
import { statsApi } from "@/api/stats";
import ProtectedRoute from "@/components/ProtectedRoute";
import SiteHeader from "@/components/SiteHeader";
import SiteNavigation from "@/components/SiteNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, LineChart } from "lucide-react";
import { formatNumber } from "@/lib/utils";

function SiteTimeSeriesContent() {
    const params = useParams();
    const router = useRouter();
    const siteId = params.siteId as string;

    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
    });

    const { data: siteResponse, isLoading: siteLoading } = useQuery({
        queryKey: ["site", siteId],
        queryFn: () => sitesApi.getSite(siteId),
        enabled: !!siteId,
    });

    const {
        data: timeSeries,
        isLoading: timeSeriesLoading,
        error: timeSeriesError,
    } = useQuery({
        queryKey: [
            "websiteTimeSeries",
            siteId,
            dateRange.startDate,
            dateRange.endDate,
        ],
        queryFn: () =>
            statsApi.getWebsiteTimeSeries(
                siteId,
                new Date(dateRange.startDate).toISOString(),
                new Date(dateRange.endDate).toISOString()
            ),
        enabled: !!siteId,
    });

    const site = siteResponse?.data;

    const handleDateRangeChange = (
        field: "startDate" | "endDate",
        value: string
    ) => {
        setDateRange((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Calculate aggregated metrics from time series data
    const aggregatedMetrics = timeSeries
        ? {
              totalPageViews: timeSeries.reduce(
                  (sum, day) => sum + day.pageViews,
                  0
              ),
              totalUniqueVisitors: timeSeries.reduce(
                  (sum, day) => sum + day.uniqueVisitors,
                  0
              ),
              totalSessions: timeSeries.reduce(
                  (sum, day) => sum + day.sessions,
                  0
              ),
              averagePageViewsPerDay:
                  timeSeries.length > 0
                      ? timeSeries.reduce(
                            (sum, day) => sum + day.pageViews,
                            0
                        ) / timeSeries.length
                      : 0,
              averageVisitorsPerDay:
                  timeSeries.length > 0
                      ? timeSeries.reduce(
                            (sum, day) => sum + day.uniqueVisitors,
                            0
                        ) / timeSeries.length
                      : 0,
              averageSessionsPerDay:
                  timeSeries.length > 0
                      ? timeSeries.reduce((sum, day) => sum + day.sessions, 0) /
                        timeSeries.length
                      : 0,
          }
        : null;

    if (siteLoading || timeSeriesLoading) {
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

    return (
        <div className="min-h-screen bg-gray-50">
            <SiteHeader
                siteDomain={site.domain}
                pageTitle="Time Series"
                pageSubtitle="Daily Analytics Trends"
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
            />

            <SiteNavigation siteId={siteId} currentPage="timeseries" />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {timeSeriesError ? (
                    <Card className="p-6">
                        <div className="text-center text-red-600">
                            <h3 className="text-lg font-semibold mb-2">
                                Error
                            </h3>
                            <p>Failed to load time series data</p>
                        </div>
                    </Card>
                ) : !timeSeries || timeSeries.length === 0 ? (
                    <Card className="p-6">
                        <div className="text-center text-gray-600">
                            <h3 className="text-lg font-semibold mb-2">
                                No Data
                            </h3>
                            <p>
                                No time series data available for this website.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Aggregated Summary */}
                        {aggregatedMetrics && (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <Card className="p-4">
                                    <div className="text-sm font-medium text-gray-600 mb-1">
                                        Total Page Views
                                    </div>
                                    <div className="text-xl font-bold text-blue-600">
                                        {formatNumber(
                                            aggregatedMetrics.totalPageViews
                                        )}
                                    </div>
                                </Card>
                                <Card className="p-4">
                                    <div className="text-sm font-medium text-gray-600 mb-1">
                                        Total Visitors
                                    </div>
                                    <div className="text-xl font-bold text-green-600">
                                        {formatNumber(
                                            aggregatedMetrics.totalUniqueVisitors
                                        )}
                                    </div>
                                </Card>
                                <Card className="p-4">
                                    <div className="text-sm font-medium text-gray-600 mb-1">
                                        Total Sessions
                                    </div>
                                    <div className="text-xl font-bold text-purple-600">
                                        {formatNumber(
                                            aggregatedMetrics.totalSessions
                                        )}
                                    </div>
                                </Card>
                                <Card className="p-4">
                                    <div className="text-sm font-medium text-gray-600 mb-1">
                                        Avg Views/Day
                                    </div>
                                    <div className="text-xl font-bold text-orange-600">
                                        {formatNumber(
                                            Math.round(
                                                aggregatedMetrics.averagePageViewsPerDay
                                            )
                                        )}
                                    </div>
                                </Card>
                                <Card className="p-4">
                                    <div className="text-sm font-medium text-gray-600 mb-1">
                                        Avg Visitors/Day
                                    </div>
                                    <div className="text-xl font-bold text-indigo-600">
                                        {formatNumber(
                                            Math.round(
                                                aggregatedMetrics.averageVisitorsPerDay
                                            )
                                        )}
                                    </div>
                                </Card>
                                <Card className="p-4">
                                    <div className="text-sm font-medium text-gray-600 mb-1">
                                        Avg Sessions/Day
                                    </div>
                                    <div className="text-xl font-bold text-pink-600">
                                        {formatNumber(
                                            Math.round(
                                                aggregatedMetrics.averageSessionsPerDay
                                            )
                                        )}
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Time Series Data Table */}
                        <Card className="p-6">
                            <div className="flex items-center mb-4">
                                <LineChart className="h-5 w-5 text-blue-600 mr-2" />
                                <h3 className="text-lg font-semibold">
                                    Daily Analytics Data
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Page Views
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Unique Visitors
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Sessions
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Views/Session
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {timeSeries.map((dayData, index) => (
                                            <tr
                                                key={dayData.date}
                                                className={
                                                    index % 2 === 0
                                                        ? "bg-white"
                                                        : "bg-gray-50"
                                                }
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {new Date(
                                                        dayData.date
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <div className="flex-1">
                                                            {formatNumber(
                                                                dayData.pageViews
                                                            )}
                                                        </div>
                                                        <div className="w-16 bg-gray-200 rounded-full h-2 ml-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full"
                                                                style={{
                                                                    width: `${
                                                                        aggregatedMetrics
                                                                            ? Math.min(
                                                                                  100,
                                                                                  (dayData.pageViews /
                                                                                      Math.max(
                                                                                          ...timeSeries.map(
                                                                                              (
                                                                                                  d
                                                                                              ) =>
                                                                                                  d.pageViews
                                                                                          )
                                                                                      )) *
                                                                                      100
                                                                              )
                                                                            : 0
                                                                    }%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <div className="flex-1">
                                                            {formatNumber(
                                                                dayData.uniqueVisitors
                                                            )}
                                                        </div>
                                                        <div className="w-16 bg-gray-200 rounded-full h-2 ml-2">
                                                            <div
                                                                className="bg-green-600 h-2 rounded-full"
                                                                style={{
                                                                    width: `${
                                                                        aggregatedMetrics
                                                                            ? Math.min(
                                                                                  100,
                                                                                  (dayData.uniqueVisitors /
                                                                                      Math.max(
                                                                                          ...timeSeries.map(
                                                                                              (
                                                                                                  d
                                                                                              ) =>
                                                                                                  d.uniqueVisitors
                                                                                          )
                                                                                      )) *
                                                                                      100
                                                                              )
                                                                            : 0
                                                                    }%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <div className="flex-1">
                                                            {formatNumber(
                                                                dayData.sessions
                                                            )}
                                                        </div>
                                                        <div className="w-16 bg-gray-200 rounded-full h-2 ml-2">
                                                            <div
                                                                className="bg-purple-600 h-2 rounded-full"
                                                                style={{
                                                                    width: `${
                                                                        aggregatedMetrics
                                                                            ? Math.min(
                                                                                  100,
                                                                                  (dayData.sessions /
                                                                                      Math.max(
                                                                                          ...timeSeries.map(
                                                                                              (
                                                                                                  d
                                                                                              ) =>
                                                                                                  d.sessions
                                                                                          )
                                                                                      )) *
                                                                                      100
                                                                              )
                                                                            : 0
                                                                    }%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {dayData.sessions > 0
                                                        ? (
                                                              dayData.pageViews /
                                                              dayData.sessions
                                                          ).toFixed(1)
                                                        : "0"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Trend Analysis */}
                        <Card className="p-6">
                            <div className="flex items-center mb-4">
                                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                                <h3 className="text-lg font-semibold">
                                    Trend Analysis
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-semibold text-blue-800">
                                        Best Performing Day
                                    </h4>
                                    {timeSeries.length > 0 && (
                                        <div className="mt-2">
                                            <div className="text-sm text-blue-600">
                                                {new Date(
                                                    timeSeries.reduce(
                                                        (max, day) =>
                                                            day.pageViews >
                                                            max.pageViews
                                                                ? day
                                                                : max
                                                    ).date
                                                ).toLocaleDateString()}
                                            </div>
                                            <div className="text-lg font-bold text-blue-800">
                                                {formatNumber(
                                                    timeSeries.reduce(
                                                        (max, day) =>
                                                            day.pageViews >
                                                            max.pageViews
                                                                ? day
                                                                : max
                                                    ).pageViews
                                                )}{" "}
                                                views
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <h4 className="font-semibold text-green-800">
                                        Most Visitors
                                    </h4>
                                    {timeSeries.length > 0 && (
                                        <div className="mt-2">
                                            <div className="text-sm text-green-600">
                                                {new Date(
                                                    timeSeries.reduce(
                                                        (max, day) =>
                                                            day.uniqueVisitors >
                                                            max.uniqueVisitors
                                                                ? day
                                                                : max
                                                    ).date
                                                ).toLocaleDateString()}
                                            </div>
                                            <div className="text-lg font-bold text-green-800">
                                                {formatNumber(
                                                    timeSeries.reduce(
                                                        (max, day) =>
                                                            day.uniqueVisitors >
                                                            max.uniqueVisitors
                                                                ? day
                                                                : max
                                                    ).uniqueVisitors
                                                )}{" "}
                                                visitors
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <h4 className="font-semibold text-purple-800">
                                        Peak Sessions
                                    </h4>
                                    {timeSeries.length > 0 && (
                                        <div className="mt-2">
                                            <div className="text-sm text-purple-600">
                                                {new Date(
                                                    timeSeries.reduce(
                                                        (max, day) =>
                                                            day.sessions >
                                                            max.sessions
                                                                ? day
                                                                : max
                                                    ).date
                                                ).toLocaleDateString()}
                                            </div>
                                            <div className="text-lg font-bold text-purple-800">
                                                {formatNumber(
                                                    timeSeries.reduce(
                                                        (max, day) =>
                                                            day.sessions >
                                                            max.sessions
                                                                ? day
                                                                : max
                                                    ).sessions
                                                )}{" "}
                                                sessions
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function SiteTimeSeriesPage() {
    return (
        <ProtectedRoute>
            <SiteTimeSeriesContent />
        </ProtectedRoute>
    );
}
