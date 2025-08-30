import api from "@/lib/axios";

export interface SummaryStats {
    totalPageViews: number;
    uniqueVisitors: number;
    totalSessions: number;
    averageSessionDuration: number;
    bounceRate: number;
}

export interface TimeSeriesData {
    date: string;
    pageViews: number;
    uniqueVisitors: number;
    sessions: number;
}

export interface PageStats {
    url: string;
    views: number;
    uniqueVisitors: number;
    averageTimeOnPage: number;
}

export interface ReferrerStats {
    referrer: string;
    visits: number;
    percentage: number;
}

export interface CountryStats {
    country: string;
    visits: number;
    percentage: number;
}

export interface DeviceStats {
    deviceType: string;
    visits: number;
    percentage: number;
}

export interface EventStats {
    eventName: string;
    count: number;
    additionalData: Record<string, unknown>;
}

export interface PageView {
    url: string;
    pageTitle: string;
    timestamp: string;
    country: string;
    browser: string;
}

export interface RealTimeStatsResponse {
    websiteId: string;
    activeUsers: number;
    pageViewsLastHour: number;
    recentPageViews: PageView[];
    topPagesRealTime: string[];
}

export interface AnalyticsEvent {
    id: string;
    websiteId: string;
    eventName: string;
    url: string;
    timestamp: string;
    userId?: string;
    sessionId: string;
    additionalData: Record<string, unknown>;
}

export interface PageResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    size: number;
    number: number;
    numberOfElements: number;
    empty: boolean;
}

export interface StatsResponse {
    summary: SummaryStats;
    timeSeries: TimeSeriesData[];
    topPages: PageStats[];
    topReferrers: ReferrerStats[];
    topCountries: CountryStats[];
    deviceStats: DeviceStats[];
    topEvents: EventStats[];
}

export const statsApi = {
    getWebsiteStats: async (
        websiteId: string,
        startDate?: string,
        endDate?: string
    ): Promise<StatsResponse> => {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const response = await api.get(
            `/api/stats/website/${websiteId}?${params.toString()}`
        );
        return response.data;
    },

    getWebsiteSummary: async (
        websiteId: string,
        startDate?: string,
        endDate?: string
    ): Promise<SummaryStats> => {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const response = await api.get(
            `/api/stats/website/${websiteId}/summary?${params.toString()}`
        );
        return response.data;
    },

    getWebsiteTimeSeries: async (
        websiteId: string,
        startDate?: string,
        endDate?: string
    ): Promise<TimeSeriesData[]> => {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const response = await api.get(
            `/api/stats/website/${websiteId}/timeseries?${params.toString()}`
        );
        return response.data;
    },

    getRealTimeStats: async (
        websiteId: string
    ): Promise<RealTimeStatsResponse> => {
        const response = await api.get(
            `/api/stats/website/${websiteId}/realtime`
        );
        return response.data;
    },

    getEvents: async (
        websiteId: string,
        startDate?: string,
        endDate?: string,
        page: number = 0,
        size: number = 20,
        sortBy: string = "timestamp",
        sortDirection: "asc" | "desc" = "desc"
    ): Promise<PageResponse<AnalyticsEvent>> => {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        params.append("page", page.toString());
        params.append("size", size.toString());
        params.append("sortBy", sortBy);
        params.append("sortDirection", sortDirection);

        const response = await api.get(
            `/api/stats/website/${websiteId}/events?${params.toString()}`
        );
        return response.data;
    },
};
