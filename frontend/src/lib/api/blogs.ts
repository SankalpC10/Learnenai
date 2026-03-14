import { api } from "./client";
import type { BlogPost } from "@/types";

export const blogsApi = {
  list: (domainId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (domainId) params.set("domain_id", domainId);
    if (status) params.set("status", status);
    return api.get<BlogPost[]>(`/api/v1/blogs?${params}`);
  },
  get: (id: string) => api.get<BlogPost>(`/api/v1/blogs/${id}`),
  generate: (data: {
    domain_id: string;
    keyword_id?: string;
    custom_keyword?: string;
    custom_title?: string;
    word_count?: number;
  }) => api.post<BlogPost>("/api/v1/blogs/generate", data),
  update: (id: string, data: { title?: string; meta_description?: string; body_html?: string }) =>
    api.put<BlogPost>(`/api/v1/blogs/${id}`, data),
  publish: (id: string, data: { wp_url?: string; wp_username?: string; wp_password?: string; publish_status?: string }) =>
    api.post<BlogPost>(`/api/v1/blogs/${id}/publish`, data),
};
