import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SiteNavigationProps {
    siteId: string;
    currentPage: "dashboard" | "summary" | "timeseries" | "realtime" | "events";
}

export default function SiteNavigation({
    siteId,
    currentPage,
}: SiteNavigationProps) {
    const router = useRouter();

    const navigationItems = [
        {
            key: "dashboard",
            label: "Full Dashboard",
            path: `/dashboard/sites/${siteId}`,
        },
        {
            key: "summary",
            label: "Summary",
            path: `/dashboard/sites/${siteId}/summary`,
        },
        {
            key: "timeseries",
            label: "Time Series",
            path: `/dashboard/sites/${siteId}/timeseries`,
        },
        {
            key: "realtime",
            label: "Real-Time",
            path: `/dashboard/sites/${siteId}/realtime`,
        },
        {
            key: "events",
            label: "Events",
            path: `/dashboard/sites/${siteId}/events`,
        },
    ];

    return (
        <nav className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex space-x-8">
                    {navigationItems.map((item) => (
                        <Button
                            key={item.key}
                            variant="ghost"
                            onClick={() =>
                                currentPage !== item.key &&
                                router.push(item.path)
                            }
                            className={`border-b-2 rounded-none px-1 py-4 ${
                                currentPage === item.key
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent hover:border-gray-300"
                            }`}
                            disabled={currentPage === item.key}
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>
            </div>
        </nav>
    );
}
