"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { StopsResponse } from "@/types/api";

export function useStopSearch(query: string) {
    return useQuery<StopsResponse>({
        queryKey: ["stops", query],
        queryFn: async () => {
            const { data } = await api.get<StopsResponse>("/stops", {
                params: { query, limit: 10 },
            });
            return data;
        },
        enabled: query.length >= 2,
        staleTime: 30_000,
    });
}
