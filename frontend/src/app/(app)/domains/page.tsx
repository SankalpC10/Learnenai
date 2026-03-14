"use client";
import { useState } from "react";
import { Globe, Plus, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDomains, useCreateDomain, useDeleteDomain } from "@/lib/hooks/useDomains";
import { useAppStore } from "@/stores/app-store";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function DomainsPage() {
  const { data: domains, isLoading } = useDomains();
  const createDomain = useCreateDomain();
  const deleteDomain = useDeleteDomain();
  const { selectedDomainId, setSelectedDomainId } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [url, setUrl] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!url.trim()) return;
    try {
      const domain = await createDomain.mutateAsync(url.trim());
      setSelectedDomainId(domain.id);
      toast.success("Domain added! Crawling started.");
      setShowAdd(false);
      setUrl("");
    } catch (e: any) {
      toast.error(e.message || "Failed to add domain");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDomain.mutateAsync(deleteTarget);
      if (selectedDomainId === deleteTarget) setSelectedDomainId(null);
      toast.success("Domain deleted");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Domains</h1>
          <p className="text-text-secondary mt-1">Manage your website domains for content generation</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Domain
        </Button>
      </div>

      {(!domains || domains.length === 0) ? (
        <EmptyState
          icon={Globe}
          title="No domains yet"
          description="Add your first domain to start generating AI-powered content."
          action={<Button onClick={() => setShowAdd(true)}><Plus size={16} /> Add Domain</Button>}
        />
      ) : (
        <div className="grid gap-4">
          {domains.map((domain) => (
            <Card key={domain.id} hover onClick={() => setSelectedDomainId(domain.id)} className={selectedDomainId === domain.id ? "border-accent/40" : ""}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold truncate">{domain.company_name || domain.url}</h3>
                    <Badge variant={
                      domain.crawl_status === "completed" ? "success"
                        : domain.crawl_status === "crawling" ? "warning"
                        : domain.crawl_status === "failed" ? "error"
                        : "default"
                    }>
                      {domain.crawl_status === "crawling" && <Spinner size={12} />}
                      {domain.crawl_status}
                    </Badge>
                    {selectedDomainId === domain.id && <Badge variant="accent">Active</Badge>}
                  </div>
                  <p className="text-sm text-text-secondary truncate">{domain.url}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                    {domain.industry && <span>{domain.industry}</span>}
                    <span>{domain.pages_crawled} pages crawled</span>
                    <span>Added {formatDistanceToNow(new Date(domain.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/domains/${domain.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm"><ExternalLink size={14} /></Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteTarget(domain.id); }} loading={deleteDomain.isPending}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Domain">
        <div className="space-y-4">
          <Input
            label="Website URL"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} loading={createDomain.isPending}>Add & Crawl</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Domain">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete this domain and all associated data? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button onClick={handleDelete} loading={deleteDomain.isPending} className="bg-error text-white hover:bg-error/90">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
