import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar } from "lucide-react";

interface SiteHeaderProps {
    siteDomain: string;
    pageTitle: string;
    pageSubtitle: string;
    dateRange: {
        startDate: string;
        endDate: string;
    };
    onDateRangeChange: (field: "startDate" | "endDate", value: string) => void;
}

export default function SiteHeader({
    siteDomain,
    pageTitle,
    pageSubtitle,
    dateRange,
    onDateRangeChange,
}: SiteHeaderProps) {
    const router = useRouter();

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/dashboard")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                {siteDomain} - {pageTitle}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {pageSubtitle}
                            </p>
                        </div>
                    </div>

                    {/* Date Range Selector */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <Label htmlFor="startDate" className="text-sm">
                                From:
                            </Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) =>
                                    onDateRangeChange(
                                        "startDate",
                                        e.target.value
                                    )
                                }
                                className="w-auto"
                            />
                            <Label htmlFor="endDate" className="text-sm">
                                To:
                            </Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) =>
                                    onDateRangeChange("endDate", e.target.value)
                                }
                                className="w-auto"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
