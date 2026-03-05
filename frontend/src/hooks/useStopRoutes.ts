"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { StopRoutesResponse } from "@/types/api";

export function useStopRoutes(stopId: number | null) {
    return useQuery<StopRoutesResponse>({
        queryKey: ["stopRoutes", stopId],
        queryFn: async () => {
            const { data } = await api.get<StopRoutesResponse>(`/stops/${stopId}/routes`);
            return data;
        },
        enabled: stopId !== null && stopId > 0,
        staleTime: 5 * 60_000,
    });
}
