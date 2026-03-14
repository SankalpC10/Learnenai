import { api } from "./client";
import type { CalendarItem } from "@/types";

export const calendarApi = {
  list: (domainId: string, month?: string) => {
    const params = new URLSearchParams({ domain_id: domainId });
    if (month) params.set("month", month);
    return api.get<CalendarItem[]>(`/api/v1/calendar?${params}`);
  },
  generate: (data: { domain_id: string; start_date: string; weeks?: number; posts_per_week?: number }) =>
    api.post<CalendarItem[]>("/api/v1/calendar/generate", data),
  update: (id: string, data: Partial<CalendarItem>) =>
    api.put<CalendarItem>(`/api/v1/calendar/${id}`, data),
  delete: (id: string) => api.del(`/api/v1/calendar/${id}`),
  writePost: (id: string) => api.post<import("@/types").BlogPost>(`/api/v1/calendar/${id}/write-post`),
};
