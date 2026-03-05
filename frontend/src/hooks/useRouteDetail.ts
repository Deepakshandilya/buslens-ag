"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { RouteDetailResponse } from "@/types/api";

export function useRouteDetail(routeNumber: string, direction: string) {
    return useQuery<RouteDetailResponse>({
        queryKey: ["routeDetail", routeNumber, direction],
        queryFn: async () => {
            const { data } = await api.get<RouteDetailResponse>(
                `/routes/${encodeURIComponent(routeNumber)}/${encodeURIComponent(direction)}`
            );
            return data;
        },
        enabled: routeNumber.length > 0 && direction.length > 0,
        staleTime: 5 * 60_000,
    });
}
