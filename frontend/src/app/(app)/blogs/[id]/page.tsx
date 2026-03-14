"use client";
import { use, useState } from "react";
import { ArrowLeft, Edit3, Save, Globe, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Input, Textarea } from "@/components/ui/Input";
import { useBlog, useUpdateBlog } from "@/lib/hooks/useBlogs";
import Link from "next/link";
import { toast } from "sonner";

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: post, isLoading } = useBlog(id);
  const updateBlog = useUpdateBlog();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [copied, setCopied] = useState(false);

  const startEditing = () => {
    if (!post) return;
    setTitle(post.title);
    setMetaDesc(post.meta_description || "");
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateBlog.mutateAsync({ id, title, meta_description: metaDesc });
      setEditing(false);
      toast.success("Post updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    }
  };

  const handleCopyHtml = () => {
    if (!post?.body_html) return;
    navigator.clipboard.writeText(post.body_html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("HTML copied to clipboard");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;
  }

  if (!post) {
    return <div className="text-center py-20 text-text-secondary">Post not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/blogs"><Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button></Link>
        <div className="flex-1 min-w-0">
          {editing ? (
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-xl font-bold" />
          ) : (
            <h1 className="text-2xl font-display font-bold truncate">{post.title}</h1>
          )}
        </div>
        <Badge variant={post.status === "published" ? "success" : post.status === "ready" ? "accent" : "default"}>
          {post.status}
        </Badge>
        {editing ? (
          <Button size="sm" onClick={handleSave} loading={updateBlog.isPending}><Save size={14} /> Save</Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={startEditing}><Edit3 size={14} /> Edit</Button>
        )}
      </div>

      {/* Meta */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Target Keyword</p>
            <p className="text-sm font-medium">{post.target_keyword ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Word Count</p>
            <p className="text-sm font-medium">{post.word_count?.toLocaleString() ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Slug</p>
            <p className="text-sm font-medium truncate">{post.slug}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Published URL</p>
            {post.wp_url ? (
              <a href={post.wp_url} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline flex items-center gap-1">
                <Globe size={12} /> View
              </a>
            ) : <p className="text-sm text-text-secondary">Not published</p>}
          </div>
        </div>
        {editing ? (
          <div className="mt-4">
            <Textarea label="Meta Description" value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={2} />
          </div>
        ) : post.meta_description && (
          <p className="mt-4 text-sm text-text-secondary border-t border-card-border pt-4">{post.meta_description}</p>
        )}
      </Card>

      {/* Content */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Content</h2>
          <Button variant="ghost" size="sm" onClick={handleCopyHtml}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy HTML"}
          </Button>
        </div>
        {post.body_html ? (
          <div
            className="prose prose-invert prose-sm max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_p]:text-text-secondary [&_p]:leading-relaxed [&_a]:text-accent [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:text-text-secondary [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: post.body_html }}
          />
        ) : (
          <p className="text-sm text-text-secondary">No content generated yet.</p>
        )}
      </Card>
    </div>
  );
}
