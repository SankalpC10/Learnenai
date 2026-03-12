"""
Blog Post Generator Service
Generates full SEO-optimized blog drafts using Gemini structured output.
"""
import re
from app.services.llm_service import generate_text


async def generate_blog_post(
    keyword: str,
    suggested_title: str,
    brand_profile: dict,
    word_count: int = 1500,
) -> dict:
    """
    Generate a full SEO-optimized blog post.
    
    Returns:
        {
            "title": str,
            "slug": str,
            "meta_description": str,
            "body_html": str,
            "word_count": int
        }
    """
    prompt = f"""You are an expert SEO content writer. Write a complete, high-quality blog post.

TARGET KEYWORD: {keyword}
SUGGESTED TITLE: {suggested_title}
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
6. Include practical, actionable advice — not generic filler
7. Add a FAQ section at the end with 3-4 questions and answers
8. End with a clear call-to-action relevant to the company
9. Use short paragraphs (2-3 sentences max) for readability
10. Include bullet points or numbered lists where appropriate

OUTPUT FORMAT:
Return the blog post in this exact structure:

TITLE: [Your SEO title here]
META_DESCRIPTION: [Your meta description here]
---
[Full blog post body in HTML format using <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> tags]
"""

    # Sync call to Gemini
    raw_output = generate_text(prompt, temperature=0.7)
    
    # Parse the structured output
    result = _parse_blog_output(raw_output, keyword)
    
    return result


def _parse_blog_output(raw: str, keyword: str) -> dict:
    """Parse the LLM output into structured blog post fields."""
    
    title = ""
    meta_description = ""
    body_html = ""
    
    # Extract title
    title_match = re.search(r"TITLE:\s*(.+?)(?:\n|META_DESCRIPTION)", raw, re.DOTALL)
    if title_match:
        title = title_match.group(1).strip()
    
    # Extract meta description
    meta_match = re.search(r"META_DESCRIPTION:\s*(.+?)(?:\n---|\n\n)", raw, re.DOTALL)
    if meta_match:
        meta_description = meta_match.group(1).strip()
    
    # Extract body (everything after ---)
    body_match = re.search(r"---\s*\n(.+)", raw, re.DOTALL)
    if body_match:
        body_html = body_match.group(1).strip()
    else:
        body_html = raw
    
    # Clean up markdown code fences if present
    body_html = re.sub(r"```html\s*", "", body_html)
    body_html = re.sub(r"```\s*$", "", body_html)
    
    # Generate slug from title
    slug = _generate_slug(title or keyword)
    
    # Count words
    text_only = re.sub(r"<[^>]+>", "", body_html)
    word_count = len(text_only.split())
    
    return {
        "title": title,
        "slug": slug,
        "meta_description": meta_description[:320],
        "body_html": body_html,
        "word_count": word_count,
    }


def _generate_slug(title: str) -> str:
    """Generate a URL-friendly slug from a title."""
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s]+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")[:100]
