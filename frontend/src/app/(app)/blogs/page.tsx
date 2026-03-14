"use client";
import { FileText, Plus, Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useBlogs } from "@/lib/hooks/useBlogs";
import { useAppStore } from "@/stores/app-store";
import { useDomains } from "@/lib/hooks/useDomains";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

const statusFilters = ["all", "draft", "ready", "published", "failed"] as const;

export default function BlogsPage() {
  const selectedDomainId = useAppStore((s) => s.selectedDomainId);
  const { data: domains } = useDomains();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: blogs, isLoading } = useBlogs(
    selectedDomainId ?? undefined,
    statusFilter === "all" ? undefined : statusFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Blog Posts</h1>
          <p className="text-text-secondary mt-1">AI-generated blog content for your domains</p>
        </div>
        <Link href="/blogs/new">
          <Button><Plus size={16} /> New Post</Button>
        </Link>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
              statusFilter === s
                ? "bg-accent/10 text-accent border border-accent/30"
                : "bg-input-bg text-text-secondary border border-card-border hover:bg-hover-bg"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40"><Spinner size={32} /></div>
      ) : (!blogs || blogs.length === 0) ? (
        <EmptyState
          icon={FileText}
          title="No blog posts yet"
          description="Generate your first AI-powered blog post."
          action={<Link href="/blogs/new"><Button><Plus size={16} /> Create Post</Button></Link>}
        />
      ) : (
        <div className="grid gap-4">
          {blogs.map((post) => (
            <Link key={post.id} href={`/blogs/${post.id}`}>
              <Card hover>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-semibold truncate">{post.title}</h3>
                      <Badge variant={
                        post.status === "published" ? "success"
                          : post.status === "ready" ? "accent"
                          : post.status === "failed" ? "error"
                          : "default"
                      }>{post.status}</Badge>
                    </div>
                    {post.meta_description && (
                      <p className="text-sm text-text-secondary line-clamp-1">{post.meta_description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                      {post.target_keyword && <span className="bg-input-bg px-2 py-0.5 rounded">{post.target_keyword}</span>}
                      {post.word_count && <span>{post.word_count.toLocaleString()} words</span>}
                      <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
