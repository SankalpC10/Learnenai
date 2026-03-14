"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calendarApi } from "@/lib/api/calendar";

export function useCalendar(domainId: string | null, month?: string) {
  return useQuery({
    queryKey: ["calendar", domainId, month],
    queryFn: () => calendarApi.list(domainId!, month),
    enabled: !!domainId,
  });
}

export function useGenerateCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: calendarApi.generate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar"] }),
  });
}

export function useWritePostFromCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => calendarApi.writePost(itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar"] });
      qc.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}
