"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { RouteAutocompleteResponse } from "@/types/api";

export function useBusSearch(query: string) {
    return useQuery<RouteAutocompleteResponse>({
        queryKey: ["busAutocomplete", query],
        queryFn: async () => {
            const { data } = await api.get<RouteAutocompleteResponse>("/routes/autocomplete", {
                params: { query, limit: 10 },
            });
            return data;
        },
        enabled: query.length >= 1,
        staleTime: 30_000,
    });
}
