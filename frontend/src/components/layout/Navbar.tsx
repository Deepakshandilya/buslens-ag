"use client";

import Link from "next/link";
import { Bus, User, LogOut, LayoutDashboard } from "lucide-react";
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
import { useRouter } from "next/navigation";

export function Navbar() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                        <Bus className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Bus<span className="text-primary">Lens</span>
                    </span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
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
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">Log in</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/register">Sign up</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
