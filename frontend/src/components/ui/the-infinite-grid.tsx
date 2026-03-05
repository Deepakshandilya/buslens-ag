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

export function InfiniteGridHero({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
    };

    const gridOffsetX = useMotionValue(0);
    const gridOffsetY = useMotionValue(0);

    const speedX = 0.3;
    const speedY = 0.3;

    useAnimationFrame(() => {
        gridOffsetX.set((gridOffsetX.get() + speedX) % 40);
        gridOffsetY.set((gridOffsetY.get() + speedY) % 40);
    });

    const maskImage = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className={cn(
                "relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background",
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
