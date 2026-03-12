"""
Gemini LLM Service
Uses Pydantic structured outputs for type-safe responses from Gemini.
"""
from pydantic import BaseModel, Field
from google import genai
from app.core.config import get_settings

settings = get_settings()

# Initialize the Gemini client
client = genai.Client(api_key=settings.GEMINI_API_KEY)


# ── Structured Output Schemas ──────────────────────────────────────────

class BrandProfile(BaseModel):
    """Schema for brand analysis output."""
    company_name: str = Field(description="The company or brand name")
    industry: str = Field(description="Primary industry, e.g. SaaS, E-commerce, Healthcare, BPO")
    target_audience: str = Field(description="Who the company serves, 1-2 sentences")
    brand_voice: str = Field(description="One of: formal, casual, technical, professional, friendly")
    key_topics: list[str] = Field(description="5 key topics the company covers")
    brand_summary: str = Field(description="2-3 sentence summary of what the company does and their value proposition")


class KeywordSuggestion(BaseModel):
    """Schema for a single keyword suggestion."""
    keyword: str = Field(description="Long-tail keyword phrase, 3-6 words")
    search_volume_estimate: str = Field(description="Estimated volume: Low (<500), Medium (500-2000), High (2000+)")
    difficulty_estimate: str = Field(description="Competition difficulty: Low, Medium, or High")
    suggested_title: str = Field(description="Compelling blog post title targeting this keyword")


class KeywordSuggestions(BaseModel):
    """Schema for keyword suggestion batch."""
    keywords: list[KeywordSuggestion] = Field(description="List of keyword suggestions")


# ── Core Functions ─────────────────────────────────────────────────────

def generate_text(prompt: str, model: str | None = None, temperature: float = 0.7) -> str:
    """Generate free-form text using Gemini."""
    model_name = model or settings.GEMINI_MODEL

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=genai.types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=8192,
        ),
    )

    return response.text


def analyze_brand(crawl_data: dict) -> dict:
    """
    Analyze crawled website data and return a structured BrandProfile.
    Uses Gemini structured output with Pydantic schema.
    """
    prompt = f"""You are an expert brand and SEO analyst. Analyze the following website data and produce a brand profile.

PAGE TITLES:
{chr(10).join(crawl_data['page_titles'][:10])}

META DESCRIPTIONS:
{chr(10).join(crawl_data['meta_descriptions'][:10])}

HEADINGS:
{chr(10).join(crawl_data['headings'][:50])}

BODY TEXT (sample):
{crawl_data['extracted_text'][:8000]}

Analyze the above and produce a comprehensive brand profile."""

    model_name = settings.GEMINI_MODEL

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=genai.types.GenerateContentConfig(
            temperature=0.3,
            max_output_tokens=4096,
            response_mime_type="application/json",
            response_schema=BrandProfile,
        ),
    )

    # Parse the structured response
    parsed: BrandProfile = response.parsed
    return parsed.model_dump()


def suggest_keywords_llm(brand_profile: dict, count: int = 15) -> list[dict]:
    """
    Generate keyword suggestions using structured output.
    Returns a list of keyword suggestion dicts.
    """
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

    model_name = settings.GEMINI_MODEL

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=genai.types.GenerateContentConfig(
            temperature=0.5,
            max_output_tokens=4096,
            response_mime_type="application/json",
            response_schema=KeywordSuggestions,
        ),
    )

    parsed: KeywordSuggestions = response.parsed
    return [kw.model_dump() for kw in parsed.keywords]
