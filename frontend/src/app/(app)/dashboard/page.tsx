"use client";
import { Globe, Search, FileText, Calendar as CalendarIcon, ArrowRight, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { useDomains } from "@/lib/hooks/useDomains";
import { useBlogs } from "@/lib/hooks/useBlogs";
import { useKeywords } from "@/lib/hooks/useKeywords";
import { useAppStore } from "@/stores/app-store";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-sm text-text-secondary">{label}</p>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: domains, isLoading: domainsLoading } = useDomains();
  const selectedDomainId = useAppStore((s) => s.selectedDomainId);
  const { data: keywords } = useKeywords(selectedDomainId);
  const { data: blogs } = useBlogs(selectedDomainId ?? undefined);

  if (domainsLoading) {
    return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;
  }

  const activeDomain = domains?.find((d) => d.id === selectedDomainId) ?? domains?.[0];
  const domainCount = domains?.length ?? 0;
  const keywordCount = keywords?.length ?? 0;
  const blogCount = blogs?.length ?? 0;
  const publishedCount = blogs?.filter((b) => b.status === "published").length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-text-secondary mt-1">Overview of your AI content generation pipeline</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Globe} label="Domains" value={domainCount} color="bg-accent/10 text-accent" />
        <StatCard icon={Search} label="Keywords" value={keywordCount} color="bg-accent-secondary/10 text-accent-secondary" />
        <StatCard icon={FileText} label="Blog Posts" value={blogCount} color="bg-accent/10 text-accent" />
        <StatCard icon={CalendarIcon} label="Published" value={publishedCount} color="bg-success/10 text-success" />
      </div>

      {/* Active Domain */}
      {activeDomain && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Domain</h2>
            <Badge variant={activeDomain.crawl_status === "completed" ? "success" : activeDomain.crawl_status === "crawling" ? "warning" : "default"}>
              {activeDomain.crawl_status}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">URL</p>
              <p className="text-sm font-medium truncate">{activeDomain.url}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Company</p>
              <p className="text-sm font-medium">{activeDomain.company_name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Industry</p>
              <p className="text-sm font-medium">{activeDomain.industry ?? "—"}</p>
            </div>
          </div>
          {activeDomain.key_topics?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeDomain.key_topics.slice(0, 6).map((t) => (
                <Badge key={t} variant="accent">{t}</Badge>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/domains">
          <Card hover className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-accent" />
              <span className="font-medium">Manage Domains</span>
            </div>
            <ArrowRight size={16} className="text-text-secondary" />
          </Card>
        </Link>
        <Link href="/keywords">
          <Card hover className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Search size={20} className="text-accent-secondary" />
              <span className="font-medium">Generate Keywords</span>
            </div>
            <ArrowRight size={16} className="text-text-secondary" />
          </Card>
        </Link>
        <Link href="/blogs/new">
          <Card hover className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-accent-secondary" />
              <span className="font-medium">Create Blog Post</span>
            </div>
            <ArrowRight size={16} className="text-text-secondary" />
          </Card>
        </Link>
      </div>

      {/* Recent Blogs */}
      {blogs && blogs.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Posts</h2>
            <Link href="/blogs" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {blogs.slice(0, 5).map((post) => (
              <Link key={post.id} href={`/blogs/${post.id}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-hover-bg transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{post.title}</p>
                  <p className="text-xs text-text-secondary">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
                </div>
                <Badge variant={post.status === "published" ? "success" : post.status === "ready" ? "accent" : "default"}>{post.status}</Badge>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
