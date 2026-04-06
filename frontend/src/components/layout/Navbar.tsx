"use client";

import Link from "next/link";
import { LogOut, LayoutDashboard, Search, Heart, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { useRouter, usePathname } from "next/navigation";

export function Navbar() {
    const { isAuthenticated, user, logout, isHydrated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const isActive = (path: string) => pathname === path;
    const isDashboard = pathname === "/dashboard";

    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
            <div
                className="flex h-16 items-center justify-between px-3 sm:px-5 rounded-2xl shadow-xl shadow-black/20 backdrop-blur-xl"
                style={{
                    background: "oklch(0.17 0.02 285 / 85%)",
                    border: "1px solid oklch(1 0.02 285 / 10%)",
                }}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group pl-1 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo.png"
                        alt="BusLens"
                        className="h-9 w-9 rounded-lg object-cover transition-transform group-hover:scale-105"
                    />
                    <span
                        className="text-xl font-bold tracking-tight text-white hidden md:inline"
                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                    >
                        Bus<span style={{ color: "oklch(0.78 0.12 290)" }}>Lens</span>
                    </span>
                </Link>

                {/* Center nav links */}
                <div className="flex items-center gap-0.5 sm:gap-1">
                    <Link
                        href="/"
                        className={`flex items-center gap-1.5 text-[15px] font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 ${
                            isActive("/")
                                ? "text-white bg-white/10"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <Search className="h-4.5 w-4.5" />
                        <span className="hidden sm:inline">Search</span>
                    </Link>
                    {isHydrated && isAuthenticated && (
                        <>
                            <Link
                                href="/dashboard?tab=history"
                                className={`flex items-center gap-1.5 text-[15px] font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 ${
                                    isDashboard
                                        ? "text-white bg-white/10"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <Clock className="h-4.5 w-4.5" />
                                <span className="hidden sm:inline">History</span>
                            </Link>
                            <Link
                                href="/dashboard?tab=favorites"
                                className={`flex items-center gap-1.5 text-[15px] font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 ${
                                    isDashboard
                                        ? "text-white bg-white/10"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <Heart className="h-4.5 w-4.5" />
                                <span className="hidden sm:inline">Favourites</span>
                            </Link>
                        </>
                    )}
                    <Link
                        href="/about"
                        className={`flex items-center gap-1.5 text-[15px] font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 ${
                            isActive("/about")
                                ? "text-white bg-white/10"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <Info className="h-4.5 w-4.5" />
                        <span className="hidden sm:inline">About</span>
                    </Link>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-1 sm:gap-1.5 pr-1 shrink-0 justify-end">
                    {!isHydrated ? (
                        <div className="flex items-center justify-center h-10 w-10">
                            <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        </div>
                    ) : isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback
                                            className="font-bold text-base"
                                            style={{
                                                background: "oklch(0.72 0.12 290 / 20%)",
                                                color: "oklch(0.82 0.12 290)",
                                            }}
                                        >
                                            {user?.email?.charAt(0).toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="px-2 py-1.5">
                                    <p className="text-sm font-medium">{user?.email}</p>
                                    <p className="text-xs text-muted-foreground">Logged in</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            {/* Mobile: icon-only log in button; desktop: text label */}
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl h-10 px-2.5 sm:px-4"
                            >
                                <Link href="/login">
                                    <span className="hidden sm:inline text-[15px]">Log in</span>
                                    <span className="sm:hidden text-[13px] font-medium">Login</span>
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                asChild
                                className="rounded-xl font-semibold h-10 px-3 sm:px-5 text-[13px] sm:text-[15px]"
                                style={{
                                    background: "oklch(0.72 0.12 290)",
                                    color: "white",
                                }}
                            >
                                <Link href="/register">
                                    <span className="hidden sm:inline">Sign up</span>
                                    <span className="sm:hidden">Sign up</span>
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
