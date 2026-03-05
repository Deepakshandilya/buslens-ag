"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { HistoryResponse } from "@/types/api";

export function useHistory() {
    return useQuery<HistoryResponse[]>({
        queryKey: ["history"],
        queryFn: async () => {
            const { data } = await api.get<HistoryResponse[]>("/users/me/history");
            return data;
        },
    });
}

export function useAddHistory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { from_stop_id: number; to_stop_id: number }) => {
            const { data } = await api.post("/users/me/history", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["history"] });
        },
    });
}
