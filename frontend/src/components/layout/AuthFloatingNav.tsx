"use client";

import { useRouter } from "next/navigation";

export function AuthFloatingNav() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center h-14 w-14 rounded-full shadow-xl shadow-black/40 cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 overflow-hidden"
            style={{
                background: "oklch(0.20 0.025 285)",
                border: "2px solid oklch(0.72 0.12 290 / 30%)",
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
