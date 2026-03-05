"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { RouteSearchResult } from "@/types/api";

export function useRouteSearch(fromStop: string, toStop: string) {
    return useQuery<RouteSearchResult[]>({
        queryKey: ["routeSearch", fromStop, toStop],
        queryFn: async () => {
            const { data } = await api.post<RouteSearchResult[]>("/routes/search", {
                from_stop: fromStop,
                to_stop: toStop,
            });
            return data;
        },
        enabled: fromStop.length > 0 && toStop.length > 0,
        staleTime: 60_000,
    });
}
