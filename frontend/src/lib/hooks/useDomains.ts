"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { domainsApi } from "@/lib/api/domains";

export function useDomains() {
  return useQuery({ queryKey: ["domains"], queryFn: domainsApi.list });
}

export function useDomain(id: string) {
  return useQuery({
    queryKey: ["domains", id],
    queryFn: () => domainsApi.get(id),
    refetchInterval: (query) => {
      const domain = query.state.data;
      return domain?.crawl_status === "crawling" ? 3000 : false;
    },
  });
}

export function useCreateDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => domainsApi.create(url),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["domains"] }),
  });
}

export function useDeleteDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => domainsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["domains"] }),
  });
}
