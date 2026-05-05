"use client";

import React from "react";
import { useReducedMotion } from "@/hooks/useIsMobile";

interface PageBackgroundProps {
    children: React.ReactNode;
    className?: string;
}

export function PageBackground({ children, className = "" }: PageBackgroundProps) {
    const reducedMotion = useReducedMotion();

    return (
        <div
            className={`min-h-screen pt-24 pb-12 relative overflow-hidden ${className}`}
            style={{
                background:
                    "linear-gradient(180deg, oklch(0.14 0.03 285) 0%, oklch(0.11 0.02 280) 40%, oklch(0.13 0.025 290) 100%)",
            }}
        >
            {/* Desktop: expensive blur orbs | Mobile: cheap radial gradients */}
            {reducedMotion ? (
                <div className="pointer-events-none absolute inset-0">
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(ellipse 50% 40% at 80% 10%, oklch(0.55 0.15 290 / 6%) 0%, transparent 60%)",
                        }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(ellipse 45% 35% at 20% 70%, oklch(0.50 0.12 260 / 5%) 0%, transparent 55%)",
                        }}
                    />
                </div>
            ) : (
                <div className="pointer-events-none absolute inset-0">
                    <div
                        className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px]"
                        style={{ background: "oklch(0.55 0.15 290 / 12%)" }}
                    />
                    <div
                        className="absolute top-[30%] -left-[15%] w-[35%] h-[35%] rounded-full blur-[100px]"
                        style={{ background: "oklch(0.50 0.12 260 / 8%)" }}
                    />
                    <div
                        className="absolute -bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full blur-[100px]"
                        style={{ background: "oklch(0.50 0.10 310 / 8%)" }}
                    />
                </div>
            )}
            {children}
        </div>
    );
}
