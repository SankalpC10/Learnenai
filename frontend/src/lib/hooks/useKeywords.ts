"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keywordsApi } from "@/lib/api/keywords";

export function useKeywords(domainId: string | null) {
  return useQuery({
    queryKey: ["keywords", domainId],
    queryFn: () => keywordsApi.list(domainId!),
    enabled: !!domainId,
  });
}

export function useSuggestKeywords() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ domainId, count }: { domainId: string; count?: number }) =>
      keywordsApi.suggest(domainId, count),
    onSuccess: (_, { domainId }) => qc.invalidateQueries({ queryKey: ["keywords", domainId] }),
  });
}
