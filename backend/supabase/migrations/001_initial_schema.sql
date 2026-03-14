-- LernenAI Supabase Schema
-- Run this in the Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- DOMAINS
-- ============================================================
CREATE TYPE crawl_status AS ENUM ('pending', 'crawling', 'completed', 'failed');

CREATE TABLE public.domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    company_name TEXT,
    industry TEXT,
    target_audience TEXT,
    brand_voice TEXT,
    brand_summary TEXT,
    key_topics JSONB DEFAULT '[]'::jsonb,
    crawl_status crawl_status DEFAULT 'pending' NOT NULL,
    crawl_error TEXT,
    pages_crawled INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, url)
);

CREATE INDEX idx_domains_user_id ON public.domains(user_id);
CREATE INDEX idx_domains_crawl_status ON public.domains(crawl_status);

-- ============================================================
-- KEYWORDS
-- ============================================================
CREATE TABLE public.keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    search_volume INTEGER,
    difficulty TEXT,
    suggested_title TEXT,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_keywords_domain_id ON public.keywords(domain_id);
CREATE INDEX idx_keywords_user_id ON public.keywords(user_id);
CREATE INDEX idx_keywords_search_volume ON public.keywords(search_volume DESC);

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE TYPE post_status AS ENUM ('draft', 'ready', 'published', 'failed');

CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    meta_description TEXT,
    body_html TEXT,
    target_keyword TEXT,
    search_volume INTEGER,
    difficulty TEXT,
    word_count INTEGER,
    status post_status DEFAULT 'draft' NOT NULL,
    wp_post_id INTEGER,
    wp_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_blog_posts_domain_id ON public.blog_posts(domain_id);
CREATE INDEX idx_blog_posts_user_id ON public.blog_posts(user_id);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_created_at ON public.blog_posts(created_at DESC);

-- ============================================================
-- CONTENT CALENDAR
-- ============================================================
CREATE TYPE calendar_item_status AS ENUM ('idea', 'scheduled', 'in_progress', 'completed', 'skipped');

CREATE TABLE public.content_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_keyword TEXT,
    scheduled_date DATE NOT NULL,
    status calendar_item_status DEFAULT 'idea' NOT NULL,
    blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_calendar_domain_id ON public.content_calendar(domain_id);
CREATE INDEX idx_calendar_user_id ON public.content_calendar(user_id);
CREATE INDEX idx_calendar_scheduled_date ON public.content_calendar(scheduled_date);

-- ============================================================
-- WORDPRESS CONNECTIONS
-- ============================================================
CREATE TABLE public.wp_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wp_site_url TEXT NOT NULL,
    wp_username TEXT NOT NULL,
    wp_app_password TEXT NOT NULL,
    is_connected BOOLEAN DEFAULT FALSE,
    last_tested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(domain_id, user_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own domains" ON public.domains FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own keywords" ON public.keywords FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own blog posts" ON public.blog_posts FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own calendar items" ON public.content_calendar FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.wp_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own wp connections" ON public.wp_connections FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON public.domains FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_content_calendar_updated_at BEFORE UPDATE ON public.content_calendar FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
