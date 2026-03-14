"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogsApi } from "@/lib/api/blogs";

export function useBlogs(domainId?: string, status?: string) {
  return useQuery({
    queryKey: ["blogs", domainId, status],
    queryFn: () => blogsApi.list(domainId, status),
  });
}

export function useBlog(id: string) {
  return useQuery({
    queryKey: ["blogs", id],
    queryFn: () => blogsApi.get(id),
  });
}

export function useGenerateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: blogsApi.generate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blogs"] }),
  });
}

export function useUpdateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; meta_description?: string; body_html?: string }) =>
      blogsApi.update(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: ["blogs", id] }),
  });
}
