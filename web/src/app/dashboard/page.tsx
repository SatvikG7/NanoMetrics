"use client";

import { sitesApi } from "@/api/sites";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import type { SiteResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
    Calendar,
    Check,
    Code,
    Copy,
    Globe,
    LogOut,
    Plus,
    Trash2,
    User,
} from "lucide-react";
import { useState } from "react";

function DashboardContent() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [showAddSite, setShowAddSite] = useState(false);
    const [showTrackingCode, setShowTrackingCode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedSite, setSelectedSite] = useState<SiteResponse | null>(null);
    const [siteToDelete, setSiteToDelete] = useState<SiteResponse | null>(null);
    const [copied, setCopied] = useState(false);
    const [newSite, setNewSite] = useState("");

    // useEffect(() => {
    //     setInterval(() => {
    //         window.analytics.track("signup_button_click");
    //     }, 2000); // Update every 2 seconds
    // }, []);

    const {
        data: sitesResponse,
        isLoading: sitesLoading,
        refetch,
    } = useQuery({
        queryKey: ["sites"],
        queryFn: () => sitesApi.getUserSites(),
    });

    const sites = sitesResponse?.data || [];

    const handleAddSite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sitesApi.createSite(newSite);
            setNewSite("");
            setShowAddSite(false);
            refetch();
        } catch (error) {
            console.error("Failed to create site:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleShowTrackingCode = (site: SiteResponse) => {
        setSelectedSite(site);
        setShowTrackingCode(true);
        setCopied(false);
    };

    const handleCopyTrackingCode = async () => {
        if (!selectedSite) return;

        const trackingCode = `<script defer="" src="http://localhost:3000/script.js" data-website-id="${selectedSite.id}"></script>`;

        try {
            await navigator.clipboard.writeText(trackingCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy tracking code:", error);
        }
    };

    const handleDeleteSite = (site: SiteResponse) => {
        setSiteToDelete(site);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteSite = async () => {
        if (!siteToDelete) return;

        try {
            await sitesApi.deleteSite(siteToDelete.id);
            setShowDeleteConfirm(false);
            setSiteToDelete(null);
            refetch();
        } catch (error) {
            console.error("Failed to delete site:", error);
        }
    };

    const cancelDeleteSite = () => {
        setShowDeleteConfirm(false);
        setSiteToDelete(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                NanoMetrics
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                <span>
                                    {user?.fname} {user?.lname}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                analyticsEvent="dashboard_logout_click"
                                analyticsData={{ userSitesCount: sites.length }}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.fname}!
                    </h2>
                    <p className="text-gray-600">
                        Monitor and analyze your website performance with
                        comprehensive analytics.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Sites
                            </CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {sites.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {sites.length === 0
                                    ? "No sites yet"
                                    : "Sites being monitored"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Member Since
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {user?.createdAt
                                    ? new Date(
                                          user.createdAt
                                      ).toLocaleDateString()
                                    : "Today"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Registration date
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Account Status
                            </CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                Active
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All systems operational
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sites Section */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-900">
                            Your Sites
                        </h3>
                        <Button
                            onClick={() => setShowAddSite(true)}
                            analyticsEvent="dashboard_add_site_click"
                            analyticsData={{ currentSitesCount: sites.length }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Site
                        </Button>
                    </div>

                    {/* Add Site Form */}
                    {showAddSite && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Add New Site</CardTitle>
                                <CardDescription>
                                    Add a website to start monitoring its
                                    analytics
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleAddSite}>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="siteUrl">
                                                Website URL
                                            </Label>
                                            <Input
                                                id="siteUrl"
                                                type="text"
                                                value={newSite}
                                                onChange={(e) =>
                                                    setNewSite(e.target.value)
                                                }
                                                placeholder="https://example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            type="submit"
                                            analyticsEvent="dashboard_add_site_submit"
                                            analyticsData={{ siteUrl: newSite }}
                                        >
                                            Add Site
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setShowAddSite(false)
                                            }
                                            analyticsEvent="dashboard_add_site_cancel"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </form>
                        </Card>
                    )}

                    {/* Sites List */}
                    {sitesLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : sites.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    No sites yet
                                </h4>
                                <p className="text-gray-600 mb-4">
                                    Get started by adding your first website to
                                    monitor.
                                </p>
                                <Button
                                    onClick={() => setShowAddSite(true)}
                                    analyticsEvent="dashboard_add_first_site_click"
                                    analyticsData={{ isFirstSite: true }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Site
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sites.map((site) => (
                                <Card
                                    key={site.id}
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Globe className="h-5 w-5 text-blue-600" />
                                            <span>{site.domain}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="text-xs text-gray-500">
                                                Added{" "}
                                                {new Date(
                                                    site.createdAt
                                                ).toLocaleDateString()}
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.push(
                                                            `/dashboard/sites/${site.id}`
                                                        )
                                                    }
                                                    analyticsEvent="dashboard_view_analytics_click"
                                                    analyticsData={{
                                                        siteDomain: site.domain,
                                                        siteId: site.id,
                                                    }}
                                                >
                                                    View Analytics
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleShowTrackingCode(
                                                            site
                                                        )
                                                    }
                                                    analyticsEvent="dashboard_tracking_code_click"
                                                    analyticsData={{
                                                        siteDomain: site.domain,
                                                        siteId: site.id,
                                                    }}
                                                >
                                                    <Code className="h-4 w-4 mr-1" />
                                                    Tracking Code
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteSite(site)
                                                    }
                                                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                                                    analyticsEvent="dashboard_delete_site_click"
                                                    analyticsData={{
                                                        siteDomain: site.domain,
                                                        siteId: site.id,
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tracking Code Modal */}
                <Dialog
                    open={showTrackingCode}
                    onOpenChange={setShowTrackingCode}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Tracking Code</DialogTitle>
                            <DialogDescription>
                                Copy and paste this code into the &lt;head&gt;
                                section of your website to start tracking
                                analytics.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <code className="text-sm text-gray-800 break-all">
                                    {selectedSite &&
                                        `<script defer="" src="http://localhost:3000/script.js" data-website-id="${selectedSite.id}"></script>`}
                                </code>
                            </div>
                            <Button
                                onClick={handleCopyTrackingCode}
                                className="w-full"
                                variant={copied ? "default" : "outline"}
                                analyticsEvent="dashboard_copy_tracking_code_click"
                                analyticsData={{
                                    siteDomain: selectedSite?.domain,
                                    siteId: selectedSite?.id,
                                    wasCopied: copied,
                                }}
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Tracking Code
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog
                    open={showDeleteConfirm}
                    onOpenChange={setShowDeleteConfirm}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Delete Site</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete &quot;
                                {siteToDelete?.domain}&quot;? This action cannot
                                be undone and all analytics data for this site
                                will be permanently removed.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex space-x-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={cancelDeleteSite}
                                analyticsEvent="dashboard_delete_site_cancel"
                                analyticsData={{
                                    siteDomain: siteToDelete?.domain,
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDeleteSite}
                                analyticsEvent="dashboard_delete_site_confirm"
                                analyticsData={{
                                    siteDomain: siteToDelete?.domain,
                                    siteId: siteToDelete?.id,
                                }}
                            >
                                Delete Site
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}
