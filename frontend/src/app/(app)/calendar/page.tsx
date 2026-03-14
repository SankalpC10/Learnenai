"use client";
import { useState } from "react";
import { Calendar as CalendarIcon, Sparkles, Trash2, ChevronLeft, ChevronRight, PenLine } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCalendar, useGenerateCalendar, useWritePostFromCalendar } from "@/lib/hooks/useCalendar";
import { useAppStore } from "@/stores/app-store";
import { useDomains } from "@/lib/hooks/useDomains";
import { calendarApi } from "@/lib/api/calendar";
import { toast } from "sonner";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

const statusColors: Record<string, string> = {
  idea: "default",
  scheduled: "accent",
  in_progress: "warning",
  completed: "success",
  skipped: "error",
} as const;

export default function CalendarPage() {
  const { selectedDomainId } = useAppStore();
  const { data: domains } = useDomains();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const monthStr = format(currentMonth, "yyyy-MM");
  const { data: items, isLoading } = useCalendar(selectedDomainId, monthStr);
  const generateCalendar = useGenerateCalendar();
  const writePost = useWritePostFromCalendar();
  const [writingId, setWritingId] = useState<string | null>(null);
  const qc = useQueryClient();

  const activeDomain = domains?.find((d) => d.id === selectedDomainId);

  const handleGenerate = async () => {
    if (!selectedDomainId) return toast.error("Select a domain first");
    try {
      await generateCalendar.mutateAsync({
        domain_id: selectedDomainId,
        start_date: format(currentMonth, "yyyy-MM-dd"),
        weeks: 4,
        posts_per_week: 2,
      });
      toast.success("Calendar generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate calendar");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await calendarApi.delete(id);
      qc.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Item removed");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await calendarApi.update(id, { status: status as any });
      qc.invalidateQueries({ queryKey: ["calendar"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    }
  };

  const handleWritePost = async (id: string) => {
    setWritingId(id);
    try {
      const blog = await writePost.mutateAsync(id);
      toast.success(`Blog post "${blog.title}" created!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate post");
    } finally {
      setWritingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Content Calendar</h1>
          <p className="text-text-secondary mt-1">Plan and schedule your content pipeline</p>
        </div>
        <Button onClick={handleGenerate} loading={generateCalendar.isPending} disabled={!selectedDomainId}>
          <Sparkles size={16} /> Generate Calendar
        </Button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft size={16} />
        </Button>
        <span className="text-lg font-semibold min-w-[180px] text-center">{format(currentMonth, "MMMM yyyy")}</span>
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight size={16} />
        </Button>
      </div>

      {!selectedDomainId ? (
        <EmptyState
          icon={CalendarIcon}
          title="Select a domain"
          description="Choose a domain to view or generate a content calendar."
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center h-40"><Spinner size={32} /></div>
      ) : (!items || items.length === 0) ? (
        <EmptyState
          icon={CalendarIcon}
          title="No calendar items"
          description={`Generate an AI content calendar for ${activeDomain?.company_name || "your domain"}.`}
          action={<Button onClick={handleGenerate} loading={generateCalendar.isPending}><Sparkles size={16} /> Generate</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {items
            .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
            .map((item) => (
            <Card key={item.id} className="flex items-center gap-4 py-4">
              <div className="w-16 text-center shrink-0">
                <p className="text-2xl font-bold text-accent">{format(new Date(item.scheduled_date), "dd")}</p>
                <p className="text-xs text-text-secondary uppercase">{format(new Date(item.scheduled_date), "EEE")}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.title}</p>
                {item.target_keyword && (
                  <p className="text-xs text-text-secondary mt-0.5">Keyword: {item.target_keyword}</p>
                )}
                {item.notes && (
                  <p className="text-xs text-text-secondary mt-0.5">{item.notes}</p>
                )}
              </div>
              <Select
                value={item.status}
                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                className="!py-1 !px-2 !text-xs !w-auto !min-w-[100px]"
              >
                {Object.keys(statusColors).map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </Select>
              <Badge variant={(statusColors[item.status] || "default") as any}>{item.status.replace("_", " ")}</Badge>
              {!item.blog_post_id ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleWritePost(item.id)}
                  loading={writingId === item.id}
                  disabled={!!writingId}
                >
                  <PenLine size={14} /> Write Post
                </Button>
              ) : (
                <a href={`/blogs/${item.blog_post_id}`}>
                  <Badge variant="success">View Post</Badge>
                </a>
              )}
              <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                <Trash2 size={14} />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
