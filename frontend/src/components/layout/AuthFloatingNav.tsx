"use client";

import { useRouter } from "next/navigation";

export function AuthFloatingNav() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center h-14 w-14 rounded-full shadow-xl shadow-black/40 cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 overflow-hidden"
            style={{
                background: "var(--background)",
                border: "2px solid var(--border)",
            }}
            aria-label="Go to homepage"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/logo.png"
                alt="BusLens"
                className="h-10 w-10 object-cover"
            />
        </button>
    );
}
