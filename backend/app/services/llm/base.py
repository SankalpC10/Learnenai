from abc import ABC, abstractmethod
from pydantic import BaseModel, Field


class BrandProfile(BaseModel):
    company_name: str = Field(description="The company or brand name")
    industry: str = Field(description="Primary industry, e.g. SaaS, E-commerce, Healthcare, BPO")
    target_audience: str = Field(description="Who the company serves, 1-2 sentences")
    brand_voice: str = Field(description="One of: formal, casual, technical, professional, friendly")
    key_topics: list[str] = Field(description="5 key topics the company covers")
    brand_summary: str = Field(description="2-3 sentence summary of what the company does and their value proposition")


class KeywordSuggestion(BaseModel):
    keyword: str = Field(description="Long-tail keyword phrase, 3-6 words")
    search_volume_estimate: str = Field(description="Estimated volume: Low (<500), Medium (500-2000), High (2000+)")
    difficulty_estimate: str = Field(description="Competition difficulty: Low, Medium, or High")
    suggested_title: str = Field(description="Compelling blog post title targeting this keyword")


class KeywordSuggestions(BaseModel):
    keywords: list[KeywordSuggestion] = Field(description="List of keyword suggestions")


class BlogPostOutput(BaseModel):
    title: str = Field(description="SEO-optimized blog post title")
    meta_description: str = Field(description="Meta description, 150-160 characters")
    body_html: str = Field(description="Full blog post body in HTML format")


class CalendarSuggestion(BaseModel):
    title: str = Field(description="Blog post title idea")
    target_keyword: str = Field(description="Target keyword for SEO")
    content_angle: str = Field(description="Brief description of the content angle")
    priority: str = Field(description="Priority: high, medium, or low")


class CalendarSuggestions(BaseModel):
    items: list[CalendarSuggestion] = Field(description="List of content calendar suggestions")


class LLMProvider(ABC):
    @abstractmethod
    def generate_text(self, prompt: str, temperature: float = 0.7, max_tokens: int = 8192) -> str: ...

    @abstractmethod
    def analyze_brand(self, crawl_data: dict) -> BrandProfile: ...

    @abstractmethod
    def suggest_keywords(self, brand_profile: dict, count: int = 15) -> list[KeywordSuggestion]: ...

    @abstractmethod
    def generate_blog_post(self, keyword: str, title: str, brand_profile: dict, word_count: int = 1500) -> BlogPostOutput: ...

    @abstractmethod
    def suggest_calendar(self, brand_profile: dict, existing_keywords: list[str], weeks: int = 4) -> list[CalendarSuggestion]: ...
