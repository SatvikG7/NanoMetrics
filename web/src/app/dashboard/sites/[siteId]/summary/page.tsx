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
import { TrendingUp, Users, MousePointer, Clock, BarChart } from "lucide-react";
import { formatNumber, formatDuration, formatPercentage } from "@/lib/utils";

function SiteSummaryContent() {
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
        data: summary,
        isLoading: summaryLoading,
        error: summaryError,
    } = useQuery({
        queryKey: [
            "websiteSummary",
            siteId,
            dateRange.startDate,
            dateRange.endDate,
        ],
        queryFn: () =>
            statsApi.getWebsiteSummary(
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

    if (siteLoading || summaryLoading) {
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
                pageTitle="Summary"
                pageSubtitle="Analytics Summary Overview"
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
            />

            <SiteNavigation siteId={siteId} currentPage="summary" />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {summaryError ? (
                    <Card className="p-6">
                        <div className="text-center text-red-600">
                            <h3 className="text-lg font-semibold mb-2">
                                Error
                            </h3>
                            <p>Failed to load summary data</p>
                        </div>
                    </Card>
                ) : !summary ? (
                    <Card className="p-6">
                        <div className="text-center text-gray-600">
                            <h3 className="text-lg font-semibold mb-2">
                                No Data
                            </h3>
                            <p>No summary data available for this website.</p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Title */}
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Website Performance Summary
                            </h2>
                            <p className="text-gray-600">
                                Key metrics for {site.domain} from{" "}
                                {dateRange.startDate} to {dateRange.endDate}
                            </p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-600 mb-1">
                                            Total Page Views
                                        </div>
                                        <div className="text-3xl font-bold text-blue-600">
                                            {formatNumber(
                                                summary.totalPageViews
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <MousePointer className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-600 mb-1">
                                            Unique Visitors
                                        </div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {formatNumber(
                                                summary.uniqueVisitors
                                            )}
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
                                            Total Sessions
                                        </div>
                                        <div className="text-3xl font-bold text-purple-600">
                                            {formatNumber(
                                                summary.totalSessions
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-600 mb-1">
                                            Avg Session Duration
                                        </div>
                                        <div className="text-3xl font-bold text-orange-600">
                                            {formatDuration(
                                                summary.averageSessionDuration
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-full">
                                        <Clock className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-600 mb-1">
                                            Bounce Rate
                                        </div>
                                        <div className="text-3xl font-bold text-red-600">
                                            {formatPercentage(
                                                summary.bounceRate
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <BarChart className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            </Card>

                            {/* Calculated Metrics */}
                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-600 mb-1">
                                            Pages per Session
                                        </div>
                                        <div className="text-3xl font-bold text-indigo-600">
                                            {summary.totalSessions > 0
                                                ? (
                                                      summary.totalPageViews /
                                                      summary.totalSessions
                                                  ).toFixed(1)
                                                : "0"}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-indigo-100 rounded-full">
                                        <TrendingUp className="h-6 w-6 text-indigo-600" />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Additional Insights */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                Quick Insights
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        Visitor Return Rate:
                                    </span>
                                    <span className="font-semibold">
                                        {summary.uniqueVisitors > 0
                                            ? formatPercentage(
                                                  ((summary.totalSessions -
                                                      summary.uniqueVisitors) /
                                                      summary.uniqueVisitors) *
                                                      100
                                              )
                                            : "0%"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        Session Quality Score:
                                    </span>
                                    <span className="font-semibold">
                                        {Math.max(
                                            0,
                                            Math.min(
                                                100,
                                                (100 - summary.bounceRate) *
                                                    (summary.averageSessionDuration /
                                                        180) *
                                                    (summary.totalPageViews /
                                                        summary.totalSessions /
                                                        2)
                                            )
                                        ).toFixed(0)}
                                        /100
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function SiteSummaryPage() {
    return (
        <ProtectedRoute>
            <SiteSummaryContent />
        </ProtectedRoute>
    );
}
