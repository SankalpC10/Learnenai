export interface Domain {
  id: string;
  url: string;
  company_name: string | null;
  industry: string | null;
  target_audience: string | null;
  brand_voice: string | null;
  brand_summary: string | null;
  key_topics: string[];
  crawl_status: "pending" | "crawling" | "completed" | "failed";
  crawl_error: string | null;
  pages_crawled: number;
  created_at: string;
  updated_at?: string;
}

export interface Keyword {
  id: string;
  domain_id: string;
  keyword: string;
  search_volume: number | null;
  difficulty: string | null;
  suggested_title: string | null;
  used: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  domain_id: string;
  title: string;
  slug: string;
  meta_description: string | null;
  body_html: string | null;
  target_keyword: string | null;
  search_volume: number | null;
  difficulty: string | null;
  word_count: number | null;
  status: "draft" | "ready" | "published" | "failed";
  wp_post_id: number | null;
  wp_url: string | null;
  created_at: string;
}

export interface CalendarItem {
  id: string;
  domain_id: string;
  title: string;
  target_keyword: string | null;
  scheduled_date: string;
  status: "idea" | "scheduled" | "in_progress" | "completed" | "skipped";
  blog_post_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}
