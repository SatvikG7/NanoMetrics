import api from "@/lib/axios";
import type { SiteResponse, ApiResponse } from "@/types/api";

export const sitesApi = {
    getUserSites: async (): Promise<ApiResponse<SiteResponse[]>> => {
        const response = await api.get("/api/sites");
        return response.data;
    },

    getSite: async (siteId: string): Promise<ApiResponse<SiteResponse>> => {
        const response = await api.get(`/api/sites/${siteId}`);
        return response.data;
    },

    createSite: async (site: string): Promise<ApiResponse<SiteResponse>> => {
        const response = await api.post("/api/sites", {
            domain: site,
        });
        return response.data;
    },

    deleteSite: async (siteId: string): Promise<ApiResponse<void>> => {
        const response = await api.delete(`/api/sites/${siteId}`);
        return response.data;
    },
};
