from google import genai
from app.services.llm.base import (
    LLMProvider, BrandProfile, KeywordSuggestion, KeywordSuggestions,
    BlogPostOutput, CalendarSuggestion, CalendarSuggestions,
)
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger("gemini_provider")


class GeminiProvider(LLMProvider):
    def __init__(self):
        settings = get_settings()
        self._client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self._model = settings.GEMINI_MODEL
        self._model_lite = settings.GEMINI_MODEL_LITE

    def generate_text(self, prompt: str, temperature: float = 0.7, max_tokens: int = 8192) -> str:
        logger.info("generate_text", model=self._model, prompt_length=len(prompt))
        response = self._client.models.generate_content(
            model=self._model,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            ),
        )
        return response.text

    def analyze_brand(self, crawl_data: dict) -> BrandProfile:
        logger.info("analyze_brand", pages=crawl_data.get("pages_crawled", 0))

        prompt = f"""You are an expert brand and SEO analyst. Analyze the following website data and produce a brand profile.

PAGE TITLES:
{chr(10).join(crawl_data.get('page_titles', [])[:10])}

META DESCRIPTIONS:
{chr(10).join(crawl_data.get('meta_descriptions', [])[:10])}

HEADINGS:
{chr(10).join(crawl_data.get('headings', [])[:50])}

BODY TEXT (sample):
{crawl_data.get('extracted_text', '')[:8000]}

Analyze the above and produce a comprehensive brand profile."""

        response = self._client.models.generate_content(
            model=self._model,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=4096,
                response_mime_type="application/json",
                response_schema=BrandProfile,
            ),
        )
        parsed: BrandProfile = response.parsed
        logger.info("brand_analyzed", company=parsed.company_name)
        return parsed

    def suggest_keywords(self, brand_profile: dict, count: int = 15) -> list[KeywordSuggestion]:
        logger.info("suggest_keywords", company=brand_profile.get("company_name"), count=count)

        prompt = f"""You are an expert SEO keyword researcher. Based on the following brand profile,
suggest {count} high-value blog post keywords that this company should target.

BRAND PROFILE:
- Company: {brand_profile.get('company_name', 'Unknown')}
- Industry: {brand_profile.get('industry', 'Unknown')}
- Target Audience: {brand_profile.get('target_audience', 'Unknown')}
- Key Topics: {', '.join(brand_profile.get('key_topics', []))}
- Brand Summary: {brand_profile.get('brand_summary', '')}

Prioritize keywords that:
- Have clear search intent (informational, how-to, comparison)
- Are relevant to the company's expertise
- Have a realistic chance of ranking (prefer medium-low competition)
- Would attract the target audience
- Are long-tail (3-6 words preferred)"""

        response = self._client.models.generate_content(
            model=self._model,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                temperature=0.5,
                max_output_tokens=4096,
                response_mime_type="application/json",
                response_schema=KeywordSuggestions,
            ),
        )
        parsed: KeywordSuggestions = response.parsed
        return parsed.keywords

    def generate_blog_post(
        self, keyword: str, title: str, brand_profile: dict, word_count: int = 1500
    ) -> BlogPostOutput:
        logger.info("generate_blog_post", keyword=keyword, word_count=word_count)

        prompt = f"""You are an expert SEO content writer. Write a complete, high-quality blog post.

TARGET KEYWORD: {keyword}
SUGGESTED TITLE: {title}
WORD COUNT: Approximately {word_count} words

BRAND CONTEXT:
- Company: {brand_profile.get('company_name', 'Our company')}
- Industry: {brand_profile.get('industry', '')}
- Target Audience: {brand_profile.get('target_audience', '')}
- Brand Voice: {brand_profile.get('brand_voice', 'professional')}
- About: {brand_profile.get('brand_summary', '')}

WRITING REQUIREMENTS:
1. Write an SEO-optimized title that includes the target keyword naturally
2. Write a compelling meta description (150-160 characters) with the keyword
3. Structure the article with clear H2 and H3 headings
4. Include the target keyword in the first paragraph, at least one H2, and naturally throughout
5. Write in the brand's voice and tone
6. Include practical, actionable advice
7. Add a FAQ section at the end with 3-4 questions and answers
8. End with a clear call-to-action relevant to the company
9. Use short paragraphs (2-3 sentences max) for readability
10. Include bullet points or numbered lists where appropriate

Return the blog post body in HTML format using <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> tags."""

        response = self._client.models.generate_content(
            model=self._model,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=8192,
                response_mime_type="application/json",
                response_schema=BlogPostOutput,
            ),
        )
        parsed: BlogPostOutput = response.parsed
        logger.info("blog_generated", title=parsed.title)
        return parsed

    def suggest_calendar(
        self, brand_profile: dict, existing_keywords: list[str], weeks: int = 4
    ) -> list[CalendarSuggestion]:
        logger.info("suggest_calendar", weeks=weeks)

        existing_str = ", ".join(existing_keywords[:20]) if existing_keywords else "None yet"
        total_posts = weeks * 2

        prompt = f"""You are an expert content strategist. Generate {total_posts} blog post ideas for a content calendar spanning {weeks} weeks.

BRAND PROFILE:
- Company: {brand_profile.get('company_name', 'Unknown')}
- Industry: {brand_profile.get('industry', 'Unknown')}
- Target Audience: {brand_profile.get('target_audience', 'Unknown')}
- Key Topics: {', '.join(brand_profile.get('key_topics', []))}
- Brand Summary: {brand_profile.get('brand_summary', '')}

EXISTING KEYWORDS (avoid duplicating these):
{existing_str}

For each post idea, provide:
- A compelling blog post title
- A target long-tail keyword (3-6 words)
- A brief content angle description
- Priority (high, medium, or low) based on potential SEO impact

Mix different content types: how-to guides, listicles, comparison posts, case studies, and thought leadership pieces."""

        response = self._client.models.generate_content(
            model=self._model,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                temperature=0.6,
                max_output_tokens=4096,
                response_mime_type="application/json",
                response_schema=CalendarSuggestions,
            ),
        )
        parsed: CalendarSuggestions = response.parsed
        return parsed.items
