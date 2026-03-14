"use client";
import { use } from "react";
import { ArrowLeft, RefreshCw, Globe } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useDomain } from "@/lib/hooks/useDomains";
import { domainsApi } from "@/lib/api/domains";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";

export default function DomainDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: domain, isLoading, refetch } = useDomain(id);
  const [recrawling, setRecrawling] = useState(false);

  const handleRecrawl = async () => {
    setRecrawling(true);
    try {
      await domainsApi.recrawl(id);
      refetch();
      toast.success("Recrawl started");
    } catch (e: any) {
      toast.error(e.message || "Failed to recrawl");
    } finally {
      setRecrawling(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;
  }

  if (!domain) {
    return <div className="text-center py-20 text-text-secondary">Domain not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/domains"><Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold">{domain.company_name || domain.url}</h1>
          <p className="text-sm text-text-secondary">{domain.url}</p>
        </div>
        <Badge variant={domain.crawl_status === "completed" ? "success" : domain.crawl_status === "crawling" ? "warning" : "default"}>
          {domain.crawl_status === "crawling" && <Spinner size={12} />}
          {domain.crawl_status}
        </Badge>
        <Button variant="secondary" size="sm" onClick={handleRecrawl} loading={recrawling}>
          <RefreshCw size={14} /> Recrawl
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Brand Profile</h3>
          <div className="space-y-3">
            <InfoRow label="Industry" value={domain.industry} />
            <InfoRow label="Target Audience" value={domain.target_audience} />
            <InfoRow label="Brand Voice" value={domain.brand_voice} />
            <InfoRow label="Pages Crawled" value={String(domain.pages_crawled)} />
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Brand Summary</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{domain.brand_summary || "No summary yet. Complete a crawl to generate."}</p>
        </Card>
      </div>

      {domain.key_topics?.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Key Topics</h3>
          <div className="flex flex-wrap gap-2">
            {domain.key_topics.map((t) => (
              <Badge key={t} variant="accent">{t}</Badge>
            ))}
          </div>
        </Card>
      )}

      {domain.crawl_error && (
        <Card className="border-error/30">
          <h3 className="text-sm font-semibold text-error mb-2">Crawl Error</h3>
          <p className="text-sm text-text-secondary">{domain.crawl_error}</p>
        </Card>
      )}

      <div className="flex gap-3">
        <Link href="/keywords"><Button variant="secondary">View Keywords</Button></Link>
        <Link href="/blogs/new"><Button>Generate Blog Post</Button></Link>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}
