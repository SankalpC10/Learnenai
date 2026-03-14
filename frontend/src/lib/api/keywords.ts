import { api } from "./client";
import type { Keyword } from "@/types";

export const keywordsApi = {
  list: (domainId: string) => api.get<Keyword[]>(`/api/v1/keywords?domain_id=${domainId}`),
  suggest: (domainId: string, count = 15) =>
    api.post<Keyword[]>("/api/v1/keywords/suggest", { domain_id: domainId, count }),
};
