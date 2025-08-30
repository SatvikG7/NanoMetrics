"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { sitesApi } from "@/api/sites";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatsDashboard from "@/components/StatsDashboard";
import SiteHeader from "@/components/SiteHeader";
import SiteNavigation from "@/components/SiteNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function SiteStatsContent() {
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

    const {
        data: siteResponse,
        isLoading: siteLoading,
        error,
    } = useQuery({
        queryKey: ["site", siteId],
        queryFn: () => sitesApi.getSite(siteId),
        enabled: !!siteId,
    });

    const site = siteResponse?.data;

    if (siteLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !site) {
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

    const handleDateRangeChange = (
        field: "startDate" | "endDate",
        value: string
    ) => {
        setDateRange((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <SiteHeader
                siteDomain={site.domain}
                pageTitle="Analytics Dashboard"
                pageSubtitle="Complete Analytics Overview"
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
            />

            <SiteNavigation siteId={siteId} currentPage="dashboard" />

            {/* Main Content */}
            <main>
                <StatsDashboard
                    websiteId={siteId}
                    dateRange={{
                        startDate: new Date(dateRange.startDate).toISOString(),
                        endDate: new Date(dateRange.endDate).toISOString(),
                    }}
                />
            </main>
        </div>
    );
}

export default function SiteStatsPage() {
    return (
        <ProtectedRoute>
            <SiteStatsContent />
        </ProtectedRoute>
    );
}
