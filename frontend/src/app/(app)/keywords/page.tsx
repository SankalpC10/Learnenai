"use client";
import { Search, Sparkles, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useKeywords, useSuggestKeywords } from "@/lib/hooks/useKeywords";
import { useAppStore } from "@/stores/app-store";
import { useDomains } from "@/lib/hooks/useDomains";
import { toast } from "sonner";
import Link from "next/link";

export default function KeywordsPage() {
  const { selectedDomainId, setSelectedDomainId } = useAppStore();
  const { data: domains } = useDomains();
  const { data: keywords, isLoading } = useKeywords(selectedDomainId);
  const suggestKeywords = useSuggestKeywords();

  const activeDomain = domains?.find((d) => d.id === selectedDomainId);

  const handleSuggest = async () => {
    if (!selectedDomainId) return toast.error("Select a domain first");
    try {
      await suggestKeywords.mutateAsync({ domainId: selectedDomainId, count: 15 });
      toast.success("New keywords generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate keywords");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Keywords</h1>
          <p className="text-text-secondary mt-1">AI-suggested SEO keywords for your content</p>
        </div>
        <Button onClick={handleSuggest} loading={suggestKeywords.isPending} disabled={!selectedDomainId}>
          <Sparkles size={16} /> Generate Keywords
        </Button>
      </div>

      {/* Domain selector */}
      {domains && domains.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {domains.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDomainId(d.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                selectedDomainId === d.id
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "bg-input-bg text-text-secondary border border-card-border hover:bg-hover-bg"
              }`}
            >
              {d.company_name || d.url}
            </button>
          ))}
        </div>
      )}

      {!selectedDomainId ? (
        <EmptyState
          icon={Search}
          title="Select a domain"
          description="Choose a domain from the selector above or add one in the Domains page."
          action={<Link href="/domains"><Button variant="secondary">Go to Domains</Button></Link>}
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center h-40"><Spinner size={32} /></div>
      ) : (!keywords || keywords.length === 0) ? (
        <EmptyState
          icon={Search}
          title="No keywords yet"
          description={`Generate AI-powered keyword suggestions for ${activeDomain?.company_name || "your domain"}.`}
          action={<Button onClick={handleSuggest} loading={suggestKeywords.isPending}><Sparkles size={16} /> Generate Keywords</Button>}
        />
      ) : (
        <div className="grid gap-3" role="table" aria-label="Keywords">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-text-secondary uppercase tracking-wider" role="row">
            <div className="col-span-5" role="columnheader">Keyword</div>
            <div className="col-span-3" role="columnheader">Suggested Title</div>
            <div className="col-span-1 text-center" role="columnheader">Volume</div>
            <div className="col-span-1 text-center" role="columnheader">Difficulty</div>
            <div className="col-span-2 text-right" role="columnheader">Action</div>
          </div>
          {keywords.map((kw) => (
            <Card key={kw.id} className="grid grid-cols-12 gap-4 items-center py-4" role="row">
              <div className="col-span-5 flex items-center gap-2" role="cell">
                {kw.used && <CheckCircle size={14} className="text-success shrink-0" aria-label="Used" />}
                <span className="text-sm font-medium truncate">{kw.keyword}</span>
              </div>
              <div className="col-span-3 text-sm text-text-secondary truncate" role="cell">{kw.suggested_title || "—"}</div>
              <div className="col-span-1 text-center text-sm" role="cell">{kw.search_volume ?? "—"}</div>
              <div className="col-span-1 text-center" role="cell">
                {kw.difficulty ? (
                  <Badge variant={kw.difficulty === "easy" ? "success" : kw.difficulty === "medium" ? "warning" : "error"}>
                    {kw.difficulty}
                  </Badge>
                ) : "—"}
              </div>
              <div className="col-span-2 text-right" role="cell">
                {!kw.used && (
                  <Link href={`/blogs/new?keyword=${encodeURIComponent(kw.keyword)}&title=${encodeURIComponent(kw.suggested_title || "")}&domainId=${selectedDomainId}`}>
                    <Button variant="secondary" size="sm">Write Post</Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
