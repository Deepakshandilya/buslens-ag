"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

const AUTH_ROUTES = ["/login", "/register"];

export function NavbarWrapper() {
    const pathname = usePathname();
    const isAuthPage = AUTH_ROUTES.includes(pathname);

    if (isAuthPage) return null;
    return <Navbar />;
}
