"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import {
    motion,
    useMotionValue,
    useMotionTemplate,
    useAnimationFrame,
    type MotionValue,
} from "framer-motion";
import { useReducedMotion } from "@/hooks/useIsMobile";

/**
 * Mobile-optimised hero: no grid animation, no mouse tracking,
 * just a clean dark background with subtle static orbs.
 */
function MobileHero({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "relative w-full min-h-[100dvh] flex flex-col items-center overflow-hidden pt-[15vh] pb-12",
                className
            )}
            style={{
                background:
                    "linear-gradient(180deg, oklch(0.145 0.01 285) 0%, oklch(0.12 0.015 280) 50%, oklch(0.14 0.02 290) 100%)",
            }}
        >
            {/* Static ambient glow — uses radial-gradient, no blur filter */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 50% 40% at 85% 10%, oklch(0.45 0.15 250 / 10%) 0%, transparent 60%)",
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 50% 40% at 15% 85%, oklch(0.45 0.12 160 / 8%) 0%, transparent 60%)",
                    }}
                />
            </div>

            {/* Content slot */}
            <div className="relative z-10 w-full">{children}</div>
        </div>
    );
}

export function InfiniteGridHero({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) {
    const reducedMotion = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (reducedMotion) return; // skip tracking on mobile
        const { left, top } = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
    };

    const gridOffsetX = useMotionValue(0);
    const gridOffsetY = useMotionValue(0);

    const speedX = 0.3;
    const speedY = 0.3;

    useAnimationFrame(() => {
        if (reducedMotion) return; // no-op on mobile
        gridOffsetX.set((gridOffsetX.get() + speedX) % 40);
        gridOffsetY.set((gridOffsetY.get() + speedY) % 40);
    });

    const maskImage = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

    // ── Mobile: lightweight hero ──
    if (reducedMotion) {
        return <MobileHero className={className}>{children}</MobileHero>;
    }

    // ── Desktop: full animated grid ──
    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className={cn(
                "relative w-full min-h-[100dvh] flex flex-col items-center overflow-hidden bg-background pt-[15vh] sm:pt-[20vh] pb-12",
                className
            )}
        >
            {/* Static faint grid */}
            <div className="absolute inset-0 z-0 opacity-[0.04]">
                <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
            </div>

            {/* Mouse-tracking bright grid */}
            <motion.div
                className="absolute inset-0 z-0 opacity-30"
                style={{ maskImage, WebkitMaskImage: maskImage }}
            >
                <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
            </motion.div>

            {/* Ambient glow orbs */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute right-[-15%] top-[-15%] w-[35%] h-[35%] rounded-full bg-blue-500/25 blur-[120px]" />
                <div className="absolute right-[15%] top-[-5%] w-[15%] h-[15%] rounded-full bg-primary/20 blur-[100px]" />
                <div className="absolute left-[-10%] bottom-[-15%] w-[35%] h-[35%] rounded-full bg-emerald-500/20 blur-[120px]" />
            </div>

            {/* Content slot */}
            <div className="relative z-10 w-full">{children}</div>
        </div>
    );
}

function GridPattern({
    offsetX,
    offsetY,
}: {
    offsetX: MotionValue<number>;
    offsetY: MotionValue<number>;
}) {
    return (
        <svg className="w-full h-full">
            <defs>
                <motion.pattern
                    id="buslens-grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                    x={offsetX}
                    y={offsetY}
                >
                    <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-muted-foreground"
                    />
                </motion.pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#buslens-grid)" />
        </svg>
    );
}
