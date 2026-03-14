import { api } from "./client";
import type { Domain } from "@/types";

export const domainsApi = {
  list: () => api.get<Domain[]>("/api/v1/domains"),
  get: (id: string) => api.get<Domain>(`/api/v1/domains/${id}`),
  create: (url: string) => api.post<Domain>("/api/v1/domains", { url }),
  delete: (id: string) => api.del(`/api/v1/domains/${id}`),
  recrawl: (id: string) => api.post<Domain>(`/api/v1/domains/${id}/recrawl`),
};
