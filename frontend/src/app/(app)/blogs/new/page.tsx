"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useGenerateBlog } from "@/lib/hooks/useBlogs";
import { useDomains } from "@/lib/hooks/useDomains";
import { useAppStore } from "@/stores/app-store";
import Link from "next/link";
import { toast } from "sonner";

export default function NewBlogPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Spinner size={32} /></div>}>
      <NewBlogContent />
    </Suspense>
  );
}

function NewBlogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: domains } = useDomains();
  const { selectedDomainId, setSelectedDomainId } = useAppStore();
  const generateBlog = useGenerateBlog();

  const [domainId, setDomainId] = useState(selectedDomainId || "");
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [wordCount, setWordCount] = useState(1500);

  useEffect(() => {
    const paramDomainId = searchParams.get("domainId");
    if (paramDomainId) setDomainId(paramDomainId);
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!domainId) return toast.error("Select a domain");
    if (!keyword.trim()) return toast.error("Enter a keyword");

    try {
      const post = await generateBlog.mutateAsync({
        domain_id: domainId,
        custom_keyword: keyword.trim(),
        custom_title: title.trim() || undefined,
        word_count: wordCount,
      });
      toast.success("Blog post generated!");
      router.push(`/blogs/${post.id}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/blogs"><Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button></Link>
        <div>
          <h1 className="text-2xl font-display font-bold">Generate Blog Post</h1>
          <p className="text-sm text-text-secondary">AI will create an SEO-optimized article for your brand</p>
        </div>
      </div>

      <Card>
        <div className="space-y-5">
          {/* Domain select */}
          <Select
            label="Domain"
            value={domainId}
            onChange={(e) => { setDomainId(e.target.value); setSelectedDomainId(e.target.value); }}
          >
            <option value="">Select a domain...</option>
            {domains?.filter((d) => d.crawl_status === "completed").map((d) => (
              <option key={d.id} value={d.id}>{d.company_name || d.url}</option>
            ))}
          </Select>

          <Input
            label="Target Keyword"
            placeholder="e.g. best project management tools"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <Input
            label="Custom Title (optional)"
            placeholder="Leave blank for AI-generated title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Word Count: {wordCount.toLocaleString()}</label>
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-text-secondary">
              <span>500</span>
              <span>5,000</span>
            </div>
          </div>

          <Button onClick={handleGenerate} loading={generateBlog.isPending} className="w-full" size="lg">
            <Sparkles size={18} /> Generate Post
          </Button>

          {generateBlog.isPending && (
            <p className="text-sm text-text-secondary text-center animate-pulse">
              Generating your blog post... This may take 30-60 seconds.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
