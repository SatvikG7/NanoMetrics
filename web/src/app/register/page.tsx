"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: "",
        fname: "",
        lname: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        setIsLoading(true);

        try {
            await register({
                username: formData.username,
                fname: formData.fname,
                lname: formData.lname,
                email: formData.email,
                password: formData.password,
            });
            router.push(
                "/login?message=Registration successful! Please sign in."
            );
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        NanoMetrics
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Website Analytics Platform
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Create your account</CardTitle>
                        <CardDescription>
                            Enter your information to get started with analytics
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fname">First Name</Label>
                                    <Input
                                        id="fname"
                                        name="fname"
                                        type="text"
                                        value={formData.fname}
                                        onChange={handleChange}
                                        required
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lname">Last Name</Label>
                                    <Input
                                        id="lname"
                                        name="lname"
                                        type="text"
                                        value={formData.lname}
                                        onChange={handleChange}
                                        required
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    placeholder="johndoe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="At least 8 characters"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="Confirm your password"
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                                analyticsEvent="register_submit_click"
                                analyticsData={{
                                    hasEmail: !!formData.email,
                                    hasUsername: !!formData.username,
                                    passwordLength: formData.password.length,
                                }}
                            >
                                {isLoading
                                    ? "Creating account..."
                                    : "Create account"}
                            </Button>

                            <p className="text-center text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="text-blue-600 hover:text-blue-500"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
