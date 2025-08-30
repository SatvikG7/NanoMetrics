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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Filter,
    ChevronLeft,
    ChevronRight,
    Search,
    Download,
    Eye,
    Clock,
    User,
    Globe,
    MousePointer,
    Hash,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

function SiteEventsContent() {
    const params = useParams();
    const router = useRouter();
    const siteId = params.siteId as string;

    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
    });

    const [pagination, setPagination] = useState({
        page: 0,
        size: 20,
        sortBy: "timestamp",
        sortDirection: "desc" as "asc" | "desc",
    });

    const [filters, setFilters] = useState({
        eventName: "",
        url: "",
        sessionId: "",
    });

    const { data: siteResponse, isLoading: siteLoading } = useQuery({
        queryKey: ["site", siteId],
        queryFn: () => sitesApi.getSite(siteId),
        enabled: !!siteId,
    });

    const {
        data: eventsResponse,
        isLoading: eventsLoading,
        error: eventsError,
    } = useQuery({
        queryKey: [
            "websiteEvents",
            siteId,
            dateRange.startDate,
            dateRange.endDate,
            pagination.page,
            pagination.size,
            pagination.sortBy,
            pagination.sortDirection,
        ],
        queryFn: () =>
            statsApi.getEvents(
                siteId,
                new Date(dateRange.startDate).toISOString(),
                new Date(dateRange.endDate).toISOString(),
                pagination.page,
                pagination.size,
                pagination.sortBy,
                pagination.sortDirection
            ),
        enabled: !!siteId,
    });

    const site = siteResponse?.data;
    const events = eventsResponse?.content || [];
    const totalElements = eventsResponse?.totalElements || 0;
    const totalPages = eventsResponse?.totalPages || 0;

    const handleDateRangeChange = (
        field: "startDate" | "endDate",
        value: string
    ) => {
        setDateRange((prev) => ({
            ...prev,
            [field]: value,
        }));
        setPagination((prev) => ({ ...prev, page: 0 })); // Reset to first page
    };

    const handlePageChange = (newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    const handleSortChange = (newSortBy: string) => {
        setPagination((prev) => ({
            ...prev,
            sortBy: newSortBy,
            sortDirection:
                prev.sortBy === newSortBy && prev.sortDirection === "desc"
                    ? "asc"
                    : "desc",
            page: 0,
        }));
    };

    const filteredEvents = events.filter((event) => {
        return (
            (!filters.eventName ||
                event.eventName
                    .toLowerCase()
                    .includes(filters.eventName.toLowerCase())) &&
            (!filters.url ||
                event.url.toLowerCase().includes(filters.url.toLowerCase())) &&
            (!filters.sessionId || event.sessionId.includes(filters.sessionId))
        );
    });

    if (siteLoading || eventsLoading) {
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
                pageTitle="Events"
                pageSubtitle="Analytics Events Log"
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
            />

            <SiteNavigation siteId={siteId} currentPage="events" />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4">
                        <div className="flex items-center space-x-2">
                            <Hash className="h-5 w-5 text-blue-600" />
                            <div>
                                <div className="text-sm font-medium text-gray-600">
                                    Total Events
                                </div>
                                <div className="text-xl font-bold text-blue-600">
                                    {formatNumber(totalElements)}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-2">
                            <Eye className="h-5 w-5 text-green-600" />
                            <div>
                                <div className="text-sm font-medium text-gray-600">
                                    Unique Events
                                </div>
                                <div className="text-xl font-bold text-green-600">
                                    {formatNumber(
                                        new Set(events.map((e) => e.eventName))
                                            .size
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-purple-600" />
                            <div>
                                <div className="text-sm font-medium text-gray-600">
                                    Sessions
                                </div>
                                <div className="text-xl font-bold text-purple-600">
                                    {formatNumber(
                                        new Set(events.map((e) => e.sessionId))
                                            .size
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-orange-600" />
                            <div>
                                <div className="text-sm font-medium text-gray-600">
                                    Avg/Day
                                </div>
                                <div className="text-xl font-bold text-orange-600">
                                    {formatNumber(
                                        Math.round(totalElements / 7)
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="p-4 mb-6">
                    <div className="flex items-center mb-4">
                        <Filter className="h-5 w-5 text-gray-600 mr-2" />
                        <h3 className="text-lg font-semibold">Filters</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label
                                htmlFor="eventName"
                                className="text-sm font-medium"
                            >
                                Event Name
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    id="eventName"
                                    placeholder="Filter by event name..."
                                    value={filters.eventName}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            eventName: e.target.value,
                                        }))
                                    }
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div>
                            <Label
                                htmlFor="url"
                                className="text-sm font-medium"
                            >
                                URL
                            </Label>
                            <div className="relative">
                                <Globe className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    id="url"
                                    placeholder="Filter by URL..."
                                    value={filters.url}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            url: e.target.value,
                                        }))
                                    }
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div>
                            <Label
                                htmlFor="sessionId"
                                className="text-sm font-medium"
                            >
                                Session ID
                            </Label>
                            <div className="relative">
                                <Hash className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    id="sessionId"
                                    placeholder="Filter by session..."
                                    value={filters.sessionId}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            sessionId: e.target.value,
                                        }))
                                    }
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Events Table */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <MousePointer className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">Events</h3>
                            <span className="text-sm text-gray-500">
                                ({filteredEvents.length} of {totalElements}{" "}
                                events)
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {eventsError ? (
                        <div className="text-center text-red-600 py-8">
                            <h3 className="text-lg font-semibold mb-2">
                                Error
                            </h3>
                            <p>Failed to load events data</p>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center text-gray-600 py-8">
                            <MousePointer className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <h3 className="text-lg font-semibold mb-2">
                                No Events
                            </h3>
                            <p>No events found for the selected criteria.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() =>
                                                    handleSortChange(
                                                        "timestamp"
                                                    )
                                                }
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Timestamp</span>
                                                    {pagination.sortBy ===
                                                        "timestamp" && (
                                                        <span className="text-blue-600">
                                                            {pagination.sortDirection ===
                                                            "desc"
                                                                ? "↓"
                                                                : "↑"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() =>
                                                    handleSortChange(
                                                        "eventName"
                                                    )
                                                }
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Event</span>
                                                    {pagination.sortBy ===
                                                        "eventName" && (
                                                        <span className="text-blue-600">
                                                            {pagination.sortDirection ===
                                                            "desc"
                                                                ? "↓"
                                                                : "↑"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                URL
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Session
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Additional Data
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredEvents.map((event, index) => (
                                            <tr
                                                key={event.id}
                                                className={
                                                    index % 2 === 0
                                                        ? "bg-white"
                                                        : "bg-gray-50"
                                                }
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>
                                                        <div className="font-medium">
                                                            {new Date(
                                                                event.timestamp
                                                            ).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {new Date(
                                                                event.timestamp
                                                            ).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-2 w-2 bg-blue-600 rounded-full mr-2"></div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {event.eventName}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <div
                                                        className="max-w-xs truncate"
                                                        title={event.url}
                                                    >
                                                        {event.url}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="font-mono text-xs">
                                                        {event.sessionId.substring(
                                                            0,
                                                            8
                                                        )}
                                                        ...
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {Object.keys(
                                                        event.additionalData ||
                                                            {}
                                                    ).length > 0 ? (
                                                        <details className="cursor-pointer">
                                                            <summary className="text-blue-600 hover:text-blue-800">
                                                                {
                                                                    Object.keys(
                                                                        event.additionalData
                                                                    ).length
                                                                }{" "}
                                                                fields
                                                            </summary>
                                                            <div className="mt-2 text-xs space-y-1">
                                                                {Object.entries(
                                                                    event.additionalData
                                                                ).map(
                                                                    ([
                                                                        key,
                                                                        value,
                                                                    ]) => (
                                                                        <div
                                                                            key={
                                                                                key
                                                                            }
                                                                            className="flex justify-between"
                                                                        >
                                                                            <span className="font-medium">
                                                                                {
                                                                                    key
                                                                                }
                                                                                :
                                                                            </span>
                                                                            <span className="ml-2 text-gray-600">
                                                                                {typeof value ===
                                                                                "object"
                                                                                    ? JSON.stringify(
                                                                                          value
                                                                                      )
                                                                                    : String(
                                                                                          value
                                                                                      )}
                                                                            </span>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </details>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            No data
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-gray-700">
                                    Showing{" "}
                                    <span className="font-medium">
                                        {pagination.page * pagination.size + 1}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-medium">
                                        {Math.min(
                                            (pagination.page + 1) *
                                                pagination.size,
                                            totalElements
                                        )}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium">
                                        {totalElements}
                                    </span>{" "}
                                    results
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(
                                                pagination.page - 1
                                            )
                                        }
                                        disabled={pagination.page === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>

                                    <div className="flex items-center space-x-1">
                                        {Array.from(
                                            { length: Math.min(5, totalPages) },
                                            (_, i) => {
                                                const pageNumber = Math.max(
                                                    0,
                                                    Math.min(
                                                        pagination.page - 2 + i,
                                                        totalPages - 5 + i
                                                    )
                                                );
                                                return (
                                                    <Button
                                                        key={pageNumber}
                                                        variant={
                                                            pageNumber ===
                                                            pagination.page
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            handlePageChange(
                                                                pageNumber
                                                            )
                                                        }
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        {pageNumber + 1}
                                                    </Button>
                                                );
                                            }
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(
                                                pagination.page + 1
                                            )
                                        }
                                        disabled={
                                            pagination.page >= totalPages - 1
                                        }
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default function SiteEventsPage() {
    return (
        <ProtectedRoute>
            <SiteEventsContent />
        </ProtectedRoute>
    );
}
