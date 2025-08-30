import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
    title: "NanoMetrics",
    description: "Website Analytics Platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <QueryProvider>
                    <AuthProvider>{children}</AuthProvider>
                </QueryProvider>
                <script
                    defer
                    src="http://localhost:3000/script.js"
                    data-website-id="ba673f70-6fb7-4e3e-afe7-10c07f03c4ed"
                ></script>
            </body>
        </html>
    );
}

