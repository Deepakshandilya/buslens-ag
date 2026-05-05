"use client";

import { useState, useEffect } from "react";

/** Breakpoint (px) below which we consider the device "mobile" */
const MOBILE_BREAKPOINT = 768;

/**
 * Detects whether the current viewport is mobile-sized.
 *
 * On the server (SSR) and during hydration it returns `false`
 * so desktop markup is rendered first — this prevents layout
 * shifts on desktop which is the majority traffic.
 *
 * Uses `window.matchMedia` for efficient, event-driven updates
 * rather than polling or resize listeners.
 */
export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

        // Set initial value
        setIsMobile(mql.matches);

        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener("change", handler);

        return () => mql.removeEventListener("change", handler);
    }, []);

    return isMobile;
}

/**
 * Detects whether the device has limited GPU/rendering capability.
 * Checks for:
 *  - Touch-primary device (mobile/tablet)
 *  - Small screen
 *  - Reduced-motion user preference
 *  - Low device memory (if available)
 *  - Low hardware concurrency (CPU cores)
 *
 * Returns `true` if the device should receive the lightweight UI.
 */
export function useReducedMotion(): boolean {
    const [shouldReduce, setShouldReduce] = useState(false);

    useEffect(() => {
        const checks: boolean[] = [];

        // 1. User prefers reduced motion
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        checks.push(prefersReduced);

        // 2. Touch-primary device (strong mobile signal)
        const isTouchPrimary = window.matchMedia("(pointer: coarse)").matches;
        checks.push(isTouchPrimary);

        // 3. Small viewport
        const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT;
        checks.push(isSmallScreen);

        // 4. Low device memory (Chrome-only API)
        const nav = navigator as Navigator & { deviceMemory?: number };
        if (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) {
            checks.push(true);
        }

        // 5. Low CPU cores
        if (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4) {
            checks.push(true);
        }

        // If ANY two signals fire, reduce motion
        const positiveSignals = checks.filter(Boolean).length;
        setShouldReduce(positiveSignals >= 2);
    }, []);

    return shouldReduce;
}
